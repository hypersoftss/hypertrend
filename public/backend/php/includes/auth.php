<?php
/**
 * =====================================================
 * 🔐 AUTHENTICATION HELPER
 * =====================================================
 */

session_start();

require_once __DIR__ . '/../config.php';

/**
 * Check if user is logged in
 */
function is_logged_in(): bool {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

/**
 * Check if current user is admin
 */
function is_admin(): bool {
    return isset($_SESSION['role']) && $_SESSION['role'] === 'admin';
}

/**
 * Require authentication - redirect to login if not authenticated
 */
function require_auth(): void {
    if (!is_logged_in()) {
        header('Location: login.php');
        exit;
    }
}

/**
 * Require admin role
 */
function require_admin(): void {
    require_auth();
    if (!is_admin()) {
        header('Location: dashboard.php?error=access_denied');
        exit;
    }
}

/**
 * Login user
 */
function login_user(string $username, string $password): array {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($conn->connect_error) {
        return ['success' => false, 'error' => 'Database connection failed'];
    }
    
    $stmt = $conn->prepare("SELECT id, username, email, password_hash, role, status FROM users WHERE username = ? OR email = ? LIMIT 1");
    $stmt->bind_param("ss", $username, $username);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        if ($row['status'] !== 'active') {
            $stmt->close();
            $conn->close();
            return ['success' => false, 'error' => 'Account is suspended or pending approval'];
        }
        
        if (password_verify($password, $row['password_hash'])) {
            // Update last login
            $ip = $_SERVER['REMOTE_ADDR'] ?? '';
            $update = $conn->prepare("UPDATE users SET last_login_at = NOW(), last_login_ip = ? WHERE id = ?");
            $update->bind_param("si", $ip, $row['id']);
            $update->execute();
            $update->close();
            
            // Set session
            $_SESSION['user_id'] = $row['id'];
            $_SESSION['username'] = $row['username'];
            $_SESSION['email'] = $row['email'];
            $_SESSION['role'] = $row['role'];
            
            // Log activity
            log_activity($conn, $row['id'], 'login', 'user', $row['id']);
            
            $stmt->close();
            $conn->close();
            return ['success' => true, 'user' => $row];
        }
    }
    
    $stmt->close();
    $conn->close();
    return ['success' => false, 'error' => 'Invalid username or password'];
}

/**
 * Logout user
 */
function logout_user(): void {
    session_destroy();
    header('Location: login.php');
    exit;
}

/**
 * Log activity
 */
function log_activity($conn, int $user_id, string $action, string $target_type = null, int $target_id = null, array $old_values = null, array $new_values = null): void {
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
    $old_json = $old_values ? json_encode($old_values) : null;
    $new_json = $new_values ? json_encode($new_values) : null;
    
    $stmt = $conn->prepare("INSERT INTO activity_logs (user_id, action, target_type, target_id, old_values, new_values, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ississss", $user_id, $action, $target_type, $target_id, $old_json, $new_json, $ip, $ua);
    $stmt->execute();
    $stmt->close();
}

/**
 * Change password
 */
function change_password(int $user_id, string $old_password, string $new_password): array {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($conn->connect_error) {
        return ['success' => false, 'error' => 'Database connection failed'];
    }
    
    // Verify old password
    $stmt = $conn->prepare("SELECT password_hash FROM users WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        if (!password_verify($old_password, $row['password_hash'])) {
            $stmt->close();
            $conn->close();
            return ['success' => false, 'error' => 'Current password is incorrect'];
        }
    } else {
        $stmt->close();
        $conn->close();
        return ['success' => false, 'error' => 'User not found'];
    }
    $stmt->close();
    
    // Update password
    $new_hash = password_hash($new_password, PASSWORD_DEFAULT);
    $update = $conn->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
    $update->bind_param("si", $new_hash, $user_id);
    
    if ($update->execute()) {
        log_activity($conn, $user_id, 'password_change', 'user', $user_id);
        $update->close();
        $conn->close();
        return ['success' => true, 'message' => 'Password updated successfully'];
    }
    
    $update->close();
    $conn->close();
    return ['success' => false, 'error' => 'Failed to update password'];
}

/**
 * Get current user data
 */
function get_current_user(): ?array {
    if (!is_logged_in()) return null;
    
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($conn->connect_error) return null;
    
    $stmt = $conn->prepare("SELECT id, username, email, role, status, telegram_id, phone, company_name, created_at FROM users WHERE id = ?");
    $stmt->bind_param("i", $_SESSION['user_id']);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    
    $stmt->close();
    $conn->close();
    
    return $user;
}
