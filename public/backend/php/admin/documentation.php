<?php
/**
 * =====================================================
 * 📚 API DOCUMENTATION
 * =====================================================
 */

$page_title = 'API Documentation';
require_once __DIR__ . '/../includes/header.php';

// Get API domain from settings or config
$api_domain = YOUR_DOMAIN;
?>

<div class="max-w-4xl mx-auto">
    <!-- Overview -->
    <div class="card rounded-xl p-6 mb-6">
        <h2 class="text-2xl font-bold mb-4">
            <i class="fas fa-book text-indigo-400 mr-2"></i>API Documentation
        </h2>
        <p class="text-gray-400 mb-4">
            Welcome to the <?php echo SITE_NAME; ?> API documentation. This API provides real-time trend data for gaming platforms.
        </p>
        <div class="bg-indigo-900 bg-opacity-30 border border-indigo-500 rounded-lg p-4">
            <h4 class="font-medium text-indigo-300 mb-2"><i class="fas fa-server mr-2"></i>Base URL</h4>
            <code class="text-lg text-white"><?php echo $api_domain; ?></code>
        </div>
    </div>

    <!-- Authentication -->
    <div class="card rounded-xl p-6 mb-6">
        <h3 class="text-xl font-semibold mb-4">
            <i class="fas fa-key text-yellow-400 mr-2"></i>Authentication
        </h3>
        <p class="text-gray-400 mb-4">
            All API requests require an API key. Include your key as a query parameter:
        </p>
        <div class="bg-gray-800 rounded-lg p-4">
            <code class="text-green-400">?api_key=YOUR_API_KEY</code>
        </div>
    </div>

    <!-- Endpoints -->
    <div class="card rounded-xl p-6 mb-6">
        <h3 class="text-xl font-semibold mb-4">
            <i class="fas fa-link text-green-400 mr-2"></i>Endpoints
        </h3>
        
        <!-- WinGo -->
        <div class="mb-6">
            <h4 class="font-medium text-indigo-300 mb-2">WinGo</h4>
            <div class="bg-gray-800 rounded-lg p-4 mb-2">
                <code class="text-white">GET /api/wingo.php?duration={duration}&api_key={key}</code>
            </div>
            <p class="text-gray-400 text-sm">Durations: <code class="text-indigo-300">30s</code>, <code class="text-indigo-300">1min</code>, <code class="text-indigo-300">3min</code>, <code class="text-indigo-300">5min</code></p>
        </div>

        <!-- K3 -->
        <div class="mb-6">
            <h4 class="font-medium text-indigo-300 mb-2">K3</h4>
            <div class="bg-gray-800 rounded-lg p-4 mb-2">
                <code class="text-white">GET /api/k3.php?duration={duration}&api_key={key}</code>
            </div>
            <p class="text-gray-400 text-sm">Durations: <code class="text-indigo-300">1min</code>, <code class="text-indigo-300">3min</code>, <code class="text-indigo-300">5min</code>, <code class="text-indigo-300">10min</code></p>
        </div>

        <!-- 5D -->
        <div class="mb-6">
            <h4 class="font-medium text-indigo-300 mb-2">5D</h4>
            <div class="bg-gray-800 rounded-lg p-4 mb-2">
                <code class="text-white">GET /api/5d.php?duration={duration}&api_key={key}</code>
            </div>
            <p class="text-gray-400 text-sm">Durations: <code class="text-indigo-300">1min</code>, <code class="text-indigo-300">3min</code>, <code class="text-indigo-300">5min</code>, <code class="text-indigo-300">10min</code></p>
        </div>

        <!-- TRX -->
        <div class="mb-6">
            <h4 class="font-medium text-indigo-300 mb-2">TRX</h4>
            <div class="bg-gray-800 rounded-lg p-4 mb-2">
                <code class="text-white">GET /api/trx.php?duration={duration}&api_key={key}</code>
            </div>
            <p class="text-gray-400 text-sm">Durations: <code class="text-indigo-300">1min</code>, <code class="text-indigo-300">3min</code>, <code class="text-indigo-300">5min</code></p>
        </div>

        <!-- Numeric -->
        <div class="mb-6">
            <h4 class="font-medium text-indigo-300 mb-2">Numeric</h4>
            <div class="bg-gray-800 rounded-lg p-4 mb-2">
                <code class="text-white">GET /api/numeric.php?duration={duration}&api_key={key}</code>
            </div>
            <p class="text-gray-400 text-sm">Durations: <code class="text-indigo-300">1min</code>, <code class="text-indigo-300">3min</code>, <code class="text-indigo-300">5min</code></p>
        </div>
    </div>

    <!-- Code Examples -->
    <div class="card rounded-xl p-6 mb-6">
        <h3 class="text-xl font-semibold mb-4">
            <i class="fas fa-code text-purple-400 mr-2"></i>Code Examples
        </h3>
        
        <!-- Tabs -->
        <div class="flex border-b border-gray-700 mb-4">
            <button class="code-tab active px-4 py-2 border-b-2 border-indigo-500 text-indigo-400" data-lang="curl">cURL</button>
            <button class="code-tab px-4 py-2 border-b-2 border-transparent text-gray-400 hover:text-white" data-lang="javascript">JavaScript</button>
            <button class="code-tab px-4 py-2 border-b-2 border-transparent text-gray-400 hover:text-white" data-lang="python">Python</button>
            <button class="code-tab px-4 py-2 border-b-2 border-transparent text-gray-400 hover:text-white" data-lang="php">PHP</button>
        </div>

        <!-- cURL -->
        <div id="code-curl" class="code-block">
            <pre class="bg-gray-800 rounded-lg p-4 overflow-x-auto text-sm"><code class="text-green-400">curl -X GET "<?php echo $api_domain; ?>/api/wingo.php?duration=1min&api_key=YOUR_API_KEY"</code></pre>
        </div>

        <!-- JavaScript -->
        <div id="code-javascript" class="code-block hidden">
            <pre class="bg-gray-800 rounded-lg p-4 overflow-x-auto text-sm"><code class="text-green-400">const response = await fetch(
  '<?php echo $api_domain; ?>/api/wingo.php?duration=1min&api_key=YOUR_API_KEY'
);
const data = await response.json();
console.log(data);</code></pre>
        </div>

        <!-- Python -->
        <div id="code-python" class="code-block hidden">
            <pre class="bg-gray-800 rounded-lg p-4 overflow-x-auto text-sm"><code class="text-green-400">import requests

