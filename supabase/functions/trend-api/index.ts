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

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // Expected path: /trend-api/{game}
    // e.g., /trend-api/wingo, /trend-api/k3, /trend-api/5d
    const game = pathParts[pathParts.length - 1]?.toLowerCase();
    
    // Get query parameters
    const apiKey = url.searchParams.get('api_key');
    const duration = url.searchParams.get('duration');

    // IP check endpoint - to find outbound IP for whitelisting
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
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown',
      });

      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid API key',
        message: 'The provided API key is not valid',
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if key is active
    if (keyData.status !== 'active') {
      return new Response(JSON.stringify({
        success: false,
        error: 'API key inactive',
        message: 'Your API key has been deactivated',
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
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check daily limit
    if (keyData.daily_limit && keyData.calls_today >= keyData.daily_limit) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Rate limit exceeded',
        message: 'You have exceeded your daily API call limit',
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
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown',
      });

      // Return upstream's actual response for debugging
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
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown',
      domain: req.headers.get('origin') || req.headers.get('referer') || 'direct',
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