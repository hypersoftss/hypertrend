<?php
/**
 * =====================================================
 * 🔐 LOGIN PAGE
 * =====================================================
 */

session_start();
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../includes/auth.php';

// Redirect if already logged in
if (is_logged_in()) {
    header('Location: dashboard.php');
    exit;
}

$error = '';

// Handle login form
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    
    if (empty($username) || empty($password)) {
        $error = 'Please enter both username and password';
    } else {
        $result = login_user($username, $password);
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
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - <?php echo SITE_NAME; ?></title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        body {
            background: linear-gradient(135deg, #0f0a1e 0%, #1e1b4b 50%, #312e81 100%);
            min-height: 100vh;
        }
        .login-card {
            background: rgba(30, 27, 75, 0.9);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(99, 102, 241, 0.3);
        }
        .glow {
            box-shadow: 0 0 60px rgba(99, 102, 241, 0.3);
        }
    </style>
</head>
<body class="flex items-center justify-center p-4">
    <div class="login-card rounded-2xl p-8 w-full max-w-md glow">
        <!-- Logo -->
        <div class="text-center mb-8">
            <div class="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-chart-line text-3xl text-white"></i>
            </div>
            <h1 class="text-2xl font-bold text-white"><?php echo SITE_NAME; ?></h1>
            <p class="text-gray-400 mt-2"><?php echo SITE_DESCRIPTION; ?></p>
        </div>

        <?php if ($error): ?>
        <div class="bg-red-900 bg-opacity-50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
            <i class="fas fa-exclamation-circle mr-2"></i><?php echo htmlspecialchars($error); ?>
        </div>
        <?php endif; ?>

        <!-- Login Form -->
        <form method="POST" class="space-y-6">
            <div>
                <label class="block text-gray-300 text-sm font-medium mb-2">
                    <i class="fas fa-user mr-1"></i> Username or Email
                </label>
                <input type="text" name="username" required autocomplete="username"
                       class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition"
                       placeholder="Enter your username or email"
                       value="<?php echo htmlspecialchars($_POST['username'] ?? ''); ?>">
            </div>

            <div>
                <label class="block text-gray-300 text-sm font-medium mb-2">
                    <i class="fas fa-lock mr-1"></i> Password
                </label>
                <div class="relative">
                    <input type="password" name="password" id="password" required autocomplete="current-password"
                           class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition"
                           placeholder="Enter your password">
                    <button type="button" onclick="togglePassword()" class="absolute right-3 top-3 text-gray-400 hover:text-white">
                        <i class="fas fa-eye" id="toggleIcon"></i>
                    </button>
                </div>
            </div>

            <button type="submit" class="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition transform hover:scale-105">
                <i class="fas fa-sign-in-alt mr-2"></i>Sign In
            </button>
        </form>

        <!-- Footer -->
        <div class="mt-8 text-center text-gray-500 text-sm">
            <p>Powered by <span class="text-indigo-400">Hyper Softs Trend API</span></p>
        </div>
    </div>

    <script>
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
    </script>
</body>
</html>
