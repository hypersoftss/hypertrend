<?php
/**
 * =====================================================
 * ⚙️ SETTINGS PAGE
 * =====================================================
 */

$page_title = 'Settings';
require_once __DIR__ . '/../includes/header.php';
require_admin();

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
$message = '';
$error = '';

// Handle Settings Update
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
    if ($action === 'update_settings') {
        $settings = [
            'site_name' => trim($_POST['site_name'] ?? ''),
            'site_description' => trim($_POST['site_description'] ?? ''),
            'support_email' => trim($_POST['support_email'] ?? ''),
            'admin_email' => trim($_POST['admin_email'] ?? ''),
            'telegram_bot_token' => trim($_POST['telegram_bot_token'] ?? ''),
            'admin_telegram_id' => trim($_POST['admin_telegram_id'] ?? ''),
            'default_rate_limit' => (int)($_POST['default_rate_limit'] ?? 60),
            'log_retention_days' => (int)($_POST['log_retention_days'] ?? 90),
            'maintenance_mode' => isset($_POST['maintenance_mode']) ? 'true' : 'false',
        ];
        
        foreach ($settings as $key => $value) {
            $stmt = $conn->prepare("INSERT INTO settings (setting_key, setting_value, updated_by) VALUES (?, ?, ?) 
                                    ON DUPLICATE KEY UPDATE setting_value = ?, updated_by = ?");
            $stmt->bind_param("ssisi", $key, $value, $_SESSION['user_id'], $value, $_SESSION['user_id']);
            $stmt->execute();
            $stmt->close();
        }
        
        $message = 'Settings updated successfully';
        log_activity($conn, $_SESSION['user_id'], 'update_settings', 'settings', null);
    } elseif ($action === 'test_telegram') {
        $token = trim($_POST['telegram_bot_token'] ?? '');
        $chat_id = trim($_POST['admin_telegram_id'] ?? '');
        
        if ($token && $chat_id) {
            $url = "https://api.telegram.org/bot{$token}/sendMessage";
            $data = [
                'chat_id' => $chat_id,
                'text' => "🔔 Test message from " . SITE_NAME . "\n\n✅ Telegram integration is working!",
                'parse_mode' => 'HTML'
            ];
            
            $ch = curl_init();
            curl_setopt_array($ch, [
                CURLOPT_URL => $url,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => http_build_query($data),
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 10
            ]);
            $result = curl_exec($ch);
            $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if ($http_code === 200) {
                $message = 'Test message sent successfully! Check your Telegram.';
            } else {
                $error = 'Failed to send message. Check your bot token and chat ID.';
            }
        } else {
            $error = 'Bot token and Chat ID are required';
        }
    }
}

// Get current settings
$settings = [];
$result = $conn->query("SELECT setting_key, setting_value FROM settings");
while ($row = $result->fetch_assoc()) {
    $settings[$row['setting_key']] = $row['setting_value'];
}

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

