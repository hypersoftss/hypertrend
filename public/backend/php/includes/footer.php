<?php
/**
 * =====================================================
 * 📄 FOOTER - CLOSES HTML STRUCTURE
 * =====================================================
 */
?>
            </div><!-- End .page-content -->
            
            <!-- Footer -->
            <footer class="app-footer">
                <div class="footer-content">
                    <p>&copy; <?php echo date('Y'); ?> <?php echo SITE_NAME; ?>. All rights reserved.</p>
                    <p class="footer-powered">Powered by <a href="#">Hyper Softs</a> Trend API</p>
                </div>
            </footer>
        </div><!-- End .main-content -->
    </div><!-- End .app-wrapper -->
    
    <!-- Toast Container -->
    <div id="toastContainer" class="toast-container"></div>
    
    <script>
        // =====================================================
        // SIDEBAR FUNCTIONALITY
        // =====================================================
        
        // Toggle mobile sidebar
        function toggleMobileSidebar() {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('sidebarOverlay');
            sidebar.classList.toggle('open');
            overlay.classList.toggle('active');
        }
        
        // Close sidebar (mobile)
        function closeSidebar() {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('sidebarOverlay');
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        }
        
        // Toggle sidebar collapse (desktop)
        function toggleSidebarCollapse() {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.toggle('collapsed');
            
            // Save state
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
        }
        
        // Restore sidebar state on load
        document.addEventListener('DOMContentLoaded', function() {
            const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
            if (sidebarCollapsed) {
                document.getElementById('sidebar')?.classList.add('collapsed');
            }
        });
        
        // Toggle navigation group
        function toggleNavGroup(header) {
            const group = header.parentElement;
            
            // Close other groups (accordion behavior)
            document.querySelectorAll('.nav-group').forEach(g => {
                if (g !== group) {
                    g.classList.add('collapsed');
                }
            });
            
            group.classList.toggle('collapsed');
        }
        
        // =====================================================
        // THEME FUNCTIONALITY
        // =====================================================
        
        function toggleTheme() {
            const html = document.documentElement;
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            updateThemeIcon(newTheme);
        }
        
        function updateThemeIcon(theme) {
            const icon = document.getElementById('themeIcon');
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
            }
        }
        
        // Restore theme on load
        document.addEventListener('DOMContentLoaded', function() {
            const savedTheme = localStorage.getItem('theme') || 'dark';
            document.documentElement.setAttribute('data-theme', savedTheme);
            updateThemeIcon(savedTheme);
        });
        
        // =====================================================
        // PROFILE DROPDOWN
        // =====================================================
        
        function toggleProfileDropdown() {
            const dropdown = document.getElementById('profileDropdown');
            dropdown.classList.toggle('open');
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            const dropdown = document.getElementById('profileDropdown');
            if (dropdown && !dropdown.contains(e.target)) {
                dropdown.classList.remove('open');
            }
        });
        
        // =====================================================
        // TOAST NOTIFICATIONS
        // =====================================================
        
        function showToast(title, message, type = 'info') {
            const container = document.getElementById('toastContainer');
            
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            
            const icons = {
                success: 'fa-check-circle',
                error: 'fa-times-circle',
                warning: 'fa-exclamation-triangle',
                info: 'fa-info-circle'
            };
            
            toast.innerHTML = `
                <div class="toast-icon">
                    <i class="fas ${icons[type] || icons.info}"></i>
                </div>
                <div class="toast-content">
                    <div class="toast-title">${title}</div>
                    <div class="toast-message">${message}</div>
                </div>
                <button class="toast-close" onclick="this.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            container.appendChild(toast);
            
            // Trigger animation
            setTimeout(() => toast.classList.add('show'), 10);
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 5000);
        }
        
        // =====================================================
        // UTILITY FUNCTIONS
        // =====================================================
        
        // Copy to clipboard
        function copyToClipboard(text, successMessage = 'Copied to clipboard!') {
            navigator.clipboard.writeText(text).then(() => {
                showToast('Success', successMessage, 'success');
            }).catch(err => {
                showToast('Error', 'Failed to copy', 'error');
            });
        }
        
        // Confirm action
        function confirmAction(message) {
            return confirm(message);
        }
        
        // Format date
        function formatDate(dateStr) {
            const date = new Date(dateStr);
            return date.toLocaleString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        // Format relative time
        function timeAgo(dateStr) {
            const date = new Date(dateStr);
            const now = new Date();
            const seconds = Math.floor((now - date) / 1000);
            
            if (seconds < 60) return 'Just now';
            if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
            if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
            return Math.floor(seconds / 86400) + 'd ago';
        }
        
        // Format number with commas
        function formatNumber(num) {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
        
        // Mask API key
        function maskApiKey(key) {
            if (!key || key.length <= 12) return '****';
            return key.substring(0, 6) + '...' + key.substring(key.length - 6);
        }
        
        // =====================================================
        // MODAL FUNCTIONALITY
        // =====================================================
        
        function openModal(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('open');
                document.body.style.overflow = 'hidden';
            }
        }
        
        function closeModal(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.remove('open');
                document.body.style.overflow = '';
            }
        }
        
        // Close modal on backdrop click
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
            backdrop.addEventListener('click', function(e) {
                if (e.target === this) {
                    this.classList.remove('open');
                    document.body.style.overflow = '';
                }
            });
        });
        
        // Close modal on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-backdrop.open').forEach(modal => {
                    modal.classList.remove('open');
                });
                document.body.style.overflow = '';
            }
        });
        
        // =====================================================
        // FORM HELPERS
        // =====================================================
        
        // Debounce function for search inputs
        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
        
        // Form validation helper
        function validateForm(formId) {
            const form = document.getElementById(formId);
            if (!form) return false;
            
            let isValid = true;
            form.querySelectorAll('[required]').forEach(input => {
                if (!input.value.trim()) {
                    input.classList.add('error');
                    isValid = false;
                } else {
                    input.classList.remove('error');
                }
            });
            
            return isValid;
        }
        
        // =====================================================
        // TABLE HELPERS
        // =====================================================
        
        // Sort table
        function sortTable(tableId, columnIndex) {
            const table = document.getElementById(tableId);
            if (!table) return;
            
            const tbody = table.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));
            
            const sortedRows = rows.sort((a, b) => {
                const aText = a.cells[columnIndex]?.textContent.trim() || '';
                const bText = b.cells[columnIndex]?.textContent.trim() || '';
                return aText.localeCompare(bText);
            });
            
            tbody.innerHTML = '';
            sortedRows.forEach(row => tbody.appendChild(row));
        }
        
        // =====================================================
        // KEYBOARD SHORTCUTS
        // =====================================================
        
        document.addEventListener('keydown', function(e) {
            // Ctrl/Cmd + K for search focus
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.querySelector('input[type="search"], input[name="search"], .search-input');
                if (searchInput) searchInput.focus();
            }
        });
    </script>
    
    <style>
        /* Footer Styles */
        .app-footer {
            padding: 20px 24px;
            border-top: 1px solid rgb(var(--border) / var(--border-opacity));
            text-align: center;
            margin-top: auto;
        }
        
        .footer-content p {
            font-size: 13px;
            color: rgb(var(--text-muted));
            margin: 4px 0;
        }
        
        .footer-powered a {
            color: rgb(var(--primary-light));
            text-decoration: none;
        }
        
        .footer-powered a:hover {
            text-decoration: underline;
        }
        
        /* Toast Styles */
        .toast-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        
        .toast {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 16px 20px;
            background: rgb(var(--bg-surface));
            border: 1px solid rgb(var(--border) / var(--border-opacity));
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
            transform: translateX(120%);
            transition: transform 0.3s ease-out;
            min-width: 320px;
            max-width: 420px;
        }
        
        .toast.show {
            transform: translateX(0);
        }
        
        .toast-icon {
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            font-size: 18px;
        }
        
        .toast-success .toast-icon { color: rgb(var(--success)); }
        .toast-error .toast-icon { color: rgb(var(--danger)); }
        .toast-warning .toast-icon { color: rgb(var(--warning)); }
        .toast-info .toast-icon { color: rgb(var(--info)); }
        
        .toast-content {
            flex: 1;
        }
        
        .toast-title {
            font-weight: 600;
            font-size: 14px;
            margin-bottom: 2px;
        }
        
        .toast-message {
            font-size: 13px;
            color: rgb(var(--text-muted));
        }
        
        .toast-close {
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: transparent;
            border: none;
            color: rgb(var(--text-muted));
            cursor: pointer;
            border-radius: var(--radius-sm);
            transition: all 0.2s;
        }
        
        .toast-close:hover {
            background: rgb(var(--danger) / 0.1);
            color: rgb(var(--danger));
        }
        
        @media (max-width: 768px) {
            .toast-container {
                left: 12px;
                right: 12px;
                top: auto;
                bottom: 20px;
            }
            
            .toast {
                min-width: auto;
                max-width: none;
                transform: translateY(120%);
            }
            
            .toast.show {
                transform: translateY(0);
            }
        }
    </style>
</body>
</html>
