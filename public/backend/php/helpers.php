<?php
/**
 * =====================================================
 * 🛠️ HYPER SOFTS TREND API - HELPER FUNCTIONS
 * =====================================================
 */

require_once __DIR__ . '/config.php';

/**
 * Get client's real IP address
 */
function get_client_ip(): string {
    $headers = ['HTTP_CF_CONNECTING_IP', 'HTTP_X_REAL_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];
    foreach ($headers as $header) {
        if (!empty($_SERVER[$header])) {
            $ips = explode(',', $_SERVER[$header]);
            $ip = trim($ips[0]);
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                return $ip;
            }
        }
    }
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

/**
 * Get request domain/origin
 */
function get_request_domain(): string {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $referer = $_SERVER['HTTP_REFERER'] ?? '';
    
    if ($origin) {
        return parse_url($origin, PHP_URL_HOST) ?? '';
    }
    if ($referer) {
        return parse_url($referer, PHP_URL_HOST) ?? '';
    }
    return '';
}

/**
 * Check if IP matches CIDR notation
 */
function ip_in_cidr(string $ip, string $cidr): bool {
    if (strpos($cidr, '/') === false) {
        return $ip === $cidr;
    }
    
    list($network, $mask) = explode('/', $cidr, 2);
    $mask = (int)$mask;
    
    // IPv6 support
    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
        return ipv6_in_cidr($ip, $network, $mask);
    }
    
    // IPv4
    $ip_long = ip2long($ip);
    $network_long = ip2long($network);
    
    if ($ip_long === false || $network_long === false) return false;
    if ($mask < 0 || $mask > 32) return false;
    
    $netmask = ($mask === 0) ? 0 : (~0 << (32 - $mask)) & 0xFFFFFFFF;
    return (($ip_long & $netmask) === ($network_long & $netmask));
}

/**
 * IPv6 CIDR check
 */
function ipv6_in_cidr(string $ip, string $network, int $mask): bool {
    $ip_bin = inet_pton($ip);
    $network_bin = inet_pton($network);
    
    if ($ip_bin === false || $network_bin === false) return false;
    
    $ip_hex = bin2hex($ip_bin);
    $network_hex = bin2hex($network_bin);
    
    $prefix_len = intval($mask / 4);
    return substr($ip_hex, 0, $prefix_len) === substr($network_hex, 0, $prefix_len);
}

/**
 * Check domain against whitelist (supports wildcards)
 */
function domain_matches(string $domain, string $pattern): bool {
    $domain = strtolower(trim($domain));
    $pattern = strtolower(trim($pattern));
    
    // Exact match
    if ($domain === $pattern) return true;
    
    // Wildcard match (*.example.com)
    if (strpos($pattern, '*.') === 0) {
        $base = substr($pattern, 2);
        return $domain === $base || str_ends_with($domain, '.' . $base);
    }
    
    return false;
}

/**
 * Mask API key for logging
 */
function mask_api_key(?string $key): string {
    if (!$key) return '****';
    $len = strlen($key);
    if ($len <= 8) return str_repeat('*', $len);
    return substr($key, 0, 4) . str_repeat('*', max(0, $len - 8)) . substr($key, -4);
}

/**
 * JSON response and exit
 */
