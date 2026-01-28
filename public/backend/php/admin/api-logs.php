<?php
/**
 * =====================================================
 * 📋 API LOGS
 * =====================================================
 */

$page_title = 'API Logs';
require_once __DIR__ . '/../includes/header.php';

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Filters
$filter_status = $_GET['status'] ?? '';
$filter_game = $_GET['game'] ?? '';
$filter_date = $_GET['date'] ?? date('Y-m-d');

// Build query
$where_clauses = [];
$params = [];
$types = '';

if (!is_admin()) {
    $where_clauses[] = "l.user_id = ?";
    $params[] = $_SESSION['user_id'];
    $types .= 'i';
}

if ($filter_status === 'success') {
    $where_clauses[] = "l.http_status = 200";
} elseif ($filter_status === 'error') {
    $where_clauses[] = "l.http_status != 200";
}

if ($filter_game && $filter_game !== 'all') {
    $where_clauses[] = "l.game_type = ?";
    $params[] = $filter_game;
    $types .= 's';
}

if ($filter_date) {
    $where_clauses[] = "DATE(l.created_at) = ?";
    $params[] = $filter_date;
    $types .= 's';
}

$where_sql = $where_clauses ? 'WHERE ' . implode(' AND ', $where_clauses) : '';

// Get total count
$count_sql = "SELECT COUNT(*) as total FROM api_logs l {$where_sql}";
if ($types) {
    $stmt = $conn->prepare($count_sql);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $total = $stmt->get_result()->fetch_assoc()['total'];
    $stmt->close();
} else {
    $total = $conn->query($count_sql)->fetch_assoc()['total'];
}

// Pagination
$page = max(1, (int)($_GET['page'] ?? 1));
$per_page = 50;
$total_pages = ceil($total / $per_page);
$offset = ($page - 1) * $per_page;

// Get logs
$sql = "
    SELECT l.*, k.api_key, u.username 
    FROM api_logs l
    LEFT JOIN api_keys k ON l.api_key_id = k.id
    LEFT JOIN users u ON l.user_id = u.id
    {$where_sql}
    ORDER BY l.created_at DESC
    LIMIT {$per_page} OFFSET {$offset}
";

if ($types) {
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $logs = $stmt->get_result();
    $stmt->close();
} else {
    $logs = $conn->query($sql);
}

$conn->close();
?>

<!-- Filters -->
<div class="card rounded-xl p-4 mb-6">
    <form method="GET" class="flex flex-wrap gap-4 items-end">
        <div>
            <label class="block text-gray-400 text-sm mb-1">Date</label>
            <input type="date" name="date" value="<?php echo htmlspecialchars($filter_date); ?>" 
                   class="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
        </div>
        <div>
            <label class="block text-gray-400 text-sm mb-1">Status</label>
            <select name="status" class="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                <option value="">All</option>
                <option value="success" <?php echo $filter_status === 'success' ? 'selected' : ''; ?>>Success</option>
                <option value="error" <?php echo $filter_status === 'error' ? 'selected' : ''; ?>>Error</option>
            </select>
        </div>
        <div>
            <label class="block text-gray-400 text-sm mb-1">Game Type</label>
            <select name="game" class="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                <option value="all">All Games</option>
                <option value="wingo" <?php echo $filter_game === 'wingo' ? 'selected' : ''; ?>>WinGo</option>
                <option value="k3" <?php echo $filter_game === 'k3' ? 'selected' : ''; ?>>K3</option>
                <option value="5d" <?php echo $filter_game === '5d' ? 'selected' : ''; ?>>5D</option>
                <option value="trx" <?php echo $filter_game === 'trx' ? 'selected' : ''; ?>>TRX</option>
                <option value="numeric" <?php echo $filter_game === 'numeric' ? 'selected' : ''; ?>>Numeric</option>
            </select>
        </div>
        <button type="submit" class="px-4 py-2 btn-primary rounded-lg">
            <i class="fas fa-filter mr-2"></i>Filter
        </button>
        <a href="api-logs.php" class="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition">Clear</a>
    </form>
</div>

<!-- Stats -->
<div class="mb-4 text-gray-400">
    Showing <?php echo number_format($total); ?> log entries
</div>

