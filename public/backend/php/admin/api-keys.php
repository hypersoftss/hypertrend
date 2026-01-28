<?php
/**
 * =====================================================
 * 🔑 API KEYS MANAGEMENT
 * =====================================================
 */

$page_title = 'API Keys';
require_once __DIR__ . '/../includes/header.php';

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
$message = '';
$error = '';

// Handle Actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
    if ($action === 'create') {
        $user_id = is_admin() ? (int)$_POST['user_id'] : $_SESSION['user_id'];
        $name = trim($_POST['name'] ?? '');
        $game_type = $_POST['game_type'] ?? 'all';
        $expires_days = (int)($_POST['expires_days'] ?? 30);
        $daily_limit = (int)($_POST['daily_limit'] ?? 10000);
        $whitelisted_ips = trim($_POST['whitelisted_ips'] ?? '');
        $whitelisted_domains = trim($_POST['whitelisted_domains'] ?? '');
        
        // Generate unique API key
        $api_key = 'HS_' . bin2hex(random_bytes(24));
        $expires_at = date('Y-m-d H:i:s', strtotime("+{$expires_days} days"));
        
        // Parse whitelists
        $ip_array = array_filter(array_map('trim', explode("\n", $whitelisted_ips)));
        $domain_array = array_filter(array_map('trim', explode("\n", $whitelisted_domains)));
        $ip_json = json_encode($ip_array);
        $domain_json = json_encode($domain_array);
        
        $stmt = $conn->prepare("INSERT INTO api_keys (user_id, api_key, name, game_type, expires_at, whitelisted_ips, whitelisted_domains, daily_limit) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("issssssi", $user_id, $api_key, $name, $game_type, $expires_at, $ip_json, $domain_json, $daily_limit);
        
        if ($stmt->execute()) {
            $message = "API Key created: <code class='bg-gray-800 px-2 py-1 rounded select-all cursor-pointer' onclick='copyToClipboard(\"{$api_key}\")'>{$api_key}</code>";
            log_activity($conn, $_SESSION['user_id'], 'create_api_key', 'api_key', $stmt->insert_id);
        } else {
            $error = 'Failed to create API key: ' . $conn->error;
        }
        $stmt->close();
    } elseif ($action === 'toggle_status') {
        $key_id = (int)$_POST['key_id'];
        $new_status = $_POST['new_status'];
        
        $stmt = $conn->prepare("UPDATE api_keys SET status = ? WHERE id = ?");
        $stmt->bind_param("si", $new_status, $key_id);
        
        if ($stmt->execute()) {
            $message = 'API key status updated';
            log_activity($conn, $_SESSION['user_id'], 'toggle_api_key', 'api_key', $key_id);
        } else {
            $error = 'Failed to update status';
        }
        $stmt->close();
    } elseif ($action === 'delete') {
        $key_id = (int)$_POST['key_id'];
        
        $stmt = $conn->prepare("DELETE FROM api_keys WHERE id = ?");
        $stmt->bind_param("i", $key_id);
        
        if ($stmt->execute()) {
            $message = 'API key deleted successfully';
            log_activity($conn, $_SESSION['user_id'], 'delete_api_key', 'api_key', $key_id);
        } else {
            $error = 'Failed to delete API key';
        }
        $stmt->close();
    }
}

