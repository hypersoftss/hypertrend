import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// TypeId to upstream typeId mapping
// User-facing typeId -> Upstream typeId
// New upstream /hypersoftsxdr uses: wg1, wg3, wg5, wg30, k31, k33, k35, k310, 5d1, 5d3, 5d5, 5d10, trx1, trx3, trx5, trx10
const TYPE_ID_MAP: Record<string, { upstreamId: string; game: string; duration: string }> = {
  // WinGo - upstream accepts: 1, 2, 3, 30 or wg1, wg3, wg5, wg30
  'wg30s': { upstreamId: 'wg30', game: 'wingo', duration: '30s' },
  'wg1': { upstreamId: 'wg1', game: 'wingo', duration: '1min' },
  'wg3': { upstreamId: 'wg3', game: 'wingo', duration: '3min' },
  'wg5': { upstreamId: 'wg5', game: 'wingo', duration: '5min' },
  // K3 - upstream accepts: k31, k33, k35, k310
  'k31': { upstreamId: 'k31', game: 'k3', duration: '1min' },
  'k33': { upstreamId: 'k33', game: 'k3', duration: '3min' },
  'k35': { upstreamId: 'k35', game: 'k3', duration: '5min' },
  'k310': { upstreamId: 'k310', game: 'k3', duration: '10min' },
  // 5D - upstream accepts: 5d1, 5d3, 5d5, 5d10
  '5d1': { upstreamId: '5d1', game: '5d', duration: '1min' },
  '5d3': { upstreamId: '5d3', game: '5d', duration: '3min' },
  '5d5': { upstreamId: '5d5', game: '5d', duration: '5min' },
  '5d10': { upstreamId: '5d10', game: '5d', duration: '10min' },
  // TRX - upstream accepts: trx1, trx3, trx5, trx10
  'trx1': { upstreamId: 'trx1', game: 'trx', duration: '1min' },
  'trx3': { upstreamId: 'trx3', game: 'trx', duration: '3min' },
  'trx5': { upstreamId: 'trx5', game: 'trx', duration: '5min' },
  'trx10': { upstreamId: 'trx10', game: 'trx', duration: '10min' },
};

// Upstream API configuration
const UPSTREAM_API = 'https://betapi.space';
const UPSTREAM_ENDPOINT = '/hypersoftsxdr';

