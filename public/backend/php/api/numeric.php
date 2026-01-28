<?php
/**
 * =====================================================
 * 🔢 NUMERIC TREND API ENDPOINT
 * =====================================================
 * 
 * USAGE: /api/numeric.php?api_key=YOUR_KEY&duration=1min
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
    '1min' => 'numeric_1min',
    '1'    => 'numeric_1min',
    '3min' => 'numeric_3min',
    '3'    => 'numeric_3min',
    '5min' => 'numeric_5min',
    '5'    => 'numeric_5min',
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
