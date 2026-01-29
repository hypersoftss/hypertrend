import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Message templates
const MESSAGE_TEMPLATES = {
  welcome: (siteName: string) => `
🎉 *Welcome to ${siteName}!*

Your account has been successfully created.

📋 *Quick Links:*
• Dashboard: View your API keys
• Documentation: Learn how to integrate
• Support: Get help when needed

Thank you for joining us! 🚀
`,

  new_api_key: (keyName: string, expiresAt: string) => `
🔑 *New API Key Generated*

Key Name: \`${keyName}\`
Expires: ${expiresAt}

⚠️ Keep your API key secure and never share it publicly.
`,

  key_expiring: (keyName: string, daysLeft: number) => `
⏰ *API Key Expiring Soon*

Your API key "\`${keyName}\`" will expire in *${daysLeft} days*.

Please renew it to avoid service interruption.

Reply /renew to request renewal.
`,

  key_expired: (keyName: string) => `
❌ *API Key Expired*

Your API key "\`${keyName}\`" has expired.

Please contact admin to get a new key or renew your subscription.
`,

  renewal_reminder: (keyName: string, adminName: string) => `
📢 *Renewal Reminder from Admin*

Hi! This is a reminder from *${adminName}*.

Your API key "\`${keyName}\`" needs attention.

Please contact us to renew your subscription.
`,

  server_health: (status: string, uptime: string) => `
🖥️ *Server Health Status*

Status: ${status}
Uptime: ${uptime}
Checked: ${new Date().toISOString()}

All systems operational! ✅
`,

  admin_alert: (message: string) => `
🚨 *Admin Alert*

${message}

Time: ${new Date().toISOString()}
`,

  test_message: () => `
✅ *Telegram Bot Test Successful!*

🤖 Bot is working correctly.
📡 Connection established.
⏰ Time: ${new Date().toISOString()}

All message types are ready to use! 🎉
`,
};

async function sendTelegramMessage(botToken: string, chatId: string, message: string): Promise<{ ok: boolean; description?: string }> {
  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
    }),
  });
  return response.json();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get Telegram settings
    const { data: settings } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', ['telegram_bot_token', 'admin_telegram_id', 'site_name']);

    const settingsMap = Object.fromEntries(settings?.map(s => [s.key, s.value]) || []);
    const botToken = settingsMap['telegram_bot_token'];
    const adminChatId = settingsMap['admin_telegram_id'];
    const siteName = settingsMap['site_name'] || 'Hyper Softs Trend';

    if (!botToken || !adminChatId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Telegram not configured',
        message: 'Bot token or admin chat ID missing',
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'test';
    const chatId = url.searchParams.get('chat_id') || adminChatId;

    let message = '';
    let messageType = action;

    switch (action) {
      case 'test':
        message = MESSAGE_TEMPLATES.test_message();
        break;
      case 'welcome':
        message = MESSAGE_TEMPLATES.welcome(siteName);
        break;
      case 'new_key':
        message = MESSAGE_TEMPLATES.new_api_key('Demo API Key', '30 days');
        break;
      case 'expiring':
        message = MESSAGE_TEMPLATES.key_expiring('Demo API Key', 3);
        break;
      case 'expired':
        message = MESSAGE_TEMPLATES.key_expired('Demo API Key');
        break;
      case 'reminder':
        message = MESSAGE_TEMPLATES.renewal_reminder('Demo API Key', 'Admin');
        break;
      case 'health':
        message = MESSAGE_TEMPLATES.server_health('🟢 Online', '99.9%');
        break;
      case 'alert':
        message = MESSAGE_TEMPLATES.admin_alert('This is a test admin alert message.');
        break;
      case 'all':
        // Send all message types
        const results = [];
        const allActions = ['test', 'welcome', 'new_key', 'expiring', 'expired', 'reminder', 'health', 'alert'];
        
        for (const act of allActions) {
          let msg = '';
          switch (act) {
            case 'test': msg = MESSAGE_TEMPLATES.test_message(); break;
            case 'welcome': msg = MESSAGE_TEMPLATES.welcome(siteName); break;
            case 'new_key': msg = MESSAGE_TEMPLATES.new_api_key('Demo API Key', '30 days'); break;
            case 'expiring': msg = MESSAGE_TEMPLATES.key_expiring('Demo API Key', 3); break;
            case 'expired': msg = MESSAGE_TEMPLATES.key_expired('Demo API Key'); break;
            case 'reminder': msg = MESSAGE_TEMPLATES.renewal_reminder('Demo API Key', 'Admin'); break;
            case 'health': msg = MESSAGE_TEMPLATES.server_health('🟢 Online', '99.9%'); break;
            case 'alert': msg = MESSAGE_TEMPLATES.admin_alert('This is a test admin alert message.'); break;
          }
          
          const result = await sendTelegramMessage(botToken, chatId, msg);
          results.push({ action: act, success: result.ok, error: result.description });
          
          // Log to database
          await supabase.from('telegram_logs').insert({
            chat_id: chatId,
            message_type: act,
            message: msg.substring(0, 500),
            status: result.ok ? 'sent' : 'failed',
            error_message: result.description || null,
          });
          
          // Small delay between messages
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        return new Response(JSON.stringify({
          success: true,
          message: 'All test messages sent',
          results,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid action',
          available_actions: ['test', 'welcome', 'new_key', 'expiring', 'expired', 'reminder', 'health', 'alert', 'all'],
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // Send single message
    const result = await sendTelegramMessage(botToken, chatId, message);
    
    // Log to database
    await supabase.from('telegram_logs').insert({
      chat_id: chatId,
      message_type: messageType,
      message: message.substring(0, 500),
      status: result.ok ? 'sent' : 'failed',
      error_message: result.description || null,
    });

    return new Response(JSON.stringify({
      success: result.ok,
      action: action,
      chat_id: chatId,
      result: result,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Telegram bot error:', err);
    return new Response(JSON.stringify({
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
