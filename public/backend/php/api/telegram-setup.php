<?php
/**
 * =====================================================
 * 🔧 TELEGRAM BOT SETUP & WEBHOOK
 * =====================================================
 * 
 * Run this file ONCE to set up the webhook
 * 
 * USAGE: 
 * 1. Upload all files to your server
 * 2. Visit: https://yourdomain.com/api/telegram-setup.php
 * 3. Click "Set Webhook"
 * 
 * =====================================================
 */

require_once __DIR__ . '/../config.php';

$action = $_GET['action'] ?? 'info';
$webhook_url = "https://" . ($_SERVER['HTTP_HOST'] ?? 'yourdomain.com') . "/api/telegram-bot.php";

function telegramApiCall($method, $params = []) {
    $url = "https://api.telegram.org/bot" . TELEGRAM_BOT_TOKEN . "/{$method}";
    
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query($params),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30
    ]);
    
    $result = curl_exec($ch);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        return ['ok' => false, 'error' => $error];
    }
    
    return json_decode($result, true);
}

// Handle actions
$result = null;
$message = '';

// Webhook secret for added security (optional)
$webhook_secret = defined('TELEGRAM_WEBHOOK_SECRET') ? TELEGRAM_WEBHOOK_SECRET : '';

switch ($action) {
    case 'set':
        $params = [
            'url' => $webhook_url,
            'allowed_updates' => json_encode(['message', 'callback_query']),
            'drop_pending_updates' => true
        ];
        
        // Add secret token if configured
        if (!empty($webhook_secret) && $webhook_secret !== 'your_webhook_secret') {
            $params['secret_token'] = $webhook_secret;
        }
        
        $result = telegramApiCall('setWebhook', $params);
        $message = $result['ok'] ? '✅ Webhook set successfully!' : '❌ Failed: ' . ($result['description'] ?? 'Unknown error');
        break;
        
    case 'delete':
        $result = telegramApiCall('deleteWebhook', ['drop_pending_updates' => true]);
        $message = $result['ok'] ? '✅ Webhook deleted!' : '❌ Failed to delete webhook';
        break;
        
    case 'status':
        $result = telegramApiCall('getWebhookInfo');
        break;
        
    case 'me':
        $result = telegramApiCall('getMe');
        break;
        
    case 'test':
        $result = telegramApiCall('sendMessage', [
            'chat_id' => ADMIN_TELEGRAM_ID,
            'text' => "🔔 <b>Test Message</b>\n\nFrom: " . SITE_NAME . "\nVersion: " . (defined('APP_VERSION') ? APP_VERSION : '1.0.0') . "\n\n✅ Bot is working correctly!\n🕐 " . date('Y-m-d H:i:s'),
            'parse_mode' => 'HTML'
        ]);
        $message = $result['ok'] ? '✅ Test message sent to admin!' : '❌ Failed: ' . ($result['description'] ?? 'Check Admin Telegram ID');
        break;
        
    case 'health':
        // Quick health check
        $bot_info = telegramApiCall('getMe');
        $webhook_info = telegramApiCall('getWebhookInfo');
        $result = [
            'bot' => $bot_info,
            'webhook' => $webhook_info,
            'config' => [
                'site_name' => SITE_NAME,
                'admin_id_set' => !empty(ADMIN_TELEGRAM_ID) && ADMIN_TELEGRAM_ID !== 'your_telegram_id',
                'token_set' => !empty(TELEGRAM_BOT_TOKEN) && strpos(TELEGRAM_BOT_TOKEN, 'your_bot') === false
            ]
        ];
        break;
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Telegram Bot Setup - <?php echo SITE_NAME; ?></title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            min-height: 100vh;
            color: #fff;
            padding: 2rem;
        }
        .container { max-width: 800px; margin: 0 auto; }
        h1 { margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .card {
            background: rgba(255,255,255,0.1);
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 1rem;
            backdrop-filter: blur(10px);
        }
        .card h2 { margin-bottom: 1rem; font-size: 1.2rem; }
        .btn {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            margin-right: 0.5rem;
            margin-bottom: 0.5rem;
            transition: all 0.3s;
        }
        .btn-primary { background: #0088cc; color: #fff; }
        .btn-danger { background: #e74c3c; color: #fff; }
        .btn-success { background: #27ae60; color: #fff; }
        .btn-secondary { background: #6c757d; color: #fff; }
        .btn:hover { transform: translateY(-2px); filter: brightness(1.1); }
        .message {
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
        }
        .message.success { background: rgba(39, 174, 96, 0.3); }
        .message.error { background: rgba(231, 76, 60, 0.3); }
        pre {
            background: rgba(0,0,0,0.3);
            padding: 1rem;
            border-radius: 8px;
            overflow-x: auto;
            font-size: 0.85rem;
        }
        .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
        .info-item { padding: 1rem; background: rgba(0,0,0,0.2); border-radius: 8px; }
        .info-item label { display: block; font-size: 0.8rem; opacity: 0.7; margin-bottom: 0.25rem; }
        .info-item span { font-weight: 600; word-break: break-all; }
        code { background: rgba(0,0,0,0.3); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.9rem; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 Telegram Bot Setup</h1>
        <p style="opacity: 0.7; margin-bottom: 2rem;">Configure webhook for <?php echo SITE_NAME; ?> Telegram Bot</p>
        
        <?php if ($message): ?>
        <div class="message <?php echo strpos($message, '✅') !== false ? 'success' : 'error'; ?>">
            <?php echo $message; ?>
        </div>
        <?php endif; ?>
        
        <div class="card">
            <h2>📋 Configuration</h2>
            <div class="info-grid">
                <div class="info-item">
                    <label>Site Name</label>
                    <span><?php echo SITE_NAME; ?></span>
                </div>
                <div class="info-item">
                    <label>Webhook URL</label>
                    <span><?php echo $webhook_url; ?></span>
                </div>
                <div class="info-item">
                    <label>Admin Telegram ID</label>
                    <span><?php echo ADMIN_TELEGRAM_ID; ?></span>
                </div>
                <div class="info-item">
                    <label>Bot Token</label>
                    <span><?php echo substr(TELEGRAM_BOT_TOKEN, 0, 10) . '***'; ?></span>
                </div>
            </div>
        </div>
        
        <div class="card">
            <h2>🔧 Actions</h2>
            <a href="?action=set" class="btn btn-primary">📡 Set Webhook</a>
            <a href="?action=delete" class="btn btn-danger">🗑️ Delete Webhook</a>
            <a href="?action=status" class="btn btn-secondary">ℹ️ Webhook Status</a>
            <a href="?action=me" class="btn btn-secondary">🤖 Bot Info</a>
            <a href="?action=test" class="btn btn-success">📨 Send Test Message</a>
            <a href="?action=health" class="btn btn-secondary">💚 Health Check</a>
        </div>
        
        <?php if ($result): ?>
        <div class="card">
            <h2>📄 Result</h2>
            <pre><?php echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE); ?></pre>
        </div>
        <?php endif; ?>
        
        <div class="card">
            <h2>📖 Setup Instructions</h2>
            <ol style="padding-left: 1.5rem; line-height: 2;">
                <li>Upload all PHP files to your server</li>
                <li>Edit <code>config.php</code> with your settings</li>
                <li>Click <strong>"Set Webhook"</strong> above</li>
                <li>Click <strong>"Send Test Message"</strong> to verify</li>
                <li>Bot is now ready! Users can start with <code>/start</code></li>
            </ol>
        </div>
        
        <div class="card">
            <h2>💬 Bot Commands</h2>
            <ul style="padding-left: 1.5rem; line-height: 2;">
                <li><code>/start</code> - Start bot & show menu</li>
                <li><code>/status</code> - Check account status</li>
                <li><code>/keys</code> - View API keys</li>
                <li><code>/renew</code> - Request key renewal</li>
                <li><code>/help</code> - Get help</li>
            </ul>
        </div>
    </div>
</body>
</html>
