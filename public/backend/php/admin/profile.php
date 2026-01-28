<?php
/**
 * =====================================================
 * 👤 USER PROFILE
 * =====================================================
 */

$page_title = 'My Profile';
require_once __DIR__ . '/../includes/header.php';

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
$message = '';
$error = '';

// Get user data
$stmt = $conn->prepare("SELECT * FROM users WHERE id = ?");
$stmt->bind_param("i", $_SESSION['user_id']);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();
$stmt->close();

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
    if ($action === 'update_profile') {
        $email = trim($_POST['email'] ?? '');
        $telegram_id = trim($_POST['telegram_id'] ?? '');
        $phone = trim($_POST['phone'] ?? '');
        $company_name = trim($_POST['company_name'] ?? '');
        
        $stmt = $conn->prepare("UPDATE users SET email = ?, telegram_id = ?, phone = ?, company_name = ? WHERE id = ?");
        $stmt->bind_param("ssssi", $email, $telegram_id, $phone, $company_name, $_SESSION['user_id']);
        
        if ($stmt->execute()) {
            $message = 'Profile updated successfully';
            log_activity($conn, $_SESSION['user_id'], 'update_profile', 'user', $_SESSION['user_id']);
            
            // Refresh user data
            $stmt->close();
            $stmt = $conn->prepare("SELECT * FROM users WHERE id = ?");
            $stmt->bind_param("i", $_SESSION['user_id']);
            $stmt->execute();
            $user = $stmt->get_result()->fetch_assoc();
        } else {
            $error = 'Failed to update profile';
        }
        $stmt->close();
    } elseif ($action === 'change_password') {
        $current_password = $_POST['current_password'] ?? '';
        $new_password = $_POST['new_password'] ?? '';
        $confirm_password = $_POST['confirm_password'] ?? '';
        
        if ($new_password !== $confirm_password) {
            $error = 'New passwords do not match';
        } elseif (strlen($new_password) < 6) {
            $error = 'Password must be at least 6 characters';
        } else {
            $result = change_password($_SESSION['user_id'], $current_password, $new_password);
            if ($result['success']) {
                $message = $result['message'];
            } else {
                $error = $result['error'];
            }
        }
    }
}

// Get user's API stats
$stats = [];
$result = $conn->query("SELECT COUNT(*) as count FROM api_keys WHERE user_id = {$_SESSION['user_id']} AND status = 'active'");
$stats['active_keys'] = $result->fetch_assoc()['count'];

$result = $conn->query("SELECT COUNT(*) as count FROM api_logs WHERE user_id = {$_SESSION['user_id']} AND DATE(created_at) = CURDATE()");
$stats['today_calls'] = $result->fetch_assoc()['count'];

$result = $conn->query("SELECT SUM(total_calls) as total FROM api_keys WHERE user_id = {$_SESSION['user_id']}");
$stats['total_calls'] = $result->fetch_assoc()['total'] ?? 0;

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

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Profile Info -->
    <div class="lg:col-span-2">
        <div class="card rounded-xl p-6 mb-6">
            <h3 class="text-xl font-bold mb-4">
                <i class="fas fa-user text-indigo-400 mr-2"></i>Profile Information
            </h3>
            <form method="POST">
                <input type="hidden" name="action" value="update_profile">
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-gray-400 text-sm mb-1">Username</label>
                        <input type="text" value="<?php echo htmlspecialchars($user['username']); ?>" disabled 
                               class="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-400">
                    </div>
                    <div>
                        <label class="block text-gray-400 text-sm mb-1">Email</label>
                        <input type="email" name="email" value="<?php echo htmlspecialchars($user['email']); ?>" required
                               class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500">
                    </div>
                    <div>
                        <label class="block text-gray-400 text-sm mb-1">Telegram ID</label>
                        <input type="text" name="telegram_id" value="<?php echo htmlspecialchars($user['telegram_id'] ?? ''); ?>"
                               class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500"
                               placeholder="Your Telegram chat ID">
                    </div>
                    <div>
                        <label class="block text-gray-400 text-sm mb-1">Phone</label>
                        <input type="text" name="phone" value="<?php echo htmlspecialchars($user['phone'] ?? ''); ?>"
                               class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500">
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-gray-400 text-sm mb-1">Company Name</label>
                        <input type="text" name="company_name" value="<?php echo htmlspecialchars($user['company_name'] ?? ''); ?>"
                               class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500">
                    </div>
                </div>
                
                <button type="submit" class="mt-4 btn-primary px-6 py-2 rounded-lg">
                    <i class="fas fa-save mr-2"></i>Save Changes
                </button>
            </form>
        </div>

        <!-- Change Password -->
        <div class="card rounded-xl p-6">
            <h3 class="text-xl font-bold mb-4">
                <i class="fas fa-lock text-yellow-400 mr-2"></i>Change Password
            </h3>
            <form method="POST">
                <input type="hidden" name="action" value="change_password">
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-gray-400 text-sm mb-1">Current Password</label>
                        <input type="password" name="current_password" required
                               class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500">
                    </div>
                    <div>
                        <label class="block text-gray-400 text-sm mb-1">New Password</label>
                        <input type="password" name="new_password" required minlength="6"
                               class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500">
                    </div>
                    <div>
                        <label class="block text-gray-400 text-sm mb-1">Confirm New Password</label>
                        <input type="password" name="confirm_password" required minlength="6"
                               class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500">
                    </div>
                </div>
                
                <button type="submit" class="mt-4 px-6 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition">
                    <i class="fas fa-key mr-2"></i>Update Password
                </button>
            </form>
        </div>
    </div>

    <!-- Stats & Info -->
    <div>
        <div class="card rounded-xl p-6 mb-6">
            <h3 class="text-lg font-semibold mb-4">
                <i class="fas fa-chart-pie text-indigo-400 mr-2"></i>Your Stats
            </h3>
            <div class="space-y-4">
                <div class="flex justify-between items-center">
                    <span class="text-gray-400">Active API Keys</span>
                    <span class="text-2xl font-bold text-white"><?php echo $stats['active_keys']; ?></span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-gray-400">Today's Calls</span>
                    <span class="text-2xl font-bold text-white"><?php echo number_format($stats['today_calls']); ?></span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-gray-400">Total Calls</span>
                    <span class="text-2xl font-bold text-white"><?php echo number_format($stats['total_calls']); ?></span>
                </div>
            </div>
        </div>

        <div class="card rounded-xl p-6">
            <h3 class="text-lg font-semibold mb-4">
                <i class="fas fa-info-circle text-indigo-400 mr-2"></i>Account Info
            </h3>
            <div class="space-y-3 text-sm">
                <div class="flex justify-between">
                    <span class="text-gray-400">Role</span>
                    <span class="text-white"><?php echo ucfirst($user['role']); ?></span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-400">Status</span>
                    <span class="status-<?php echo $user['status']; ?>"><?php echo ucfirst($user['status']); ?></span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-400">Joined</span>
                    <span class="text-white"><?php echo date('M j, Y', strtotime($user['created_at'])); ?></span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-400">Last Login</span>
                    <span class="text-white"><?php echo $user['last_login_at'] ? date('M j, H:i', strtotime($user['last_login_at'])) : 'N/A'; ?></span>
                </div>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
