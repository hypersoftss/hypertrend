<?php
/**
 * =====================================================
 * 🔑 API KEYS MANAGEMENT - ENHANCED UI
 * =====================================================
 * Features:
 * - Generate/Manage API keys
 * - IP & Domain whitelisting
 * - Usage statistics
 * - Quick copy functionality
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
            $_SESSION['new_api_key'] = $api_key;
            $message = "API Key generated successfully!";
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

// Get stats
$stats_query = is_admin() ? "1=1" : "user_id = " . (int)$_SESSION['user_id'];
$stats = [
    'total' => $conn->query("SELECT COUNT(*) as c FROM api_keys WHERE $stats_query")->fetch_assoc()['c'],
    'active' => $conn->query("SELECT COUNT(*) as c FROM api_keys WHERE status='active' AND $stats_query")->fetch_assoc()['c'],
    'expired' => $conn->query("SELECT COUNT(*) as c FROM api_keys WHERE expires_at < NOW() AND $stats_query")->fetch_assoc()['c'],
];

$conn->close();
?>

<!-- Page Header -->
<div class="flex items-center justify-between mb-6">
    <div>
        <h2 class="text-2xl font-bold">API Keys</h2>
        <p class="text-muted text-sm">Generate and manage API keys for your applications</p>
    </div>
    <button onclick="openModal('createKeyModal')" class="btn btn-primary">
        <i class="fas fa-plus"></i> Generate New Key
    </button>
</div>

<!-- New Key Alert -->
<?php if (isset($_SESSION['new_api_key'])): ?>
<div style="padding: 20px; background: rgb(var(--success) / 0.1); border: 1px solid rgb(var(--success) / 0.3); border-radius: var(--radius-lg); margin-bottom: 24px;">
    <div class="flex items-center gap-3 mb-3">
        <i class="fas fa-check-circle" style="color: rgb(var(--success)); font-size: 24px;"></i>
        <div>
            <h4 class="font-semibold" style="color: rgb(var(--success));">API Key Generated!</h4>
            <p class="text-sm text-muted">Copy your key now - it won't be shown again in full</p>
        </div>
    </div>
    <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: rgb(var(--bg-base)); border-radius: var(--radius-md);">
        <code style="flex: 1; font-size: 14px; word-break: break-all;"><?php echo htmlspecialchars($_SESSION['new_api_key']); ?></code>
        <button onclick="copyToClipboard('<?php echo $_SESSION['new_api_key']; ?>', 'API Key copied!')" class="btn btn-sm btn-success">
            <i class="fas fa-copy"></i> Copy
        </button>
    </div>
</div>
<?php unset($_SESSION['new_api_key']); endif; ?>

<!-- Alerts -->
<?php if ($message): ?>
<div style="display: flex; align-items: center; gap: 12px; padding: 16px; background: rgb(var(--success) / 0.1); border: 1px solid rgb(var(--success) / 0.3); border-radius: var(--radius-lg); margin-bottom: 24px;">
    <i class="fas fa-check-circle" style="color: rgb(var(--success));"></i>
    <span><?php echo $message; ?></span>
</div>
<?php endif; ?>

<?php if ($error): ?>
<div style="display: flex; align-items: center; gap: 12px; padding: 16px; background: rgb(var(--danger) / 0.1); border: 1px solid rgb(var(--danger) / 0.3); border-radius: var(--radius-lg); margin-bottom: 24px;">
    <i class="fas fa-exclamation-circle" style="color: rgb(var(--danger));"></i>
    <span><?php echo htmlspecialchars($error); ?></span>
</div>
<?php endif; ?>

<!-- Stats Cards -->
<div class="grid grid-cols-3 md-cols-1 mb-6">
    <div class="card stat-card">
        <div class="stat-icon primary">
            <i class="fas fa-key"></i>
        </div>
        <div class="stat-content">
            <h3><?php echo number_format($stats['total']); ?></h3>
            <p>Total Keys</p>
        </div>
    </div>
    <div class="card stat-card">
        <div class="stat-icon success">
            <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-content">
            <h3><?php echo number_format($stats['active']); ?></h3>
            <p>Active Keys</p>
        </div>
    </div>
    <div class="card stat-card">
        <div class="stat-icon danger">
            <i class="fas fa-clock"></i>
        </div>
        <div class="stat-content">
            <h3><?php echo number_format($stats['expired']); ?></h3>
            <p>Expired Keys</p>
        </div>
    </div>
</div>

<!-- API Keys Table -->
<div class="card">
    <div class="card-header">
        <h3 class="card-title">
            <i class="fas fa-list"></i> All API Keys
        </h3>
        <span class="badge badge-primary"><?php echo $keys->num_rows; ?> keys</span>
    </div>
    <div class="card-body" style="padding: 0;">
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>API Key</th>
                        <th>Name</th>
                        <?php if (is_admin()): ?><th>User</th><?php endif; ?>
                        <th>Game</th>
                        <th>Status</th>
                        <th>Expires</th>
                        <th>Usage</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if ($keys->num_rows > 0): ?>
                    <?php while ($key = $keys->fetch_assoc()): ?>
                    <tr>
                        <td>
                            <div class="flex items-center gap-2">
                                <code style="padding: 4px 8px; background: rgb(var(--primary) / 0.1); border-radius: 6px; font-size: 12px; cursor: pointer;" 
                                      onclick="copyToClipboard('<?php echo $key['api_key']; ?>')">
                                    <?php echo substr($key['api_key'], 0, 16); ?>...
                                </code>
                                <button onclick="copyToClipboard('<?php echo $key['api_key']; ?>')" 
                                        style="background: none; border: none; color: rgb(var(--text-muted)); cursor: pointer;">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                        </td>
                        <td>
                            <span class="font-medium"><?php echo htmlspecialchars($key['name'] ?: 'Unnamed'); ?></span>
                        </td>
                        <?php if (is_admin()): ?>
                        <td>
                            <span class="text-muted"><?php echo htmlspecialchars($key['username']); ?></span>
                        </td>
                        <?php endif; ?>
                        <td>
                            <span class="badge badge-primary">
                                <?php echo strtoupper($key['game_type']); ?>
                            </span>
                        </td>
                        <td>
                            <?php if ($key['status'] === 'active'): ?>
                                <span class="badge badge-success"><i class="fas fa-check"></i> Active</span>
                            <?php else: ?>
                                <span class="badge badge-danger"><i class="fas fa-times"></i> Disabled</span>
                            <?php endif; ?>
                        </td>
                        <td>
                            <?php 
                            if ($key['expires_at']) {
                                $expires = strtotime($key['expires_at']);
                                $now = time();
                                if ($expires < $now) {
                                    echo '<span class="badge badge-danger">Expired</span>';
                                } else {
                                    $days_left = ceil(($expires - $now) / 86400);
                                    if ($days_left <= 7) {
                                        echo '<span class="badge badge-warning">' . $days_left . ' days</span>';
                                    } else {
                                        echo '<span class="text-muted text-sm">' . $days_left . ' days</span>';
                                    }
                                }
                            } else {
                                echo '<span class="badge badge-success">Never</span>';
                            }
                            ?>
                        </td>
                        <td>
                            <div>
                                <span class="font-semibold"><?php echo number_format($key['total_calls'] ?? 0); ?></span>
                                <span class="text-muted text-xs">total</span>
                            </div>
                            <div class="text-xs text-muted">
                                <?php echo number_format($key['calls_today'] ?? 0); ?>/<?php echo number_format($key['daily_limit'] ?? 10000); ?> today
                            </div>
                        </td>
                        <td>
                            <div class="flex gap-2">
                                <button onclick='viewKeyDetails(<?php echo json_encode($key); ?>)' 
                                        class="btn btn-sm btn-secondary" title="View Details">
                                    <i class="fas fa-eye"></i>
                                </button>
                                
                                <?php if ($key['status'] === 'active'): ?>
                                <form method="POST" style="display: inline;">
                                    <input type="hidden" name="action" value="toggle_status">
                                    <input type="hidden" name="key_id" value="<?php echo $key['id']; ?>">
                                    <input type="hidden" name="new_status" value="disabled">
                                    <button type="submit" class="btn btn-sm btn-secondary" title="Disable">
                                        <i class="fas fa-pause" style="color: rgb(var(--warning));"></i>
                                    </button>
                                </form>
                                <?php else: ?>
                                <form method="POST" style="display: inline;">
                                    <input type="hidden" name="action" value="toggle_status">
                                    <input type="hidden" name="key_id" value="<?php echo $key['id']; ?>">
                                    <input type="hidden" name="new_status" value="active">
                                    <button type="submit" class="btn btn-sm btn-secondary" title="Enable">
                                        <i class="fas fa-play" style="color: rgb(var(--success));"></i>
                                    </button>
                                </form>
                                <?php endif; ?>
                                
                                <form method="POST" style="display: inline;" onsubmit="return confirmAction('Delete this API key?')">
                                    <input type="hidden" name="action" value="delete">
                                    <input type="hidden" name="key_id" value="<?php echo $key['id']; ?>">
                                    <button type="submit" class="btn btn-sm btn-secondary" title="Delete">
                                        <i class="fas fa-trash" style="color: rgb(var(--danger));"></i>
                                    </button>
                                </form>
                            </div>
                        </td>
                    </tr>
                    <?php endwhile; ?>
                    <?php else: ?>
                    <tr>
                        <td colspan="<?php echo is_admin() ? 8 : 7; ?>">
                            <div class="empty-state">
                                <div class="empty-state-icon">
                                    <i class="fas fa-key"></i>
                                </div>
                                <h3>No API Keys</h3>
                                <p>Generate your first API key to get started</p>
                                <button onclick="openModal('createKeyModal')" class="btn btn-primary" style="margin-top: 16px;">
                                    <i class="fas fa-plus"></i> Generate Key
                                </button>
                            </div>
                        </td>
                    </tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- Create Key Modal -->
<div class="modal-backdrop" id="createKeyModal">
    <div class="modal" style="max-width: 560px;">
        <div class="modal-header">
            <h3 class="modal-title">
                <i class="fas fa-key" style="color: rgb(var(--primary));"></i>
                Generate New API Key
            </h3>
            <button onclick="closeModal('createKeyModal')" style="background: none; border: none; color: rgb(var(--text-muted)); cursor: pointer; font-size: 20px;">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <form method="POST">
            <input type="hidden" name="action" value="create">
            
            <div class="modal-body">
                <?php if (is_admin() && $users): ?>
                <div class="form-group">
                    <label class="form-label">Assign to User</label>
                    <select name="user_id" required class="form-control">
                        <?php 
                        $users->data_seek(0);
                        while ($user = $users->fetch_assoc()): 
                        ?>
                        <option value="<?php echo $user['id']; ?>"><?php echo htmlspecialchars($user['username']); ?></option>
                        <?php endwhile; ?>
                    </select>
                </div>
                <?php endif; ?>
                
                <div class="form-group">
                    <label class="form-label">Key Name (Optional)</label>
                    <input type="text" name="name" class="form-control" placeholder="e.g., Production Server">
                </div>
                
                <div class="grid grid-cols-2" style="gap: 16px;">
                    <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label">Game Type</label>
                        <select name="game_type" class="form-control">
                            <option value="all">All Games</option>
                            <option value="wingo">WinGo</option>
                            <option value="k3">K3</option>
                            <option value="5d">5D</option>
                            <option value="trx">TRX</option>
                            <option value="numeric">Numeric</option>
                        </select>
                    </div>
                    
                    <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label">Validity</label>
                        <select name="expires_days" class="form-control">
                            <option value="7">7 Days</option>
                            <option value="30" selected>30 Days</option>
                            <option value="90">90 Days</option>
                            <option value="180">6 Months</option>
                            <option value="365">1 Year</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group" style="margin-top: 16px;">
                    <label class="form-label">Daily Request Limit</label>
                    <input type="number" name="daily_limit" value="10000" class="form-control">
                </div>
                
                <div class="form-group">
                    <label class="form-label">
                        <i class="fas fa-shield-alt" style="color: rgb(var(--warning));"></i>
                        Whitelisted IPs (One per line)
                    </label>
                    <textarea name="whitelisted_ips" rows="3" class="form-control" 
                              placeholder="192.168.1.1&#10;10.0.0.0/24&#10;2001:db8::1"></textarea>
                    <small class="text-muted">Supports IPv4, IPv6, and CIDR notation. Leave empty to allow all.</small>
                </div>
                
                <div class="form-group">
                    <label class="form-label">
                        <i class="fas fa-globe" style="color: rgb(var(--info));"></i>
                        Whitelisted Domains (One per line)
                    </label>
                    <textarea name="whitelisted_domains" rows="3" class="form-control" 
                              placeholder="example.com&#10;*.mysite.com&#10;api.domain.com"></textarea>
                    <small class="text-muted">Supports wildcards like *.example.com. Leave empty to allow all.</small>
                </div>
            </div>
            
            <div class="modal-footer">
                <button type="button" onclick="closeModal('createKeyModal')" class="btn btn-secondary">Cancel</button>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-key"></i> Generate Key
                </button>
            </div>
        </form>
    </div>
</div>

<!-- View Key Details Modal -->
<div class="modal-backdrop" id="viewKeyModal">
    <div class="modal" style="max-width: 560px;">
        <div class="modal-header">
            <h3 class="modal-title">
                <i class="fas fa-info-circle" style="color: rgb(var(--info));"></i>
                API Key Details
            </h3>
            <button onclick="closeModal('viewKeyModal')" style="background: none; border: none; color: rgb(var(--text-muted)); cursor: pointer; font-size: 20px;">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="modal-body" id="keyDetailsContent">
            <!-- Filled by JavaScript -->
        </div>
        <div class="modal-footer">
            <button onclick="closeModal('viewKeyModal')" class="btn btn-secondary">Close</button>
        </div>
    </div>
</div>

<script>
function viewKeyDetails(key) {
    const ips = JSON.parse(key.whitelisted_ips || '[]');
    const domains = JSON.parse(key.whitelisted_domains || '[]');
    
    document.getElementById('keyDetailsContent').innerHTML = `
        <div style="padding: 16px; background: rgb(var(--primary) / 0.05); border: 1px solid rgb(var(--primary) / 0.2); border-radius: var(--radius-md); margin-bottom: 20px;">
            <label class="form-label" style="margin-bottom: 8px;">Full API Key</label>
            <div style="display: flex; align-items: center; gap: 12px;">
                <code style="flex: 1; word-break: break-all; font-size: 13px;">${key.api_key}</code>
                <button onclick="copyToClipboard('${key.api_key}')" class="btn btn-sm btn-primary">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
        </div>
        
        <div class="grid grid-cols-2" style="gap: 16px; margin-bottom: 20px;">
            <div>
                <label class="text-muted text-sm">Name</label>
                <p class="font-medium">${key.name || 'Unnamed'}</p>
            </div>
            <div>
                <label class="text-muted text-sm">Game Type</label>
                <p><span class="badge badge-primary">${key.game_type.toUpperCase()}</span></p>
            </div>
            <div>
                <label class="text-muted text-sm">Status</label>
                <p><span class="badge badge-${key.status === 'active' ? 'success' : 'danger'}">${key.status}</span></p>
            </div>
            <div>
                <label class="text-muted text-sm">Daily Limit</label>
                <p class="font-medium">${Number(key.daily_limit || 10000).toLocaleString()}</p>
            </div>
            <div>
                <label class="text-muted text-sm">Total Calls</label>
                <p class="font-medium">${Number(key.total_calls || 0).toLocaleString()}</p>
            </div>
            <div>
                <label class="text-muted text-sm">Calls Today</label>
                <p class="font-medium">${Number(key.calls_today || 0).toLocaleString()}</p>
            </div>
        </div>
        
        <div style="margin-bottom: 16px;">
            <label class="text-muted text-sm">Whitelisted IPs</label>
            <p>${ips.length ? ips.map(ip => '<code style="font-size: 12px; padding: 2px 6px; background: rgb(var(--bg-base)); border-radius: 4px; margin-right: 4px;">' + ip + '</code>').join('') : '<span class="text-muted">All IPs allowed</span>'}</p>
        </div>
        
        <div style="margin-bottom: 16px;">
            <label class="text-muted text-sm">Whitelisted Domains</label>
            <p>${domains.length ? domains.map(d => '<code style="font-size: 12px; padding: 2px 6px; background: rgb(var(--bg-base)); border-radius: 4px; margin-right: 4px;">' + d + '</code>').join('') : '<span class="text-muted">All domains allowed</span>'}</p>
        </div>
        
        <div class="grid grid-cols-2" style="gap: 16px;">
            <div>
                <label class="text-muted text-sm">Created</label>
                <p class="text-sm">${new Date(key.created_at).toLocaleString()}</p>
            </div>
            <div>
                <label class="text-muted text-sm">Expires</label>
                <p class="text-sm">${key.expires_at ? new Date(key.expires_at).toLocaleString() : 'Never'}</p>
            </div>
        </div>
    `;
    
    openModal('viewKeyModal');
}
</script>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
