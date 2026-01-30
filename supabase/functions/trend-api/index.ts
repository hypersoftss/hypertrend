import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Game type to typeId mapping
const GAME_TYPE_MAP: Record<string, Record<string, string>> = {
  wingo: {
    '30s': '1',
    '1min': '2',
    '3min': '3',
    '5min': '4',
  },
  k3: {
    '1min': '5',
    '3min': '6',
    '5min': '7',
    '10min': '8',
  },
  '5d': {
    '1min': '9',
    '3min': '10',
    '5min': '11',
    '10min': '12',
  },
  trx: {
    '1min': '13',
    '3min': '14',
    '5min': '15',
  },
  numeric: {
    '1min': '16',
    '3min': '17',
    '5min': '18',
  },
};

// Upstream API configuration
const UPSTREAM_API = 'https://betapi.space';
const UPSTREAM_ENDPOINT = '/Xdrtrend';

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
    // Get admin telegram settings
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

    // Log the notification
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
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // Expected path: /trend-api/{game}
    const game = pathParts[pathParts.length - 1]?.toLowerCase();
    
    // Get query parameters
    const apiKey = url.searchParams.get('api_key');
    const duration = url.searchParams.get('duration');

    // IP check endpoint
    if (game === 'ipcheck') {
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

    // Health check endpoint
    if (game === 'health' || game === 'trend-api') {
      return new Response(JSON.stringify({
        status: 'ok',
        message: 'Trend API is running',
        timestamp: new Date().toISOString(),
        endpoints: ['wingo', 'k3', '5d', 'trx', 'numeric'],
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate game type
    if (!game || !GAME_TYPE_MAP[game]) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid game type',
        message: `Supported games: ${Object.keys(GAME_TYPE_MAP).join(', ')}`,
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate API key
    if (!apiKey) {
      return new Response(JSON.stringify({
        success: false,
        error: 'API key required',
        message: 'Please provide api_key parameter',
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate duration
    if (!duration) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Duration required',
        message: `Supported durations for ${game}: ${Object.keys(GAME_TYPE_MAP[game]).join(', ')}`,
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const typeId = GAME_TYPE_MAP[game][duration];
    if (!typeId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid duration',
        message: `Supported durations for ${game}: ${Object.keys(GAME_TYPE_MAP[game]).join(', ')}`,
      }), {
        status: 400,
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
    const siteName = adminSettingsMap['site_name'] || 'Hyper Softs Trend';

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

    // Validate API key in database
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('*')
      .eq('api_key', apiKey)
      .single();

    if (keyError || !keyData) {
      // Log failed attempt
      await supabase.from('api_logs').insert({
        endpoint: `/${game}`,
        game_type: game,
        duration: duration,
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

    // Get key owner's profile for telegram_id
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
        your_domain: requestDomain || 'Unknown',
        owner_telegram_id: ownerTelegramId,
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
        message: 'Your API key has expired. Please contact admin for renewal.',
        your_ip: clientIp,
        your_domain: requestDomain || 'Unknown',
        owner_telegram_id: ownerTelegramId,
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

    // If no IPs are whitelisted, block the request
    if (!allowedIps || allowedIps.length === 0) {
      await supabase.from('api_logs').insert({
        endpoint: `/${game}`,
        game_type: game,
        duration: duration,
        status: 'blocked',
        error_message: `No IP whitelist configured`,
        api_key_id: keyData.id,
        ip_address: clientIp,
        domain: requestDomain,
      });

      // Notify admin
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

    // Check if IP is in whitelist
    const isIpAllowed = allowedIps.some(ip => ip.ip_address === clientIp);
    if (!isIpAllowed) {
      await supabase.from('api_logs').insert({
        endpoint: `/${game}`,
        game_type: game,
        duration: duration,
        status: 'blocked',
        error_message: `IP not whitelisted: ${clientIp}`,
        api_key_id: keyData.id,
        ip_address: clientIp,
        domain: requestDomain,
      });

      // Notify admin
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

    // If no domains are whitelisted, block the request
    if (!allowedDomains || allowedDomains.length === 0) {
      await supabase.from('api_logs').insert({
        endpoint: `/${game}`,
        game_type: game,
        duration: duration,
        status: 'blocked',
        error_message: `No domain whitelist configured`,
        api_key_id: keyData.id,
        ip_address: clientIp,
        domain: requestDomain,
      });

      // Notify admin
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

    // Check if domain is in whitelist
    if (requestDomain) {
      const isDomainAllowed = allowedDomains.some(d => 
        requestDomain === d.domain || requestDomain.endsWith('.' + d.domain)
      );
      if (!isDomainAllowed) {
        await supabase.from('api_logs').insert({
          endpoint: `/${game}`,
          game_type: game,
          duration: duration,
          status: 'blocked',
          error_message: `Domain not whitelisted: ${requestDomain}`,
          api_key_id: keyData.id,
          ip_address: clientIp,
          domain: requestDomain,
        });

        // Notify admin
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

    // Check daily limit
    if (keyData.daily_limit && keyData.calls_today >= keyData.daily_limit) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Rate limit exceeded',
        message: 'You have exceeded your daily API call limit',
        your_ip: clientIp,
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch data from upstream API
    const startTime = Date.now();
    const upstreamUrl = `${UPSTREAM_API}${UPSTREAM_ENDPOINT}?typeId=${typeId}`;
    
    const upstreamResponse = await fetch(upstreamUrl);
    const responseTime = Date.now() - startTime;

    // Read upstream body regardless of status
    const upstreamBody = await upstreamResponse.text();
    let upstreamData;
    try {
      upstreamData = JSON.parse(upstreamBody);
    } catch {
      upstreamData = { raw: upstreamBody };
    }

    if (!upstreamResponse.ok) {
      // Log error
      await supabase.from('api_logs').insert({
        endpoint: `/${game}`,
        game_type: game,
        duration: duration,
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

    const data = upstreamData;

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
      endpoint: `/${game}`,
      game_type: game,
      duration: duration,
      status: 'success',
      response_time_ms: responseTime,
      api_key_id: keyData.id,
      ip_address: clientIp,
      domain: requestDomain || 'direct',
    });

    // Return successful response
    return new Response(JSON.stringify({
      success: true,
      game: game,
      duration: duration,
      timestamp: new Date().toISOString(),
      data: data,
    }), {
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