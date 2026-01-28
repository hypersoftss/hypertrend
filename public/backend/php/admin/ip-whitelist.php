<?php
/**
 * =====================================================
 * 🛡️ IP WHITELIST MANAGEMENT
 * =====================================================
 */

$page_title = 'IP Whitelist';
require_once __DIR__ . '/../includes/header.php';
require_admin();

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
$message = '';
$error = '';

// Handle Actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
    if ($action === 'add') {
        $ip_address = trim($_POST['ip_address'] ?? '');
        $description = trim($_POST['description'] ?? '');
        
        if (empty($ip_address)) {
            $error = 'IP address is required';
        } else {
            // Try to resolve if it's a hostname
            $resolved_ip = null;
            if (filter_var($ip_address, FILTER_VALIDATE_IP)) {
                $resolved_ip = $ip_address;
            } elseif (strpos($ip_address, '/') !== false) {
                // CIDR notation
                $resolved_ip = explode('/', $ip_address)[0];
            } else {
                // Try DNS lookup
                $dns = gethostbyname($ip_address);
                if ($dns !== $ip_address) {
                    $resolved_ip = $dns;
                }
            }
            
            $stmt = $conn->prepare("INSERT INTO allowed_ips (ip_address, resolved_ip, description, added_by, last_resolved_at) VALUES (?, ?, ?, ?, NOW())");
            $stmt->bind_param("sssi", $ip_address, $resolved_ip, $description, $_SESSION['user_id']);
            
            if ($stmt->execute()) {
                $message = 'IP added successfully';
                log_activity($conn, $_SESSION['user_id'], 'add_ip_whitelist', 'allowed_ips', $stmt->insert_id);
            } else {
                $error = 'Failed to add IP: ' . $conn->error;
            }
            $stmt->close();
        }
    } elseif ($action === 'toggle') {
        $ip_id = (int)$_POST['ip_id'];
        $new_status = $_POST['new_status'];
        
        $stmt = $conn->prepare("UPDATE allowed_ips SET status = ? WHERE id = ?");
        $stmt->bind_param("si", $new_status, $ip_id);
        
        if ($stmt->execute()) {
            $message = 'IP status updated';
            log_activity($conn, $_SESSION['user_id'], 'toggle_ip_whitelist', 'allowed_ips', $ip_id);
        }
        $stmt->close();
    } elseif ($action === 'delete') {
        $ip_id = (int)$_POST['ip_id'];
        
        $stmt = $conn->prepare("DELETE FROM allowed_ips WHERE id = ?");
        $stmt->bind_param("i", $ip_id);
        
        if ($stmt->execute()) {
            $message = 'IP removed from whitelist';
            log_activity($conn, $_SESSION['user_id'], 'delete_ip_whitelist', 'allowed_ips', $ip_id);
        }
        $stmt->close();
    } elseif ($action === 'refresh') {
        // Re-resolve all IPs
        $ips = $conn->query("SELECT id, ip_address FROM allowed_ips WHERE resolved_ip IS NULL OR last_resolved_at < DATE_SUB(NOW(), INTERVAL 1 DAY)");
        $updated = 0;
        
        while ($ip = $ips->fetch_assoc()) {
            $resolved = null;
            if (filter_var($ip['ip_address'], FILTER_VALIDATE_IP)) {
                $resolved = $ip['ip_address'];
            } elseif (strpos($ip['ip_address'], '/') !== false) {
                $resolved = explode('/', $ip['ip_address'])[0];
            } else {
                $dns = gethostbyname($ip['ip_address']);
                if ($dns !== $ip['ip_address']) {
                    $resolved = $dns;
                }
            }
            
            if ($resolved) {
                $stmt = $conn->prepare("UPDATE allowed_ips SET resolved_ip = ?, last_resolved_at = NOW() WHERE id = ?");
                $stmt->bind_param("si", $resolved, $ip['id']);
                $stmt->execute();
                $stmt->close();
                $updated++;
            }
        }
        
        $message = "Refreshed {$updated} IP addresses";
    }
}

// Get whitelist
$whitelist = $conn->query("SELECT a.*, u.username as added_by_name FROM allowed_ips a LEFT JOIN users u ON a.added_by = u.id ORDER BY a.created_at DESC");

$conn->close();
?>

<?php if ($message): ?>
<div class="bg-green-900 bg-opacity-50 border border-green-500 text-green-200 px-4 py-3 rounded-lg mb-6">
    <i class="fas fa-check-circle mr-2"></i><?php echo htmlspecialchars($message); ?>
</div>
<?php endif; ?>

<?php if ($error): ?>
<div class="bg-red-900 bg-opacity-50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
    <i class="fas fa-exclamation-circle mr-2"></i><?php echo htmlspecialchars($error); ?>
</div>
<?php endif; ?>

<!-- Actions -->
<div class="flex flex-wrap gap-4 mb-6">
    <button onclick="showAddModal()" class="btn-primary px-6 py-3 rounded-lg font-medium">
        <i class="fas fa-plus-circle mr-2"></i>Add IP/CIDR
    </button>
    <form method="POST" class="inline">
        <input type="hidden" name="action" value="refresh">
        <button type="submit" class="px-6 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition">
            <i class="fas fa-sync-alt mr-2"></i>Refresh DNS
        </button>
    </form>
</div>

