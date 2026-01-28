<?php
/**
 * =====================================================
 * 🔐 MODERN LOGIN PAGE - ENHANCED UI
 * =====================================================
 * Features:
 * - Glassmorphism design
 * - Animated background
 * - Password visibility toggle
 * - Remember me option
 * - Loading states
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../includes/auth.php';

// Redirect if already logged in
if (is_logged_in()) {
    header('Location: dashboard.php');
    exit;
}

$error = '';
$success = '';

// Handle login form
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    $remember = isset($_POST['remember']);
    
    if (empty($username) || empty($password)) {
        $error = 'Please enter both username and password';
    } else {
        $result = login_user($username, $password, $remember);
        if ($result['success']) {
            header('Location: dashboard.php');
            exit;
        } else {
            $error = $result['error'];
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - <?php echo SITE_NAME; ?></title>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Icons -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" rel="stylesheet">
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        :root {
            --primary: 99 102 241;
            --accent: 168 85 247;
            --success: 16 185 129;
            --danger: 239 68 68;
            --bg-dark: 15 10 30;
            --bg-surface: 30 27 75;
            --text-primary: 248 250 252;
            --text-secondary: 148 163 184;
            --text-muted: 100 116 139;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, 
                rgb(var(--bg-dark)) 0%, 
                rgb(var(--bg-surface)) 50%,
                rgb(20 15 50) 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            overflow: hidden;
            position: relative;
        }
        
        /* Animated Background */
        .bg-animation {
            position: fixed;
            inset: 0;
            overflow: hidden;
            z-index: 0;
        }
        
        .bg-orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(100px);
            opacity: 0.4;
            animation: float 20s ease-in-out infinite;
        }
        
        .bg-orb-1 {
            width: 500px;
            height: 500px;
            background: rgb(var(--primary));
            top: -200px;
            left: -100px;
            animation-delay: 0s;
        }
        
        .bg-orb-2 {
            width: 400px;
            height: 400px;
            background: rgb(var(--accent));
            bottom: -150px;
            right: -100px;
            animation-delay: -7s;
        }
        
        .bg-orb-3 {
            width: 300px;
            height: 300px;
            background: rgb(99 102 241);
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            animation-delay: -14s;
        }
        
        @keyframes float {
            0%, 100% {
                transform: translate(0, 0) scale(1);
            }
            25% {
                transform: translate(30px, -30px) scale(1.05);
            }
            50% {
                transform: translate(-20px, 20px) scale(0.95);
            }
            75% {
                transform: translate(-30px, -20px) scale(1.02);
            }
        }
        
        /* Grid Pattern */
        .bg-grid {
            position: fixed;
            inset: 0;
            background-image: 
                linear-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(99, 102, 241, 0.03) 1px, transparent 1px);
            background-size: 50px 50px;
            z-index: 1;
        }
        
        /* Login Container */
        .login-container {
            position: relative;
            z-index: 10;
            width: 100%;
            max-width: 440px;
        }
        
        /* Login Card */
        .login-card {
            background: rgba(30, 27, 75, 0.7);
            backdrop-filter: blur(24px);
            border: 1px solid rgba(99, 102, 241, 0.2);
            border-radius: 24px;
            padding: 48px 40px;
            box-shadow: 
                0 25px 50px -12px rgba(0, 0, 0, 0.5),
                0 0 80px rgba(99, 102, 241, 0.15);
            animation: cardAppear 0.6s ease-out;
        }
        
        @keyframes cardAppear {
            from {
                opacity: 0;
                transform: translateY(30px) scale(0.95);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
        
        /* Brand Header */
        .brand-header {
            text-align: center;
            margin-bottom: 40px;
        }
        
        .brand-logo {
            width: 72px;
            height: 72px;
            background: linear-gradient(135deg, rgb(var(--primary)), rgb(var(--accent)));
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            font-size: 32px;
            color: white;
            box-shadow: 0 10px 40px rgba(99, 102, 241, 0.4);
            animation: pulse 3s ease-in-out infinite;
        }
        
        @keyframes pulse {
            0%, 100% { box-shadow: 0 10px 40px rgba(99, 102, 241, 0.4); }
            50% { box-shadow: 0 10px 60px rgba(99, 102, 241, 0.6); }
        }
        
        .brand-title {
            font-size: 28px;
            font-weight: 800;
            background: linear-gradient(135deg, rgb(var(--primary)), rgb(var(--accent)));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 8px;
        }
        
        .brand-subtitle {
            color: rgb(var(--text-muted));
            font-size: 14px;
        }
        
        /* Alert Messages */
        .alert {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 16px;
            border-radius: 12px;
            margin-bottom: 24px;
            font-size: 14px;
            animation: shake 0.4s ease-in-out;
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        
        .alert-error {
            background: rgba(239, 68, 68, 0.15);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: rgb(252, 165, 165);
        }
        
        .alert-success {
            background: rgba(16, 185, 129, 0.15);
            border: 1px solid rgba(16, 185, 129, 0.3);
            color: rgb(110, 231, 183);
        }
        
        .alert i {
            font-size: 18px;
        }
        
        /* Form Styles */
        .form-group {
            margin-bottom: 24px;
        }
        
        .form-label {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            font-weight: 600;
            color: rgb(var(--text-secondary));
            margin-bottom: 10px;
        }
        
        .form-label i {
            font-size: 14px;
            color: rgb(var(--primary));
        }
        
        .input-wrapper {
            position: relative;
        }
        
        .form-input {
            width: 100%;
            padding: 16px 20px;
            font-size: 15px;
            font-family: inherit;
            color: rgb(var(--text-primary));
            background: rgba(15, 10, 30, 0.6);
            border: 2px solid rgba(99, 102, 241, 0.15);
            border-radius: 14px;
            outline: none;
            transition: all 0.25s ease;
        }
        
        .form-input::placeholder {
            color: rgb(var(--text-muted));
        }
        
        .form-input:focus {
            border-color: rgb(var(--primary));
            background: rgba(15, 10, 30, 0.8);
            box-shadow: 
                0 0 0 4px rgba(99, 102, 241, 0.1),
                0 0 20px rgba(99, 102, 241, 0.1);
        }
        
        .password-toggle {
            position: absolute;
            right: 16px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: rgb(var(--text-muted));
            cursor: pointer;
            padding: 4px;
            transition: color 0.2s;
        }
        
        .password-toggle:hover {
            color: rgb(var(--text-primary));
        }
        
        /* Remember Me */
        .form-options {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 28px;
        }
        
        .checkbox-wrapper {
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
        }
        
        .checkbox-wrapper input {
            display: none;
        }
        
        .checkbox-custom {
            width: 20px;
            height: 20px;
            border: 2px solid rgba(99, 102, 241, 0.3);
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }
        
        .checkbox-custom i {
            font-size: 10px;
            color: white;
            opacity: 0;
            transform: scale(0);
            transition: all 0.2s;
        }
        
        .checkbox-wrapper input:checked + .checkbox-custom {
            background: linear-gradient(135deg, rgb(var(--primary)), rgb(var(--accent)));
            border-color: transparent;
        }
        
        .checkbox-wrapper input:checked + .checkbox-custom i {
            opacity: 1;
            transform: scale(1);
        }
        
        .checkbox-label {
            font-size: 14px;
            color: rgb(var(--text-secondary));
        }
        
        .forgot-link {
            font-size: 14px;
            color: rgb(var(--primary));
            text-decoration: none;
            transition: color 0.2s;
        }
        
        .forgot-link:hover {
            color: rgb(129 140 248);
        }
        
        /* Submit Button */
        .btn-login {
            width: 100%;
            padding: 16px 24px;
            font-size: 16px;
            font-weight: 700;
            font-family: inherit;
            color: white;
            background: linear-gradient(135deg, rgb(var(--primary)), rgb(var(--accent)));
            border: none;
            border-radius: 14px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            transition: all 0.3s ease;
            box-shadow: 0 8px 30px rgba(99, 102, 241, 0.4);
            position: relative;
            overflow: hidden;
        }
        
        .btn-login::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, rgba(255,255,255,0.2), transparent);
            opacity: 0;
            transition: opacity 0.3s;
        }
        
        .btn-login:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 40px rgba(99, 102, 241, 0.5);
        }
        
        .btn-login:hover::before {
            opacity: 1;
        }
        
        .btn-login:active {
            transform: translateY(0);
        }
        
        .btn-login.loading {
            pointer-events: none;
            opacity: 0.8;
        }
        
        .btn-login.loading .btn-text {
            display: none;
        }
        
        .btn-login .spinner {
            display: none;
        }
        
        .btn-login.loading .spinner {
            display: block;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        /* Footer */
        .login-footer {
            text-align: center;
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid rgba(99, 102, 241, 0.15);
        }
        
        .footer-text {
            font-size: 13px;
            color: rgb(var(--text-muted));
        }
        
        .footer-link {
            color: rgb(var(--primary));
            text-decoration: none;
            font-weight: 500;
        }
        
        /* Decorative Elements */
        .decoration {
            position: absolute;
            border-radius: 50%;
            opacity: 0.5;
        }
        
        .decoration-1 {
            width: 6px;
            height: 6px;
            background: rgb(var(--primary));
            top: -20px;
            right: 40px;
            animation: twinkle 2s ease-in-out infinite;
        }
        
        .decoration-2 {
            width: 4px;
            height: 4px;
            background: rgb(var(--accent));
            bottom: 30px;
            left: -15px;
            animation: twinkle 2s ease-in-out infinite 0.5s;
        }
        
        .decoration-3 {
            width: 8px;
            height: 8px;
            background: rgb(var(--success));
            top: 60%;
            right: -25px;
            animation: twinkle 2s ease-in-out infinite 1s;
        }
        
        @keyframes twinkle {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.5); }
        }
        
        /* Responsive */
        @media (max-width: 480px) {
            .login-card {
                padding: 36px 24px;
                border-radius: 20px;
            }
            
            .brand-logo {
                width: 60px;
                height: 60px;
                font-size: 28px;
            }
            
            .brand-title {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <!-- Animated Background -->
    <div class="bg-animation">
        <div class="bg-orb bg-orb-1"></div>
        <div class="bg-orb bg-orb-2"></div>
        <div class="bg-orb bg-orb-3"></div>
    </div>
    <div class="bg-grid"></div>
    
    <!-- Login Container -->
    <div class="login-container">
        <div class="login-card">
            <!-- Decorative Elements -->
            <div class="decoration decoration-1"></div>
            <div class="decoration decoration-2"></div>
            <div class="decoration decoration-3"></div>
            
            <!-- Brand Header -->
            <div class="brand-header">
                <div class="brand-logo">
                    <i class="fas fa-chart-line"></i>
                </div>
                <h1 class="brand-title"><?php echo SITE_NAME; ?></h1>
                <p class="brand-subtitle"><?php echo SITE_DESCRIPTION; ?></p>
            </div>
            
            <!-- Error Alert -->
            <?php if ($error): ?>
            <div class="alert alert-error">
                <i class="fas fa-exclamation-circle"></i>
                <span><?php echo htmlspecialchars($error); ?></span>
            </div>
            <?php endif; ?>
            
            <!-- Success Alert -->
            <?php if ($success): ?>
            <div class="alert alert-success">
                <i class="fas fa-check-circle"></i>
                <span><?php echo htmlspecialchars($success); ?></span>
            </div>
            <?php endif; ?>
            
            <!-- Login Form -->
            <form method="POST" id="loginForm">
                <div class="form-group">
                    <label class="form-label">
                        <i class="fas fa-user"></i>
                        Username or Email
                    </label>
                    <div class="input-wrapper">
                        <input 
                            type="text" 
                            name="username" 
                            class="form-input" 
                            placeholder="Enter your username or email"
                            value="<?php echo htmlspecialchars($_POST['username'] ?? ''); ?>"
                            autocomplete="username"
                            required
                        >
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">
                        <i class="fas fa-lock"></i>
                        Password
                    </label>
                    <div class="input-wrapper">
                        <input 
                            type="password" 
                            name="password" 
                            id="password"
                            class="form-input" 
                            placeholder="Enter your password"
                            autocomplete="current-password"
                            required
                        >
                        <button type="button" class="password-toggle" onclick="togglePassword()">
                            <i class="fas fa-eye" id="toggleIcon"></i>
                        </button>
                    </div>
                </div>
                
                <div class="form-options">
                    <label class="checkbox-wrapper">
                        <input type="checkbox" name="remember">
                        <span class="checkbox-custom">
                            <i class="fas fa-check"></i>
                        </span>
                        <span class="checkbox-label">Remember me</span>
                    </label>
                </div>
                
                <button type="submit" class="btn-login" id="loginBtn">
                    <i class="fas fa-spinner spinner"></i>
                    <span class="btn-text">
                        <i class="fas fa-sign-in-alt"></i>
                        Sign In
                    </span>
                </button>
            </form>
            
            <!-- Footer -->
            <div class="login-footer">
                <p class="footer-text">
                    Powered by <span class="footer-link"><?php echo SITE_NAME; ?></span> Trend API
                </p>
            </div>
        </div>
    </div>
    
    <script>
        // Toggle Password Visibility
        function togglePassword() {
            const input = document.getElementById('password');
            const icon = document.getElementById('toggleIcon');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        }
        
        // Form Submit Loading State
        document.getElementById('loginForm').addEventListener('submit', function() {
            const btn = document.getElementById('loginBtn');
            btn.classList.add('loading');
        });
        
        // Auto-focus username input
        document.addEventListener('DOMContentLoaded', function() {
            const usernameInput = document.querySelector('input[name="username"]');
            if (usernameInput && !usernameInput.value) {
                usernameInput.focus();
            }
        });
    </script>
</body>
</html>
