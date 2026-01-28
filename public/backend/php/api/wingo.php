<?php
/**
 * =====================================================
 * 🎰 WINGO TREND API - ALL DURATIONS
 * =====================================================
 * 
 * Your real data source is HIDDEN - users only see your domain!
 * 
 * ENDPOINTS:
 * /api/wingo.php?api_key=KEY&duration=30s
 * /api/wingo.php?api_key=KEY&duration=1min
 * /api/wingo.php?api_key=KEY&duration=3min
 * /api/wingo.php?api_key=KEY&duration=5min
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
        'endpoint' => '/api/wingo.php',
        'game_type' => 'wingo',
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
    '30s'   => ['typeId' => 'wg30s', 'name' => 'WinGo 30 Seconds'],
    '30sec' => ['typeId' => 'wg30s', 'name' => 'WinGo 30 Seconds'],
    '1min'  => ['typeId' => 'wg1', 'name' => 'WinGo 1 Minute'],
    '1'     => ['typeId' => 'wg1', 'name' => 'WinGo 1 Minute'],
    '3min'  => ['typeId' => 'wg3', 'name' => 'WinGo 3 Minutes'],
    '3'     => ['typeId' => 'wg3', 'name' => 'WinGo 3 Minutes'],
    '5min'  => ['typeId' => 'wg5', 'name' => 'WinGo 5 Minutes'],
    '5'     => ['typeId' => 'wg5', 'name' => 'WinGo 5 Minutes'],
];

if (!isset($duration_map[$duration])) {
    json_response([
        'success' => false,
        'error' => 'Invalid duration',
        'provided' => $duration,
        'available' => ['30s', '1min', '3min', '5min'],
        'example' => '/api/wingo.php?api_key=YOUR_KEY&duration=1min'
    ], 400);
}

$game_config = $duration_map[$duration];

// -------------------- API KEY VALIDATION --------------------
$key_data = validate_api_key($api_key);

if (!$key_data) {
    log_api_request([
        'client_ip' => $client_ip,
        'domain' => $request_domain,
        'endpoint' => '/api/wingo.php',
        'game_type' => 'wingo',
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
    log_api_request([
        'api_key_id' => $api_key_id,
        'user_id' => $user_id,
        'client_ip' => $client_ip,
        'domain' => $request_domain,
        'endpoint' => '/api/wingo.php',
        'game_type' => 'wingo',
        'http_status' => 403,
        'response_body' => json_encode(['error' => 'Key disabled']),
        'duration_ms' => 0
    ]);
    error_response('key_disabled', 403);
}

// Check expiry
if (!empty($key_data['expires_at']) && strtotime($key_data['expires_at']) < time()) {
    log_api_request([
        'api_key_id' => $api_key_id,
        'user_id' => $user_id,
        'client_ip' => $client_ip,
        'domain' => $request_domain,
        'endpoint' => '/api/wingo.php',
        'game_type' => 'wingo',
        'http_status' => 403,
        'response_body' => json_encode(['error' => 'Key expired']),
        'duration_ms' => 0
    ]);
    error_response('key_expired', 403);
}

// Check game type permission
if (!empty($key_data['game_type']) && $key_data['game_type'] !== 'all') {
    $allowed_games = array_map('trim', explode(',', $key_data['game_type']));
    if (!in_array('wingo', $allowed_games)) {
        json_response([
            'success' => false,
            'error' => 'Your API key does not have access to WinGo',
            'allowed_games' => $allowed_games
        ], 403);
    }
}

// -------------------- KEY-SPECIFIC IP WHITELIST CHECK --------------------
if (!check_key_ip_whitelist($client_ip, $key_data)) {
    log_api_request([
        'api_key_id' => $api_key_id,
        'user_id' => $user_id,
        'client_ip' => $client_ip,
        'domain' => $request_domain,
        'endpoint' => '/api/wingo.php',
        'game_type' => 'wingo',
        'http_status' => 403,
        'response_body' => json_encode(['error' => 'IP not whitelisted for this key']),
        'duration_ms' => 0
    ]);
    error_response('ip_blocked', 403);
}

// -------------------- DOMAIN WHITELIST CHECK --------------------
if (!check_domain_whitelist($request_domain, $key_data)) {
    log_api_request([
        'api_key_id' => $api_key_id,
        'user_id' => $user_id,
        'client_ip' => $client_ip,
        'domain' => $request_domain,
        'endpoint' => '/api/wingo.php',
        'game_type' => 'wingo',
        'http_status' => 403,
        'response_body' => json_encode(['error' => 'Domain blocked']),
        'duration_ms' => 0
    ]);
    error_response('domain_blocked', 403);
}

// -------------------- RATE LIMIT CHECK --------------------
if (!check_rate_limit($key_data)) {
    log_api_request([
        'api_key_id' => $api_key_id,
        'user_id' => $user_id,
        'client_ip' => $client_ip,
        'domain' => $request_domain,
        'endpoint' => '/api/wingo.php',
        'game_type' => 'wingo',
        'http_status' => 429,
        'response_body' => json_encode(['error' => 'Rate limit exceeded']),
        'duration_ms' => 0
    ]);
    error_response('rate_limited', 429);
}

// -------------------- FETCH FROM UPSTREAM (COMPLETELY HIDDEN!) --------------------
$type_id = $game_config['typeId'];
$upstream = fetch_upstream_data($type_id);
$duration_ms = (int)((microtime(true) - $start_time) * 1000);

if (!$upstream['success']) {
    log_api_request([
        'api_key_id' => $api_key_id,
        'user_id' => $user_id,
        'client_ip' => $client_ip,
        'domain' => $request_domain,
        'endpoint' => '/api/wingo.php',
        'game_type' => 'wingo',
        'http_status' => 502,
        'response_body' => json_encode(['error' => 'Upstream failed']),
        'duration_ms' => $duration_ms
    ]);
    error_response('upstream_error', 502);
}

// Parse response
$data = json_decode($upstream['data'], true);
if ($data === null) {
    log_api_request([
        'api_key_id' => $api_key_id,
        'user_id' => $user_id,
        'client_ip' => $client_ip,
        'domain' => $request_domain,
        'endpoint' => '/api/wingo.php',
        'game_type' => 'wingo',
        'http_status' => 502,
        'response_body' => json_encode(['error' => 'Invalid JSON']),
        'duration_ms' => $duration_ms
    ]);
    error_response('upstream_error', 502);
}

// -------------------- SUCCESS RESPONSE (NO UPSTREAM INFO!) --------------------
$response = [
    'success' => true,
    'game' => 'wingo',
    'duration' => $duration,
    'game_name' => $game_config['name'],
    'data' => $data,
    'meta' => [
        'response_time_ms' => $duration_ms,
        'timestamp' => date('c'),
        'powered_by' => 'Hyper Softs Trend API'
    ]
];

// Log successful request
log_api_request([
    'api_key_id' => $api_key_id,
    'user_id' => $user_id,
    'client_ip' => $client_ip,
    'domain' => $request_domain,
    'endpoint' => '/api/wingo.php',
    'game_type' => 'wingo',
    'request_params' => json_encode([
        'masked_key' => mask_api_key($api_key),
        'duration' => $duration
    ]),
    'response_body' => json_encode(['success' => true, 'records' => count($data['data'] ?? $data)]),
    'http_status' => 200,
    'duration_ms' => $duration_ms
]);

// Update API key usage
update_api_key_usage($api_key_id, $client_ip);

json_response($response, 200);
