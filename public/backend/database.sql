-- =====================================================
-- 🚀 HYPER SOFTS TREND - DATABASE SCHEMA
-- MySQL 8.0+ Compatible
-- =====================================================

CREATE DATABASE IF NOT EXISTS hyper_softs_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hyper_softs_db;

-- =====================================================
-- 👤 USERS TABLE
-- =====================================================
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- bcrypt hashed
    telegram_id VARCHAR(50) DEFAULT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME DEFAULT NULL,
    login_ip VARCHAR(45) DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_telegram_id (telegram_id),
    INDEX idx_role (role),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB;

-- =====================================================
-- 🔑 API KEYS TABLE
-- =====================================================
CREATE TABLE api_keys (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    api_key VARCHAR(100) UNIQUE NOT NULL, -- Format: HYPER_xxxx
    user_id VARCHAR(36) NOT NULL,
    game_type ENUM('wingo', 'k3', '5d', 'trx', 'numeric') NOT NULL,
    duration ENUM('1min', '3min', '5min', '10min', '30min') NOT NULL,
    domain VARCHAR(255) NOT NULL,
    ip_whitelist JSON DEFAULT '[]', -- Array of IPs (IPv4 & IPv6)
    domain_whitelist JSON DEFAULT '[]', -- Array of domains
    validity_days INT NOT NULL DEFAULT 30,
    expires_at DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    total_calls BIGINT DEFAULT 0,
    success_calls BIGINT DEFAULT 0,
    failed_calls BIGINT DEFAULT 0,
    blocked_calls BIGINT DEFAULT 0,
    last_used DATETIME DEFAULT NULL,
    last_ip VARCHAR(45) DEFAULT NULL,
    last_domain VARCHAR(255) DEFAULT NULL,
    created_by VARCHAR(36) NOT NULL, -- Admin who created
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    
    INDEX idx_api_key (api_key),
    INDEX idx_user_id (user_id),
    INDEX idx_game_type (game_type),
    INDEX idx_is_active (is_active),
    INDEX idx_expires_at (expires_at),
    INDEX idx_domain (domain)
) ENGINE=InnoDB;

-- =====================================================
-- 📊 API LOGS TABLE
-- =====================================================
CREATE TABLE api_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    api_key_id VARCHAR(36) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) DEFAULT 'GET',
    request_ip VARCHAR(45) NOT NULL,
    request_domain VARCHAR(255) DEFAULT NULL,
    user_agent TEXT DEFAULT NULL,
    request_headers JSON DEFAULT NULL,
    request_body JSON DEFAULT NULL,
    response_status INT DEFAULT NULL,
    response_body JSON DEFAULT NULL,
    status ENUM('success', 'error', 'blocked', 'rate_limited') NOT NULL,
    error_message TEXT DEFAULT NULL,
    response_time INT DEFAULT 0, -- in milliseconds
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE CASCADE,
    
    INDEX idx_api_key_id (api_key_id),
    INDEX idx_status (status),
    INDEX idx_request_ip (request_ip),
    INDEX idx_created_at (created_at),
    INDEX idx_endpoint (endpoint(191))
) ENGINE=InnoDB;