response = requests.get(
    '<?php echo $api_domain; ?>/api/wingo.php',
    params={'duration': '1min', 'api_key': 'YOUR_API_KEY'}
)
data = response.json()
print(data)</code></pre>
        </div>

        <!-- PHP -->
        <div id="code-php" class="code-block hidden">
            <pre class="bg-gray-800 rounded-lg p-4 overflow-x-auto text-sm"><code class="text-green-400">&lt;?php
$url = '<?php echo $api_domain; ?>/api/wingo.php?duration=1min&api_key=YOUR_API_KEY';
$response = file_get_contents($url);
$data = json_decode($response, true);
print_r($data);</code></pre>
        </div>
    </div>

    <!-- Response Format -->
    <div class="card rounded-xl p-6 mb-6">
        <h3 class="text-xl font-semibold mb-4">
            <i class="fas fa-exchange-alt text-blue-400 mr-2"></i>Response Format
        </h3>
        <p class="text-gray-400 mb-4">All endpoints return JSON responses:</p>
        <pre class="bg-gray-800 rounded-lg p-4 overflow-x-auto text-sm"><code class="text-green-400">{
  "success": true,
  "data": {
    "period": "20240115001",
    "result": "5",
    "color": "green",
    "big_small": "small",
    "trend": [...],
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "meta": {
    "game": "wingo",
    "duration": "1min",
    "powered_by": "<?php echo SITE_NAME; ?>"
  }
}</code></pre>
    </div>

    <!-- Error Codes -->
    <div class="card rounded-xl p-6">
        <h3 class="text-xl font-semibold mb-4">
            <i class="fas fa-exclamation-triangle text-red-400 mr-2"></i>Error Codes
        </h3>
        <table class="w-full">
            <thead>
                <tr class="text-left text-gray-400">
                    <th class="p-2">Code</th>
                    <th class="p-2">Description</th>
                </tr>
            </thead>
            <tbody class="text-sm">
                <tr class="border-t border-gray-800">
                    <td class="p-2"><code class="text-red-400">401</code></td>
                    <td class="p-2 text-gray-400">Invalid or missing API key</td>
                </tr>
                <tr class="border-t border-gray-800">
                    <td class="p-2"><code class="text-red-400">403</code></td>
                    <td class="p-2 text-gray-400">IP or domain not whitelisted</td>
                </tr>
                <tr class="border-t border-gray-800">
                    <td class="p-2"><code class="text-yellow-400">429</code></td>
                    <td class="p-2 text-gray-400">Rate limit exceeded</td>
                </tr>
                <tr class="border-t border-gray-800">
                    <td class="p-2"><code class="text-red-400">500</code></td>
                    <td class="p-2 text-gray-400">Internal server error</td>
                </tr>
                <tr class="border-t border-gray-800">
                    <td class="p-2"><code class="text-red-400">502</code></td>
                    <td class="p-2 text-gray-400">Data source temporarily unavailable</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

<script>
document.querySelectorAll('.code-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active from all tabs
        document.querySelectorAll('.code-tab').forEach(t => {
            t.classList.remove('active', 'border-indigo-500', 'text-indigo-400');
            t.classList.add('border-transparent', 'text-gray-400');
        });
        
        // Add active to clicked tab
        tab.classList.add('active', 'border-indigo-500', 'text-indigo-400');
        tab.classList.remove('border-transparent', 'text-gray-400');
        
        // Hide all code blocks
        document.querySelectorAll('.code-block').forEach(block => block.classList.add('hidden'));
        
        // Show selected code block
        document.getElementById('code-' + tab.dataset.lang).classList.remove('hidden');
    });
});
</script>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
