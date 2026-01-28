-- =====================================================
-- 🗄️ HYPER SOFTS TREND API - DATABASE SCHEMA
-- =====================================================
-- Run this SQL to create all required tables
-- MySQL 5.7+ or MariaDB 10.2+
-- =====================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('admin', 'user', 'reseller') NOT NULL DEFAULT 'user',
    `status` ENUM('active', 'suspended', 'pending') NOT NULL DEFAULT 'active',
    `telegram_id` VARCHAR(50) NULL,
    `telegram_username` VARCHAR(100) NULL,
    `company_name` VARCHAR(255) NULL,
    `phone` VARCHAR(20) NULL,
    `last_login_at` TIMESTAMP NULL,
    `last_login_ip` VARCHAR(45) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`),
    UNIQUE KEY `uk_email` (`email`),
    KEY `idx_role` (`role`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- API KEYS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS `api_keys` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INT UNSIGNED NOT NULL,
    `api_key` VARCHAR(64) NOT NULL,
    `name` VARCHAR(100) NULL COMMENT 'Friendly name for the key',
    `game_type` VARCHAR(50) NOT NULL DEFAULT 'all' COMMENT 'wingo,k3,5d,trx,numeric or all',
    `status` ENUM('active', 'disabled', 'expired', 'revoked') NOT NULL DEFAULT 'active',
    `expires_at` TIMESTAMP NULL COMMENT 'NULL = never expires',
    `whitelisted_ips` JSON NULL COMMENT 'Array of allowed IPs/CIDRs',
    `whitelisted_domains` JSON NULL COMMENT 'Array of allowed domains',
    `daily_limit` INT UNSIGNED NULL DEFAULT 10000 COMMENT 'Max calls per day',
    `monthly_limit` INT UNSIGNED NULL DEFAULT 300000 COMMENT 'Max calls per month',
    `rate_limit_per_minute` INT UNSIGNED NULL DEFAULT 60,
    `calls_today` INT UNSIGNED NOT NULL DEFAULT 0,
    `calls_this_month` INT UNSIGNED NOT NULL DEFAULT 0,
    `total_calls` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `last_used_at` TIMESTAMP NULL,
    `last_used_ip` VARCHAR(45) NULL,
    `notes` TEXT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_api_key` (`api_key`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_status` (`status`),
    KEY `idx_expires_at` (`expires_at`),
    KEY `idx_game_type` (`game_type`),
    CONSTRAINT `fk_api_keys_user` FOREIGN KEY (`user_id`) 
        REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- API LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS `api_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `api_key_id` INT UNSIGNED NULL,
    `user_id` INT UNSIGNED NULL,
    `client_ip` VARCHAR(45) NOT NULL,
    `domain` VARCHAR(255) NULL,
    `endpoint` VARCHAR(500) NOT NULL,
    `game_type` VARCHAR(50) NULL,
    `request_params` TEXT NULL,
    `response_body` TEXT NULL,
    `http_status` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `duration_ms` INT UNSIGNED NOT NULL DEFAULT 0,
    `is_success` BOOLEAN NOT NULL DEFAULT FALSE,
    `error_message` VARCHAR(500) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_api_key_id` (`api_key_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_client_ip` (`client_ip`),
    KEY `idx_http_status` (`http_status`),
    KEY `idx_created_at` (`created_at`),
    KEY `idx_game_type` (`game_type`),
    KEY `idx_is_success` (`is_success`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- ALLOWED IPS TABLE (Global Whitelist)
-- =====================================================
CREATE TABLE IF NOT EXISTS `allowed_ips` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `ip_address` VARCHAR(100) NOT NULL COMMENT 'Can be IP, CIDR, or hostname',
    `resolved_ip` VARCHAR(45) NULL COMMENT 'Resolved IP for hostnames',
    `description` VARCHAR(255) NULL,
    `status` ENUM('active', 'disabled') NOT NULL DEFAULT 'active',
    `added_by` INT UNSIGNED NULL,
    `last_resolved_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ip_address` (`ip_address`),
    KEY `idx_status` (`status`),
    KEY `idx_resolved_ip` (`resolved_ip`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- ALLOWED DOMAINS TABLE (Global Whitelist)
-- =====================================================
CREATE TABLE IF NOT EXISTS `allowed_domains` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `domain` VARCHAR(255) NOT NULL COMMENT 'Can include wildcard: *.example.com',
    `description` VARCHAR(255) NULL,
    `status` ENUM('active', 'disabled') NOT NULL DEFAULT 'active',
    `added_by` INT UNSIGNED NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_domain` (`domain`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TELEGRAM LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS `telegram_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `chat_id` VARCHAR(50) NOT NULL,
    `username` VARCHAR(100) NULL,
    `message_type` ENUM('incoming', 'outgoing', 'command', 'callback') NOT NULL,
    `message_text` TEXT NULL,
    `command` VARCHAR(50) NULL,
    `response_text` TEXT NULL,
    `status` ENUM('success', 'failed', 'pending') NOT NULL DEFAULT 'success',
    `error_message` TEXT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_chat_id` (`chat_id`),
    KEY `idx_message_type` (`message_type`),
    KEY `idx_command` (`command`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- ACTIVITY LOGS TABLE (Admin Actions)
-- =====================================================
CREATE TABLE IF NOT EXISTS `activity_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INT UNSIGNED NULL,
    `action` VARCHAR(100) NOT NULL,
    `description` TEXT NULL COMMENT 'Human readable description',
    `target_type` VARCHAR(50) NULL COMMENT 'user, api_key, setting, etc.',
    `target_id` INT UNSIGNED NULL,
    `old_values` JSON NULL,
    `new_values` JSON NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` VARCHAR(500) NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'For notification system',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_action` (`action`),
    KEY `idx_target` (`target_type`, `target_id`),
    KEY `idx_created_at` (`created_at`),
    KEY `idx_is_read` (`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS `settings` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `setting_key` VARCHAR(100) NOT NULL,
    `setting_value` TEXT NULL,
    `setting_type` ENUM('string', 'number', 'boolean', 'json') NOT NULL DEFAULT 'string',
    `description` VARCHAR(255) NULL,
    `is_public` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Can be exposed to frontend',
    `updated_by` INT UNSIGNED NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_setting_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- DEFAULT DATA
-- =====================================================

-- Default admin user (password: admin123 - CHANGE THIS!)
INSERT INTO `users` (`username`, `email`, `password_hash`, `role`, `status`) VALUES
('admin', 'admin@hypersofts.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'active')
ON DUPLICATE KEY UPDATE `id` = `id`;

-- Default settings
INSERT INTO `settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) VALUES
('site_name', 'Hyper Softs', 'string', 'Website name', TRUE),
('site_description', 'Trend API Management System', 'string', 'Website description', TRUE),
('support_email', 'support@hypersofts.com', 'string', 'Support email address', TRUE),
('admin_email', 'admin@hypersofts.com', 'string', 'Admin email address', FALSE),
('telegram_bot_token', '', 'string', 'Telegram bot token', FALSE),
('admin_telegram_id', '', 'string', 'Admin Telegram chat ID', FALSE),
('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode', TRUE),
('default_rate_limit', '60', 'number', 'Default API calls per minute', FALSE),
('log_retention_days', '90', 'number', 'Days to keep API logs', FALSE)
ON DUPLICATE KEY UPDATE `id` = `id`;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 🎉 SETUP COMPLETE!
-- =====================================================
-- 
-- Default admin credentials are created via install.php
-- 
-- OPTIONAL: Run these queries manually for maintenance:
-- 
-- Clean old logs (90 days):
-- DELETE FROM api_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
-- DELETE FROM telegram_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
-- DELETE FROM activity_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 180 DAY);
-- 
-- Reset daily counters:
-- UPDATE api_keys SET calls_today = 0;
-- 
-- Reset monthly counters (run on 1st of month):
-- UPDATE api_keys SET calls_this_month = 0;
-- 
-- =====================================================