<!-- Logs Table -->
<div class="card rounded-xl overflow-hidden">
    <div class="table-container">
        <table class="data-table w-full">
            <thead>
                <tr class="text-left text-gray-400 text-sm">
                    <th class="p-4">Time</th>
                    <th class="p-4">Client IP</th>
                    <th class="p-4">Game</th>
                    <th class="p-4">Status</th>
                    <th class="p-4">Duration</th>
                    <?php if (is_admin()): ?><th class="p-4">User</th><?php endif; ?>
                    <th class="p-4">Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php while ($log = $logs->fetch_assoc()): ?>
                <tr class="border-t border-gray-800">
                    <td class="p-4 text-gray-400 text-sm">
                        <?php echo date('H:i:s', strtotime($log['created_at'])); ?>
                    </td>
                    <td class="p-4">
                        <code class="text-xs bg-gray-800 px-2 py-1 rounded"><?php echo htmlspecialchars($log['client_ip']); ?></code>
                    </td>
                    <td class="p-4">
                        <span class="px-2 py-1 bg-indigo-900 bg-opacity-50 text-indigo-300 rounded text-xs uppercase">
                            <?php echo htmlspecialchars($log['game_type'] ?: 'unknown'); ?>
                        </span>
                    </td>
                    <td class="p-4">
                        <?php if ($log['http_status'] == 200): ?>
                            <span class="px-2 py-1 bg-green-900 text-green-300 rounded text-xs">
                                <i class="fas fa-check mr-1"></i>200
                            </span>
                        <?php elseif ($log['http_status'] >= 400 && $log['http_status'] < 500): ?>
                            <span class="px-2 py-1 bg-yellow-900 text-yellow-300 rounded text-xs">
                                <i class="fas fa-exclamation-triangle mr-1"></i><?php echo $log['http_status']; ?>
                            </span>
                        <?php else: ?>
                            <span class="px-2 py-1 bg-red-900 text-red-300 rounded text-xs">
                                <i class="fas fa-times mr-1"></i><?php echo $log['http_status']; ?>
                            </span>
                        <?php endif; ?>
                    </td>
                    <td class="p-4 text-gray-400">
                        <?php echo $log['duration_ms']; ?>ms
                    </td>
                    <?php if (is_admin()): ?>
                    <td class="p-4 text-gray-400 text-sm">
                        <?php echo htmlspecialchars($log['username'] ?: '-'); ?>
                    </td>
                    <?php endif; ?>
                    <td class="p-4">
                        <button onclick="viewLog(<?php echo htmlspecialchars(json_encode($log)); ?>)" 
                                class="p-2 text-indigo-400 hover:bg-indigo-900 rounded transition" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
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
    <a href="?page=<?php echo $page - 1; ?>&date=<?php echo $filter_date; ?>&status=<?php echo $filter_status; ?>&game=<?php echo $filter_game; ?>" 
       class="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
        <i class="fas fa-chevron-left"></i>
    </a>
    <?php endif; ?>
    
    <span class="px-4 py-2 bg-indigo-600 rounded-lg">
        Page <?php echo $page; ?> of <?php echo $total_pages; ?>
    </span>
    
    <?php if ($page < $total_pages): ?>
    <a href="?page=<?php echo $page + 1; ?>&date=<?php echo $filter_date; ?>&status=<?php echo $filter_status; ?>&game=<?php echo $filter_game; ?>" 
       class="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
        <i class="fas fa-chevron-right"></i>
    </a>
    <?php endif; ?>
</div>
<?php endif; ?>

<!-- View Log Modal -->
<div id="viewModal" class="fixed inset-0 z-50 hidden items-center justify-center bg-black bg-opacity-50">
    <div class="card rounded-xl p-6 w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">
        <h3 class="text-xl font-bold mb-4">
            <i class="fas fa-file-alt text-indigo-400 mr-2"></i>Log Details
        </h3>
        <div id="logDetails" class="space-y-4">
            <!-- Filled by JavaScript -->
        </div>
        <div class="flex justify-end mt-6">
            <button onclick="hideModal('viewModal')" class="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition">Close</button>
        </div>
    </div>
</div>

<script>
function hideModal(id) {
    document.getElementById(id).classList.add('hidden');
    document.getElementById(id).classList.remove('flex');
}

function viewLog(log) {
    let requestParams = '';
    let responseBody = '';
    
    try {
        requestParams = JSON.stringify(JSON.parse(log.request_params || '{}'), null, 2);
    } catch {
        requestParams = log.request_params || 'N/A';
    }
    
    try {
        responseBody = JSON.stringify(JSON.parse(log.response_body || '{}'), null, 2);
    } catch {
        responseBody = log.response_body || 'N/A';
    }
    
    document.getElementById('logDetails').innerHTML = `
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="text-gray-400 text-sm">Timestamp</label>
                <p class="text-white">${new Date(log.created_at).toLocaleString()}</p>
            </div>
            <div>
                <label class="text-gray-400 text-sm">Duration</label>
                <p class="text-white">${log.duration_ms}ms</p>
            </div>
            <div>
                <label class="text-gray-400 text-sm">Client IP</label>
                <p class="text-white font-mono">${log.client_ip}</p>
            </div>
            <div>
                <label class="text-gray-400 text-sm">HTTP Status</label>
                <p class="text-white">${log.http_status}</p>
            </div>
            <div>
                <label class="text-gray-400 text-sm">Game Type</label>
                <p class="text-white uppercase">${log.game_type || 'N/A'}</p>
            </div>
            <div>
                <label class="text-gray-400 text-sm">Domain</label>
                <p class="text-white">${log.domain || 'N/A'}</p>
            </div>
        </div>
        <div>
            <label class="text-gray-400 text-sm">Endpoint</label>
            <p class="text-white font-mono text-sm break-all">${log.endpoint}</p>
        </div>
        <div>
            <label class="text-gray-400 text-sm">Request Parameters</label>
            <pre class="bg-gray-800 p-3 rounded-lg text-xs text-gray-300 overflow-x-auto max-h-40">${requestParams}</pre>
        </div>
        <div>
            <label class="text-gray-400 text-sm">Response Body</label>
            <pre class="bg-gray-800 p-3 rounded-lg text-xs text-gray-300 overflow-x-auto max-h-60">${responseBody}</pre>
        </div>
    `;
    
    document.getElementById('viewModal').classList.remove('hidden');
    document.getElementById('viewModal').classList.add('flex');
}

// Close modals on outside click
document.querySelectorAll('[id$="Modal"]').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) hideModal(modal.id);
    });
});
</script>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
