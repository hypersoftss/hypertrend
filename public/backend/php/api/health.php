<?php
/**
 * =====================================================
 * 💚 HEALTH CHECK ENDPOINT
 * =====================================================
 * 
 * Check server status, database connectivity, and system health
 * 
 * USAGE: GET /api/health.php
 * 
 * =====================================================
 */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-cache, no-store, must-revalidate');

$start_time = microtime(true);

// Response structure
$health = [
    'status' => 'healthy',
    'timestamp' => date('c'),
    'uptime' => @exec('uptime -p') ?: 'unknown',
    'checks' => [],
    'meta' => [
        'php_version' => PHP_VERSION,
        'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'unknown',
        'powered_by' => 'Hyper Softs Trend API'
    ]
];

$all_healthy = true;

// -------------------- PHP CHECK --------------------
$health['checks']['php'] = [
    'status' => 'ok',
    'version' => PHP_VERSION,
    'extensions' => [
        'curl' => extension_loaded('curl'),
        'mysqli' => extension_loaded('mysqli'),
        'json' => extension_loaded('json'),
        'mbstring' => extension_loaded('mbstring')
    ]
];

// -------------------- DATABASE CHECK --------------------
try {
    require_once __DIR__ . '/../config.php';
    
    $db_start = microtime(true);
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    $db_time = round((microtime(true) - $db_start) * 1000, 2);
    
    if ($conn->connect_error) {
        throw new Exception($conn->connect_error);
    }
    
    // Test query
    $result = $conn->query("SELECT 1 as test");
    $conn->close();
    
    $health['checks']['database'] = [
        'status' => 'ok',
        'response_time_ms' => $db_time,
        'connection' => 'established'
    ];
} catch (Exception $e) {
    $all_healthy = false;
    $health['checks']['database'] = [
        'status' => 'error',
        'message' => 'Connection failed',
        'error' => $e->getMessage()
    ];
}

// -------------------- UPSTREAM API CHECK --------------------
try {
    $upstream_start = microtime(true);
    
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => UPSTREAM_API_BASE,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 5,
        CURLOPT_CONNECTTIMEOUT => 3,
        CURLOPT_NOBODY => true, // HEAD request
        CURLOPT_SSL_VERIFYPEER => false
    ]);
    
    curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $upstream_time = round((microtime(true) - $upstream_start) * 1000, 2);
    curl_close($ch);
    
    if ($http_code >= 200 && $http_code < 500) {
        $health['checks']['upstream'] = [
            'status' => 'ok',
            'response_time_ms' => $upstream_time,
            'reachable' => true
        ];
    } else {
        throw new Exception("HTTP $http_code");
    }
} catch (Exception $e) {
    $all_healthy = false;
    $health['checks']['upstream'] = [
        'status' => 'warning',
        'message' => 'Upstream may be slow or unavailable',
        'reachable' => false
    ];
}

// -------------------- DISK SPACE CHECK --------------------
$disk_free = @disk_free_space('/');
$disk_total = @disk_total_space('/');

if ($disk_free !== false && $disk_total !== false) {
    $disk_percent_free = round(($disk_free / $disk_total) * 100, 1);
    
    $health['checks']['disk'] = [
        'status' => $disk_percent_free > 10 ? 'ok' : 'warning',
        'free_percent' => $disk_percent_free,
        'free_gb' => round($disk_free / 1073741824, 2),
        'total_gb' => round($disk_total / 1073741824, 2)
    ];
    
    if ($disk_percent_free <= 10) {
        $all_healthy = false;
    }
} else {
    $health['checks']['disk'] = [
        'status' => 'unknown',
        'message' => 'Cannot read disk info'
    ];
}

// -------------------- MEMORY CHECK --------------------
$memory_limit = ini_get('memory_limit');
$memory_usage = memory_get_usage(true);

$health['checks']['memory'] = [
    'status' => 'ok',
    'limit' => $memory_limit,
    'usage_mb' => round($memory_usage / 1048576, 2),
    'peak_mb' => round(memory_get_peak_usage(true) / 1048576, 2)
];

// -------------------- FINAL STATUS --------------------
$health['status'] = $all_healthy ? 'healthy' : 'degraded';
$health['response_time_ms'] = round((microtime(true) - $start_time) * 1000, 2);

// Set HTTP status based on health
http_response_code($all_healthy ? 200 : 503);

echo json_encode($health, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
