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
 * Get database connection (uses global PDO from config.php)
 * For backward compatibility - prefer using getDB() directly
 */
function get_db_connection(): PDO {
    return getDB();
}

/**
 * Check IP whitelist
 */
function check_ip_whitelist(string $client_ip): bool {
    if (!ENABLE_IP_WHITELIST) return true;
    
    $db = getDB();
    
    $stmt = $db->prepare("SELECT resolved_ip FROM allowed_ips WHERE status = 'active' AND resolved_ip IS NOT NULL");
    $stmt->execute();
    
    while ($row = $stmt->fetch()) {
        $entry = trim($row['resolved_ip']);
        if (!empty($entry) && ip_in_cidr($client_ip, $entry)) {
            return true;
        }
    }
    
    return false;
}

/**
 * Check key-specific IP whitelist
 */
function check_key_ip_whitelist(string $client_ip, array $key_data): bool {
    $whitelisted_ips = json_decode($key_data['whitelisted_ips'] ?? '[]', true) ?: [];
    
    // If no IPs whitelisted, allow all
    if (empty($whitelisted_ips)) return true;
    
    foreach ($whitelisted_ips as $allowed_ip) {
        if (ip_in_cidr($client_ip, trim($allowed_ip))) {
            return true;
        }
    }
    
    return false;
}

/**
 * Check domain whitelist
 */
function check_domain_whitelist(string $domain, array $key_data): bool {
    if (!ENABLE_DOMAIN_WHITELIST || empty($domain)) return true;
    
    $whitelisted_domains = json_decode($key_data['whitelisted_domains'] ?? '[]', true) ?: [];
    
    // If no domains whitelisted, allow all
    if (empty($whitelisted_domains)) return true;
    
    foreach ($whitelisted_domains as $pattern) {
        if (domain_matches($domain, $pattern)) {
            return true;
        }
    }
    
    return false;
}

/**
 * Validate API key
 */
