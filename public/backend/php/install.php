<?php
/**
 * HYPER SOFTS TREND API - AUTOMATED INSTALLER
 * One-click installation for cPanel/shared hosting
 * 
 * Features:
 * - 3-step wizard
 * - Database connection test
 * - Auto table creation
 * - Admin account setup
 * - Config file generation
 */

define('INSTALLER_VERSION', '1.0.1');

// Prevent session errors
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$configFile = __DIR__ . '/config.php';
$isInstalled = false;

// Check if already installed
if (file_exists($configFile)) {
    require_once $configFile;
    if (defined('DB_HOST') && defined('DB_NAME')) {
        try {
            $testConn = new PDO(
                "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
                DB_USER,
                DB_PASS,
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
            );
            $stmt = $testConn->query("SELECT COUNT(*) FROM users WHERE role = 'admin'");
            if ($stmt->fetchColumn() > 0) {
                $isInstalled = true;
            }
        } catch (PDOException $e) {
            // Config exists but DB connection fails - allow reinstall
        }
    }
}

$step = isset($_GET['step']) ? max(1, min(3, (int)$_GET['step'])) : 1;
$error = '';
$success = '';

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // CSRF protection via session check
    if (!isset($_SESSION['install_started'])) {
        $_SESSION['install_started'] = true;
    }
    
    // Step 1: Test database connection
    if (isset($_POST['test_connection'])) {
        $dbHost = trim($_POST['db_host'] ?? '');
        $dbName = trim($_POST['db_name'] ?? '');
        $dbUser = trim($_POST['db_user'] ?? '');
        $dbPass = $_POST['db_pass'] ?? '';
        
        // Validation
        if (empty($dbHost) || empty($dbName) || empty($dbUser)) {
            $error = 'All database fields are required.';
        } elseif (!preg_match('/^[a-zA-Z0-9_\-\.]+$/', $dbHost)) {
            $error = 'Invalid database host format.';
        } elseif (!preg_match('/^[a-zA-Z0-9_]+$/', $dbName)) {
            $error = 'Database name can only contain letters, numbers, and underscores.';
        } elseif (strlen($dbName) > 64) {
            $error = 'Database name is too long (max 64 characters).';
        } else {
            try {
                // Test connection first
                $testConn = new PDO(
                    "mysql:host={$dbHost}",
                    $dbUser,
                    $dbPass,
                    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
                );
                
                // Try to create database if it doesn't exist
                $testConn->exec("CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                
                // Test connection to the specific database
                $testConn = new PDO(
                    "mysql:host={$dbHost};dbname={$dbName};charset=utf8mb4",
                    $dbUser,
                    $dbPass,
                    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
                );
                
                // Store in session
                $_SESSION['install_db'] = [
                    'dbHost' => $dbHost,
                    'dbName' => $dbName,
                    'dbUser' => $dbUser,
                    'dbPass' => $dbPass
                ];
                
                header('Location: install.php?step=2');
                exit;
            } catch (PDOException $e) {
                $error = 'Connection failed: ' . htmlspecialchars($e->getMessage());
            }
        }
    }
    
    // Step 2: Run installation
    if (isset($_POST['run_install'])) {
        if (!isset($_SESSION['install_db'])) {
            header('Location: install.php?step=1');
            exit;
        }
        
        $db = $_SESSION['install_db'];
        $adminUser = trim($_POST['admin_username'] ?? 'admin');
        $adminEmail = trim($_POST['admin_email'] ?? '');
        $adminPass = $_POST['admin_password'] ?? '';
        $siteNameInput = trim($_POST['site_name'] ?? 'Hyper Softs');
        
        // Validation
        if (empty($adminUser) || empty($adminEmail) || empty($adminPass)) {
            $error = 'All admin fields are required.';
        } elseif (!preg_match('/^[a-zA-Z0-9_]+$/', $adminUser)) {
            $error = 'Username can only contain letters, numbers, and underscores.';
        } elseif (strlen($adminUser) < 3 || strlen($adminUser) > 50) {
            $error = 'Username must be between 3 and 50 characters.';
        } elseif (!filter_var($adminEmail, FILTER_VALIDATE_EMAIL)) {
            $error = 'Please enter a valid email address.';
        } elseif (strlen($adminPass) < 6) {
            $error = 'Password must be at least 6 characters.';
        } elseif (strlen($siteNameInput) < 2 || strlen($siteNameInput) > 100) {
            $error = 'Site name must be between 2 and 100 characters.';
        } else {
            try {
                $pdo = new PDO(
                    "mysql:host={$db['dbHost']};dbname={$db['dbName']};charset=utf8mb4",
                    $db['dbUser'],
                    $db['dbPass'],
                    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
                );
                
                // Read and execute database schema
                $sqlFile = __DIR__ . '/database.sql';
                if (!file_exists($sqlFile)) {
                    throw new Exception('database.sql not found! Please ensure it\'s in the same directory.');
                }
                
                $sql = file_get_contents($sqlFile);
                
                // Remove problematic statements for shared hosting
                $sql = preg_replace('/DELIMITER.*?DELIMITER\s+;/s', '', $sql);
                $sql = preg_replace('/SET\s+GLOBAL.*?;/i', '', $sql);
                $sql = preg_replace('/CREATE\s+EVENT.*?;/s', '', $sql);
                $sql = preg_replace('/CREATE\s+PROCEDURE.*?END\s*\/\//s', '', $sql);
                
                // Execute each statement
                $statements = array_filter(array_map('trim', explode(';', $sql)));
                foreach ($statements as $stmt) {
                    if (!empty($stmt) && !preg_match('/^--/', $stmt) && !preg_match('/^\/\*/', $stmt)) {
                        try {
                            $pdo->exec($stmt);
                        } catch (PDOException $e) {
                            // Ignore duplicate errors, continue with others
                            if (strpos($e->getMessage(), 'Duplicate') === false && 
                                strpos($e->getMessage(), 'already exists') === false) {
                                // Log but continue
                            }
                        }
                    }
                }
                
                // Create admin user
                $hashedPass = password_hash($adminPass, PASSWORD_DEFAULT);
                
                // Delete default admin if exists
                $pdo->exec("DELETE FROM users WHERE username = 'admin' AND id = 1");
                
                // Check if username already exists
                $checkStmt = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
                $checkStmt->execute([$adminUser, $adminEmail]);
                if ($checkStmt->fetch()) {
                    // Update existing
                    $stmt = $pdo->prepare("UPDATE users SET password_hash = ?, role = 'admin', status = 'active' WHERE username = ? OR email = ?");
                    $stmt->execute([$hashedPass, $adminUser, $adminEmail]);
                } else {
                    // Insert new
                    $stmt = $pdo->prepare("INSERT INTO users (username, email, password_hash, role, status) VALUES (?, ?, ?, 'admin', 'active')");
                    $stmt->execute([$adminUser, $adminEmail, $hashedPass]);
                }
                
                // Update site name in settings
                $stmt = $pdo->prepare("UPDATE settings SET setting_value = ? WHERE setting_key = 'site_name'");
                $stmt->execute([$siteNameInput]);
                
                // Generate config.php
                $configContent = '<?php
/**
 * ' . strtoupper(preg_replace('/[^a-zA-Z0-9\s]/', '', $siteNameInput)) . ' - CONFIGURATION
 * Generated: ' . date('Y-m-d H:i:s') . '
 * 
 * WARNING: Do not edit this file unless you know what you are doing!
 */

// Database Configuration
define("DB_HOST", "' . addslashes($db['dbHost']) . '");
define("DB_NAME", "' . addslashes($db['dbName']) . '");
define("DB_USER", "' . addslashes($db['dbUser']) . '");
define("DB_PASS", "' . addslashes($db['dbPass']) . '");
define("DB_CHARSET", "utf8mb4");

// Site Configuration
define("SITE_NAME", "' . addslashes($siteNameInput) . '");
define("SITE_URL", (isset($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] === "on" ? "https" : "http") . "://" . ($_SERVER["HTTP_HOST"] ?? "localhost"));

// Upstream API Configuration (Hidden from users)
define("UPSTREAM_API_BASE", "https://betapi.space");
define("UPSTREAM_API_ENDPOINT", "/Xdrtrend");

// Telegram Bot Configuration
define("TELEGRAM_BOT_TOKEN", "");
define("ADMIN_TELEGRAM_ID", "");

// Security Configuration
define("DEBUG_MODE", false);
define("SESSION_LIFETIME", 86400); // 24 hours

// Error handling
if (!DEBUG_MODE) {
    error_reporting(0);
    ini_set("display_errors", 0);
} else {
    error_reporting(E_ALL);
    ini_set("display_errors", 1);
}

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    ini_set("session.cookie_httponly", 1);
    ini_set("session.use_strict_mode", 1);
    session_start();
}

// Database connection
try {
    $GLOBALS["pdo"] = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET,
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $e) {
    if (DEBUG_MODE) {
        die("Database connection failed: " . $e->getMessage());
    }
    die("Database connection failed. Please check your configuration.");
}

/**
 * Get PDO database connection
 */
function getDB(): PDO {
    return $GLOBALS["pdo"];
}

/**
 * Get setting value from database
 */
function getSetting(string $key, $default = null) {
    static $cache = [];
    if (isset($cache[$key])) return $cache[$key];
    
    try {
        $db = getDB();
        $stmt = $db->prepare("SELECT setting_value FROM settings WHERE setting_key = ?");
        $stmt->execute([$key]);
        $result = $stmt->fetchColumn();
        $cache[$key] = $result !== false ? $result : $default;
        return $cache[$key];
    } catch (PDOException $e) {
        return $default;
    }
}
';
                
                // Write config file
                if (file_put_contents($configFile, $configContent) === false) {
                    throw new Exception('Failed to write config.php. Check directory permissions.');
                }
                
                // Clear session
                $_SESSION['admin_user'] = $adminUser;
                unset($_SESSION['install_db']);
                
                header('Location: install.php?step=3');
                exit;
                
            } catch (Exception $e) {
                $error = 'Installation failed: ' . htmlspecialchars($e->getMessage());
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🚀 Hyper Softs Installer</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .card { background: rgba(255,255,255,0.95); border-radius: 20px; box-shadow: 0 25px 50px rgba(0,0,0,0.3); max-width: 600px; width: 100%; overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { font-size: 28px; margin-bottom: 10px; }
        .header p { opacity: 0.9; font-size: 14px; }
        .steps { display: flex; justify-content: center; gap: 10px; margin-top: 20px; }
        .step { width: 35px; height: 35px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; }
        .step.active { background: white; color: #667eea; }
        .step.done { background: #10b981; color: white; }
        .step.pending { background: rgba(255,255,255,0.3); color: white; }
        .line { width: 40px; height: 3px; background: rgba(255,255,255,0.3); align-self: center; }
        .line.done { background: #10b981; }
        .body { padding: 40px; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; font-weight: 600; color: #374151; margin-bottom: 8px; font-size: 14px; }
        .form-group input { width: 100%; padding: 14px 16px; border: 2px solid #e5e7eb; border-radius: 10px; font-size: 15px; transition: all 0.3s; }
        .form-group input:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }
        .form-group small { display: block; margin-top: 6px; color: #6b7280; font-size: 12px; }
        .btn { width: 100%; padding: 16px; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
        .btn:hover { transform: translateY(-2px); }
        .btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .btn-success { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; }
        .alert { padding: 16px; border-radius: 10px; margin-bottom: 20px; font-size: 14px; }
        .alert-error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; }
        .alert-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; }
        .success-icon { font-size: 80px; text-align: center; margin-bottom: 20px; }
        .success-msg { text-align: center; }
        .success-msg h2 { color: #10b981; font-size: 28px; margin-bottom: 10px; }
        .success-msg p { color: #6b7280; margin-bottom: 20px; }
        .creds { background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 10px; padding: 20px; margin: 20px 0; }
        .creds h3 { color: #374151; font-size: 14px; margin-bottom: 12px; }
        .cred-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .cred-item:last-child { border-bottom: none; }
        .cred-label { color: #6b7280; font-size: 13px; }
        .cred-value { font-weight: 600; color: #1f2937; font-family: monospace; }
        .warning { background: #fffbeb; border: 1px solid #fcd34d; border-radius: 10px; padding: 16px; margin-top: 20px; font-size: 13px; color: #92400e; }
        .title { font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb; }
    </style>
</head>
<body>
<div class="card">
    <div class="header">
        <h1>🚀 Hyper Softs Installer</h1>
        <p>Automated Setup for Trend API System</p>
        <div class="steps">
            <div class="step <?php echo $step >= 1 ? ($step > 1 ? 'done' : 'active') : 'pending'; ?>">1</div>
            <div class="line <?php echo $step > 1 ? 'done' : ''; ?>"></div>
            <div class="step <?php echo $step >= 2 ? ($step > 2 ? 'done' : 'active') : 'pending'; ?>">2</div>
            <div class="line <?php echo $step > 2 ? 'done' : ''; ?>"></div>
            <div class="step <?php echo $step >= 3 ? 'active' : 'pending'; ?>">3</div>
        </div>
    </div>
    <div class="body">
        <?php if ($isInstalled && $step !== 3): ?>
            <div class="success-msg">
                <div class="success-icon">✅</div>
                <h2>Already Installed!</h2>
                <p>The system is already installed and configured.</p>
                <a href="admin/login.php" class="btn btn-primary" style="text-decoration:none;display:inline-flex;width:auto;padding:14px 30px;justify-content:center;">🔐 Go to Login</a>
                <div class="warning">⚠️ <strong>Security Notice:</strong> Delete this file (install.php) for security!</div>
            </div>
        
        <?php elseif ($step === 1): ?>
            <h3 class="title">📦 Step 1: Database Configuration</h3>
            <?php if ($error): ?><div class="alert alert-error"><?php echo htmlspecialchars($error); ?></div><?php endif; ?>
            <form method="POST" action="install.php?step=1">
                <div class="form-group">
                    <label>Database Host</label>
                    <input type="text" name="db_host" value="<?php echo htmlspecialchars($_POST['db_host'] ?? 'localhost'); ?>" required>
                    <small>Usually "localhost" for cPanel hosting</small>
                </div>
                <div class="form-group">
                    <label>Database Name</label>
                    <input type="text" name="db_name" value="<?php echo htmlspecialchars($_POST['db_name'] ?? ''); ?>" required placeholder="e.g., hypersofts_db">
                    <small>Create this database in cPanel → MySQL Databases first</small>
                </div>
                <div class="form-group">
                    <label>Database Username</label>
                    <input type="text" name="db_user" value="<?php echo htmlspecialchars($_POST['db_user'] ?? ''); ?>" required placeholder="e.g., cpanel_user">
                    <small>cPanel format: cpaneluser_dbuser</small>
                </div>
                <div class="form-group">
                    <label>Database Password</label>
                    <input type="password" name="db_pass" required>
                </div>
                <button type="submit" name="test_connection" class="btn btn-primary">🔌 Test Connection & Continue</button>
            </form>
        
        <?php elseif ($step === 2): ?>
            <h3 class="title">👤 Step 2: Admin Account Setup</h3>
            <?php if ($error): ?><div class="alert alert-error"><?php echo htmlspecialchars($error); ?></div><?php endif; ?>
            <?php if (!isset($_SESSION['install_db'])): ?>
                <div class="alert alert-error">Session expired. Please start again.</div>
                <a href="install.php?step=1" class="btn btn-primary" style="text-decoration:none;">← Back to Step 1</a>
            <?php else: ?>
                <div class="alert alert-success">✅ Database connection verified!</div>
                <form method="POST" action="install.php?step=2">
                    <div class="form-group">
                        <label>Site Name</label>
                        <input type="text" name="site_name" value="<?php echo htmlspecialchars($_POST['site_name'] ?? 'Hyper Softs'); ?>" required>
                        <small>Your website/brand name</small>
                    </div>
                    <div class="form-group">
                        <label>Admin Username</label>
                        <input type="text" name="admin_username" value="<?php echo htmlspecialchars($_POST['admin_username'] ?? 'admin'); ?>" required pattern="[a-zA-Z0-9_]+" minlength="3">
                        <small>Letters, numbers, underscore only</small>
                    </div>
                    <div class="form-group">
                        <label>Admin Email</label>
                        <input type="email" name="admin_email" value="<?php echo htmlspecialchars($_POST['admin_email'] ?? ''); ?>" required placeholder="admin@yourdomain.com">
                    </div>
                    <div class="form-group">
                        <label>Admin Password</label>
                        <input type="password" name="admin_password" required minlength="6" placeholder="Min 6 characters">
                        <small>Choose a strong password!</small>
                    </div>
                    <button type="submit" name="run_install" class="btn btn-success">🚀 Run Installation</button>
                </form>
            <?php endif; ?>
        
        <?php elseif ($step === 3): ?>
            <div class="success-msg">
                <div class="success-icon">🎉</div>
                <h2>Installation Complete!</h2>
                <p>Your Trend API system has been successfully installed.</p>
                <?php if (isset($_SESSION['admin_user'])): ?>
                    <div class="creds">
                        <h3>📋 Admin Login Credentials</h3>
                        <div class="cred-item">
                            <span class="cred-label">Username:</span>
                            <span class="cred-value"><?php echo htmlspecialchars($_SESSION['admin_user']); ?></span>
                        </div>
                        <div class="cred-item">
                            <span class="cred-label">Login URL:</span>
                            <span class="cred-value">admin/login.php</span>
                        </div>
                    </div>
                    <?php unset($_SESSION['admin_user']); ?>
                <?php endif; ?>
                <a href="admin/login.php" class="btn btn-primary" style="text-decoration:none;">🔐 Go to Admin Login</a>
                <div class="warning">⚠️ <strong>IMPORTANT:</strong> Delete this file (install.php) immediately for security!</div>
            </div>
        <?php endif; ?>
    </div>
</div>
</body>
</html>
