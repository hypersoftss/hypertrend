<?php
/**
 * =====================================================
 * 🎯 HYPER SOFTS TREND API - MAIN ENDPOINT
 * =====================================================
 * 
 * USAGE: /api/trend.php?api_key=YOUR_KEY&game=wingo_1min
 * 
 * This file handles ALL game types through a single endpoint.
 * The real upstream API (betapi.space) is completely hidden.
 * Users only see YOUR domain.
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
        'endpoint' => $_SERVER['REQUEST_URI'] ?? '',
        'http_status' => 403,
        'response_body' => json_encode(['error' => 'IP blocked']),
        'duration_ms' => 0
    ]);
    error_response('ip_blocked', 403);
}

// -------------------- GET PARAMETERS --------------------
$api_key = $_GET['api_key'] ?? $_SERVER['HTTP_X_API_KEY'] ?? '';
$game = strtolower(trim($_GET['game'] ?? ''));

// Validate required params
if (empty($api_key)) {
    error_response('invalid_key', 401);
}

if (empty($game)) {
    json_response([
        'success' => false,
        'error' => 'Missing game parameter',
        'available_games' => array_keys(GAME_TYPES),
        'example' => '?api_key=YOUR_KEY&game=wingo_1min'
    ], 400);
}

// Check if game type exists
if (!isset(GAME_TYPES[$game])) {
    json_response([
        'success' => false,
        'error' => 'Invalid game type',
        'provided' => $game,
        'available_games' => array_keys(GAME_TYPES)
    ], 400);
}

// -------------------- API KEY VALIDATION --------------------
$key_data = validate_api_key($api_key);

if (!$key_data) {
    log_api_request([
        'client_ip' => $client_ip,
        'domain' => $request_domain,
        'endpoint' => $_SERVER['REQUEST_URI'] ?? '',
        'game_type' => $game,
        'request_params' => json_encode(['masked_key' => mask_api_key($api_key)]),
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
        'endpoint' => $_SERVER['REQUEST_URI'] ?? '',
        'game_type' => $game,
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
        'endpoint' => $_SERVER['REQUEST_URI'] ?? '',
        'game_type' => $game,
        'http_status' => 403,
        'response_body' => json_encode(['error' => 'Key expired']),
        'duration_ms' => 0
    ]);
    error_response('key_expired', 403);
}

// Check game type permission (if key is restricted to specific game)
if (!empty($key_data['game_type']) && $key_data['game_type'] !== 'all') {
    $allowed_games = explode(',', $key_data['game_type']);
    $game_prefix = explode('_', $game)[0]; // wingo, k3, 5d, trx, numeric
    
    if (!in_array($game_prefix, $allowed_games) && !in_array($game, $allowed_games)) {
        json_response([
            'success' => false,
            'error' => 'Your API key does not have access to this game type',
            'requested_game' => $game,
            'allowed_games' => $allowed_games
        ], 403);
    }
}

// -------------------- DOMAIN WHITELIST CHECK --------------------
if (!check_domain_whitelist($request_domain, $api_key_id)) {
    log_api_request([
        'api_key_id' => $api_key_id,
        'user_id' => $user_id,
        'client_ip' => $client_ip,
        'domain' => $request_domain,
        'endpoint' => $_SERVER['REQUEST_URI'] ?? '',
        'game_type' => $game,
        'http_status' => 403,
        'response_body' => json_encode(['error' => 'Domain blocked']),
        'duration_ms' => 0
    ]);
    error_response('domain_blocked', 403);
}

// -------------------- FETCH DATA FROM UPSTREAM (HIDDEN!) --------------------
$game_config = GAME_TYPES[$game];
$type_id = $game_config['typeId'];

$upstream = fetch_upstream_data($type_id);
$duration_ms = (int)((microtime(true) - $start_time) * 1000);

if (!$upstream['success']) {
    log_api_request([
        'api_key_id' => $api_key_id,
        'user_id' => $user_id,
        'client_ip' => $client_ip,
        'domain' => $request_domain,
        'endpoint' => $_SERVER['REQUEST_URI'] ?? '',
        'game_type' => $game,
        'http_status' => 502,
        'response_body' => json_encode(['error' => 'Upstream failed']),
        'duration_ms' => $duration_ms
    ]);
    error_response('upstream_error', 502);
}

// Parse upstream response
$data = json_decode($upstream['data'], true);
if ($data === null) {
    log_api_request([
        'api_key_id' => $api_key_id,
        'user_id' => $user_id,
        'client_ip' => $client_ip,
        'domain' => $request_domain,
        'endpoint' => $_SERVER['REQUEST_URI'] ?? '',
        'game_type' => $game,
        'http_status' => 502,
        'response_body' => json_encode(['error' => 'Invalid JSON from upstream']),
        'duration_ms' => $duration_ms
    ]);
    error_response('upstream_error', 502);
}

// -------------------- SUCCESS RESPONSE --------------------
// Wrap response with our metadata (NO upstream info exposed!)
$response = [
    'success' => true,
    'game' => $game,
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
    'endpoint' => $_SERVER['REQUEST_URI'] ?? '',
    'game_type' => $game,
    'request_params' => json_encode([
        'masked_key' => mask_api_key($api_key),
        'game' => $game
    ]),
    'response_body' => json_encode(['success' => true, 'records' => count($data['data'] ?? $data)]),
    'http_status' => 200,
    'duration_ms' => $duration_ms
]);

json_response($response, 200);