function validate_api_key(string $api_key): ?array {
    if (empty($api_key)) return null;
    
    $db = getDB();
    
    $stmt = $db->prepare("
        SELECT id, user_id, game_type, status, expires_at, 
               whitelisted_ips, whitelisted_domains, daily_limit, monthly_limit,
               calls_today, calls_this_month, total_calls
        FROM api_keys 
        WHERE api_key = ? 
        LIMIT 1
    ");
    
    $stmt->execute([$api_key]);
    $row = $stmt->fetch();
    
    return $row ?: null;
}

/**
 * Log API request
 */
function log_api_request(array $log_data): bool {
    if (!LOG_ALL_REQUESTS) return true;
    
    try {
        $db = getDB();
        
        $sql = "INSERT INTO api_logs 
                (api_key_id, user_id, client_ip, domain, endpoint, game_type, 
                 request_params, response_body, http_status, duration_ms, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
        
        $stmt = $db->prepare($sql);
        
        return $stmt->execute([
            $log_data['api_key_id'] ?? null,
            $log_data['user_id'] ?? null,
            $log_data['client_ip'] ?? '',
            $log_data['domain'] ?? '',
            $log_data['endpoint'] ?? '',
            $log_data['game_type'] ?? '',
            $log_data['request_params'] ?? '',
            $log_data['response_body'] ?? '',
            (int)($log_data['http_status'] ?? 0),
            (int)($log_data['duration_ms'] ?? 0)
        ]);
    } catch (Exception $e) {
        error_log("Log insert failed: " . $e->getMessage());
        return false;
    }
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
function send_telegram_notification(string $message, ?string $chat_id = null): bool {
    if (empty(TELEGRAM_BOT_TOKEN)) return false;
    
    $target_chat_id = $chat_id ?? ADMIN_TELEGRAM_ID;
    if (empty($target_chat_id)) return false;
    
    $url = "https://api.telegram.org/bot" . TELEGRAM_BOT_TOKEN . "/sendMessage";
    
    $data = [
        'chat_id' => $target_chat_id,
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
    $success = $result !== false;
    curl_close($ch);
    
    // Log to database
    log_telegram_notification($target_chat_id, $message, $success);
    
    return $success;
}

/**
 * Log Telegram notification to database
 */
function log_telegram_notification(string $chat_id, string $message, bool $success): void {
    try {
        $db = getDB();
        
        $stmt = $db->prepare("
            INSERT INTO telegram_logs (chat_id, message, status, created_at)
            VALUES (?, ?, ?, NOW())
        ");
        
        $status = $success ? 'sent' : 'failed';
        $stmt->execute([$chat_id, $message, $status]);
    } catch (Exception $e) {
        error_log("Telegram log failed: " . $e->getMessage());
    }
}

/**
 * Set CORS headers
 */
function set_cors_headers(): void {
    if (!defined('CORS_ENABLED') || !CORS_ENABLED) return;
    
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    if (in_array($origin, ALLOWED_ORIGINS)) {
        header("Access-Control-Allow-Origin: $origin");
        header('Vary: Origin');
    }
    
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-API-Key');
    header('Access-Control-Max-Age: 86400');
    
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

/**
 * Update API key usage stats
 */
function update_api_key_usage(int $api_key_id, string $client_ip): void {
    try {
        $db = getDB();
        
        $stmt = $db->prepare("
            UPDATE api_keys 
            SET calls_today = calls_today + 1,
                calls_this_month = calls_this_month + 1,
                total_calls = total_calls + 1,
                last_used_at = NOW(),
                last_used_ip = ?
            WHERE id = ?
        ");
        
        $stmt->execute([$client_ip, $api_key_id]);
    } catch (Exception $e) {
        error_log("Usage update failed: " . $e->getMessage());
    }
}

/**
 * Check rate limit
 */
function check_rate_limit(array $key_data): bool {
    if (!RATE_LIMIT_ENABLED) return true;
    
    $daily_limit = $key_data['daily_limit'] ?? 10000;
    $monthly_limit = $key_data['monthly_limit'] ?? 300000;
    $calls_today = $key_data['calls_today'] ?? 0;
    $calls_this_month = $key_data['calls_this_month'] ?? 0;
    
    if ($calls_today >= $daily_limit) return false;
    if ($calls_this_month >= $monthly_limit) return false;
    
    return true;
}

/**
 * Get API stats for a user
 */
function get_user_api_stats(int $user_id): array {
    $stats = [
        'total_calls' => 0,
        'calls_today' => 0,
        'success_rate' => 0,
        'avg_response_time' => 0
    ];
    
    try {
        $db = getDB();
        
        $stmt = $db->prepare("
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN http_status = 200 THEN 1 ELSE 0 END) as success,
                AVG(duration_ms) as avg_time,
                SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as today
            FROM api_logs 
            WHERE user_id = ?
        ");
        
        $stmt->execute([$user_id]);
        $row = $stmt->fetch();
        
        if ($row) {
            $stats['total_calls'] = (int)$row['total'];
            $stats['calls_today'] = (int)$row['today'];
            $stats['avg_response_time'] = round((float)$row['avg_time'], 2);
            
            if ($row['total'] > 0) {
                $stats['success_rate'] = round(($row['success'] / $row['total']) * 100, 1);
            }
        }
    } catch (Exception $e) {
        error_log("Stats fetch failed: " . $e->getMessage());
    }
    
    return $stats;
}

/**
 * Log activity
 */
function log_activity(int $user_id, string $action, string $details = '', ?string $ip = null): void {
    try {
        $db = getDB();
        
        $stmt = $db->prepare("
            INSERT INTO activity_logs (user_id, action, details, ip_address, created_at)
            VALUES (?, ?, ?, ?, NOW())
        ");
        
        $stmt->execute([
            $user_id,
            $action,
            $details,
            $ip ?? get_client_ip()
        ]);
    } catch (Exception $e) {
        error_log("Activity log failed: " . $e->getMessage());
    }
}

/**
 * Get setting value from database (alias for getSetting in config.php)
 * @deprecated Use getSetting() from config.php instead
 */
function get_setting(string $key, $default = null) {
    return getSetting($key, $default);
}

/**
 * Update setting value (alias for updateSetting in config.php)
 * @deprecated Use updateSetting() from config.php instead
 */
function update_setting(string $key, string $value): bool {
    return updateSetting($key, $value);
}

/**
 * Upsert setting value (insert or update)
 */
function upsert_setting(string $key, string $value, string $type = 'text'): bool {
    try {
        $db = getDB();
        
        $stmt = $db->prepare("
            INSERT INTO settings (setting_key, setting_value, setting_type, updated_at)
            VALUES (?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = NOW()
        ");
        
        return $stmt->execute([$key, $value, $type]);
    } catch (Exception $e) {
        error_log("Setting upsert failed: " . $e->getMessage());
        return false;
    }
}

/**
 * Generate secure API key
 */
function generate_api_key(string $prefix = 'hs'): string {
    return $prefix . '_' . bin2hex(random_bytes(24));
}

/**
 * Format bytes to human readable
 */
function format_bytes(int $bytes, int $precision = 2): string {
    $units = ['B', 'KB', 'MB', 'GB', 'TB'];
    
    for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
        $bytes /= 1024;
    }
    
    return round($bytes, $precision) . ' ' . $units[$i];
}

/**
 * Sanitize user input
 */
function sanitize_input(string $input): string {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

/**
 * Validate email format
 */
function is_valid_email(string $email): bool {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}
