<?php
/**
 * =====================================================
 * 📝 ACTIVITY LOGS
 * =====================================================
 */

$page_title = 'Activity Logs';
require_once __DIR__ . '/../includes/header.php';
require_admin();

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Pagination
$page = max(1, (int)($_GET['page'] ?? 1));
$per_page = 50;
$total = $conn->query("SELECT COUNT(*) as count FROM activity_logs")->fetch_assoc()['count'];
$total_pages = ceil($total / $per_page);
$offset = ($page - 1) * $per_page;

$logs = $conn->query("
    SELECT a.*, u.username 
    FROM activity_logs a
    LEFT JOIN users u ON a.user_id = u.id
    ORDER BY a.created_at DESC 
    LIMIT {$per_page} OFFSET {$offset}
");

$conn->close();
?>

<div class="card rounded-xl p-6 mb-6">
    <h3 class="text-lg font-semibold mb-2">
        <i class="fas fa-history text-indigo-400 mr-2"></i>Admin Activity Log
    </h3>
    <p class="text-gray-400 text-sm">
        Track all administrative actions: user management, API key operations, settings changes.
    </p>
</div>

<!-- Logs Table -->
<div class="card rounded-xl overflow-hidden">
    <div class="table-container">
        <table class="data-table w-full">
            <thead>
                <tr class="text-left text-gray-400 text-sm">
                    <th class="p-4">Time</th>
                    <th class="p-4">User</th>
                    <th class="p-4">Action</th>
                    <th class="p-4">Target</th>
                    <th class="p-4">IP Address</th>
                    <th class="p-4">Details</th>
                </tr>
            </thead>
            <tbody>
                <?php while ($log = $logs->fetch_assoc()): ?>
                <tr class="border-t border-gray-800">
                    <td class="p-4 text-gray-400 text-sm">
                        <?php echo date('M j, H:i:s', strtotime($log['created_at'])); ?>
                    </td>
                    <td class="p-4">
                        <span class="text-indigo-300"><?php echo htmlspecialchars($log['username'] ?: 'System'); ?></span>
                    </td>
                    <td class="p-4">
                        <?php
                        $action_icons = [
                            'login' => 'fa-sign-in-alt text-green-400',
                            'logout' => 'fa-sign-out-alt text-yellow-400',
                            'create_user' => 'fa-user-plus text-blue-400',
                            'update_user' => 'fa-user-edit text-purple-400',
                            'delete_user' => 'fa-user-minus text-red-400',
                            'create_api_key' => 'fa-key text-green-400',
                            'delete_api_key' => 'fa-key text-red-400',
                            'toggle_api_key' => 'fa-toggle-on text-yellow-400',
                            'update_settings' => 'fa-cog text-indigo-400',
                            'add_ip_whitelist' => 'fa-shield-alt text-green-400',
                            'delete_ip_whitelist' => 'fa-shield-alt text-red-400',
                            'password_change' => 'fa-lock text-yellow-400',
                            'reset_password' => 'fa-lock text-orange-400',
                        ];
                        $icon = $action_icons[$log['action']] ?? 'fa-circle text-gray-400';
                        ?>
                        <span class="flex items-center">
                            <i class="fas <?php echo $icon; ?> mr-2"></i>
                            <?php echo htmlspecialchars(str_replace('_', ' ', ucfirst($log['action']))); ?>
                        </span>
                    </td>
                    <td class="p-4 text-gray-400 text-sm">
                        <?php if ($log['target_type']): ?>
                            <span class="text-gray-500"><?php echo $log['target_type']; ?></span>
                            <?php if ($log['target_id']): ?>
                                <span class="text-gray-400">#<?php echo $log['target_id']; ?></span>
                            <?php endif; ?>
                        <?php else: ?>
                            -
                        <?php endif; ?>
                    </td>
                    <td class="p-4">
                        <code class="text-xs bg-gray-800 px-2 py-1 rounded"><?php echo htmlspecialchars($log['ip_address'] ?: '-'); ?></code>
                    </td>
                    <td class="p-4">
                        <?php if ($log['old_values'] || $log['new_values']): ?>
                        <button onclick="viewChanges(<?php echo htmlspecialchars(json_encode($log)); ?>)" 
                                class="text-indigo-400 hover:text-indigo-300">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <?php else: ?>
                        <span class="text-gray-600">-</span>
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

<!-- View Changes Modal -->
<div id="changesModal" class="fixed inset-0 z-50 hidden items-center justify-center bg-black bg-opacity-50">
    <div class="card rounded-xl p-6 w-full max-w-lg mx-4">
        <h3 class="text-xl font-bold mb-4">
            <i class="fas fa-exchange-alt text-indigo-400 mr-2"></i>Change Details
        </h3>
        <div id="changesContent" class="space-y-4">
            <!-- Filled by JavaScript -->
        </div>
        <div class="flex justify-end mt-6">
            <button onclick="hideModal('changesModal')" class="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition">Close</button>
        </div>
    </div>
</div>

<script>
function hideModal(id) {
    document.getElementById(id).classList.add('hidden');
    document.getElementById(id).classList.remove('flex');
}

function viewChanges(log) {
    let content = '';
    
    if (log.old_values) {
        try {
            const oldVals = JSON.parse(log.old_values);
            content += `<div>
                <label class="text-gray-400 text-sm">Old Values</label>
                <pre class="bg-red-900 bg-opacity-30 p-3 rounded-lg text-xs text-red-300 overflow-x-auto">${JSON.stringify(oldVals, null, 2)}</pre>
            </div>`;
        } catch {}
    }
    
    if (log.new_values) {
        try {
            const newVals = JSON.parse(log.new_values);
            content += `<div>
                <label class="text-gray-400 text-sm">New Values</label>
                <pre class="bg-green-900 bg-opacity-30 p-3 rounded-lg text-xs text-green-300 overflow-x-auto">${JSON.stringify(newVals, null, 2)}</pre>
            </div>`;
        } catch {}
    }
    
    document.getElementById('changesContent').innerHTML = content || '<p class="text-gray-400">No details available</p>';
    document.getElementById('changesModal').classList.remove('hidden');
    document.getElementById('changesModal').classList.add('flex');
}

document.querySelectorAll('[id$="Modal"]').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) hideModal(modal.id);
    });
});
</script>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
