<?php
/**
 * =====================================================
 * 🔒 HYPER SOFTS TREND API - CONFIGURATION
 * =====================================================
 * This file contains all sensitive configurations.
 * NEVER expose this file publicly!
 */

// -------------------- DATABASE CONFIGURATION --------------------
define('DB_HOST', 'localhost');
define('DB_USER', 'your_db_user');
define('DB_PASS', 'your_db_password');
define('DB_NAME', 'hyper_softs_db');

// -------------------- HIDDEN UPSTREAM API (NEVER EXPOSE!) --------------------
// This is your actual data source - KEEP IT SECRET!
define('UPSTREAM_API_BASE', 'https://betapi.space');
define('UPSTREAM_API_ENDPOINT', '/Xdrtrend');

// -------------------- GAME TYPE IDs (Internal Mapping) --------------------
// These map your clean endpoints to upstream typeIds
define('GAME_TYPES', [
    'wingo_1min'   => ['typeId' => '30', 'name' => 'WinGo 1 Min'],
    'wingo_3min'   => ['typeId' => '31', 'name' => 'WinGo 3 Min'],
    'wingo_5min'   => ['typeId' => '32', 'name' => 'WinGo 5 Min'],
    'wingo_10min'  => ['typeId' => '33', 'name' => 'WinGo 10 Min'],
    'k3_1min'      => ['typeId' => '40', 'name' => 'K3 1 Min'],
    'k3_3min'      => ['typeId' => '41', 'name' => 'K3 3 Min'],
    'k3_5min'      => ['typeId' => '42', 'name' => 'K3 5 Min'],
    'k3_10min'     => ['typeId' => '43', 'name' => 'K3 10 Min'],
    '5d_1min'      => ['typeId' => '50', 'name' => '5D 1 Min'],
    '5d_3min'      => ['typeId' => '51', 'name' => '5D 3 Min'],
    '5d_5min'      => ['typeId' => '52', 'name' => '5D 5 Min'],
    '5d_10min'     => ['typeId' => '53', 'name' => '5D 10 Min'],
    'trx_1min'     => ['typeId' => '60', 'name' => 'TRX 1 Min'],
    'trx_3min'     => ['typeId' => '61', 'name' => 'TRX 3 Min'],
    'trx_5min'     => ['typeId' => '62', 'name' => 'TRX 5 Min'],
    'numeric_1min' => ['typeId' => '70', 'name' => 'Numeric 1 Min'],
    'numeric_3min' => ['typeId' => '71', 'name' => 'Numeric 3 Min'],
    'numeric_5min' => ['typeId' => '72', 'name' => 'Numeric 5 Min'],
]);

// -------------------- TELEGRAM NOTIFICATIONS --------------------
define('TELEGRAM_BOT_TOKEN', 'your_telegram_bot_token');
define('ADMIN_TELEGRAM_ID', 'your_admin_telegram_id');

// -------------------- SECURITY SETTINGS --------------------
define('ENABLE_IP_WHITELIST', true);
define('ENABLE_DOMAIN_WHITELIST', true);
define('LOG_ALL_REQUESTS', true);
define('MASK_API_KEYS_IN_LOGS', true);

// -------------------- RATE LIMITING --------------------
define('RATE_LIMIT_ENABLED', true);
define('RATE_LIMIT_PER_MINUTE', 60);
define('RATE_LIMIT_PER_HOUR', 1000);

// -------------------- CORS SETTINGS --------------------
define('ALLOWED_ORIGINS', [
    'https://your-frontend-domain.com',
    'https://admin.your-domain.com',
]);

// -------------------- ERROR MESSAGES (User-Friendly) --------------------
define('ERROR_MESSAGES', [
    'invalid_key' => 'Invalid or expired API key.',
    'ip_blocked' => 'Access denied. Your IP is not authorized.',
    'domain_blocked' => 'Access denied. Domain not authorized.',
    'rate_limited' => 'Too many requests. Please slow down.',
    'key_expired' => 'Your API key has expired. Please renew.',
    'key_disabled' => 'Your API key has been disabled.',
    'server_error' => 'Internal server error. Please try again later.',
    'upstream_error' => 'Data source temporarily unavailable.',
]);
