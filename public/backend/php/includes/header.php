<?php
/**
 * =====================================================
 * 📄 COMMON HEADER TEMPLATE
 * =====================================================
 */

require_once __DIR__ . '/auth.php';
require_auth();

$current_user = get_current_user();
$current_page = basename($_SERVER['PHP_SELF'], '.php');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $page_title ?? 'Dashboard'; ?> - <?php echo SITE_NAME; ?></title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        :root {
            --primary: #6366f1;
            --primary-dark: #4f46e5;
            --secondary: #10b981;
            --danger: #ef4444;
            --warning: #f59e0b;
            --dark: #1e1b4b;
            --darker: #0f0a1e;
        }
        body {
            background: linear-gradient(135deg, var(--darker) 0%, var(--dark) 100%);
            min-height: 100vh;
        }
        .sidebar {
            background: rgba(30, 27, 75, 0.95);
            backdrop-filter: blur(10px);
            border-right: 1px solid rgba(99, 102, 241, 0.2);
        }
        .card {
            background: rgba(30, 27, 75, 0.8);
            border: 1px solid rgba(99, 102, 241, 0.2);
            backdrop-filter: blur(10px);
        }
        .btn-primary {
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
        }
        .btn-primary:hover {
            background: linear-gradient(135deg, var(--primary-dark) 0%, #3730a3 100%);
        }
        .nav-link {
            transition: all 0.3s ease;
        }
        .nav-link:hover, .nav-link.active {
            background: rgba(99, 102, 241, 0.2);
            border-left: 3px solid var(--primary);
        }
        .table-container {
            overflow-x: auto;
        }
        .data-table th {
            background: rgba(99, 102, 241, 0.1);
        }
        .data-table tr:hover {
            background: rgba(99, 102, 241, 0.05);
        }
        .status-active { color: #10b981; }
        .status-disabled { color: #ef4444; }
        .status-expired { color: #f59e0b; }
        .toast {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            animation: slideIn 0.3s ease;
        }
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    </style>
</head>
<body class="text-white">
    <div class="flex h-screen">
        <!-- Sidebar -->
        <aside class="sidebar w-64 flex-shrink-0 hidden md:block">
            <div class="p-6 border-b border-indigo-900">
                <h1 class="text-xl font-bold text-indigo-400">
                    <i class="fas fa-chart-line mr-2"></i><?php echo SITE_NAME; ?>
                </h1>
            </div>
            <nav class="p-4">
                <ul class="space-y-2">
                    <li>
                        <a href="dashboard.php" class="nav-link flex items-center p-3 rounded <?php echo $current_page === 'dashboard' ? 'active' : ''; ?>">
                            <i class="fas fa-home w-5"></i>
                            <span class="ml-3">Dashboard</span>
                        </a>
                    </li>
                    <?php if (is_admin()): ?>
                    <li>
                        <a href="users.php" class="nav-link flex items-center p-3 rounded <?php echo $current_page === 'users' ? 'active' : ''; ?>">
                            <i class="fas fa-users w-5"></i>
                            <span class="ml-3">Users</span>
                        </a>
                    </li>
                    <?php endif; ?>
                    <li>
                        <a href="api-keys.php" class="nav-link flex items-center p-3 rounded <?php echo $current_page === 'api-keys' ? 'active' : ''; ?>">
                            <i class="fas fa-key w-5"></i>
                            <span class="ml-3">API Keys</span>
                        </a>
                    </li>
                    <li>
                        <a href="api-logs.php" class="nav-link flex items-center p-3 rounded <?php echo $current_page === 'api-logs' ? 'active' : ''; ?>">
                            <i class="fas fa-list-alt w-5"></i>
                            <span class="ml-3">API Logs</span>
                        </a>
                    </li>
                    <?php if (is_admin()): ?>
                    <li>
                        <a href="ip-whitelist.php" class="nav-link flex items-center p-3 rounded <?php echo $current_page === 'ip-whitelist' ? 'active' : ''; ?>">
                            <i class="fas fa-shield-alt w-5"></i>
                            <span class="ml-3">IP Whitelist</span>
                        </a>
                    </li>
                    <li>
                        <a href="telegram-logs.php" class="nav-link flex items-center p-3 rounded <?php echo $current_page === 'telegram-logs' ? 'active' : ''; ?>">
                            <i class="fab fa-telegram w-5"></i>
                            <span class="ml-3">Telegram Logs</span>
                        </a>
                    </li>
                    <li>
                        <a href="activity-logs.php" class="nav-link flex items-center p-3 rounded <?php echo $current_page === 'activity-logs' ? 'active' : ''; ?>">
                            <i class="fas fa-history w-5"></i>
                            <span class="ml-3">Activity Logs</span>
                        </a>
                    </li>
                    <li>
                        <a href="settings.php" class="nav-link flex items-center p-3 rounded <?php echo $current_page === 'settings' ? 'active' : ''; ?>">
                            <i class="fas fa-cog w-5"></i>
                            <span class="ml-3">Settings</span>
                        </a>
                    </li>
                    <?php endif; ?>
                    <li>
                        <a href="documentation.php" class="nav-link flex items-center p-3 rounded <?php echo $current_page === 'documentation' ? 'active' : ''; ?>">
                            <i class="fas fa-book w-5"></i>
                            <span class="ml-3">Documentation</span>
                        </a>
                    </li>
                </ul>
            </nav>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 overflow-y-auto">
            <!-- Top Bar -->
            <header class="bg-indigo-900 bg-opacity-50 p-4 flex justify-between items-center sticky top-0 z-10 backdrop-blur-sm">
                <button class="md:hidden text-white" onclick="toggleSidebar()">
                    <i class="fas fa-bars text-xl"></i>
                </button>
                <h2 class="text-lg font-semibold"><?php echo $page_title ?? 'Dashboard'; ?></h2>
                <div class="flex items-center space-x-4">
                    <span class="text-sm text-gray-300">
                        <i class="fas fa-user mr-1"></i>
                        <?php echo htmlspecialchars($current_user['username'] ?? 'User'); ?>
                        <span class="ml-1 px-2 py-1 bg-indigo-600 rounded text-xs"><?php echo ucfirst($current_user['role'] ?? 'user'); ?></span>
                    </span>
                    <a href="profile.php" class="text-gray-300 hover:text-white">
                        <i class="fas fa-user-cog"></i>
                    </a>
                    <a href="logout.php" class="text-gray-300 hover:text-red-400">
                        <i class="fas fa-sign-out-alt"></i>
                    </a>
                </div>
            </header>

            <!-- Page Content -->
            <div class="p-6">
