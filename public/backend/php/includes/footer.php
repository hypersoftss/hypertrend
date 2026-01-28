            </div>
            <!-- Footer -->
            <footer class="p-4 text-center text-gray-500 text-sm">
                <p>&copy; <?php echo date('Y'); ?> <?php echo SITE_NAME; ?>. Powered by Hyper Softs Trend API.</p>
            </footer>
        </main>
    </div>

    <!-- Mobile Sidebar -->
    <div id="mobileSidebar" class="fixed inset-0 z-50 hidden">
        <div class="absolute inset-0 bg-black bg-opacity-50" onclick="toggleSidebar()"></div>
        <aside class="sidebar w-64 h-full absolute left-0 top-0 overflow-y-auto">
            <div class="p-6 border-b border-indigo-900 flex justify-between items-center">
                <h1 class="text-xl font-bold text-indigo-400"><?php echo SITE_NAME; ?></h1>
                <button onclick="toggleSidebar()" class="text-gray-400 hover:text-white">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <nav class="p-4">
                <!-- Same nav items as desktop -->
            </nav>
        </aside>
    </div>

    <script>
        function toggleSidebar() {
            document.getElementById('mobileSidebar').classList.toggle('hidden');
        }

        function showToast(message, type = 'success') {
            const toast = document.createElement('div');
            toast.className = `toast p-4 rounded-lg shadow-lg ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`;
            toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} mr-2"></i>${message}`;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }

        function confirmAction(message) {
            return confirm(message);
        }

        // Copy to clipboard
        function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                showToast('Copied to clipboard!');
            });
        }

        // Format dates
        function formatDate(dateStr) {
            return new Date(dateStr).toLocaleString();
        }
    </script>
</body>
</html>