// Get API Keys
$where_clause = is_admin() ? "1=1" : "k.user_id = " . (int)$_SESSION['user_id'];
$keys = $conn->query("
    SELECT k.*, u.username 
    FROM api_keys k
    LEFT JOIN users u ON k.user_id = u.id
    WHERE {$where_clause}
    ORDER BY k.created_at DESC
");

// Get users for dropdown (admin only)
$users = is_admin() ? $conn->query("SELECT id, username FROM users ORDER BY username") : null;

$conn->close();
?>

<?php if ($message): ?>
<div class="bg-green-900 bg-opacity-50 border border-green-500 text-green-200 px-4 py-3 rounded-lg mb-6">
    <i class="fas fa-check-circle mr-2"></i><?php echo $message; ?>
</div>
<?php endif; ?>

<?php if ($error): ?>
<div class="bg-red-900 bg-opacity-50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
    <i class="fas fa-exclamation-circle mr-2"></i><?php echo htmlspecialchars($error); ?>
</div>
<?php endif; ?>

<!-- Create Key Button -->
<div class="mb-6">
    <button onclick="showCreateModal()" class="btn-primary px-6 py-3 rounded-lg font-medium">
        <i class="fas fa-plus-circle mr-2"></i>Generate New API Key
    </button>
</div>

<!-- API Keys Table -->
<div class="card rounded-xl overflow-hidden">
    <div class="table-container">
        <table class="data-table w-full">
            <thead>
                <tr class="text-left text-gray-400 text-sm">
                    <th class="p-4">API Key</th>
                    <th class="p-4">Name</th>
                    <?php if (is_admin()): ?><th class="p-4">User</th><?php endif; ?>
                    <th class="p-4">Game Type</th>
                    <th class="p-4">Status</th>
                    <th class="p-4">Expires</th>
                    <th class="p-4">Usage</th>
                    <th class="p-4">Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php while ($key = $keys->fetch_assoc()): ?>
                <tr class="border-t border-gray-800">
                    <td class="p-4">
                        <div class="flex items-center">
                            <code class="bg-gray-800 px-2 py-1 rounded text-sm text-indigo-300 cursor-pointer hover:bg-gray-700" 
                                  onclick="copyToClipboard('<?php echo $key['api_key']; ?>')">
                                <?php echo substr($key['api_key'], 0, 12); ?>...
                            </code>
                            <button onclick="copyToClipboard('<?php echo $key['api_key']; ?>')" class="ml-2 text-gray-400 hover:text-white">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    </td>
                    <td class="p-4 text-gray-300"><?php echo htmlspecialchars($key['name'] ?: 'Unnamed'); ?></td>
                    <?php if (is_admin()): ?>
                    <td class="p-4 text-gray-400"><?php echo htmlspecialchars($key['username']); ?></td>
                    <?php endif; ?>
                    <td class="p-4">
                        <span class="px-2 py-1 bg-indigo-900 bg-opacity-50 text-indigo-300 rounded text-xs uppercase">
                            <?php echo $key['game_type']; ?>
                        </span>
                    </td>
                    <td class="p-4">
                        <span class="status-<?php echo $key['status']; ?>">
                            <i class="fas fa-circle text-xs mr-1"></i>
                            <?php echo ucfirst($key['status']); ?>
                        </span>
                    </td>
                    <td class="p-4 text-gray-400 text-sm">
                        <?php 
                        if ($key['expires_at']) {
                            $expires = strtotime($key['expires_at']);
                            $now = time();
                            if ($expires < $now) {
                                echo '<span class="text-red-400">Expired</span>';
                            } else {
                                $days_left = ceil(($expires - $now) / 86400);
                                echo "{$days_left} days left";
                            }
                        } else {
                            echo '<span class="text-green-400">Never</span>';
                        }
                        ?>
                    </td>
                    <td class="p-4">
                        <div class="text-sm">
                            <span class="text-gray-300"><?php echo number_format($key['total_calls']); ?></span>
                            <span class="text-gray-500 text-xs">total</span>
                        </div>
                        <div class="text-xs text-gray-500">
                            <?php echo number_format($key['calls_today']); ?> today
                        </div>
                    </td>
                    <td class="p-4">
                        <div class="flex space-x-2">
                            <button onclick="viewKey(<?php echo htmlspecialchars(json_encode($key)); ?>)" 
                                    class="p-2 text-indigo-400 hover:bg-indigo-900 rounded transition" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            <?php if ($key['status'] === 'active'): ?>
                            <form method="POST" class="inline">
                                <input type="hidden" name="action" value="toggle_status">
                                <input type="hidden" name="key_id" value="<?php echo $key['id']; ?>">
                                <input type="hidden" name="new_status" value="disabled">
                                <button type="submit" class="p-2 text-yellow-400 hover:bg-yellow-900 rounded transition" title="Disable">
                                    <i class="fas fa-pause"></i>
                                </button>
                            </form>
                            <?php else: ?>
                            <form method="POST" class="inline">
                                <input type="hidden" name="action" value="toggle_status">
                                <input type="hidden" name="key_id" value="<?php echo $key['id']; ?>">
                                <input type="hidden" name="new_status" value="active">
                                <button type="submit" class="p-2 text-green-400 hover:bg-green-900 rounded transition" title="Enable">
                                    <i class="fas fa-play"></i>
                                </button>
                            </form>
                            <?php endif; ?>
                            <button onclick="deleteKey(<?php echo $key['id']; ?>)" 
                                    class="p-2 text-red-400 hover:bg-red-900 rounded transition" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
                <?php endwhile; ?>
            </tbody>
        </table>
    </div>
</div>

<!-- Create Key Modal -->
<div id="createModal" class="fixed inset-0 z-50 hidden items-center justify-center bg-black bg-opacity-50">
    <div class="card rounded-xl p-6 w-full max-w-lg mx-4 max-h-screen overflow-y-auto">
        <h3 class="text-xl font-bold mb-4">
            <i class="fas fa-key text-indigo-400 mr-2"></i>Generate New API Key
        </h3>
        <form method="POST">
            <input type="hidden" name="action" value="create">
            
            <div class="space-y-4">
                <?php if (is_admin()): ?>
                <div>
                    <label class="block text-gray-400 text-sm mb-1">User</label>
                    <select name="user_id" required class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                        <?php while ($user = $users->fetch_assoc()): ?>
                        <option value="<?php echo $user['id']; ?>"><?php echo htmlspecialchars($user['username']); ?></option>
                        <?php endwhile; ?>
                    </select>
                </div>
                <?php endif; ?>
                
                <div>
                    <label class="block text-gray-400 text-sm mb-1">Key Name (Optional)</label>
                    <input type="text" name="name" class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" placeholder="e.g., Production Key">
                </div>
                
                <div>
                    <label class="block text-gray-400 text-sm mb-1">Game Type</label>
                    <select name="game_type" class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                        <option value="all">All Games</option>
                        <option value="wingo">WinGo</option>
                        <option value="k3">K3</option>
                        <option value="5d">5D</option>
                        <option value="trx">TRX</option>
                        <option value="numeric">Numeric</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-gray-400 text-sm mb-1">Expires In (Days)</label>
                    <select name="expires_days" class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                        <option value="7">7 Days</option>
                        <option value="30" selected>30 Days</option>
                        <option value="90">90 Days</option>
                        <option value="180">180 Days</option>
                        <option value="365">1 Year</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-gray-400 text-sm mb-1">Daily Limit</label>
                    <input type="number" name="daily_limit" value="10000" class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                </div>
                
                <div>
                    <label class="block text-gray-400 text-sm mb-1">Whitelisted IPs (One per line)</label>
                    <textarea name="whitelisted_ips" rows="3" class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" placeholder="192.168.1.1&#10;10.0.0.0/24"></textarea>
                    <p class="text-xs text-gray-500 mt-1">Supports IPv4, IPv6, and CIDR notation</p>
                </div>
                
                <div>
                    <label class="block text-gray-400 text-sm mb-1">Whitelisted Domains (One per line)</label>
                    <textarea name="whitelisted_domains" rows="3" class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" placeholder="example.com&#10;*.mysite.com"></textarea>
                    <p class="text-xs text-gray-500 mt-1">Supports wildcards like *.example.com</p>
                </div>
            </div>
            
            <div class="flex justify-end space-x-3 mt-6">
                <button type="button" onclick="hideModal('createModal')" class="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition">Cancel</button>
                <button type="submit" class="px-4 py-2 btn-primary rounded-lg">Generate Key</button>
            </div>
        </form>
    </div>
</div>

<!-- View Key Modal -->
<div id="viewModal" class="fixed inset-0 z-50 hidden items-center justify-center bg-black bg-opacity-50">
    <div class="card rounded-xl p-6 w-full max-w-lg mx-4">
        <h3 class="text-xl font-bold mb-4">
            <i class="fas fa-info-circle text-indigo-400 mr-2"></i>API Key Details
        </h3>
        <div id="keyDetails" class="space-y-4">
            <!-- Filled by JavaScript -->
        </div>
        <div class="flex justify-end mt-6">
            <button onclick="hideModal('viewModal')" class="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition">Close</button>
        </div>
    </div>
</div>

<!-- Delete Form -->
<form id="deleteForm" method="POST" style="display:none;">
    <input type="hidden" name="action" value="delete">
    <input type="hidden" name="key_id" id="delete_key_id">
</form>

<script>
function showCreateModal() {
    document.getElementById('createModal').classList.remove('hidden');
    document.getElementById('createModal').classList.add('flex');
}

function hideModal(id) {
    document.getElementById(id).classList.add('hidden');
    document.getElementById(id).classList.remove('flex');
}

function viewKey(key) {
    const ips = JSON.parse(key.whitelisted_ips || '[]');
    const domains = JSON.parse(key.whitelisted_domains || '[]');
    
    document.getElementById('keyDetails').innerHTML = `
        <div class="bg-gray-800 p-4 rounded-lg">
            <label class="text-gray-400 text-sm">Full API Key</label>
            <div class="flex items-center mt-1">
                <code class="flex-1 text-indigo-300 break-all">${key.api_key}</code>
                <button onclick="copyToClipboard('${key.api_key}')" class="ml-2 p-2 text-gray-400 hover:text-white">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="text-gray-400 text-sm">Game Type</label>
                <p class="text-white uppercase">${key.game_type}</p>
            </div>
            <div>
                <label class="text-gray-400 text-sm">Status</label>
                <p class="status-${key.status}">${key.status}</p>
            </div>
            <div>
                <label class="text-gray-400 text-sm">Total Calls</label>
                <p class="text-white">${Number(key.total_calls).toLocaleString()}</p>
            </div>
            <div>
                <label class="text-gray-400 text-sm">Daily Limit</label>
                <p class="text-white">${Number(key.daily_limit).toLocaleString()}</p>
            </div>
        </div>
        <div>
            <label class="text-gray-400 text-sm">Whitelisted IPs</label>
            <p class="text-white">${ips.length ? ips.join(', ') : '<span class="text-gray-500">None</span>'}</p>
        </div>
        <div>
            <label class="text-gray-400 text-sm">Whitelisted Domains</label>
            <p class="text-white">${domains.length ? domains.join(', ') : '<span class="text-gray-500">None</span>'}</p>
        </div>
        <div>
            <label class="text-gray-400 text-sm">Created</label>
            <p class="text-white">${new Date(key.created_at).toLocaleString()}</p>
        </div>
        <div>
            <label class="text-gray-400 text-sm">Expires</label>
            <p class="text-white">${key.expires_at ? new Date(key.expires_at).toLocaleString() : 'Never'}</p>
        </div>
    `;
    
    document.getElementById('viewModal').classList.remove('hidden');
    document.getElementById('viewModal').classList.add('flex');
}

function deleteKey(keyId) {
    if (confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
        document.getElementById('delete_key_id').value = keyId;
        document.getElementById('deleteForm').submit();
    }
}

// Close modals on outside click
document.querySelectorAll('[id$="Modal"]').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) hideModal(modal.id);
    });
});
</script>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