function json_response(array $data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Error response
 */
function error_response(string $error_key, int $status = 400, array $extra = []): void {
    $message = ERROR_MESSAGES[$error_key] ?? 'Unknown error';
    json_response(array_merge([
        'success' => false,
        'error' => $message,
        'code' => strtoupper($error_key),
        'timestamp' => date('c')
    ], $extra), $status);
}

/**
 * Get database connection
 */
function get_db_connection(): mysqli {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($conn->connect_error) {
        error_log("DB Connection failed: " . $conn->connect_error);
        error_response('server_error', 500);
    }
    $conn->set_charset('utf8mb4');
    return $conn;
}

/**
 * Check IP whitelist
 */
function check_ip_whitelist(string $client_ip): bool {
    if (!ENABLE_IP_WHITELIST) return true;
    
    $conn = get_db_connection();
    
    // Check global whitelist
    $stmt = $conn->prepare("SELECT resolved_ip FROM allowed_ips WHERE status = 'active' AND resolved_ip IS NOT NULL");
    if (!$stmt) {
        $conn->close();
        return false;
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $allowed = false;
    while ($row = $result->fetch_assoc()) {
        $entry = trim($row['resolved_ip']);
        if (!empty($entry) && ip_in_cidr($client_ip, $entry)) {
            $allowed = true;
            break;
        }
    }
    
    $stmt->close();
    $conn->close();
    
    return $allowed;
}

/**
 * Check domain whitelist
 */
function check_domain_whitelist(string $domain, int $api_key_id): bool {
    if (!ENABLE_DOMAIN_WHITELIST || empty($domain)) return true;
    
    $conn = get_db_connection();
    
    // Check key-specific whitelist
    $stmt = $conn->prepare("SELECT whitelisted_domains FROM api_keys WHERE id = ?");
    $stmt->bind_param("i", $api_key_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        $domains = json_decode($row['whitelisted_domains'] ?? '[]', true) ?: [];
        foreach ($domains as $pattern) {
            if (domain_matches($domain, $pattern)) {
                $stmt->close();
                $conn->close();
                return true;
            }
        }
    }
    
    $stmt->close();
    $conn->close();
    
    return false;
}

/**
 * Validate API key
 */
function validate_api_key(string $api_key): ?array {
    if (empty($api_key)) return null;
    
    $conn = get_db_connection();
    
    $stmt = $conn->prepare("
        SELECT id, user_id, game_type, status, expires_at, 
               whitelisted_ips, whitelisted_domains, daily_limit, monthly_limit
        FROM api_keys 
        WHERE api_key = ? 
        LIMIT 1
    ");
    
    if (!$stmt) {
        $conn->close();
        return null;
    }
    
    $stmt->bind_param("s", $api_key);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        $stmt->close();
        $conn->close();
        return $row;
    }
    
    $stmt->close();
    $conn->close();
    return null;
}

/**
 * Log API request
 */
function log_api_request(array $log_data): bool {
    if (!LOG_ALL_REQUESTS) return true;
    
    $conn = get_db_connection();
    
    $sql = "INSERT INTO api_logs 
            (api_key_id, user_id, client_ip, domain, endpoint, game_type, 
             request_params, response_body, http_status, duration_ms, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
    
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        error_log("Log prepare failed: " . $conn->error);
        $conn->close();
        return false;
    }
    
    $api_key_id = $log_data['api_key_id'] ?? null;
    $user_id = $log_data['user_id'] ?? null;
    $client_ip = $log_data['client_ip'] ?? '';
    $domain = $log_data['domain'] ?? '';
    $endpoint = $log_data['endpoint'] ?? '';
    $game_type = $log_data['game_type'] ?? '';
    $request_params = $log_data['request_params'] ?? '';
    $response_body = $log_data['response_body'] ?? '';
    $http_status = (int)($log_data['http_status'] ?? 0);
    $duration_ms = (int)($log_data['duration_ms'] ?? 0);
    
    $stmt->bind_param(
        "iissssssii",
        $api_key_id, $user_id, $client_ip, $domain, $endpoint, $game_type,
        $request_params, $response_body, $http_status, $duration_ms
    );
    
    $ok = $stmt->execute();
    if (!$ok) error_log("Log insert failed: " . $stmt->error);
    
    $stmt->close();
    $conn->close();
    
    return $ok;
}

/**
 * Fetch from upstream API (HIDDEN!)
 */
function fetch_upstream_data(string $type_id): array {
    $url = UPSTREAM_API_BASE . UPSTREAM_API_ENDPOINT . '?typeId=' . urlencode($type_id);
    
    $start = microtime(true);
    $response = false;
    $http_code = 0;
    
    if (function_exists('curl_init')) {
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL            => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 30,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_USERAGENT      => 'HyperSofts-API/1.0',
            CURLOPT_HTTPHEADER     => [
                'Accept: application/json',
                'Cache-Control: no-cache'
            ]
        ]);
        
        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($error) {
            error_log("Upstream CURL error: $error");
        }
    } else {
        $context = stream_context_create([
            'http' => [
                'timeout' => 30,
                'method' => 'GET',
                'header' => "Accept: application/json\r\nUser-Agent: HyperSofts-API/1.0"
            ],
            'ssl' => ['verify_peer' => true]
        ]);
        
        $response = @file_get_contents($url, false, $context);
        
        if (isset($http_response_header)) {
            foreach ($http_response_header as $hdr) {
                if (preg_match('#HTTP/\d+\.?\d*\s+(\d+)#', $hdr, $m)) {
                    $http_code = (int)$m[1];
                    break;
                }
            }
        }
    }
    
    $duration_ms = (int)((microtime(true) - $start) * 1000);
    
    return [
        'success' => ($http_code === 200 && $response !== false),
        'data' => $response,
        'http_code' => $http_code,
        'duration_ms' => $duration_ms
    ];
}

/**
 * Send Telegram notification
 */
function send_telegram_notification(string $message): bool {
    if (empty(TELEGRAM_BOT_TOKEN) || empty(ADMIN_TELEGRAM_ID)) return false;
    
    $url = "https://api.telegram.org/bot" . TELEGRAM_BOT_TOKEN . "/sendMessage";
    
    $data = [
        'chat_id' => ADMIN_TELEGRAM_ID,
        'text' => $message,
        'parse_mode' => 'HTML'
    ];
    
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
    
    return $result !== false;
}

/**
 * Set CORS headers
 */
function set_cors_headers(): void {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    if (in_array($origin, ALLOWED_ORIGINS)) {
        header("Access-Control-Allow-Origin: $origin");
    }
    
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-API-Key');
    header('Access-Control-Max-Age: 86400');
    
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}
