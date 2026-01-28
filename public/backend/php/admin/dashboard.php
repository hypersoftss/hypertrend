<?php
/**
 * =====================================================
 * 📊 ADMIN DASHBOARD
 * =====================================================
 */

$page_title = 'Dashboard';
require_once __DIR__ . '/../includes/header.php';

// Get statistics
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
$stats = [];

// Total Users
$result = $conn->query("SELECT COUNT(*) as count FROM users WHERE status = 'active'");
$stats['users'] = $result->fetch_assoc()['count'];

// Active API Keys
$result = $conn->query("SELECT COUNT(*) as count FROM api_keys WHERE status = 'active'");
$stats['active_keys'] = $result->fetch_assoc()['count'];

// Today's API Calls
$result = $conn->query("SELECT COUNT(*) as count FROM api_logs WHERE DATE(created_at) = CURDATE()");
$stats['today_calls'] = $result->fetch_assoc()['count'];

// Success Rate
$result = $conn->query("SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN http_status = 200 THEN 1 ELSE 0 END) as success
    FROM api_logs WHERE DATE(created_at) = CURDATE()");
$row = $result->fetch_assoc();
$stats['success_rate'] = $row['total'] > 0 ? round(($row['success'] / $row['total']) * 100, 1) : 100;

// Recent API Logs
$recent_logs = $conn->query("
    SELECT l.*, k.api_key, u.username 
    FROM api_logs l
    LEFT JOIN api_keys k ON l.api_key_id = k.id
    LEFT JOIN users u ON l.user_id = u.id
    ORDER BY l.created_at DESC LIMIT 10
");

// Game Type Stats
$game_stats = $conn->query("
    SELECT game_type, COUNT(*) as count
    FROM api_logs
    WHERE DATE(created_at) = CURDATE() AND game_type IS NOT NULL
    GROUP BY game_type
    ORDER BY count DESC
");

$conn->close();
?>

<!-- Stats Cards -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <!-- Total Users -->
    <div class="card rounded-xl p-6">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-gray-400 text-sm">Total Users</p>
                <h3 class="text-3xl font-bold text-white mt-1"><?php echo number_format($stats['users']); ?></h3>
            </div>
            <div class="w-14 h-14 bg-indigo-600 bg-opacity-20 rounded-xl flex items-center justify-center">
                <i class="fas fa-users text-2xl text-indigo-400"></i>
            </div>
        </div>
    </div>

    <!-- Active Keys -->
    <div class="card rounded-xl p-6">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-gray-400 text-sm">Active API Keys</p>
                <h3 class="text-3xl font-bold text-white mt-1"><?php echo number_format($stats['active_keys']); ?></h3>
            </div>
            <div class="w-14 h-14 bg-green-600 bg-opacity-20 rounded-xl flex items-center justify-center">
                <i class="fas fa-key text-2xl text-green-400"></i>
            </div>
        </div>
    </div>

    <!-- Today's Calls -->
    <div class="card rounded-xl p-6">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-gray-400 text-sm">Today's API Calls</p>
                <h3 class="text-3xl font-bold text-white mt-1"><?php echo number_format($stats['today_calls']); ?></h3>
            </div>
            <div class="w-14 h-14 bg-purple-600 bg-opacity-20 rounded-xl flex items-center justify-center">
                <i class="fas fa-chart-bar text-2xl text-purple-400"></i>
            </div>
        </div>
    </div>

    <!-- Success Rate -->
    <div class="card rounded-xl p-6">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-gray-400 text-sm">Success Rate</p>
                <h3 class="text-3xl font-bold text-white mt-1"><?php echo $stats['success_rate']; ?>%</h3>
            </div>
            <div class="w-14 h-14 bg-yellow-600 bg-opacity-20 rounded-xl flex items-center justify-center">
                <i class="fas fa-check-circle text-2xl text-yellow-400"></i>
            </div>
        </div>
    </div>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Recent Activity -->
    <div class="lg:col-span-2 card rounded-xl p-6">
        <h3 class="text-lg font-semibold mb-4">
            <i class="fas fa-clock text-indigo-400 mr-2"></i>Recent API Requests
        </h3>
        <div class="table-container">
            <table class="data-table w-full text-sm">
                <thead>
                    <tr class="text-left text-gray-400">
                        <th class="p-3 rounded-tl-lg">Time</th>
                        <th class="p-3">Endpoint</th>
                        <th class="p-3">Status</th>
                        <th class="p-3">IP</th>
                        <th class="p-3 rounded-tr-lg">Duration</th>
                    </tr>
                </thead>
                <tbody>
                    <?php while ($log = $recent_logs->fetch_assoc()): ?>
                    <tr class="border-t border-gray-800">
                        <td class="p-3 text-gray-400"><?php echo date('H:i:s', strtotime($log['created_at'])); ?></td>
                        <td class="p-3">
                            <span class="text-indigo-300"><?php echo htmlspecialchars($log['game_type'] ?? $log['endpoint']); ?></span>
                        </td>
                        <td class="p-3">
                            <?php if ($log['http_status'] == 200): ?>
                                <span class="px-2 py-1 bg-green-900 text-green-300 rounded text-xs">200 OK</span>
                            <?php else: ?>
                                <span class="px-2 py-1 bg-red-900 text-red-300 rounded text-xs"><?php echo $log['http_status']; ?></span>
                            <?php endif; ?>
                        </td>
                        <td class="p-3 text-gray-400 text-xs"><?php echo htmlspecialchars($log['client_ip']); ?></td>
                        <td class="p-3 text-gray-400"><?php echo $log['duration_ms']; ?>ms</td>
                    </tr>
                    <?php endwhile; ?>
                </tbody>
            </table>
        </div>
        <a href="api-logs.php" class="mt-4 inline-block text-indigo-400 hover:text-indigo-300 text-sm">
            View all logs <i class="fas fa-arrow-right ml-1"></i>
        </a>
    </div>

    <!-- Game Type Distribution -->
    <div class="card rounded-xl p-6">
        <h3 class="text-lg font-semibold mb-4">
            <i class="fas fa-gamepad text-indigo-400 mr-2"></i>Today's Game Types
        </h3>
        <div class="space-y-4">
            <?php 
            $colors = ['bg-indigo-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500'];
            $i = 0;
            while ($game = $game_stats->fetch_assoc()): 
            ?>
            <div>
                <div class="flex justify-between text-sm mb-1">
                    <span class="text-gray-300"><?php echo htmlspecialchars(ucfirst($game['game_type'])); ?></span>
                    <span class="text-gray-400"><?php echo number_format($game['count']); ?> calls</span>
                </div>
                <div class="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div class="h-full <?php echo $colors[$i % 5]; ?> rounded-full" style="width: <?php echo min(100, ($game['count'] / max(1, $stats['today_calls'])) * 100); ?>%"></div>
                </div>
            </div>
            <?php $i++; endwhile; ?>
            
            <?php if ($i === 0): ?>
            <p class="text-gray-500 text-center py-4">No API calls today</p>
            <?php endif; ?>
        </div>

        <!-- Quick Actions -->
        <div class="mt-6 pt-6 border-t border-gray-800">
            <h4 class="text-sm font-medium text-gray-400 mb-3">Quick Actions</h4>
            <div class="grid grid-cols-2 gap-2">
                <a href="api-keys.php?action=create" class="p-3 bg-indigo-600 bg-opacity-20 hover:bg-opacity-30 rounded-lg text-center text-sm transition">
                    <i class="fas fa-plus-circle block mb-1"></i>
                    New Key
                </a>
                <a href="users.php?action=create" class="p-3 bg-green-600 bg-opacity-20 hover:bg-opacity-30 rounded-lg text-center text-sm transition">
                    <i class="fas fa-user-plus block mb-1"></i>
                    New User
                </a>
                <a href="documentation.php" class="p-3 bg-purple-600 bg-opacity-20 hover:bg-opacity-30 rounded-lg text-center text-sm transition">
                    <i class="fas fa-book block mb-1"></i>
                    Docs
                </a>
                <a href="settings.php" class="p-3 bg-yellow-600 bg-opacity-20 hover:bg-opacity-30 rounded-lg text-center text-sm transition">
                    <i class="fas fa-cog block mb-1"></i>
                    Settings
                </a>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
