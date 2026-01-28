<?php
/**
 * =====================================================
 * 👥 USERS MANAGEMENT
 * =====================================================
 */

$page_title = 'Users Management';
require_once __DIR__ . '/../includes/header.php';
require_admin();

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
$message = '';
$error = '';

// Handle Actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
    if ($action === 'create') {
        $username = trim($_POST['username'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';
        $role = $_POST['role'] ?? 'user';
        $telegram_id = trim($_POST['telegram_id'] ?? '');
        $phone = trim($_POST['phone'] ?? '');
        
        if (empty($username) || empty($email) || empty($password)) {
            $error = 'Username, email, and password are required';
        } else {
            $password_hash = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $conn->prepare("INSERT INTO users (username, email, password_hash, role, telegram_id, phone) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("ssssss", $username, $email, $password_hash, $role, $telegram_id, $phone);
            
            if ($stmt->execute()) {
                $message = 'User created successfully';
                log_activity($conn, $_SESSION['user_id'], 'create_user', 'user', $stmt->insert_id);
            } else {
                $error = 'Failed to create user: ' . $conn->error;
            }
            $stmt->close();
        }
    } elseif ($action === 'update') {
        $user_id = (int)$_POST['user_id'];
        $email = trim($_POST['email'] ?? '');
        $role = $_POST['role'] ?? 'user';
        $status = $_POST['status'] ?? 'active';
        $telegram_id = trim($_POST['telegram_id'] ?? '');
        $phone = trim($_POST['phone'] ?? '');
        
        $stmt = $conn->prepare("UPDATE users SET email = ?, role = ?, status = ?, telegram_id = ?, phone = ? WHERE id = ?");
        $stmt->bind_param("sssssi", $email, $role, $status, $telegram_id, $phone, $user_id);
        
        if ($stmt->execute()) {
            $message = 'User updated successfully';
            log_activity($conn, $_SESSION['user_id'], 'update_user', 'user', $user_id);
        } else {
            $error = 'Failed to update user';
        }
        $stmt->close();
    } elseif ($action === 'delete') {
        $user_id = (int)$_POST['user_id'];
        
        if ($user_id === $_SESSION['user_id']) {
            $error = 'Cannot delete yourself';
        } else {
            $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
            $stmt->bind_param("i", $user_id);
            
            if ($stmt->execute()) {
                $message = 'User deleted successfully';
                log_activity($conn, $_SESSION['user_id'], 'delete_user', 'user', $user_id);
            } else {
                $error = 'Failed to delete user';
            }
            $stmt->close();
        }
    } elseif ($action === 'reset_password') {
        $user_id = (int)$_POST['user_id'];
        $new_password = bin2hex(random_bytes(8)); // Random 16-char password
        $password_hash = password_hash($new_password, PASSWORD_DEFAULT);
        
        $stmt = $conn->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
        $stmt->bind_param("si", $password_hash, $user_id);
        
        if ($stmt->execute()) {
            $message = "Password reset to: <code class='bg-gray-800 px-2 py-1 rounded'>{$new_password}</code>";
            log_activity($conn, $_SESSION['user_id'], 'reset_password', 'user', $user_id);
        } else {
            $error = 'Failed to reset password';
        }
        $stmt->close();
    }
}

// Get Users
$users = $conn->query("SELECT * FROM users ORDER BY created_at DESC");
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

<!-- Create User Button -->
<div class="mb-6">
    <button onclick="showCreateModal()" class="btn-primary px-6 py-3 rounded-lg font-medium">
        <i class="fas fa-user-plus mr-2"></i>Create New User
    </button>
</div>

<!-- Users Table -->
<div class="card rounded-xl overflow-hidden">
    <div class="table-container">
        <table class="data-table w-full">
            <thead>
                <tr class="text-left text-gray-400 text-sm">
                    <th class="p-4">User</th>
                    <th class="p-4">Email</th>
                    <th class="p-4">Role</th>
                    <th class="p-4">Status</th>
                    <th class="p-4">Telegram</th>
                    <th class="p-4">Last Login</th>
                    <th class="p-4">Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php while ($user = $users->fetch_assoc()): ?>
                <tr class="border-t border-gray-800">
                    <td class="p-4">
                        <div class="flex items-center">
                            <div class="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center mr-3">
                                <?php echo strtoupper(substr($user['username'], 0, 1)); ?>
                            </div>
                            <span class="font-medium"><?php echo htmlspecialchars($user['username']); ?></span>
                        </div>
                    </td>
                    <td class="p-4 text-gray-400"><?php echo htmlspecialchars($user['email']); ?></td>
                    <td class="p-4">
                        <span class="px-2 py-1 rounded text-xs <?php echo $user['role'] === 'admin' ? 'bg-purple-900 text-purple-300' : 'bg-gray-800 text-gray-300'; ?>">
                            <?php echo ucfirst($user['role']); ?>
                        </span>
                    </td>
                    <td class="p-4">
                        <span class="status-<?php echo $user['status']; ?>">
                            <i class="fas fa-circle text-xs mr-1"></i>
                            <?php echo ucfirst($user['status']); ?>
                        </span>
                    </td>
                    <td class="p-4 text-gray-400">
                        <?php if ($user['telegram_id']): ?>
                            <i class="fab fa-telegram text-blue-400 mr-1"></i><?php echo htmlspecialchars($user['telegram_id']); ?>
                        <?php else: ?>
                            <span class="text-gray-600">Not linked</span>
                        <?php endif; ?>
                    </td>
                    <td class="p-4 text-gray-400 text-sm">
                        <?php echo $user['last_login_at'] ? date('M j, H:i', strtotime($user['last_login_at'])) : 'Never'; ?>
                    </td>
                    <td class="p-4">
                        <div class="flex space-x-2">
                            <button onclick="editUser(<?php echo htmlspecialchars(json_encode($user)); ?>)" 
                                    class="p-2 text-indigo-400 hover:bg-indigo-900 rounded transition">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="resetPassword(<?php echo $user['id']; ?>)" 
                                    class="p-2 text-yellow-400 hover:bg-yellow-900 rounded transition">
                                <i class="fas fa-key"></i>
                            </button>
                            <?php if ($user['id'] !== $_SESSION['user_id']): ?>
                            <button onclick="deleteUser(<?php echo $user['id']; ?>, '<?php echo htmlspecialchars($user['username']); ?>')" 
                                    class="p-2 text-red-400 hover:bg-red-900 rounded transition">
                                <i class="fas fa-trash"></i>
                            </button>
                            <?php endif; ?>
                        </div>
                    </td>
                </tr>
                <?php endwhile; ?>
            </tbody>
        </table>
    </div>
</div>

<!-- Create User Modal -->
<div id="createModal" class="fixed inset-0 z-50 hidden items-center justify-center bg-black bg-opacity-50">
    <div class="card rounded-xl p-6 w-full max-w-md mx-4">
        <h3 class="text-xl font-bold mb-4">
            <i class="fas fa-user-plus text-indigo-400 mr-2"></i>Create New User
        </h3>
        <form method="POST">
            <input type="hidden" name="action" value="create">
            
            <div class="space-y-4">
                <div>
                    <label class="block text-gray-400 text-sm mb-1">Username</label>
                    <input type="text" name="username" required class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500">
                </div>
                <div>
                    <label class="block text-gray-400 text-sm mb-1">Email</label>
                    <input type="email" name="email" required class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500">
                </div>
                <div>
                    <label class="block text-gray-400 text-sm mb-1">Password</label>
                    <input type="password" name="password" required class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500">
                </div>
                <div>
                    <label class="block text-gray-400 text-sm mb-1">Role</label>
                    <select name="role" class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                        <option value="user">User</option>
                        <option value="reseller">Reseller</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div>
                    <label class="block text-gray-400 text-sm mb-1">Telegram ID (Optional)</label>
                    <input type="text" name="telegram_id" class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500">
                </div>
                <div>
                    <label class="block text-gray-400 text-sm mb-1">Phone (Optional)</label>
                    <input type="text" name="phone" class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500">
                </div>
            </div>
            
            <div class="flex justify-end space-x-3 mt-6">
                <button type="button" onclick="hideModal('createModal')" class="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition">Cancel</button>
                <button type="submit" class="px-4 py-2 btn-primary rounded-lg">Create User</button>
            </div>
        </form>
    </div>
</div>

<!-- Edit User Modal -->
<div id="editModal" class="fixed inset-0 z-50 hidden items-center justify-center bg-black bg-opacity-50">
    <div class="card rounded-xl p-6 w-full max-w-md mx-4">
        <h3 class="text-xl font-bold mb-4">
            <i class="fas fa-user-edit text-indigo-400 mr-2"></i>Edit User
        </h3>
        <form method="POST">
            <input type="hidden" name="action" value="update">
            <input type="hidden" name="user_id" id="edit_user_id">
            
            <div class="space-y-4">
                <div>
                    <label class="block text-gray-400 text-sm mb-1">Username</label>
                    <input type="text" id="edit_username" disabled class="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-400">
                </div>
                <div>
                    <label class="block text-gray-400 text-sm mb-1">Email</label>
                    <input type="email" name="email" id="edit_email" required class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500">
                </div>
                <div>
                    <label class="block text-gray-400 text-sm mb-1">Role</label>
                    <select name="role" id="edit_role" class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                        <option value="user">User</option>
                        <option value="reseller">Reseller</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div>
                    <label class="block text-gray-400 text-sm mb-1">Status</label>
                    <select name="status" id="edit_status" class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>
                <div>
                    <label class="block text-gray-400 text-sm mb-1">Telegram ID</label>
                    <input type="text" name="telegram_id" id="edit_telegram_id" class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500">
                </div>
                <div>
                    <label class="block text-gray-400 text-sm mb-1">Phone</label>
                    <input type="text" name="phone" id="edit_phone" class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500">
                </div>
            </div>
            
            <div class="flex justify-end space-x-3 mt-6">
                <button type="button" onclick="hideModal('editModal')" class="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition">Cancel</button>
                <button type="submit" class="px-4 py-2 btn-primary rounded-lg">Save Changes</button>
            </div>
        </form>
    </div>
</div>

<!-- Hidden forms for actions -->
<form id="resetPasswordForm" method="POST" style="display:none;">
    <input type="hidden" name="action" value="reset_password">
    <input type="hidden" name="user_id" id="reset_user_id">
</form>

<form id="deleteForm" method="POST" style="display:none;">
    <input type="hidden" name="action" value="delete">
    <input type="hidden" name="user_id" id="delete_user_id">
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

function editUser(user) {
    document.getElementById('edit_user_id').value = user.id;
    document.getElementById('edit_username').value = user.username;
    document.getElementById('edit_email').value = user.email;
    document.getElementById('edit_role').value = user.role;
    document.getElementById('edit_status').value = user.status;
    document.getElementById('edit_telegram_id').value = user.telegram_id || '';
    document.getElementById('edit_phone').value = user.phone || '';
    
    document.getElementById('editModal').classList.remove('hidden');
    document.getElementById('editModal').classList.add('flex');
}

function resetPassword(userId) {
    if (confirm('Reset password for this user? They will receive a new random password.')) {
        document.getElementById('reset_user_id').value = userId;
        document.getElementById('resetPasswordForm').submit();
    }
}

function deleteUser(userId, username) {
    if (confirm(`Are you sure you want to delete user "${username}"? This will also delete all their API keys!`)) {
        document.getElementById('delete_user_id').value = userId;
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
