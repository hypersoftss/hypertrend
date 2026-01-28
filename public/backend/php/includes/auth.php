<?php
/**
 * =====================================================
 * 🔐 AUTHENTICATION HELPER
 * =====================================================
 * 
 * Provides session management, login/logout, and access control
 * Uses PDO connection from config.php
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';

// Start session if not already started (config.php sets secure options)
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

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
    
    // Verify session is still valid (user exists and is active)
    if (!verify_session()) {
        logout_user();
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
 * Verify session is still valid
 */
function verify_session(): bool {
    if (!is_logged_in()) return false;
    
    try {
        $db = getDB();
        $stmt = $db->prepare("SELECT id, status FROM users WHERE id = ? LIMIT 1");
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch();
        
        if (!$user || $user['status'] !== 'active') {
            return false;
        }
        
        return true;
    } catch (Exception $e) {
        error_log("Session verify failed: " . $e->getMessage());
        return false;
    }
}

/**
 * Login user
 */
function login_user(string $username, string $password): array {
    try {
        $db = getDB();
        
        // Find user by username or email
        $stmt = $db->prepare("
            SELECT id, username, email, password_hash, role, status 
            FROM users 
            WHERE (username = ? OR email = ?) AND status = 'active'
            LIMIT 1
        ");
        $stmt->execute([$username, $username]);
        $user = $stmt->fetch();
        
        if (!$user) {
            return ['success' => false, 'error' => 'Invalid username or password'];
        }
        
        // Verify password
        if (!password_verify($password, $user['password_hash'])) {
            // Log failed attempt
            log_activity(0, 'login_failed', "Failed login attempt for: $username", get_client_ip());
            return ['success' => false, 'error' => 'Invalid username or password'];
        }
        
        // Update last login
        $stmt = $db->prepare("
            UPDATE users SET last_login_at = NOW(), last_login_ip = ? WHERE id = ?
        ");
        $stmt->execute([get_client_ip(), $user['id']]);
        
        // Regenerate session ID for security
        session_regenerate_id(true);
        
        // Set session data
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['login_time'] = time();
        
        // Log successful login
        log_activity($user['id'], 'login', 'User logged in successfully', get_client_ip());
        
        return [
            'success' => true,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'role' => $user['role']
            ]
        ];
        
    } catch (Exception $e) {
        error_log("Login error: " . $e->getMessage());
        return ['success' => false, 'error' => 'An error occurred during login'];
    }
}

/**
 * Logout user
 */
function logout_user(): void {
    // Log logout if user was logged in
    if (is_logged_in()) {
        log_activity($_SESSION['user_id'] ?? 0, 'logout', 'User logged out');
    }
    
    // Clear session data
    $_SESSION = [];
    
    // Delete session cookie
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(),
            '',
            time() - 42000,
            $params['path'],
            $params['domain'],
            $params['secure'],
            $params['httponly']
        );
    }
    
    // Destroy session
    session_destroy();
    
    // Redirect to login
    header('Location: login.php');
    exit;
}

/**
 * Change password
 */
