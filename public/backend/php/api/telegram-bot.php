<?php
/**
 * =====================================================
 * 🤖 TELEGRAM BOT - PHP VERSION
 * =====================================================
 * 
 * Complete Telegram bot for:
 * - Admin notifications
 * - User commands (/start, /status, /keys, /renew)
 * - Key alerts & reminders
 * 
 * USAGE: Set webhook to this file URL
 * 
 * =====================================================
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';

// Get incoming update
$content = file_get_contents('php://input');
$update = json_decode($content, true);

if (!$update) {
    json_response(['ok' => true, 'message' => 'No update']);
}

// -------------------- TELEGRAM API HELPERS --------------------
function sendTelegramMessage($chat_id, $text, $parse_mode = 'HTML', $reply_markup = null) {
    $url = "https://api.telegram.org/bot" . TELEGRAM_BOT_TOKEN . "/sendMessage";
    
    $data = [
        'chat_id' => $chat_id,
        'text' => $text,
        'parse_mode' => $parse_mode,
        'disable_web_page_preview' => true
    ];
    
    if ($reply_markup) {
        $data['reply_markup'] = json_encode($reply_markup);
    }
    
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query($data),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10
    ]);
    
    $result = curl_exec($ch);
    curl_close($ch);
    
    // Log to database
    log_telegram_message($chat_id, 'outgoing', $text);
    
    return json_decode($result, true);
}

function log_telegram_message($chat_id, $type, $text, $command = null, $username = null) {
    $conn = get_db_connection();
    
    $stmt = $conn->prepare("
        INSERT INTO telegram_logs (chat_id, username, message_type, message_text, command, status, created_at)
        VALUES (?, ?, ?, ?, ?, 'success', NOW())
    ");
    
    if ($stmt) {
        $stmt->bind_param("sssss", $chat_id, $username, $type, $text, $command);
        $stmt->execute();
        $stmt->close();
    }
    
    $conn->close();
}

// -------------------- GET USER FROM TELEGRAM ID --------------------
function getUserByTelegramId($telegram_id) {
    $conn = get_db_connection();
    
    $stmt = $conn->prepare("SELECT * FROM users WHERE telegram_id = ? LIMIT 1");
    $stmt->bind_param("s", $telegram_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    
    $stmt->close();
    $conn->close();
    
    return $user;
}

// -------------------- GET USER'S API KEYS --------------------
function getUserApiKeys($user_id) {
    $conn = get_db_connection();
    
    $stmt = $conn->prepare("
        SELECT * FROM api_keys 
        WHERE user_id = ? 
        ORDER BY created_at DESC
    ");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $keys = [];
    while ($row = $result->fetch_assoc()) {
        $keys[] = $row;
    }
    
    $stmt->close();
    $conn->close();
    
    return $keys;
}

// -------------------- COMMAND HANDLERS --------------------
function handleStartCommand($chat_id, $username) {
    $user = getUserByTelegramId($chat_id);
    
    if ($user) {
        $text = "🎉 <b>Welcome back, {$user['username']}!</b>\n\n";
        $text .= "You're connected to <b>" . SITE_NAME . "</b>\n\n";
        $text .= "📋 <b>Available Commands:</b>\n";
        $text .= "/status - Check your account status\n";
        $text .= "/keys - View your API keys\n";
        $text .= "/renew - Request key renewal\n";
        $text .= "/help - Get help\n\n";
        $text .= "📧 Support: " . SUPPORT_EMAIL;
    } else {
        $text = "👋 <b>Welcome to " . SITE_NAME . "!</b>\n\n";
        $text .= "Your Telegram ID: <code>{$chat_id}</code>\n\n";
        $text .= "⚠️ Your account is not linked yet.\n";
        $text .= "Please contact admin to link your account.\n\n";
        $text .= "📧 Contact: " . ADMIN_EMAIL;
    }
    
    $keyboard = [
        'inline_keyboard' => [
            [
                ['text' => '📊 My Status', 'callback_data' => 'status'],
                ['text' => '🔑 My Keys', 'callback_data' => 'keys']
            ],
            [
                ['text' => '🔄 Request Renewal', 'callback_data' => 'renew'],
                ['text' => '❓ Help', 'callback_data' => 'help']
            ]
        ]
    ];
    
    sendTelegramMessage($chat_id, $text, 'HTML', $keyboard);
}

function handleStatusCommand($chat_id) {
    $user = getUserByTelegramId($chat_id);
    
    if (!$user) {
        sendTelegramMessage($chat_id, "❌ Account not linked. Contact admin.");
        return;
    }
    
    $keys = getUserApiKeys($user['id']);
    $active_keys = array_filter($keys, fn($k) => $k['status'] === 'active');
    
    // Get usage stats
    $stats = get_user_api_stats($user['id']);
    
    $text = "📊 <b>Account Status</b>\n\n";
    $text .= "👤 Username: <b>{$user['username']}</b>\n";
    $text .= "📧 Email: {$user['email']}\n";
    $text .= "🔑 Active Keys: <b>" . count($active_keys) . "</b>\n";
    $text .= "📈 Total Calls: <b>{$stats['total_calls']}</b>\n";
    $text .= "✅ Success Rate: <b>{$stats['success_rate']}%</b>\n";
    $text .= "⚡ Avg Response: <b>{$stats['avg_response_time']}ms</b>\n\n";
    $text .= "🕐 Last Login: " . ($user['last_login_at'] ?? 'Never');
    
    sendTelegramMessage($chat_id, $text);
}

function handleKeysCommand($chat_id) {
    $user = getUserByTelegramId($chat_id);
    
    if (!$user) {
        sendTelegramMessage($chat_id, "❌ Account not linked. Contact admin.");
        return;
    }
    
    $keys = getUserApiKeys($user['id']);
    
    if (empty($keys)) {
        sendTelegramMessage($chat_id, "🔑 You have no API keys.\nContact admin to get one.");
        return;
    }
    
    $text = "🔑 <b>Your API Keys</b>\n\n";
    
    foreach ($keys as $i => $key) {
        $status_icon = $key['status'] === 'active' ? '✅' : '❌';
        $masked_key = substr($key['api_key'], 0, 8) . '****' . substr($key['api_key'], -4);
        
        $text .= ($i + 1) . ". {$status_icon} <code>{$masked_key}</code>\n";
        $text .= "   📌 Game: {$key['game_type']}\n";
        $text .= "   📅 Expires: " . ($key['expires_at'] ?? 'Never') . "\n";
        $text .= "   📊 Calls: {$key['total_calls']}\n\n";
    }
    
    sendTelegramMessage($chat_id, $text);
}

function handleRenewCommand($chat_id, $username) {
    $user = getUserByTelegramId($chat_id);
    
    if (!$user) {
        sendTelegramMessage($chat_id, "❌ Account not linked. Contact admin.");
        return;
    }
    
    // Send request to admin
    $admin_text = "🔄 <b>Renewal Request</b>\n\n";
    $admin_text .= "👤 User: <b>{$user['username']}</b>\n";
    $admin_text .= "📱 Telegram: @{$username}\n";
    $admin_text .= "🆔 User ID: {$user['id']}\n";
    $admin_text .= "📧 Email: {$user['email']}\n\n";
    $admin_text .= "🕐 Time: " . date('Y-m-d H:i:s');
    
    sendTelegramMessage(ADMIN_TELEGRAM_ID, $admin_text);
    
    // Confirm to user
    $text = "✅ <b>Renewal Request Sent!</b>\n\n";
    $text .= "Your renewal request has been sent to admin.\n";
    $text .= "You'll be notified when it's processed.\n\n";
    $text .= "📧 Or contact: " . SUPPORT_EMAIL;
    
    sendTelegramMessage($chat_id, $text);
}

function handleHelpCommand($chat_id) {
    $text = "❓ <b>" . SITE_NAME . " Help</b>\n\n";
    $text .= "📋 <b>Commands:</b>\n";
    $text .= "/start - Start bot & see menu\n";
    $text .= "/status - Your account status\n";
    $text .= "/keys - View your API keys\n";
    $text .= "/renew - Request key renewal\n";
    $text .= "/help - This help message\n\n";
    $text .= "📧 <b>Support:</b>\n";
    $text .= SUPPORT_EMAIL . "\n\n";
    $text .= "🌐 <b>Documentation:</b>\n";
    $text .= "Check your dashboard for API docs";
    
    sendTelegramMessage($chat_id, $text);
}

// -------------------- CALLBACK HANDLER --------------------
function handleCallback($callback_query) {
    $chat_id = $callback_query['message']['chat']['id'];
    $data = $callback_query['data'];
    $username = $callback_query['from']['username'] ?? '';
    
    switch ($data) {
        case 'status':
            handleStatusCommand($chat_id);
            break;
        case 'keys':
            handleKeysCommand($chat_id);
            break;
        case 'renew':
            handleRenewCommand($chat_id, $username);
            break;
        case 'help':
            handleHelpCommand($chat_id);
            break;
    }
    
    // Answer callback
    $url = "https://api.telegram.org/bot" . TELEGRAM_BOT_TOKEN . "/answerCallbackQuery";
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => ['callback_query_id' => $callback_query['id']],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 5
    ]);
    curl_exec($ch);
    curl_close($ch);
}

// -------------------- ADMIN NOTIFICATION FUNCTIONS --------------------
function notifyAdminNewUser($user) {
    $text = "👤 <b>New User Registered</b>\n\n";
    $text .= "Username: <b>{$user['username']}</b>\n";
    $text .= "Email: {$user['email']}\n";
    $text .= "Telegram: " . ($user['telegram_id'] ?? 'Not linked') . "\n";
    $text .= "🕐 Time: " . date('Y-m-d H:i:s');
    
    sendTelegramMessage(ADMIN_TELEGRAM_ID, $text);
}

function notifyAdminNewKey($user, $key) {
    $text = "🔑 <b>New API Key Generated</b>\n\n";
    $text .= "👤 User: <b>{$user['username']}</b>\n";
    $text .= "🎮 Game: {$key['game_type']}\n";
    $text .= "📅 Expires: " . ($key['expires_at'] ?? 'Never') . "\n";
    $text .= "🕐 Time: " . date('Y-m-d H:i:s');
    
    sendTelegramMessage(ADMIN_TELEGRAM_ID, $text);
    
    // Also notify user if they have telegram
    if (!empty($user['telegram_id'])) {
        $user_text = "🎉 <b>New API Key!</b>\n\n";
        $user_text .= "Your new API key has been generated.\n";
        $user_text .= "🎮 Game: {$key['game_type']}\n";
        $user_text .= "📅 Valid until: " . ($key['expires_at'] ?? 'Forever') . "\n\n";
        $user_text .= "Check your dashboard for the full key.";
        
        sendTelegramMessage($user['telegram_id'], $user_text);
    }
}

function notifyAdminKeyExpiring($key, $user, $days_left) {
    $text = "⚠️ <b>API Key Expiring Soon</b>\n\n";
    $text .= "👤 User: <b>{$user['username']}</b>\n";
    $text .= "🎮 Game: {$key['game_type']}\n";
    $text .= "⏰ Days Left: <b>{$days_left}</b>\n";
    $text .= "📅 Expires: {$key['expires_at']}";
    
    sendTelegramMessage(ADMIN_TELEGRAM_ID, $text);
    
    // Notify user too
    if (!empty($user['telegram_id'])) {
        $user_text = "⚠️ <b>Key Expiring Soon!</b>\n\n";
        $user_text .= "Your API key will expire in <b>{$days_left} days</b>.\n";
        $user_text .= "🎮 Game: {$key['game_type']}\n\n";
        $user_text .= "Use /renew to request renewal.";
        
        sendTelegramMessage($user['telegram_id'], $user_text);
    }
}

function notifyServerHealth($status, $details) {
    $icon = $status === 'healthy' ? '✅' : ($status === 'degraded' ? '⚠️' : '🔴');
    
    $text = "{$icon} <b>Server Health: " . ucfirst($status) . "</b>\n\n";
    
    foreach ($details as $check => $info) {
        $check_icon = $info['status'] === 'ok' ? '✅' : '❌';
        $text .= "{$check_icon} {$check}\n";
    }
    
    $text .= "\n🕐 " . date('Y-m-d H:i:s');
    
    sendTelegramMessage(ADMIN_TELEGRAM_ID, $text);
}

// -------------------- PROCESS UPDATE --------------------
if (isset($update['message'])) {
    $message = $update['message'];
    $chat_id = $message['chat']['id'];
    $text = $message['text'] ?? '';
    $username = $message['from']['username'] ?? '';
    
    // Log incoming message
    log_telegram_message($chat_id, 'incoming', $text, null, $username);
    
    // Handle commands
    if (strpos($text, '/start') === 0) {
        handleStartCommand($chat_id, $username);
    } elseif (strpos($text, '/status') === 0) {
        handleStatusCommand($chat_id);
    } elseif (strpos($text, '/keys') === 0) {
        handleKeysCommand($chat_id);
    } elseif (strpos($text, '/renew') === 0) {
        handleRenewCommand($chat_id, $username);
    } elseif (strpos($text, '/help') === 0) {
        handleHelpCommand($chat_id);
    } else {
        // Echo unknown message
        sendTelegramMessage($chat_id, "❓ Unknown command. Use /help for available commands.");
    }
} elseif (isset($update['callback_query'])) {
    handleCallback($update['callback_query']);
}

json_response(['ok' => true]);