<!-- Info Box -->
<div class="card rounded-xl p-4 mb-6 border-l-4 border-indigo-500">
    <h4 class="font-medium mb-2"><i class="fas fa-info-circle text-indigo-400 mr-2"></i>IP Whitelist</h4>
    <p class="text-gray-400 text-sm">
        Only IPs listed here can access your API endpoints. Supports:
    </p>
    <ul class="text-gray-400 text-sm mt-2 list-disc list-inside">
        <li>Single IPv4: <code class="bg-gray-800 px-1 rounded">192.168.1.100</code></li>
        <li>CIDR notation: <code class="bg-gray-800 px-1 rounded">10.0.0.0/24</code></li>
        <li>IPv6: <code class="bg-gray-800 px-1 rounded">2001:db8::1</code></li>
        <li>Hostname: <code class="bg-gray-800 px-1 rounded">server.example.com</code> (auto-resolved)</li>
    </ul>
</div>

<!-- Whitelist Table -->
<div class="card rounded-xl overflow-hidden">
    <div class="table-container">
        <table class="data-table w-full">
            <thead>
                <tr class="text-left text-gray-400 text-sm">
                    <th class="p-4">IP/CIDR/Hostname</th>
                    <th class="p-4">Resolved IP</th>
                    <th class="p-4">Description</th>
                    <th class="p-4">Status</th>
                    <th class="p-4">Added</th>
                    <th class="p-4">Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php while ($ip = $whitelist->fetch_assoc()): ?>
                <tr class="border-t border-gray-800">
                    <td class="p-4">
                        <code class="text-indigo-300"><?php echo htmlspecialchars($ip['ip_address']); ?></code>
                    </td>
                    <td class="p-4">
                        <?php if ($ip['resolved_ip']): ?>
                            <code class="text-gray-300"><?php echo htmlspecialchars($ip['resolved_ip']); ?></code>
                        <?php else: ?>
                            <span class="text-yellow-400"><i class="fas fa-exclamation-triangle mr-1"></i>Unresolved</span>
                        <?php endif; ?>
                    </td>
                    <td class="p-4 text-gray-400"><?php echo htmlspecialchars($ip['description'] ?: '-'); ?></td>
                    <td class="p-4">
                        <span class="status-<?php echo $ip['status']; ?>">
                            <i class="fas fa-circle text-xs mr-1"></i>
                            <?php echo ucfirst($ip['status']); ?>
                        </span>
                    </td>
                    <td class="p-4 text-gray-400 text-sm">
                        <?php echo date('M j, Y', strtotime($ip['created_at'])); ?>
                        <br><span class="text-xs">by <?php echo htmlspecialchars($ip['added_by_name'] ?: 'System'); ?></span>
                    </td>
                    <td class="p-4">
                        <div class="flex space-x-2">
                            <?php if ($ip['status'] === 'active'): ?>
                            <form method="POST" class="inline">
                                <input type="hidden" name="action" value="toggle">
                                <input type="hidden" name="ip_id" value="<?php echo $ip['id']; ?>">
                                <input type="hidden" name="new_status" value="disabled">
                                <button type="submit" class="p-2 text-yellow-400 hover:bg-yellow-900 rounded transition" title="Disable">
                                    <i class="fas fa-pause"></i>
                                </button>
                            </form>
                            <?php else: ?>
                            <form method="POST" class="inline">
                                <input type="hidden" name="action" value="toggle">
                                <input type="hidden" name="ip_id" value="<?php echo $ip['id']; ?>">
                                <input type="hidden" name="new_status" value="active">
                                <button type="submit" class="p-2 text-green-400 hover:bg-green-900 rounded transition" title="Enable">
                                    <i class="fas fa-play"></i>
                                </button>
                            </form>
                            <?php endif; ?>
                            <button onclick="deleteIP(<?php echo $ip['id']; ?>, '<?php echo htmlspecialchars($ip['ip_address']); ?>')" 
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

<!-- Add IP Modal -->
<div id="addModal" class="fixed inset-0 z-50 hidden items-center justify-center bg-black bg-opacity-50">
    <div class="card rounded-xl p-6 w-full max-w-md mx-4">
        <h3 class="text-xl font-bold mb-4">
            <i class="fas fa-shield-alt text-indigo-400 mr-2"></i>Add to Whitelist
        </h3>
        <form method="POST">
            <input type="hidden" name="action" value="add">
            
            <div class="space-y-4">
                <div>
                    <label class="block text-gray-400 text-sm mb-1">IP Address / CIDR / Hostname</label>
                    <input type="text" name="ip_address" required 
                           class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500"
                           placeholder="e.g., 192.168.1.100 or 10.0.0.0/24">
                </div>
                <div>
                    <label class="block text-gray-400 text-sm mb-1">Description (Optional)</label>
                    <input type="text" name="description" 
                           class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                           placeholder="e.g., Client production server">
                </div>
            </div>
            
            <div class="flex justify-end space-x-3 mt-6">
                <button type="button" onclick="hideModal('addModal')" class="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition">Cancel</button>
                <button type="submit" class="px-4 py-2 btn-primary rounded-lg">Add IP</button>
            </div>
        </form>
    </div>
</div>

<!-- Delete Form -->
<form id="deleteForm" method="POST" style="display:none;">
    <input type="hidden" name="action" value="delete">
    <input type="hidden" name="ip_id" id="delete_ip_id">
</form>

<script>
function showAddModal() {
    document.getElementById('addModal').classList.remove('hidden');
    document.getElementById('addModal').classList.add('flex');
}

function hideModal(id) {
    document.getElementById(id).classList.add('hidden');
    document.getElementById(id).classList.remove('flex');
}

function deleteIP(ipId, ipAddress) {
    if (confirm(`Remove "${ipAddress}" from whitelist? This IP will no longer be able to access your API.`)) {
        document.getElementById('delete_ip_id').value = ipId;
        document.getElementById('deleteForm').submit();
    }
}

document.querySelectorAll('[id$="Modal"]').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) hideModal(modal.id);
    });
});
</script>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
