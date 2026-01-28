<?php
/**
 * =====================================================
 * 🔒 HYPER SOFTS TREND API - MASTER CONFIGURATION
 * =====================================================
 * 
 * All settings in one place - like .env but for PHP!
 * Edit this file for your VPS/cPanel setup.
 * 
 * ⚠️ NEVER expose this file publicly!
 * 
 * =====================================================
 */

// ==================== DATABASE ====================
define('DB_HOST', 'localhost');
define('DB_USER', 'your_db_user');
define('DB_PASS', 'your_db_password');
define('DB_NAME', 'hyper_softs_db');

// ==================== HIDDEN UPSTREAM API ====================
// This is your REAL data source - KEEP IT SECRET!
// Users will NEVER see this URL - only YOUR domain
define('UPSTREAM_API_BASE', 'https://betapi.space');
define('UPSTREAM_API_ENDPOINT', '/Xdrtrend');

// ==================== YOUR DOMAIN (What users see) ====================
define('YOUR_DOMAIN', 'https://api.yourdomain.com');

// ==================== TELEGRAM BOT ====================
define('TELEGRAM_BOT_TOKEN', 'your_bot_token_from_botfather');
define('ADMIN_TELEGRAM_ID', 'your_telegram_id');

// ==================== SITE INFO ====================
define('SITE_NAME', 'Hyper Softs');
define('SITE_DESCRIPTION', 'Trend API Management System');
define('ADMIN_EMAIL', 'admin@hypersofts.com');
define('SUPPORT_EMAIL', 'support@hypersofts.com');

// ==================== GAME TYPE MAPPING ====================
// Maps clean duration names to hidden upstream typeIds
define('GAME_TYPES', [
    // WinGo - 30s is actually wg30s in upstream
    'wingo' => [
        '30s'   => 'wg30s',
        '30sec' => 'wg30s', 
        '1min'  => 'wg1',
        '1'     => 'wg1',
        '3min'  => 'wg3',
        '3'     => 'wg3',
        '5min'  => 'wg5',
        '5'     => 'wg5',
    ],
    // K3
    'k3' => [
        '1min'  => 'k3_1',
        '1'     => 'k3_1',
        '3min'  => 'k3_3',
        '3'     => 'k3_3',
        '5min'  => 'k3_5',
        '5'     => 'k3_5',
        '10min' => 'k3_10',
        '10'    => 'k3_10',
    ],
    // 5D
    '5d' => [
        '1min'  => '5d_1',
        '1'     => '5d_1',
        '3min'  => '5d_3',
        '3'     => '5d_3',
        '5min'  => '5d_5',
        '5'     => '5d_5',
        '10min' => '5d_10',
        '10'    => '5d_10',
    ],
    // TRX
    'trx' => [
        '1min' => 'trx_1',
        '1'    => 'trx_1',
        '3min' => 'trx_3',
        '3'    => 'trx_3',
        '5min' => 'trx_5',
        '5'    => 'trx_5',
    ],
    // Numeric
    'numeric' => [
        '1min' => 'num_1',
        '1'    => 'num_1',
        '3min' => 'num_3',
        '3'    => 'num_3',
        '5min' => 'num_5',
        '5'    => 'num_5',
    ],
]);

// Game display names
define('GAME_NAMES', [
    'wingo' => [
        '30s'  => 'WinGo 30 Seconds',
        '1min' => 'WinGo 1 Minute',
        '3min' => 'WinGo 3 Minutes',
        '5min' => 'WinGo 5 Minutes',
    ],
    'k3' => [
        '1min'  => 'K3 1 Minute',
        '3min'  => 'K3 3 Minutes',
        '5min'  => 'K3 5 Minutes',
        '10min' => 'K3 10 Minutes',
    ],
    '5d' => [
        '1min'  => '5D 1 Minute',
        '3min'  => '5D 3 Minutes',
        '5min'  => '5D 5 Minutes',
        '10min' => '5D 10 Minutes',
    ],
    'trx' => [
        '1min' => 'TRX 1 Minute',
        '3min' => 'TRX 3 Minutes',
        '5min' => 'TRX 5 Minutes',
    ],
    'numeric' => [
        '1min' => 'Numeric 1 Minute',
        '3min' => 'Numeric 3 Minutes',
        '5min' => 'Numeric 5 Minutes',
    ],
]);

// ==================== SECURITY ====================
define('ENABLE_IP_WHITELIST', true);
define('ENABLE_DOMAIN_WHITELIST', true);
define('LOG_ALL_REQUESTS', true);
define('MASK_API_KEYS_IN_LOGS', true);

// ==================== RATE LIMITING ====================
define('RATE_LIMIT_ENABLED', true);
define('RATE_LIMIT_PER_MINUTE', 60);
define('RATE_LIMIT_PER_HOUR', 1000);
define('RATE_LIMIT_PER_DAY', 10000);

// ==================== CORS ====================
define('ALLOWED_ORIGINS', [
    'https://your-frontend-domain.com',
    'https://admin.your-domain.com',
    // Add more allowed origins here
]);

// ==================== ERROR MESSAGES ====================
// User-friendly error messages (never expose internal details)
define('ERROR_MESSAGES', [
    'invalid_key' => 'Invalid or expired API key.',
    'ip_blocked' => 'Access denied. Your IP is not authorized.',
    'domain_blocked' => 'Access denied. Domain not authorized.',
    'rate_limited' => 'Too many requests. Please slow down.',
    'key_expired' => 'Your API key has expired. Please renew.',
    'key_disabled' => 'Your API key has been disabled.',
    'server_error' => 'Internal server error. Please try again later.',
    'upstream_error' => 'Data source temporarily unavailable.',
    'invalid_duration' => 'Invalid duration parameter.',
    'missing_key' => 'API key is required.',
]);

// ==================== TIMEZONE ====================
define('APP_TIMEZONE', 'Asia/Kolkata');
date_default_timezone_set(APP_TIMEZONE);

// ==================== DEBUG MODE ====================
// Set to false in production!
define('DEBUG_MODE', false);

if (!DEBUG_MODE) {
    error_reporting(0);
    ini_set('display_errors', '0');
} else {
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
}

// ==================== HELPERS ====================
// Quick function to get game type ID
function get_type_id($game, $duration) {
    $game = strtolower(trim($game));
    $duration = strtolower(trim($duration));
    
    if (!isset(GAME_TYPES[$game])) {
        return null;
    }
    
    return GAME_TYPES[$game][$duration] ?? null;
}

// Quick function to get game name
function get_game_name($game, $duration) {
    $game = strtolower(trim($game));
    $duration = strtolower(trim($duration));
    
    // Normalize duration
    $duration = str_replace(['sec', 'minute', 'minutes'], ['s', 'min', 'min'], $duration);
    
    if (!isset(GAME_NAMES[$game])) {
        return ucfirst($game) . ' ' . $duration;
    }
    
    return GAME_NAMES[$game][$duration] ?? ucfirst($game) . ' ' . $duration;
}

// Get available durations for a game
function get_available_durations($game) {
    $game = strtolower(trim($game));
    
    $durations = [
        'wingo' => ['30s', '1min', '3min', '5min'],
        'k3' => ['1min', '3min', '5min', '10min'],
        '5d' => ['1min', '3min', '5min', '10min'],
        'trx' => ['1min', '3min', '5min'],
        'numeric' => ['1min', '3min', '5min'],
    ];
    
    return $durations[$game] ?? [];
}