function change_password(int $user_id, string $old_password, string $new_password): array {
    try {
        $db = getDB();
        
        // Verify old password
        $stmt = $db->prepare("SELECT password_hash FROM users WHERE id = ? LIMIT 1");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch();
        
        if (!$user) {
            return ['success' => false, 'error' => 'User not found'];
        }
        
        if (!password_verify($old_password, $user['password_hash'])) {
            return ['success' => false, 'error' => 'Current password is incorrect'];
        }
        
        // Validate new password
        if (strlen($new_password) < 8) {
            return ['success' => false, 'error' => 'New password must be at least 8 characters'];
        }
        
        // Update password
        $new_hash = password_hash($new_password, PASSWORD_DEFAULT);
        $stmt = $db->prepare("UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$new_hash, $user_id]);
        
        // Log activity
        log_activity($user_id, 'password_change', 'Password changed successfully');
        
        return ['success' => true, 'message' => 'Password updated successfully'];
        
    } catch (Exception $e) {
        error_log("Password change error: " . $e->getMessage());
        return ['success' => false, 'error' => 'Failed to update password'];
    }
}

/**
 * Get current user data
 */
function get_current_user(): ?array {
    if (!is_logged_in()) return null;
    
    try {
        $db = getDB();
        
        $stmt = $db->prepare("
            SELECT id, username, email, role, status, telegram_id, created_at, last_login_at 
            FROM users 
            WHERE id = ? 
            LIMIT 1
        ");
        $stmt->execute([$_SESSION['user_id']]);
        
        return $stmt->fetch() ?: null;
        
    } catch (Exception $e) {
        error_log("Get user error: " . $e->getMessage());
        return null;
    }
}

/**
 * Get current user data (with fallback to session)
 */
function get_current_user_data(): array {
    $user = get_current_user();
    
    if ($user) {
        return $user;
    }
    
    // Fallback to session data
    return [
        'id' => $_SESSION['user_id'] ?? 0,
        'username' => $_SESSION['username'] ?? 'User',
        'email' => $_SESSION['email'] ?? '',
        'role' => $_SESSION['role'] ?? 'user'
    ];
}

/**
 * Create new user (admin only)
 */
function create_user(array $data): array {
    try {
        $db = getDB();
        
        // Validate required fields
        if (empty($data['username']) || empty($data['email']) || empty($data['password'])) {
            return ['success' => false, 'error' => 'Username, email and password are required'];
        }
        
        // Check if username or email exists
        $stmt = $db->prepare("SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1");
        $stmt->execute([$data['username'], $data['email']]);
        
        if ($stmt->fetch()) {
            return ['success' => false, 'error' => 'Username or email already exists'];
        }
        
        // Create user
        $stmt = $db->prepare("
            INSERT INTO users (username, email, password_hash, role, status, telegram_id, created_at)
            VALUES (?, ?, ?, ?, 'active', ?, NOW())
        ");
        
        $password_hash = password_hash($data['password'], PASSWORD_DEFAULT);
        $role = $data['role'] ?? 'user';
        $telegram_id = $data['telegram_id'] ?? null;
        
        $stmt->execute([
            sanitize_input($data['username']),
            sanitize_input($data['email']),
            $password_hash,
            $role,
            $telegram_id
        ]);
        
        $user_id = $db->lastInsertId();
        
        // Log activity
        log_activity($_SESSION['user_id'] ?? 0, 'user_created', "Created user: {$data['username']}");
        
        return ['success' => true, 'user_id' => $user_id, 'message' => 'User created successfully'];
        
    } catch (Exception $e) {
        error_log("Create user error: " . $e->getMessage());
        return ['success' => false, 'error' => 'Failed to create user'];
    }
}

/**
 * Update user (admin only)
 */
function update_user(int $user_id, array $data): array {
    try {
        $db = getDB();
        
        $updates = [];
        $params = [];
        
        if (isset($data['email'])) {
            $updates[] = "email = ?";
            $params[] = sanitize_input($data['email']);
        }
        
        if (isset($data['role'])) {
            $updates[] = "role = ?";
            $params[] = $data['role'];
        }
        
        if (isset($data['status'])) {
            $updates[] = "status = ?";
            $params[] = $data['status'];
        }
        
        if (isset($data['telegram_id'])) {
            $updates[] = "telegram_id = ?";
            $params[] = $data['telegram_id'];
        }
        
        if (!empty($data['password'])) {
            $updates[] = "password_hash = ?";
            $params[] = password_hash($data['password'], PASSWORD_DEFAULT);
        }
        
        if (empty($updates)) {
            return ['success' => false, 'error' => 'No fields to update'];
        }
        
        $updates[] = "updated_at = NOW()";
        $params[] = $user_id;
        
        $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        
        // Log activity
        log_activity($_SESSION['user_id'] ?? 0, 'user_updated', "Updated user ID: $user_id");
        
        return ['success' => true, 'message' => 'User updated successfully'];
        
    } catch (Exception $e) {
        error_log("Update user error: " . $e->getMessage());
        return ['success' => false, 'error' => 'Failed to update user'];
    }
}

/**
 * Delete user (admin only)
 */
function delete_user(int $user_id): array {
    // Prevent deleting own account
    if ($user_id === ($_SESSION['user_id'] ?? 0)) {
        return ['success' => false, 'error' => 'Cannot delete your own account'];
    }
    
    try {
        $db = getDB();
        
        // Get username for logging
        $stmt = $db->prepare("SELECT username FROM users WHERE id = ?");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch();
        
        if (!$user) {
            return ['success' => false, 'error' => 'User not found'];
        }
        
        // Delete user (cascade will handle related records)
        $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$user_id]);
        
        // Log activity
        log_activity($_SESSION['user_id'] ?? 0, 'user_deleted', "Deleted user: {$user['username']}");
        
        return ['success' => true, 'message' => 'User deleted successfully'];
        
    } catch (Exception $e) {
        error_log("Delete user error: " . $e->getMessage());
        return ['success' => false, 'error' => 'Failed to delete user'];
    }
}

/**
 * Get all users (admin only)
 */
function get_all_users(): array {
    try {
        $db = getDB();
        
        $stmt = $db->query("
            SELECT id, username, email, role, status, telegram_id, created_at, last_login_at
            FROM users
            ORDER BY created_at DESC
        ");
        
        return $stmt->fetchAll();
        
    } catch (Exception $e) {
        error_log("Get users error: " . $e->getMessage());
        return [];
    }
}