-- =====================================================
-- 📱 TELEGRAM LOGS TABLE
-- =====================================================
CREATE TABLE telegram_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type ENUM(
        'new_key', 
        'reminder', 
        'renewal_request', 
        'login_alert', 
        'health_status',
        'key_expired',
        'server_down',
        'manual_message'
    ) NOT NULL,
    recipient_id VARCHAR(50) NOT NULL, -- Telegram chat ID
    recipient_type ENUM('admin', 'user') DEFAULT 'user',
    message TEXT NOT NULL,
    message_id VARCHAR(50) DEFAULT NULL, -- Telegram message ID
    status ENUM('sent', 'failed', 'pending') DEFAULT 'pending',
    error_message TEXT DEFAULT NULL,
    retry_count INT DEFAULT 0,
    related_api_key_id VARCHAR(36) DEFAULT NULL,
    related_user_id VARCHAR(36) DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    sent_at DATETIME DEFAULT NULL,
    
    FOREIGN KEY (related_api_key_id) REFERENCES api_keys(id) ON DELETE SET NULL,
    FOREIGN KEY (related_user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_type (type),
    INDEX idx_recipient_id (recipient_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- =====================================================
-- 📝 ACTIVITY LOGS TABLE
-- =====================================================
CREATE TABLE activity_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) DEFAULT NULL,
    action VARCHAR(100) NOT NULL,
    action_type ENUM(
        'login', 'logout', 'create', 'update', 'delete',
        'view', 'export', 'send_reminder', 'api_call'
    ) NOT NULL,
    entity_type VARCHAR(50) DEFAULT NULL, -- users, api_keys, settings, etc.
    entity_id VARCHAR(36) DEFAULT NULL,
    details TEXT DEFAULT NULL,
    old_value JSON DEFAULT NULL,
    new_value JSON DEFAULT NULL,
    ip VARCHAR(45) DEFAULT NULL,
    user_agent TEXT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_action_type (action_type),
    INDEX idx_entity_type (entity_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- =====================================================
-- ⚙️ SETTINGS TABLE
-- =====================================================
CREATE TABLE settings (
    id INT PRIMARY KEY DEFAULT 1,
    site_name VARCHAR(100) DEFAULT 'Hyper Softs Trend',
    site_logo VARCHAR(255) DEFAULT NULL,
    admin_email VARCHAR(100) DEFAULT NULL,
    telegram_bot_token VARCHAR(255) DEFAULT NULL,
    admin_telegram_id VARCHAR(50) DEFAULT NULL,
    webhook_url VARCHAR(255) DEFAULT NULL,
    bet_api_key VARCHAR(255) DEFAULT NULL,
    bet_api_base_url VARCHAR(255) DEFAULT 'https://betapi.space/api',
    auto_reminder_enabled BOOLEAN DEFAULT TRUE,
    auto_reminder_days INT DEFAULT 7,
    login_alerts_enabled BOOLEAN DEFAULT TRUE,
    health_notifications_enabled BOOLEAN DEFAULT TRUE,
    rate_limit_per_minute INT DEFAULT 60,
    rate_limit_per_day INT DEFAULT 10000,
    maintenance_mode BOOLEAN DEFAULT FALSE,
    maintenance_message TEXT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CHECK (id = 1) -- Only one settings row allowed
) ENGINE=InnoDB;

-- =====================================================
-- 🔄 RENEWAL REQUESTS TABLE
-- =====================================================
CREATE TABLE renewal_requests (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    api_key_id VARCHAR(36) NOT NULL,
    message TEXT DEFAULT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    admin_response TEXT DEFAULT NULL,
    processed_by VARCHAR(36) DEFAULT NULL,
    processed_at DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_user_id (user_id),
    INDEX idx_api_key_id (api_key_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- =====================================================
-- 🔐 SESSIONS TABLE (Optional - for JWT refresh tokens)
-- =====================================================
CREATE TABLE sessions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    refresh_token VARCHAR(500) NOT NULL,
    device_info VARCHAR(255) DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    expires_at DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_refresh_token (refresh_token(191)),
    INDEX idx_expires_at (expires_at),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB;

-- =====================================================
-- 📈 STATS TABLE (Daily aggregated stats)
-- =====================================================
CREATE TABLE daily_stats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    total_api_calls BIGINT DEFAULT 0,
    success_calls BIGINT DEFAULT 0,
    error_calls BIGINT DEFAULT 0,
    blocked_calls BIGINT DEFAULT 0,
    unique_ips INT DEFAULT 0,
    new_users INT DEFAULT 0,
    new_keys INT DEFAULT 0,
    expired_keys INT DEFAULT 0,
    telegram_messages_sent INT DEFAULT 0,
    avg_response_time INT DEFAULT 0, -- in milliseconds
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_date (date)
) ENGINE=InnoDB;

-- =====================================================
-- 🎲 GAME TYPE STATS TABLE
-- =====================================================
CREATE TABLE game_stats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    game_type ENUM('wingo', 'k3', '5d', 'trx', 'numeric') NOT NULL,
    duration ENUM('1min', '3min', '5min', '10min', '30min') NOT NULL,
    total_calls BIGINT DEFAULT 0,
    success_calls BIGINT DEFAULT 0,
    error_calls BIGINT DEFAULT 0,
    avg_response_time INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_game_date (date, game_type, duration),
    INDEX idx_date (date),
    INDEX idx_game_type (game_type)
) ENGINE=InnoDB;

-- =====================================================
-- 📥 INSERT DEFAULT DATA
-- =====================================================

-- Default Admin User (Password: Admin@123)
INSERT INTO users (id, username, email, password, telegram_id, role, is_active) VALUES
(UUID(), 'admin', 'admin@hypersofts.com', '$2b$10$rQZB3h8Z5Y9VjK5L5E5ZluqHvN5rN5kR5X5M5N5O5P5Q5R5S5T5U5', '6596742955', 'admin', TRUE);

-- Default Settings
INSERT INTO settings (id, site_name, admin_email, admin_telegram_id, auto_reminder_days) VALUES
(1, 'Hyper Softs Trend', 'admin@hypersofts.com', '6596742955', 7);

-- =====================================================
-- 📊 USEFUL VIEWS
-- =====================================================

-- View: Active keys with user info
CREATE OR REPLACE VIEW v_active_keys AS
SELECT 
    ak.*,
    u.username,
    u.email,
    u.telegram_id as user_telegram_id,
    DATEDIFF(ak.expires_at, NOW()) as days_until_expiry
FROM api_keys ak
JOIN users u ON ak.user_id = u.id
WHERE ak.is_active = TRUE AND ak.expires_at > NOW();

-- View: Keys expiring soon (within 7 days)
CREATE OR REPLACE VIEW v_expiring_keys AS
SELECT 
    ak.*,
    u.username,
    u.email,
    u.telegram_id as user_telegram_id,
    DATEDIFF(ak.expires_at, NOW()) as days_until_expiry
FROM api_keys ak
JOIN users u ON ak.user_id = u.id
WHERE ak.is_active = TRUE 
  AND ak.expires_at > NOW() 
  AND ak.expires_at <= DATE_ADD(NOW(), INTERVAL 7 DAY);

-- View: Today's API stats
CREATE OR REPLACE VIEW v_today_stats AS
SELECT 
    COUNT(*) as total_calls,
    SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success_calls,
    SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as error_calls,
    SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) as blocked_calls,
    AVG(response_time) as avg_response_time,
    COUNT(DISTINCT request_ip) as unique_ips
FROM api_logs
WHERE DATE(created_at) = CURDATE();

-- =====================================================
-- 🔧 STORED PROCEDURES
-- =====================================================

DELIMITER //

-- Procedure: Generate unique API key
CREATE PROCEDURE generate_api_key(OUT new_key VARCHAR(100))
BEGIN
    SET new_key = CONCAT('HYPER_', LOWER(REPLACE(UUID(), '-', '')));
END //

-- Procedure: Update daily stats
CREATE PROCEDURE update_daily_stats()
BEGIN
    INSERT INTO daily_stats (date, total_api_calls, success_calls, error_calls, blocked_calls, unique_ips, avg_response_time)
    SELECT 
        CURDATE() - INTERVAL 1 DAY,
        COUNT(*),
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END),
        SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END),
        SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END),
        COUNT(DISTINCT request_ip),
        AVG(response_time)
    FROM api_logs
    WHERE DATE(created_at) = CURDATE() - INTERVAL 1 DAY
    ON DUPLICATE KEY UPDATE
        total_api_calls = VALUES(total_api_calls),
        success_calls = VALUES(success_calls),
        error_calls = VALUES(error_calls),
        blocked_calls = VALUES(blocked_calls),
        unique_ips = VALUES(unique_ips),
        avg_response_time = VALUES(avg_response_time);
