<?php
/**
 * =====================================================
 * 🎯 5D TREND API - ALL DURATIONS
 * =====================================================
 * 
 * Your real data source is HIDDEN - users only see your domain!
 * 
 * ENDPOINTS:
 * /api/5d.php?api_key=KEY&duration=1min
 * /api/5d.php?api_key=KEY&duration=3min
 * /api/5d.php?api_key=KEY&duration=5min
 * /api/5d.php?api_key=KEY&duration=10min
 * 
 * =====================================================
 */

require_once __DIR__ . '/../helpers.php';

// Set CORS headers
set_cors_headers();

// Get client info
$client_ip = get_client_ip();
$request_domain = get_request_domain();
$start_time = microtime(true);

// -------------------- IP WHITELIST CHECK --------------------
if (!check_ip_whitelist($client_ip)) {
    log_api_request([
        'client_ip' => $client_ip,
        'domain' => $request_domain,
        'endpoint' => '/api/5d.php',
        'game_type' => '5d',
        'http_status' => 403,
        'response_body' => json_encode(['error' => 'IP blocked']),
        'duration_ms' => 0
    ]);
    error_response('ip_blocked', 403);
}

// -------------------- GET PARAMETERS --------------------
$api_key = $_GET['api_key'] ?? $_SERVER['HTTP_X_API_KEY'] ?? '';
$duration = strtolower(trim($_GET['duration'] ?? '1min'));

// Validate API key
if (empty($api_key)) {
    error_response('invalid_key', 401);
}

// -------------------- DURATION TO TYPE ID MAPPING (HIDDEN!) --------------------
$duration_map = [
    '1min'  => ['typeId' => '5d_1', 'name' => '5D 1 Minute'],
    '1'     => ['typeId' => '5d_1', 'name' => '5D 1 Minute'],
    '3min'  => ['typeId' => '5d_3', 'name' => '5D 3 Minutes'],
    '3'     => ['typeId' => '5d_3', 'name' => '5D 3 Minutes'],
    '5min'  => ['typeId' => '5d_5', 'name' => '5D 5 Minutes'],
    '5'     => ['typeId' => '5d_5', 'name' => '5D 5 Minutes'],
    '10min' => ['typeId' => '5d_10', 'name' => '5D 10 Minutes'],
    '10'    => ['typeId' => '5d_10', 'name' => '5D 10 Minutes'],
];

if (!isset($duration_map[$duration])) {
    json_response([
        'success' => false,
        'error' => 'Invalid duration',
        'provided' => $duration,
        'available' => ['1min', '3min', '5min', '10min'],
        'example' => '/api/5d.php?api_key=YOUR_KEY&duration=1min'
    ], 400);
}

$game_config = $duration_map[$duration];

// -------------------- API KEY VALIDATION --------------------
$key_data = validate_api_key($api_key);

if (!$key_data) {
    log_api_request([
        'client_ip' => $client_ip,
        'domain' => $request_domain,
        'endpoint' => '/api/5d.php',
        'game_type' => '5d',
        'request_params' => json_encode(['masked_key' => mask_api_key($api_key), 'duration' => $duration]),
        'http_status' => 401,
        'response_body' => json_encode(['error' => 'Invalid key']),
        'duration_ms' => 0
    ]);
    error_response('invalid_key', 401);
}

$api_key_id = (int)$key_data['id'];
$user_id = (int)$key_data['user_id'];

// Check key status
if ($key_data['status'] !== 'active') {
    error_response('key_disabled', 403);
}

// Check expiry
if (!empty($key_data['expires_at']) && strtotime($key_data['expires_at']) < time()) {
    error_response('key_expired', 403);
}

// Check game type permission
if (!empty($key_data['game_type']) && $key_data['game_type'] !== 'all') {
    $allowed_games = array_map('trim', explode(',', $key_data['game_type']));
    if (!in_array('5d', $allowed_games)) {
        json_response([
            'success' => false,
            'error' => 'Your API key does not have access to 5D',
            'allowed_games' => $allowed_games
        ], 403);
    }
}

// -------------------- DOMAIN WHITELIST CHECK --------------------
if (!check_domain_whitelist($request_domain, $api_key_id)) {
    error_response('domain_blocked', 403);
}

// -------------------- FETCH FROM UPSTREAM (COMPLETELY HIDDEN!) --------------------
$type_id = $game_config['typeId'];
$upstream = fetch_upstream_data($type_id);
$duration_ms = (int)((microtime(true) - $start_time) * 1000);

if (!$upstream['success']) {
    error_response('upstream_error', 502);
}

// Parse response
$data = json_decode($upstream['data'], true);
if ($data === null) {
    error_response('upstream_error', 502);
}

// -------------------- SUCCESS RESPONSE --------------------
$response = [
    'success' => true,
    'game' => '5d',
    'duration' => $duration,
    'game_name' => $game_config['name'],
    'data' => $data,
    'meta' => [
        'response_time_ms' => $duration_ms,
        'timestamp' => date('c'),
        'powered_by' => 'Hyper Softs Trend API'
    ]
];

// Log and update usage
log_api_request([
    'api_key_id' => $api_key_id,
    'user_id' => $user_id,
    'client_ip' => $client_ip,
    'domain' => $request_domain,
    'endpoint' => '/api/5d.php',
    'game_type' => '5d',
    'request_params' => json_encode(['masked_key' => mask_api_key($api_key), 'duration' => $duration]),
    'response_body' => json_encode(['success' => true]),
    'http_status' => 200,
    'duration_ms' => $duration_ms
]);

update_api_key_usage($api_key_id, $client_ip);

json_response($response, 200);
