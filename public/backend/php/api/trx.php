<?php
/**
 * =====================================================
 * ⚡ TRX TREND API ENDPOINT
 * =====================================================
 * 
 * USAGE: /api/trx.php?api_key=YOUR_KEY&duration=1min
 * 
 * Available durations: 1min, 3min, 5min
 * 
 * =====================================================
 */

require_once __DIR__ . '/../helpers.php';

// Set CORS headers
set_cors_headers();

// Get parameters
$api_key = $_GET['api_key'] ?? $_SERVER['HTTP_X_API_KEY'] ?? '';
$duration = strtolower(trim($_GET['duration'] ?? '1min'));

// Map duration to game type
$duration_map = [
    '1min' => 'trx_1min',
    '1'    => 'trx_1min',
    '3min' => 'trx_3min',
    '3'    => 'trx_3min',
    '5min' => 'trx_5min',
    '5'    => 'trx_5min',
];

if (!isset($duration_map[$duration])) {
    json_response([
        'success' => false,
        'error' => 'Invalid duration',
        'provided' => $duration,
        'available' => ['1min', '3min', '5min']
    ], 400);
}

// Redirect to main endpoint
$_GET['game'] = $duration_map[$duration];
require __DIR__ . '/trend.php';