// Helper to send admin notification
async function notifyAdmin(
  supabase: any,
  type: string,
  details: {
    keyName: string;
    keyOwner: string;
    ownerTelegramId?: string;
    ip: string;
    domain: string;
    reason: string;
  }
) {
  try {
    const { data: settings } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', ['telegram_bot_token', 'admin_telegram_id', 'site_name']);

    const settingsMap = Object.fromEntries(settings?.map((s: any) => [s.key, s.value]) || []);
    const botToken = settingsMap['telegram_bot_token'];
    const adminChatId = settingsMap['admin_telegram_id'];
    const siteName = settingsMap['site_name'] || 'Hyper Softs Trend';

    if (!botToken || !adminChatId) {
      console.log('Telegram not configured, skipping admin notification');
      return;
    }

    const message = `🚨 *Unauthorized API Access Attempt*

📛 *Reason:* ${details.reason}

🔑 *Key Name:* \`${details.keyName}\`
👤 *Key Owner:* ${details.keyOwner}
📱 *Owner Telegram:* ${details.ownerTelegramId || 'Not Set'}

🌐 *Request Details:*
• IP: \`${details.ip}\`
• Domain: \`${details.domain || 'Unknown'}\`

⏰ *Time:* ${new Date().toISOString()}

_${siteName} Security Alert_`;

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: adminChatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    const result = await response.json();

    await supabase.from('telegram_logs').insert({
      chat_id: adminChatId,
      message_type: 'security_alert',
      message: message.substring(0, 500),
      status: result.ok ? 'sent' : 'failed',
      error_message: result.description || null,
    });

    console.log('Admin notification sent:', result.ok);
  } catch (err) {
    console.error('Failed to send admin notification:', err);
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    
    // Get query parameters - Support both new and old patterns
    const typeId = url.searchParams.get('typeId');
    const apiKey = url.searchParams.get('apiKey') || url.searchParams.get('api_key');

    // Health check endpoint
    if (url.pathname.endsWith('/health') || url.pathname.endsWith('/ipcheck')) {
      if (url.pathname.endsWith('/ipcheck')) {
        try {
          const ipResponse = await fetch('https://api.ipify.org?format=json');
          const ipData = await ipResponse.json();
          return new Response(JSON.stringify({
            status: 'ok',
            message: 'Supabase Edge Function IP',
            outbound_ip: ipData.ip,
            timestamp: new Date().toISOString(),
            note: 'Whitelist this IP on betapi.space'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (e) {
          return new Response(JSON.stringify({
            status: 'error',
            message: 'Could not fetch IP',
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      return new Response(JSON.stringify({
        status: 'ok',
        message: 'Trend API is running',
        timestamp: new Date().toISOString(),
        supported_typeIds: Object.keys(TYPE_ID_MAP),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate typeId
    if (!typeId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'typeId required',
        message: 'Please provide typeId parameter',
        supported_typeIds: Object.keys(TYPE_ID_MAP),
        example: '?typeId=wg1&apiKey=YOUR_KEY',
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const typeConfig = TYPE_ID_MAP[typeId.toLowerCase()];
    if (!typeConfig) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid typeId',
        message: `TypeId '${typeId}' is not valid`,
        supported_typeIds: Object.keys(TYPE_ID_MAP),
        example: '?typeId=wg1&apiKey=YOUR_KEY',
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate API key
    if (!apiKey) {
      return new Response(JSON.stringify({
        success: false,
        error: 'apiKey required',
        message: 'Please provide apiKey parameter',
        example: `?typeId=${typeId}&apiKey=YOUR_KEY`,
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get admin telegram username from settings (for error responses)
    const { data: adminSettings } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', ['admin_telegram_username', 'site_name']);
    
    const adminSettingsMap = Object.fromEntries(adminSettings?.map((s: any) => [s.key, s.value]) || []);
    const adminTelegramUsername = adminSettingsMap['admin_telegram_username'] || '@Hyperdeveloperr';

    // Get client IP
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('cf-connecting-ip') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    // Get request origin/domain
    const requestOrigin = req.headers.get('origin') || '';
    const requestReferer = req.headers.get('referer') || '';
    const requestDomain = requestOrigin ? new URL(requestOrigin).hostname : 
                          requestReferer ? new URL(requestReferer).hostname : '';

    console.log(`API Request: typeId=${typeId}, apiKey=${apiKey?.substring(0,8)}..., IP=${clientIp}, Domain=${requestDomain}`);

    // Validate API key in database
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('*')
      .eq('api_key', apiKey)
      .single();

    if (keyError || !keyData) {
      await supabase.from('api_logs').insert({
        endpoint: `/trend-api`,
        game_type: typeConfig.game,
        duration: typeConfig.duration,
        status: 'error',
        error_message: 'Invalid API key',
        ip_address: clientIp,
        domain: requestDomain,
      });

      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid API key',
        message: 'The provided API key is not valid',
        your_ip: clientIp,
        your_domain: requestDomain || 'Unknown',
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get key owner's profile
    const { data: ownerProfile } = await supabase
      .from('profiles')
      .select('username, email, telegram_id')
      .eq('user_id', keyData.user_id)
      .maybeSingle();

    const keyOwnerName = ownerProfile?.username || ownerProfile?.email || 'Unknown';
    const ownerTelegramId = ownerProfile?.telegram_id || null;

    // Check if key is active
    if (keyData.status !== 'active') {
      return new Response(JSON.stringify({
        success: false,
        error: 'API key inactive',
        message: 'Your API key has been deactivated',
        your_ip: clientIp,
        contact_admin_telegram: adminTelegramUsername,
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if key is expired
    if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
      return new Response(JSON.stringify({
        success: false,
        error: 'API key expired',
        message: `Your API key has expired. Please contact admin on Telegram: ${adminTelegramUsername}`,
        your_ip: clientIp,
        contact_admin_telegram: adminTelegramUsername,
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check IP whitelist - MANDATORY
    const { data: allowedIps } = await supabase
      .from('allowed_ips')
      .select('ip_address')
      .eq('api_key_id', keyData.id);

    if (!allowedIps || allowedIps.length === 0) {
      await supabase.from('api_logs').insert({
        endpoint: `/trend-api`,
        game_type: typeConfig.game,
        duration: typeConfig.duration,
        status: 'blocked',
        error_message: `No IP whitelist configured`,
        api_key_id: keyData.id,
        ip_address: clientIp,
        domain: requestDomain,
      });

      await notifyAdmin(supabase, 'no_whitelist', {
        keyName: keyData.key_name,
        keyOwner: keyOwnerName,
        ownerTelegramId: ownerTelegramId,
        ip: clientIp,
        domain: requestDomain,
        reason: 'No IP whitelist configured for this key',
      });

      return new Response(JSON.stringify({
        success: false,
        error: 'IP not whitelisted',
        message: `⚠️ Your IP is not whitelisted! Please contact admin on Telegram: ${adminTelegramUsername}`,
        your_ip: clientIp,
        contact_admin_telegram: adminTelegramUsername,
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if IP is in whitelist (support wildcards "*" and exact match)
    const isIpAllowed = allowedIps.some(ip => 
      ip.ip_address === '*' || ip.ip_address === clientIp
    );
    if (!isIpAllowed) {
      await supabase.from('api_logs').insert({
        endpoint: `/trend-api`,
        game_type: typeConfig.game,
        duration: typeConfig.duration,
        status: 'blocked',
        error_message: `IP not whitelisted: ${clientIp}`,
        api_key_id: keyData.id,
        ip_address: clientIp,
        domain: requestDomain,
      });

      await notifyAdmin(supabase, 'ip_not_whitelisted', {
        keyName: keyData.key_name,
        keyOwner: keyOwnerName,
        ownerTelegramId: ownerTelegramId,
        ip: clientIp,
        domain: requestDomain,
        reason: `IP not whitelisted: ${clientIp}`,
      });

      return new Response(JSON.stringify({
        success: false,
        error: 'IP not authorized',
        message: `⚠️ Your IP is not whitelisted! Please contact admin on Telegram: ${adminTelegramUsername}`,
        your_ip: clientIp,
        contact_admin_telegram: adminTelegramUsername,
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check Domain whitelist - MANDATORY
    const { data: allowedDomains } = await supabase
      .from('allowed_domains')
      .select('domain')
      .eq('api_key_id', keyData.id);

    if (!allowedDomains || allowedDomains.length === 0) {
      await supabase.from('api_logs').insert({
        endpoint: `/trend-api`,
        game_type: typeConfig.game,
        duration: typeConfig.duration,
        status: 'blocked',
        error_message: `No domain whitelist configured`,
        api_key_id: keyData.id,
        ip_address: clientIp,
        domain: requestDomain,
      });

      await notifyAdmin(supabase, 'no_domain_whitelist', {
        keyName: keyData.key_name,
        keyOwner: keyOwnerName,
        ownerTelegramId: ownerTelegramId,
        ip: clientIp,
        domain: requestDomain,
        reason: 'No domain whitelist configured for this key',
      });

      return new Response(JSON.stringify({
        success: false,
        error: 'Domain not whitelisted',
        message: `⚠️ Your domain is not whitelisted! Please contact admin on Telegram: ${adminTelegramUsername}`,
        your_ip: clientIp,
        contact_admin_telegram: adminTelegramUsername,
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if domain is in whitelist (support wildcards "*" and exact/subdomain match)
    if (requestDomain) {
      const isDomainAllowed = allowedDomains.some(d => 
        d.domain === '*' || requestDomain === d.domain || requestDomain.endsWith('.' + d.domain)
      );
      if (!isDomainAllowed) {
        await supabase.from('api_logs').insert({
          endpoint: `/trend-api`,
          game_type: typeConfig.game,
          duration: typeConfig.duration,
          status: 'blocked',
          error_message: `Domain not whitelisted: ${requestDomain}`,
          api_key_id: keyData.id,
          ip_address: clientIp,
          domain: requestDomain,
        });

        await notifyAdmin(supabase, 'domain_not_whitelisted', {
          keyName: keyData.key_name,
          keyOwner: keyOwnerName,
          ownerTelegramId: ownerTelegramId,
          ip: clientIp,
          domain: requestDomain,
          reason: `Domain not whitelisted: ${requestDomain}`,
        });

        return new Response(JSON.stringify({
          success: false,
          error: 'Domain not authorized',
          message: `⚠️ Your domain is not whitelisted! Please contact admin on Telegram: ${adminTelegramUsername}`,
          your_ip: clientIp,
          contact_admin_telegram: adminTelegramUsername,
        }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Fetch data from upstream API
    const startTime = Date.now();
    const upstreamUrl = `${UPSTREAM_API}${UPSTREAM_ENDPOINT}?typeId=${typeConfig.upstreamId}`;
    
    console.log(`Fetching from upstream: ${upstreamUrl}`);
    
    const upstreamResponse = await fetch(upstreamUrl);
    const responseTime = Date.now() - startTime;

    const upstreamBody = await upstreamResponse.text();
    let upstreamData;
    try {
      upstreamData = JSON.parse(upstreamBody);
    } catch {
      upstreamData = { raw: upstreamBody };
    }

    if (!upstreamResponse.ok) {
      await supabase.from('api_logs').insert({
        endpoint: `/trend-api`,
        game_type: typeConfig.game,
        duration: typeConfig.duration,
        status: 'error',
        error_message: `Upstream error: ${upstreamResponse.status}`,
        response_time_ms: responseTime,
        api_key_id: keyData.id,
        ip_address: clientIp,
        domain: requestDomain,
      });

      return new Response(JSON.stringify({
        success: false,
        error: 'Upstream error',
        message: 'Failed to fetch data from source',
        upstream_status: upstreamResponse.status,
        upstream_response: upstreamData,
      }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update API key usage
    await supabase
      .from('api_keys')
      .update({
        calls_today: (keyData.calls_today || 0) + 1,
        calls_total: (keyData.calls_total || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', keyData.id);

    // Log successful call
    await supabase.from('api_logs').insert({
      endpoint: `/trend-api`,
      game_type: typeConfig.game,
      duration: typeConfig.duration,
      status: 'success',
      response_time_ms: responseTime,
      api_key_id: keyData.id,
      ip_address: clientIp,
      domain: requestDomain || 'direct',
    });

    // Return successful response - Pass through upstream data directly (same format as original API)
    return new Response(JSON.stringify(upstreamData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Edge function error:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error',
      message: errorMessage,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
