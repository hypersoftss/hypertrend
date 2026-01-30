import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface DeleteUserRequest {
  userId: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get the authorization header to verify the caller is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create a Supabase client with the user's token to verify they're an admin
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify the calling user is an admin
    const { data: { user: callingUser }, error: authError } = await userClient.auth.getUser();
    if (authError || !callingUser) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if caller has admin role
    const { data: roleData, error: roleError } = await userClient
      .from("user_roles")
      .select("role")
      .eq("user_id", callingUser.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: "Only admins can delete users" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the request body
    const { userId }: DeleteUserRequest = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prevent self-deletion
    if (userId === callingUser.id) {
      return new Response(
        JSON.stringify({ error: "You cannot delete your own account" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const clientIp = (req.headers.get("x-forwarded-for") || "")
      .split(",")[0]
      .trim() || null;

    // Create admin client for user deletion
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Gather some context before deletion (profiles are what the UI lists)
    const { data: profile } = await adminClient
      .from("profiles")
      .select("email, username")
      .eq("user_id", userId)
      .maybeSingle();

    const deletedUserEmail = profile?.email ?? null;
    const deletedUsername = profile?.username ?? null;

    // Cascade delete app data (these are NOT automatically removed because our tables
    // don't have FK cascades to the auth user table).
    const { data: userKeys } = await adminClient
      .from("api_keys")
      .select("id")
      .eq("user_id", userId);

    const apiKeyIds = (userKeys || []).map((k) => k.id);

    if (apiKeyIds.length) {
      await adminClient.from("allowed_ips").delete().in("api_key_id", apiKeyIds);
      await adminClient.from("allowed_domains").delete().in("api_key_id", apiKeyIds);
      await adminClient.from("api_logs").delete().in("api_key_id", apiKeyIds);
    }

    await adminClient.from("api_keys").delete().eq("user_id", userId);
    await adminClient.from("activity_logs").delete().eq("user_id", userId);
    await adminClient.from("user_roles").delete().eq("user_id", userId);
    await adminClient.from("profiles").delete().eq("user_id", userId);

    // Delete the user using admin API
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error("Error deleting user:", deleteError);
      return new Response(
        JSON.stringify({ error: deleteError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Track the deletion in activity logs (admin action)
    await adminClient.from("activity_logs").insert({
      user_id: callingUser.id,
      action: "DELETE_USER",
      ip_address: clientIp,
      details: {
        deleted_user_id: userId,
        deleted_user_email: deletedUserEmail,
        deleted_username: deletedUsername,
      },
    });

    console.log(`User ${userId} deleted successfully by admin ${callingUser.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "User deleted successfully",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