<form method="POST">
    <input type="hidden" name="action" value="update_settings">
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Site Settings -->
        <div class="card rounded-xl p-6">
            <h3 class="text-lg font-semibold mb-4">
                <i class="fas fa-globe text-indigo-400 mr-2"></i>Site Settings
            </h3>
            <div class="space-y-4">
                <div>
                    <label class="block text-gray-400 text-sm mb-1">Site Name</label>
                    <input type="text" name="site_name" value="<?php echo htmlspecialchars($settings['site_name'] ?? 'Hyper Softs'); ?>" 
                           class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500">
                </div>
                <div>
                    <label class="block text-gray-400 text-sm mb-1">Site Description</label>
                    <input type="text" name="site_description" value="<?php echo htmlspecialchars($settings['site_description'] ?? ''); ?>" 
                           class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500">
                </div>
                <div>
                    <label class="block text-gray-400 text-sm mb-1">Support Email</label>
                    <input type="email" name="support_email" value="<?php echo htmlspecialchars($settings['support_email'] ?? ''); ?>" 
                           class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500">
                </div>
                <div>
                    <label class="block text-gray-400 text-sm mb-1">Admin Email</label>
                    <input type="email" name="admin_email" value="<?php echo htmlspecialchars($settings['admin_email'] ?? ''); ?>" 
                           class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500">
                </div>
                <div class="flex items-center">
                    <input type="checkbox" name="maintenance_mode" id="maintenance_mode" class="mr-2"
                           <?php echo ($settings['maintenance_mode'] ?? 'false') === 'true' ? 'checked' : ''; ?>>
                    <label for="maintenance_mode" class="text-gray-300">Maintenance Mode</label>
                </div>
            </div>
        </div>

        <!-- Telegram Settings -->
        <div class="card rounded-xl p-6">
            <h3 class="text-lg font-semibold mb-4">
                <i class="fab fa-telegram text-indigo-400 mr-2"></i>Telegram Bot
            </h3>
            <div class="space-y-4">
                <div>
                    <label class="block text-gray-400 text-sm mb-1">Bot Token</label>
                    <input type="text" name="telegram_bot_token" value="<?php echo htmlspecialchars($settings['telegram_bot_token'] ?? ''); ?>" 
                           class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500"
                           placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz">
                    <p class="text-xs text-gray-500 mt-1">Get from @BotFather on Telegram</p>
                </div>
                <div>
                    <label class="block text-gray-400 text-sm mb-1">Admin Chat ID</label>
                    <input type="text" name="admin_telegram_id" value="<?php echo htmlspecialchars($settings['admin_telegram_id'] ?? ''); ?>" 
                           class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500"
                           placeholder="123456789">
                    <p class="text-xs text-gray-500 mt-1">Get from @userinfobot on Telegram</p>
                </div>
                <button type="button" onclick="testTelegram()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition">
                    <i class="fas fa-paper-plane mr-2"></i>Send Test Message
                </button>
            </div>
        </div>

        <!-- API Settings -->
        <div class="card rounded-xl p-6">
            <h3 class="text-lg font-semibold mb-4">
                <i class="fas fa-cogs text-indigo-400 mr-2"></i>API Settings
            </h3>
            <div class="space-y-4">
                <div>
                    <label class="block text-gray-400 text-sm mb-1">Default Rate Limit (per minute)</label>
                    <input type="number" name="default_rate_limit" value="<?php echo htmlspecialchars($settings['default_rate_limit'] ?? '60'); ?>" 
                           class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500">
                </div>
                <div>
                    <label class="block text-gray-400 text-sm mb-1">Log Retention (days)</label>
                    <input type="number" name="log_retention_days" value="<?php echo htmlspecialchars($settings['log_retention_days'] ?? '90'); ?>" 
                           class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500">
                </div>
            </div>
        </div>

        <!-- Quick Info -->
        <div class="card rounded-xl p-6">
            <h3 class="text-lg font-semibold mb-4">
                <i class="fas fa-info-circle text-indigo-400 mr-2"></i>System Info
            </h3>
            <div class="space-y-3 text-sm">
                <div class="flex justify-between">
                    <span class="text-gray-400">PHP Version</span>
                    <span class="text-white"><?php echo PHP_VERSION; ?></span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-400">Server Software</span>
                    <span class="text-white"><?php echo $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'; ?></span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-400">Timezone</span>
                    <span class="text-white"><?php echo date_default_timezone_get(); ?></span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-400">Memory Limit</span>
                    <span class="text-white"><?php echo ini_get('memory_limit'); ?></span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-400">cURL Enabled</span>
                    <span class="text-<?php echo function_exists('curl_version') ? 'green' : 'red'; ?>-400">
                        <?php echo function_exists('curl_version') ? 'Yes' : 'No'; ?>
                    </span>
                </div>
            </div>
        </div>
    </div>

    <!-- Save Button -->
    <div class="mt-6">
        <button type="submit" class="btn-primary px-8 py-3 rounded-lg font-medium">
            <i class="fas fa-save mr-2"></i>Save Settings
        </button>
    </div>
</form>

<!-- Test Telegram Form -->
<form id="testTelegramForm" method="POST" style="display:none;">
    <input type="hidden" name="action" value="test_telegram">
    <input type="hidden" name="telegram_bot_token" id="test_token">
    <input type="hidden" name="admin_telegram_id" id="test_chat_id">
</form>

<script>
function testTelegram() {
    const token = document.querySelector('input[name="telegram_bot_token"]').value;
    const chatId = document.querySelector('input[name="admin_telegram_id"]').value;
    
    if (!token || !chatId) {
        alert('Please enter both Bot Token and Chat ID first');
        return;
    }
    
    document.getElementById('test_token').value = token;
    document.getElementById('test_chat_id').value = chatId;
    document.getElementById('testTelegramForm').submit();
}
</script>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
