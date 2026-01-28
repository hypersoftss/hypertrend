<?php
/**
 * =====================================================
 * 📊 ENHANCED ADMIN DASHBOARD
 * =====================================================
 * Features:
 * - Real-time statistics
 * - Interactive charts
 * - Live API activity feed
 * - Quick actions
 * - Game type distribution
 */

$page_title = 'Dashboard';
require_once __DIR__ . '/../includes/header.php';

// Get database connection (PDO from config.php)
$db = getDB();
$stats = [];

try {
    // Total Users
    $stmt = $db->query("SELECT COUNT(*) as count FROM users WHERE status = 'active'");
    $stats['users'] = $stmt->fetch()['count'] ?? 0;

    // Active API Keys
    $stmt = $db->query("SELECT COUNT(*) as count FROM api_keys WHERE status = 'active' AND (expires_at IS NULL OR expires_at > NOW())");
    $stats['active_keys'] = $stmt->fetch()['count'] ?? 0;

    // Today's API Calls
    $stmt = $db->query("SELECT COUNT(*) as count FROM api_logs WHERE DATE(created_at) = CURDATE()");
    $stats['today_calls'] = $stmt->fetch()['count'] ?? 0;

    // Yesterday's calls for comparison
    $stmt = $db->query("SELECT COUNT(*) as count FROM api_logs WHERE DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)");
    $stats['yesterday_calls'] = $stmt->fetch()['count'] ?? 0;

    // Calculate trend
    $trend_percent = 0;
    if ($stats['yesterday_calls'] > 0) {
        $trend_percent = round((($stats['today_calls'] - $stats['yesterday_calls']) / $stats['yesterday_calls']) * 100, 1);
    }

    // Success Rate
    $stmt = $db->query("SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN http_status = 200 THEN 1 ELSE 0 END) as success
        FROM api_logs WHERE DATE(created_at) = CURDATE()");
    $row = $stmt->fetch() ?: ['total' => 0, 'success' => 0];
    $stats['success_rate'] = $row['total'] > 0 ? round(($row['success'] / $row['total']) * 100, 1) : 100;

    // Revenue placeholder
    $stats['total_revenue'] = 0;

    // Recent API Logs
    $recent_logs = $db->query("
        SELECT l.*, k.api_key, u.username 
        FROM api_logs l
        LEFT JOIN api_keys k ON l.api_key_id = k.id
        LEFT JOIN users u ON l.user_id = u.id
        ORDER BY l.created_at DESC LIMIT 8
    ")->fetchAll();

    // Game Type Stats for today
    $game_stats = $db->query("
        SELECT game_type, COUNT(*) as count
        FROM api_logs
        WHERE DATE(created_at) = CURDATE() AND game_type IS NOT NULL
        GROUP BY game_type
        ORDER BY count DESC
        LIMIT 5
    ")->fetchAll();

    // Hourly distribution for chart
    $hourly_result = $db->query("
        SELECT HOUR(created_at) as hour, COUNT(*) as count
        FROM api_logs
        WHERE DATE(created_at) = CURDATE()
        GROUP BY HOUR(created_at)
        ORDER BY hour
    ");

    $hourly_data = array_fill(0, 24, 0);
    foreach ($hourly_result as $row) {
        $hourly_data[(int)$row['hour']] = (int)$row['count'];
    }

    // Weekly trend
    $weekly_result = $db->query("
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM api_logs
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date
    ");

    $weekly_labels = [];
    $weekly_data = [];
    foreach ($weekly_result as $row) {
        $weekly_labels[] = date('D', strtotime($row['date']));
        $weekly_data[] = (int)$row['count'];
    }

    // Expiring keys (next 7 days)
    $expiring_keys = $db->query("
        SELECT k.*, u.username 
        FROM api_keys k
        LEFT JOIN users u ON k.user_id = u.id
        WHERE k.expires_at BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY)
        AND k.status = 'active'
        ORDER BY k.expires_at ASC
        LIMIT 5
    ")->fetchAll();

} catch (Exception $e) {
    $stats = ['users' => 0, 'active_keys' => 0, 'today_calls' => 0, 'yesterday_calls' => 0, 'success_rate' => 100];
    $trend_percent = 0;
    $recent_logs = [];
    $game_stats = [];
    $hourly_data = array_fill(0, 24, 0);
    $weekly_labels = [];
    $weekly_data = [];
    $expiring_keys = [];
    if (DEBUG_MODE) {
        echo "<!-- Dashboard Error: " . htmlspecialchars($e->getMessage()) . " -->";
    }
}
?>

<!-- Stats Grid -->
<div class="grid grid-cols-4 md-cols-2 sm-cols-1 mb-6">
    <!-- Total Users -->
    <div class="card stat-card">
        <div class="stat-icon primary">
            <i class="fas fa-users"></i>
        </div>
        <div class="stat-content">
            <h3><?php echo number_format($stats['users']); ?></h3>
            <p>Active Users</p>
        </div>
    </div>

    <!-- Active Keys -->
    <div class="card stat-card">
        <div class="stat-icon success">
            <i class="fas fa-key"></i>
        </div>
        <div class="stat-content">
            <h3><?php echo number_format($stats['active_keys']); ?></h3>
            <p>Active API Keys</p>
        </div>
    </div>

    <!-- Today's Calls -->
    <div class="card stat-card">
        <div class="stat-icon info">
            <i class="fas fa-chart-line"></i>
        </div>
        <div class="stat-content">
            <h3><?php echo number_format($stats['today_calls']); ?></h3>
            <p>Today's API Calls</p>
            <div class="stat-trend <?php echo $trend_percent >= 0 ? 'up' : 'down'; ?>">
                <i class="fas fa-arrow-<?php echo $trend_percent >= 0 ? 'up' : 'down'; ?>"></i>
                <span><?php echo abs($trend_percent); ?>% from yesterday</span>
            </div>
        </div>
    </div>

    <!-- Success Rate -->
    <div class="card stat-card">
        <div class="stat-icon warning">
            <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-content">
            <h3><?php echo $stats['success_rate']; ?>%</h3>
            <p>Success Rate</p>
        </div>
    </div>
</div>

<!-- Charts Row -->
<div class="grid grid-cols-3 lg-cols-2 md-cols-1 mb-6">
    <!-- API Usage Chart -->
    <div class="card" style="grid-column: span 2;">
        <div class="card-header">
            <h3 class="card-title">
                <i class="fas fa-chart-area"></i>
                Today's API Activity
            </h3>
            <div class="flex gap-2">
                <button class="btn btn-sm btn-secondary" onclick="updateChartPeriod('today')">Today</button>
                <button class="btn btn-sm btn-secondary" onclick="updateChartPeriod('week')">Week</button>
            </div>
        </div>
        <div class="card-body">
            <div style="height: 280px;">
                <canvas id="apiUsageChart"></canvas>
            </div>
        </div>
    </div>

    <!-- Game Distribution -->
    <div class="card">
        <div class="card-header">
            <h3 class="card-title">
                <i class="fas fa-gamepad"></i>
                Game Distribution
            </h3>
        </div>
        <div class="card-body">
            <div style="height: 200px;">
                <canvas id="gameDistChart"></canvas>
            </div>
            <div style="margin-top: 16px;">
                <?php 
                $colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                $i = 0;
                foreach ($game_stats as $game): 
                ?>
                <div class="flex items-center justify-between mb-2" style="padding: 8px 0;">
                    <div class="flex items-center gap-2">
                        <span style="width: 12px; height: 12px; background: <?php echo $colors[$i % 5]; ?>; border-radius: 3px;"></span>
                        <span class="text-sm"><?php echo htmlspecialchars(ucfirst($game['game_type'])); ?></span>
                    </div>
                    <span class="badge badge-primary"><?php echo number_format($game['count']); ?></span>
                </div>
                <?php $i++; endforeach; ?>
            </div>
        </div>
    </div>
</div>

<!-- Bottom Section -->
<div class="grid grid-cols-3 lg-cols-2 md-cols-1">
    <!-- Recent Activity -->
    <div class="card" style="grid-column: span 2;">
        <div class="card-header">
            <h3 class="card-title">
                <i class="fas fa-clock"></i>
                Recent API Requests
            </h3>
            <a href="api-logs.php" class="btn btn-sm btn-secondary">
                View All <i class="fas fa-arrow-right"></i>
            </a>
        </div>
        <div class="card-body" style="padding: 0;">
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Game</th>
                            <th>Status</th>
                            <th>IP Address</th>
                            <th>Response</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (!empty($recent_logs)): ?>
                        <?php foreach ($recent_logs as $log): ?>
                        <tr>
                            <td>
                                <span class="text-muted"><?php echo date('H:i:s', strtotime($log['created_at'])); ?></span>
                            </td>
                            <td>
                                <span class="badge badge-primary">
                                    <?php echo htmlspecialchars(ucfirst($log['game_type'] ?? 'Unknown')); ?>
                                </span>
                            </td>
                            <td>
                                <?php if ($log['http_status'] == 200): ?>
                                    <span class="badge badge-success">
                                        <i class="fas fa-check"></i> Success
                                    </span>
                                <?php else: ?>
                                    <span class="badge badge-danger">
                                        <i class="fas fa-times"></i> <?php echo $log['http_status']; ?>
                                    </span>
                                <?php endif; ?>
                            </td>
                            <td>
                                <code style="font-size: 12px; color: rgb(var(--text-muted));">
                                    <?php echo htmlspecialchars(substr($log['client_ip'], 0, 15)); ?>
                                </code>
                            </td>
                            <td>
                                <span class="text-muted text-sm"><?php echo $log['duration_ms'] ?? 0; ?>ms</span>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                        <?php else: ?>
                        <tr>
                            <td colspan="5">
                                <div class="empty-state" style="padding: 32px;">
                                    <i class="fas fa-inbox" style="font-size: 24px; color: rgb(var(--text-muted));"></i>
                                    <p class="text-muted" style="margin-top: 8px;">No API requests today</p>
                                </div>
                            </td>
                        </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Quick Actions & Expiring Keys -->
    <div class="card">
        <div class="card-header">
            <h3 class="card-title">
                <i class="fas fa-bolt"></i>
                Quick Actions
            </h3>
        </div>
        <div class="card-body">
            <div class="grid grid-cols-2" style="gap: 12px; margin-bottom: 24px;">
                <a href="api-keys.php?action=create" class="quick-action">
                    <i class="fas fa-plus-circle"></i>
                    <span>New Key</span>
                </a>
                <a href="users.php?action=create" class="quick-action">
                    <i class="fas fa-user-plus"></i>
                    <span>Add User</span>
                </a>
                <a href="documentation.php" class="quick-action">
                    <i class="fas fa-book"></i>
                    <span>API Docs</span>
                </a>
                <a href="settings.php" class="quick-action">
                    <i class="fas fa-cog"></i>
                    <span>Settings</span>
                </a>
            </div>
            
            <!-- Expiring Soon -->
            <h4 class="text-sm font-semibold text-muted mb-4" style="border-top: 1px solid rgb(var(--border) / var(--border-opacity)); padding-top: 16px;">
                <i class="fas fa-clock" style="color: rgb(var(--warning));"></i> Expiring Soon
            </h4>
            <?php if (!empty($expiring_keys)): ?>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <?php foreach ($expiring_keys as $key): ?>
                <div style="padding: 10px; background: rgb(var(--warning) / 0.05); border: 1px solid rgb(var(--warning) / 0.2); border-radius: var(--radius-md);">
                    <div class="flex items-center justify-between">
                        <span class="text-sm font-medium"><?php echo htmlspecialchars($key['username'] ?? 'Unknown'); ?></span>
                        <span class="badge badge-warning text-xs">
                            <?php echo date('M d', strtotime($key['expires_at'])); ?>
                        </span>
                    </div>
                    <code style="font-size: 11px; color: rgb(var(--text-muted));">
                        <?php echo substr($key['api_key'], 0, 8); ?>...
                    </code>
                </div>
                <?php endforeach; ?>
            </div>
            <?php else: ?>
            <p class="text-muted text-sm text-center" style="padding: 16px 0;">No keys expiring soon</p>
            <?php endif; ?>
        </div>
    </div>
</div>

<script>
// Initialize Charts
document.addEventListener('DOMContentLoaded', function() {
    // API Usage Chart (Hourly)
    const hourlyData = <?php echo json_encode(array_values($hourly_data)); ?>;
    const hourlyLabels = Array.from({length: 24}, (_, i) => `${i}:00`);
    
    new Chart(document.getElementById('apiUsageChart'), {
        type: 'line',
        data: {
            labels: hourlyLabels,
            datasets: [{
                label: 'API Calls',
                data: hourlyData,
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: 'rgb(99, 102, 241)',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15, 10, 30, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#94a3b8',
                    borderColor: 'rgba(99, 102, 241, 0.3)',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(99, 102, 241, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: 'rgb(100, 116, 139)',
                        font: { size: 11 }
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        color: 'rgb(100, 116, 139)',
                        font: { size: 11 },
                        maxTicksLimit: 12
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });

    // Game Distribution Chart
    <?php 
    $game_labels = [];
    $game_data_arr = [];
    foreach ($game_stats as $g) {
        $game_labels[] = ucfirst($g['game_type']);
        $game_data_arr[] = (int)$g['count'];
    }
    ?>
    
    new Chart(document.getElementById('gameDistChart'), {
        type: 'doughnut',
        data: {
            labels: <?php echo json_encode($game_labels); ?>,
            datasets: [{
                data: <?php echo json_encode($game_data_arr); ?>,
                backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
                borderWidth: 0,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15, 10, 30, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#94a3b8',
                    borderColor: 'rgba(99, 102, 241, 0.3)',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8
                }
            }
        }
    });
});

// Chart period toggle
function updateChartPeriod(period) {
    // This would fetch new data via AJAX in a real implementation
    showToast('Info', `Switching to ${period} view...`, 'info');
}
</script>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
