<?php
/**
 * =====================================================
 * 📱 TELEGRAM LOGS
 * =====================================================
 */

$page_title = 'Telegram Logs';
require_once __DIR__ . '/../includes/header.php';
require_admin();

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Pagination
$page = max(1, (int)($_GET['page'] ?? 1));
$per_page = 50;
$total = $conn->query("SELECT COUNT(*) as count FROM telegram_logs")->fetch_assoc()['count'];
$total_pages = ceil($total / $per_page);
$offset = ($page - 1) * $per_page;

$logs = $conn->query("SELECT * FROM telegram_logs ORDER BY created_at DESC LIMIT {$per_page} OFFSET {$offset}");

$conn->close();
?>

<div class="card rounded-xl p-6 mb-6">
    <h3 class="text-lg font-semibold mb-2">
        <i class="fab fa-telegram text-blue-400 mr-2"></i>Telegram Bot Activity
    </h3>
    <p class="text-gray-400 text-sm">
        All incoming commands and outgoing notifications from your Telegram bot.
    </p>
</div>

<!-- Logs Table -->
<div class="card rounded-xl overflow-hidden">
    <div class="table-container">
        <table class="data-table w-full">
            <thead>
                <tr class="text-left text-gray-400 text-sm">
                    <th class="p-4">Time</th>
                    <th class="p-4">Type</th>
                    <th class="p-4">Chat ID</th>
                    <th class="p-4">Username</th>
                    <th class="p-4">Command/Message</th>
                    <th class="p-4">Status</th>
                </tr>
            </thead>
            <tbody>
                <?php while ($log = $logs->fetch_assoc()): ?>
                <tr class="border-t border-gray-800">
                    <td class="p-4 text-gray-400 text-sm">
                        <?php echo date('M j, H:i:s', strtotime($log['created_at'])); ?>
                    </td>
                    <td class="p-4">
                        <?php 
                        $type_colors = [
                            'incoming' => 'bg-blue-900 text-blue-300',
                            'outgoing' => 'bg-green-900 text-green-300',
                            'command' => 'bg-purple-900 text-purple-300',
                            'callback' => 'bg-yellow-900 text-yellow-300',
                        ];
                        $color = $type_colors[$log['message_type']] ?? 'bg-gray-800 text-gray-300';
                        ?>
                        <span class="px-2 py-1 rounded text-xs <?php echo $color; ?>">
                            <?php echo ucfirst($log['message_type']); ?>
                        </span>
                    </td>
                    <td class="p-4">
                        <code class="text-xs bg-gray-800 px-2 py-1 rounded"><?php echo htmlspecialchars($log['chat_id']); ?></code>
                    </td>
                    <td class="p-4 text-gray-400">
                        <?php echo htmlspecialchars($log['username'] ?: '-'); ?>
                    </td>
                    <td class="p-4">
                        <?php if ($log['command']): ?>
                            <code class="text-indigo-300">/<?php echo htmlspecialchars($log['command']); ?></code>
                        <?php else: ?>
                            <span class="text-gray-400 text-sm truncate block max-w-xs">
                                <?php echo htmlspecialchars(substr($log['message_text'] ?? '', 0, 50)); ?>
                            </span>
                        <?php endif; ?>
                    </td>
                    <td class="p-4">
                        <?php if ($log['status'] === 'success'): ?>
                            <span class="text-green-400"><i class="fas fa-check-circle"></i></span>
                        <?php elseif ($log['status'] === 'failed'): ?>
                            <span class="text-red-400"><i class="fas fa-times-circle"></i></span>
                        <?php else: ?>
                            <span class="text-yellow-400"><i class="fas fa-clock"></i></span>
                        <?php endif; ?>
                    </td>
                </tr>
                <?php endwhile; ?>
            </tbody>
        </table>
    </div>
</div>

<!-- Pagination -->
<?php if ($total_pages > 1): ?>
<div class="flex justify-center mt-6 space-x-2">
    <?php if ($page > 1): ?>
    <a href="?page=<?php echo $page - 1; ?>" class="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
        <i class="fas fa-chevron-left"></i>
    </a>
    <?php endif; ?>
    
    <span class="px-4 py-2 bg-indigo-600 rounded-lg">Page <?php echo $page; ?> of <?php echo $total_pages; ?></span>
    
    <?php if ($page < $total_pages): ?>
    <a href="?page=<?php echo $page + 1; ?>" class="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
        <i class="fas fa-chevron-right"></i>
    </a>
    <?php endif; ?>
</div>
<?php endif; ?>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
