<?php
/**
 * =====================================================
 * 🎲 K3 TREND API ENDPOINT
 * =====================================================
 * 
 * USAGE: /api/k3.php?api_key=YOUR_KEY&duration=1min
 * 
 * Available durations: 1min, 3min, 5min, 10min
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
    '1min' => 'k3_1min',
    '1'    => 'k3_1min',
    '3min' => 'k3_3min',
    '3'    => 'k3_3min',
    '5min' => 'k3_5min',
    '5'    => 'k3_5min',
    '10min' => 'k3_10min',
    '10'   => 'k3_10min',
];

if (!isset($duration_map[$duration])) {
    json_response([
        'success' => false,
        'error' => 'Invalid duration',
        'provided' => $duration,
        'available' => ['1min', '3min', '5min', '10min']
    ], 400);
}

// Redirect to main endpoint
$_GET['game'] = $duration_map[$duration];
require __DIR__ . '/trend.php';