END //

-- Procedure: Auto expire keys
CREATE PROCEDURE auto_expire_keys()
BEGIN
    UPDATE api_keys 
    SET is_active = FALSE 
    WHERE expires_at < NOW() AND is_active = TRUE;
END //

-- Procedure: Get dashboard stats
CREATE PROCEDURE get_dashboard_stats()
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM users WHERE is_active = TRUE) as total_users,
        (SELECT COUNT(*) FROM api_keys WHERE is_active = TRUE AND expires_at > NOW()) as active_keys,
        (SELECT COUNT(*) FROM api_keys WHERE expires_at < NOW() OR is_active = FALSE) as expired_keys,
        (SELECT COUNT(*) FROM api_logs WHERE DATE(created_at) = CURDATE()) as today_api_calls,
        (SELECT COUNT(*) FROM api_logs) as total_api_calls;
END //

DELIMITER ;

-- =====================================================
-- ⏰ EVENTS (Scheduled Tasks)
-- =====================================================

-- Enable event scheduler
SET GLOBAL event_scheduler = ON;

-- Event: Auto expire keys every hour
CREATE EVENT IF NOT EXISTS event_auto_expire_keys
ON SCHEDULE EVERY 1 HOUR
DO CALL auto_expire_keys();

-- Event: Update daily stats at midnight
CREATE EVENT IF NOT EXISTS event_daily_stats
ON SCHEDULE EVERY 1 DAY
STARTS (TIMESTAMP(CURDATE()) + INTERVAL 1 DAY)
DO CALL update_daily_stats();

-- =====================================================
-- ✅ SCHEMA COMPLETE!
-- =====================================================
