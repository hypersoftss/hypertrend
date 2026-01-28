import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useConfig } from '@/contexts/ConfigContext';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { 
  Download, 
  Copy, 
  Check, 
  FileCode, 
  Database, 
  Bot, 
  FileText, 
  Package, 
  Settings,
  Loader2,
  FolderArchive,
  Server,
  Globe,
  Zap,
  Code2,
  Shield,
  Layout,
  Users
} from 'lucide-react';

const BackendDownloadPage = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const { toast } = useToast();
  const { config } = useConfig();

  const copyToClipboard = async (text: string, fileName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFile(fileName);
      toast({
        title: '✅ Copied!',
        description: `${fileName} copied to clipboard`,
      });
      setTimeout(() => setCopiedFile(null), 2000);
    } catch (err) {
      toast({
        title: '❌ Copy Failed',
        description: 'Please try again',
        variant: 'destructive'
      });
    }
  };

  // Generate PHP config content dynamically
  const generatePhpConfig = () => `<?php
/**
 * =====================================================
 * 🔒 ${config.siteName.toUpperCase()} - MASTER CONFIGURATION
 * Generated: ${new Date().toLocaleString()}
 * =====================================================
 * 
 * ⚠️ NEVER expose this file publicly!
 * Edit this file for your VPS/cPanel setup.
 * 
 * =====================================================
 */

// ==================== DATABASE ====================
define('DB_HOST', 'localhost');
define('DB_USER', 'your_db_user');
define('DB_PASS', 'your_db_password');
define('DB_NAME', 'hyper_softs_db');

// ==================== HIDDEN UPSTREAM API ====================
// This is your REAL data source - KEEP IT SECRET!
// Users will NEVER see this URL - only YOUR domain
define('UPSTREAM_API_BASE', '${config.apiDomain}');
define('UPSTREAM_API_ENDPOINT', '${config.apiEndpoint}');

// ==================== YOUR DOMAIN (What users see) ====================
define('YOUR_DOMAIN', '${config.userApiDomain}');

// ==================== TELEGRAM BOT ====================
define('TELEGRAM_BOT_TOKEN', '${config.telegramBotToken}');
define('ADMIN_TELEGRAM_ID', '${config.adminTelegramId}');

// ==================== SITE INFO ====================
define('SITE_NAME', '${config.siteName}');
define('SITE_DESCRIPTION', '${config.siteDescription}');
define('ADMIN_EMAIL', '${config.adminEmail}');
define('SUPPORT_EMAIL', '${config.supportEmail}');

// ==================== GAME TYPE MAPPING ====================
define('GAME_TYPES', [
    'wingo' => [
        '30s'   => 'wg30s',
        '30sec' => 'wg30s', 
        '1min'  => 'wg1',
        '1'     => 'wg1',
        '3min'  => 'wg3',
        '3'     => 'wg3',
        '5min'  => 'wg5',
        '5'     => 'wg5',
    ],
    'k3' => [
        '1min'  => 'k3_1',
        '1'     => 'k3_1',
        '3min'  => 'k3_3',
        '3'     => 'k3_3',
        '5min'  => 'k3_5',
        '5'     => 'k3_5',
        '10min' => 'k3_10',
        '10'    => 'k3_10',
    ],
    '5d' => [
        '1min'  => '5d_1',
        '1'     => '5d_1',
        '3min'  => '5d_3',
        '3'     => '5d_3',
        '5min'  => '5d_5',
        '5'     => '5d_5',
        '10min' => '5d_10',
        '10'    => '5d_10',
    ],
    'trx' => [
        '1min' => 'trx_1',
        '1'    => 'trx_1',
        '3min' => 'trx_3',
        '3'    => 'trx_3',
        '5min' => 'trx_5',
        '5'    => 'trx_5',
    ],
    'numeric' => [
        '1min' => 'num_1',
        '1'    => 'num_1',
        '3min' => 'num_3',
        '3'    => 'num_3',
        '5min' => 'num_5',
        '5'    => 'num_5',
    ],
]);

define('GAME_NAMES', [
    'wingo' => [
        '30s'  => 'WinGo 30 Seconds',
        '1min' => 'WinGo 1 Minute',
        '3min' => 'WinGo 3 Minutes',
        '5min' => 'WinGo 5 Minutes',
    ],
    'k3' => [
        '1min'  => 'K3 1 Minute',
        '3min'  => 'K3 3 Minutes',
        '5min'  => 'K3 5 Minutes',
        '10min' => 'K3 10 Minutes',
    ],
    '5d' => [
        '1min'  => '5D 1 Minute',
        '3min'  => '5D 3 Minutes',
        '5min'  => '5D 5 Minutes',
        '10min' => '5D 10 Minutes',
    ],
    'trx' => [
        '1min' => 'TRX 1 Minute',
        '3min' => 'TRX 3 Minutes',
        '5min' => 'TRX 5 Minutes',
    ],
    'numeric' => [
        '1min' => 'Numeric 1 Minute',
        '3min' => 'Numeric 3 Minutes',
        '5min' => 'Numeric 5 Minutes',
    ],
]);

// ==================== SECURITY ====================
define('ENABLE_IP_WHITELIST', true);
define('ENABLE_DOMAIN_WHITELIST', true);
define('LOG_ALL_REQUESTS', true);
define('MASK_API_KEYS_IN_LOGS', true);

// ==================== RATE LIMITING ====================
define('RATE_LIMIT_ENABLED', true);
define('RATE_LIMIT_PER_MINUTE', 60);
define('RATE_LIMIT_PER_HOUR', 1000);
define('RATE_LIMIT_PER_DAY', 10000);

// ==================== CORS ====================
define('ALLOWED_ORIGINS', [
    '${config.userApiDomain}',
    'https://admin.your-domain.com',
]);

// ==================== ERROR MESSAGES ====================
define('ERROR_MESSAGES', [
    'invalid_key' => 'Invalid or expired API key.',
    'ip_blocked' => 'Access denied. Your IP is not authorized.',
    'domain_blocked' => 'Access denied. Domain not authorized.',
    'rate_limited' => 'Too many requests. Please slow down.',
    'key_expired' => 'Your API key has expired. Please renew.',
    'key_disabled' => 'Your API key has been disabled.',
    'server_error' => 'Internal server error. Please try again later.',
    'upstream_error' => 'Data source temporarily unavailable.',
    'invalid_duration' => 'Invalid duration parameter.',
    'missing_key' => 'API key is required.',
]);

// ==================== TIMEZONE ====================
define('APP_TIMEZONE', 'Asia/Kolkata');
date_default_timezone_set(APP_TIMEZONE);

// ==================== DEBUG MODE ====================
define('DEBUG_MODE', false);

if (!DEBUG_MODE) {
    error_reporting(0);
    ini_set('display_errors', '0');
} else {
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
}

// ==================== HELPERS ====================
function get_type_id($game, $duration) {
    $game = strtolower(trim($game));
    $duration = strtolower(trim($duration));
    
    if (!isset(GAME_TYPES[$game])) {
        return null;
    }
    
    return GAME_TYPES[$game][$duration] ?? null;
}

function get_game_name($game, $duration) {
    $game = strtolower(trim($game));
    $duration = strtolower(trim($duration));
    $duration = str_replace(['sec', 'minute', 'minutes'], ['s', 'min', 'min'], $duration);
    
    if (!isset(GAME_NAMES[$game])) {
        return ucfirst($game) . ' ' . $duration;
    }
    
    return GAME_NAMES[$game][$duration] ?? ucfirst($game) . ' ' . $duration;
}

function get_available_durations($game) {
    $game = strtolower(trim($game));
    
    $durations = [
        'wingo' => ['30s', '1min', '3min', '5min'],
        'k3' => ['1min', '3min', '5min', '10min'],
        '5d' => ['1min', '3min', '5min', '10min'],
        'trx' => ['1min', '3min', '5min'],
        'numeric' => ['1min', '3min', '5min'],
    ];
    
    return $durations[$game] ?? [];
}
`;

  const downloadAllFiles = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      const zip = new JSZip();
      const folderName = config.siteName.toLowerCase().replace(/\s+/g, '-') + '-complete';
      const backend = zip.folder(folderName);
      
      setDownloadProgress(5);

      // Create folder structure
      const apiFolder = backend?.folder('api');
      const adminFolder = backend?.folder('admin');
      const includesFolder = backend?.folder('includes');
      const assetsFolder = backend?.folder('assets');
      const cssFolder = assetsFolder?.folder('css');
      const jsFolder = assetsFolder?.folder('js');

      // ==================== CSS FILES ====================
      const mainCss = generateMainCSS();
      cssFolder?.file('style.css', mainCss);
      cssFolder?.file('dashboard.css', generateDashboardCSS());
      setDownloadProgress(10);

      // ==================== JS FILES ====================
      jsFolder?.file('main.js', generateMainJS());
      jsFolder?.file('charts.js', generateChartsJS());
      setDownloadProgress(15);

      // ==================== API FILES ====================
      const apiFiles = [
        { name: 'wingo.php', path: '/backend/php/api/wingo.php' },
        { name: 'k3.php', path: '/backend/php/api/k3.php' },
        { name: '5d.php', path: '/backend/php/api/5d.php' },
        { name: 'trx.php', path: '/backend/php/api/trx.php' },
        { name: 'numeric.php', path: '/backend/php/api/numeric.php' },
        { name: 'health.php', path: '/backend/php/api/health.php' },
        { name: 'telegram-bot.php', path: '/backend/php/api/telegram-bot.php' },
        { name: 'telegram-setup.php', path: '/backend/php/api/telegram-setup.php' },
      ];

      for (let i = 0; i < apiFiles.length; i++) {
        try {
          const response = await fetch(apiFiles[i].path);
          const content = await response.text();
          apiFolder?.file(apiFiles[i].name, content);
        } catch (e) {
          console.log(`Could not fetch ${apiFiles[i].name}`);
        }
        setDownloadProgress(15 + (i + 1) * 3);
      }

      // ==================== ADMIN/FRONTEND FILES ====================
      const adminFiles = [
        { name: 'login.php', path: '/backend/php/admin/login.php' },
        { name: 'logout.php', path: '/backend/php/admin/logout.php' },
        { name: 'dashboard.php', path: '/backend/php/admin/dashboard.php' },
        { name: 'users.php', path: '/backend/php/admin/users.php' },
        { name: 'api-keys.php', path: '/backend/php/admin/api-keys.php' },
        { name: 'api-logs.php', path: '/backend/php/admin/api-logs.php' },
        { name: 'ip-whitelist.php', path: '/backend/php/admin/ip-whitelist.php' },
        { name: 'telegram-logs.php', path: '/backend/php/admin/telegram-logs.php' },
        { name: 'activity-logs.php', path: '/backend/php/admin/activity-logs.php' },
        { name: 'settings.php', path: '/backend/php/admin/settings.php' },
        { name: 'documentation.php', path: '/backend/php/admin/documentation.php' },
        { name: 'profile.php', path: '/backend/php/admin/profile.php' },
      ];

      for (let i = 0; i < adminFiles.length; i++) {
        try {
          const response = await fetch(adminFiles[i].path);
          const content = await response.text();
          adminFolder?.file(adminFiles[i].name, content);
        } catch (e) {
          console.log(`Could not fetch ${adminFiles[i].name}`);
        }
        setDownloadProgress(39 + (i + 1) * 2);
      }

      // ==================== INCLUDES FILES ====================
      const includesFiles = [
        { name: 'auth.php', path: '/backend/php/includes/auth.php' },
        { name: 'header.php', path: '/backend/php/includes/header.php' },
        { name: 'footer.php', path: '/backend/php/includes/footer.php' },
      ];

      for (let i = 0; i < includesFiles.length; i++) {
        try {
          const response = await fetch(includesFiles[i].path);
          const content = await response.text();
          includesFolder?.file(includesFiles[i].name, content);
        } catch (e) {
          console.log(`Could not fetch ${includesFiles[i].name}`);
        }
        setDownloadProgress(63 + (i + 1) * 3);
      }

      // ==================== ROOT FILES ====================
      const rootFiles = [
        { name: 'helpers.php', path: '/backend/php/helpers.php' },
        { name: 'database.sql', path: '/backend/php/database.sql' },
        { name: '.htaccess', path: '/backend/php/.htaccess' },
        { name: 'index.php', path: '/backend/php/index.php' },
      ];

      for (let i = 0; i < rootFiles.length; i++) {
        try {
          const response = await fetch(rootFiles[i].path);
          const content = await response.text();
          backend?.file(rootFiles[i].name, content);
        } catch (e) {
          console.log(`Could not fetch ${rootFiles[i].name}`);
        }
        setDownloadProgress(72 + (i + 1) * 2);
      }

      // ==================== GENERATED FILES ====================
      // Add dynamic config
      backend?.file('config.php', generatePhpConfig());
      setDownloadProgress(85);

      // Add README
      backend?.file('README.md', generateReadme());
      setDownloadProgress(90);

      // Add installation script
      backend?.file('install.php', generateInstallScript());
      setDownloadProgress(95);

      // Generate ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      setDownloadProgress(100);
      
      saveAs(content, `${folderName}.zip`);
      
      toast({
        title: '✅ Download Complete!',
        description: 'Complete PHP solution with Frontend + Backend + CSS + JS + Bot downloaded!',
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: '❌ Download Failed',
        description: 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  // Generate main CSS
  const generateMainCSS = () => `/**
 * ${config.siteName} - Main Stylesheet
 * Generated: ${new Date().toLocaleString()}
 */

:root {
  --primary: #6366f1;
  --primary-hover: #4f46e5;
  --primary-light: #818cf8;
  --secondary: #f1f5f9;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --dark: #1e293b;
  --light: #f8fafc;
  --border: #e2e8f0;
  --text: #334155;
  --text-muted: #64748b;
  --bg: #ffffff;
  --card-bg: #ffffff;
  --sidebar-bg: #1e293b;
  --sidebar-text: #94a3b8;
  --sidebar-active: #6366f1;
  --gradient-start: #6366f1;
  --gradient-end: #8b5cf6;
  --shadow: 0 1px 3px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1);
  --radius: 0.5rem;
  --radius-lg: 0.75rem;
}

[data-theme="dark"] {
  --bg: #0f172a;
  --card-bg: #1e293b;
  --text: #f1f5f9;
  --text-muted: #94a3b8;
  --border: #334155;
  --secondary: #334155;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
}

a { color: var(--primary); text-decoration: none; transition: color 0.2s; }
a:hover { color: var(--primary-hover); }

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: var(--radius);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, var(--gradient-start), var(--gradient-end));
  color: white;
}
.btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }

.btn-secondary { background: var(--secondary); color: var(--text); }
.btn-secondary:hover { background: var(--border); }

.btn-success { background: var(--success); color: white; }
.btn-danger { background: var(--danger); color: white; }
.btn-warning { background: var(--warning); color: white; }

.btn-outline {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text);
}
.btn-outline:hover { background: var(--secondary); }

.btn-sm { padding: 0.375rem 0.75rem; font-size: 0.75rem; }
.btn-lg { padding: 0.875rem 1.75rem; font-size: 1rem; }

/* Cards */
.card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
}

.card-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border);
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-body { padding: 1.5rem; }

/* Forms */
.form-group { margin-bottom: 1rem; }

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--text);
}

.form-control {
  width: 100%;
  padding: 0.625rem 0.875rem;
  font-size: 0.875rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg);
  color: var(--text);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-control::placeholder { color: var(--text-muted); }

/* Tables */
.table {
  width: 100%;
  border-collapse: collapse;
}

.table th, .table td {
  padding: 0.875rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

.table th {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  background: var(--secondary);
}

.table tbody tr:hover { background: var(--secondary); }

/* Badges */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 9999px;
}

.badge-success { background: rgba(16, 185, 129, 0.1); color: var(--success); }
.badge-warning { background: rgba(245, 158, 11, 0.1); color: var(--warning); }
.badge-danger { background: rgba(239, 68, 68, 0.1); color: var(--danger); }
.badge-primary { background: rgba(99, 102, 241, 0.1); color: var(--primary); }
.badge-secondary { background: var(--secondary); color: var(--text-muted); }

/* Alerts */
.alert {
  padding: 1rem 1.25rem;
  border-radius: var(--radius);
  margin-bottom: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.alert-success { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); color: var(--success); }
.alert-warning { background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.2); color: var(--warning); }
.alert-danger { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: var(--danger); }
.alert-info { background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.2); color: var(--primary); }

/* Grid */
.row { display: flex; flex-wrap: wrap; margin: -0.75rem; }
.col { padding: 0.75rem; }
.col-12 { width: 100%; }
.col-6 { width: 50%; }
.col-4 { width: 33.333%; }
.col-3 { width: 25%; }

@media (max-width: 768px) {
  .col-md-12 { width: 100%; }
  .col-md-6 { width: 50%; }
}

@media (max-width: 480px) {
  .col-sm-12 { width: 100%; }
}

/* Utilities */
.text-primary { color: var(--primary); }
.text-success { color: var(--success); }
.text-warning { color: var(--warning); }
.text-danger { color: var(--danger); }
.text-muted { color: var(--text-muted); }

.bg-primary { background: var(--primary); }
.bg-success { background: var(--success); }
.bg-warning { background: var(--warning); }
.bg-danger { background: var(--danger); }

.mt-1 { margin-top: 0.25rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-3 { margin-top: 1rem; }
.mt-4 { margin-top: 1.5rem; }
.mt-5 { margin-top: 2rem; }

.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 1rem; }
.mb-4 { margin-bottom: 1.5rem; }
.mb-5 { margin-bottom: 2rem; }

.p-1 { padding: 0.25rem; }
.p-2 { padding: 0.5rem; }
.p-3 { padding: 1rem; }
.p-4 { padding: 1.5rem; }
.p-5 { padding: 2rem; }

.d-flex { display: flex; }
.d-block { display: block; }
.d-none { display: none; }
.d-inline-flex { display: inline-flex; }

.align-items-center { align-items: center; }
.justify-content-between { justify-content: space-between; }
.justify-content-center { justify-content: center; }

.gap-1 { gap: 0.25rem; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 1rem; }
.gap-4 { gap: 1.5rem; }

.fw-bold { font-weight: 700; }
.fw-semibold { font-weight: 600; }
.fw-medium { font-weight: 500; }

.fs-sm { font-size: 0.875rem; }
.fs-xs { font-size: 0.75rem; }
.fs-lg { font-size: 1.125rem; }
.fs-xl { font-size: 1.25rem; }
.fs-2xl { font-size: 1.5rem; }

.rounded { border-radius: var(--radius); }
.rounded-lg { border-radius: var(--radius-lg); }
.rounded-full { border-radius: 9999px; }

.shadow { box-shadow: var(--shadow); }
.shadow-lg { box-shadow: var(--shadow-lg); }

.w-100 { width: 100%; }
.h-100 { height: 100%; }

.overflow-hidden { overflow: hidden; }
.overflow-auto { overflow: auto; }

.position-relative { position: relative; }
.position-absolute { position: absolute; }

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-fadeIn { animation: fadeIn 0.3s ease-out; }
.animate-pulse { animation: pulse 2s infinite; }
.animate-spin { animation: spin 1s linear infinite; }

/* Scrollbar */
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: var(--secondary); }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }
`;

  // Generate dashboard CSS
  const generateDashboardCSS = () => `/**
 * ${config.siteName} - Dashboard Styles
 */

/* Layout */
.wrapper {
  display: flex;
  min-height: 100vh;
}

/* Sidebar */
.sidebar {
  width: 260px;
  background: var(--sidebar-bg);
  color: var(--sidebar-text);
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  z-index: 1000;
  transition: transform 0.3s;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: white;
  font-weight: 700;
  font-size: 1.125rem;
}

.sidebar-logo img {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
}

.nav-item {
  margin: 0.25rem 0.75rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: var(--sidebar-text);
  border-radius: var(--radius);
  transition: all 0.2s;
  font-size: 0.875rem;
}

.nav-link:hover {
  background: rgba(255,255,255,0.1);
  color: white;
}

.nav-link.active {
  background: var(--sidebar-active);
  color: white;
}

.nav-link i {
  width: 20px;
  text-align: center;
}

.nav-divider {
  height: 1px;
  background: rgba(255,255,255,0.1);
  margin: 1rem 0;
}

.nav-header {
  padding: 0.5rem 1.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255,255,255,0.5);
}

/* Main Content */
.main-content {
  flex: 1;
  margin-left: 260px;
  display: flex;
  flex-direction: column;
}

/* Header */
.header {
  height: 64px;
  background: var(--card-bg);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-title {
  font-size: 1.125rem;
  font-weight: 600;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: var(--radius);
  cursor: pointer;
  transition: background 0.2s;
}

.user-menu:hover { background: var(--secondary); }

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

/* Page Content */
.page-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

/* Stats Cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.stat-icon.primary { background: rgba(99, 102, 241, 0.1); color: var(--primary); }
.stat-icon.success { background: rgba(16, 185, 129, 0.1); color: var(--success); }
.stat-icon.warning { background: rgba(245, 158, 11, 0.1); color: var(--warning); }
.stat-icon.danger { background: rgba(239, 68, 68, 0.1); color: var(--danger); }

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-muted);
}

/* Mobile Responsive */
@media (max-width: 1024px) {
  .sidebar {
    transform: translateX(-100%);
  }
  
  .sidebar.open {
    transform: translateX(0);
  }
  
  .main-content {
    margin-left: 0;
  }
  
  .mobile-toggle {
    display: block;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .page-content {
    padding: 1rem;
  }
}

/* Theme Toggle */
.theme-toggle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.theme-toggle:hover {
  background: var(--secondary);
}

/* Dropdown */
.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 200px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: all 0.2s;
}

.dropdown.open .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  color: var(--text);
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: var(--secondary);
}

.dropdown-divider {
  height: 1px;
  background: var(--border);
  margin: 0.5rem 0;
}
`;

  // Generate main JS
  const generateMainJS = () => `/**
 * ${config.siteName} - Main JavaScript
 * Generated: ${new Date().toLocaleString()}
 */

document.addEventListener('DOMContentLoaded', function() {
  // Theme Toggle
  initTheme();
  
  // Mobile Sidebar Toggle
  initSidebar();
  
  // Dropdown Menus
  initDropdowns();
  
  // Form Validation
  initForms();
  
  // Toast Notifications
  initToasts();
  
  // Copy to Clipboard
  initCopyButtons();
});

// Theme Management
function initTheme() {
  const toggle = document.querySelector('.theme-toggle');
  const savedTheme = localStorage.getItem('theme') || 'light';
  
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
  
  if (toggle) {
    toggle.addEventListener('click', function() {
      const current = document.documentElement.getAttribute('data-theme');
      const newTheme = current === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcon(newTheme);
    });
  }
}

function updateThemeIcon(theme) {
  const icon = document.querySelector('.theme-toggle i');
  if (icon) {
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
}

// Sidebar Toggle
function initSidebar() {
  const toggle = document.querySelector('.mobile-toggle');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  
  if (toggle && sidebar) {
    toggle.addEventListener('click', function() {
      sidebar.classList.toggle('open');
      if (overlay) overlay.classList.toggle('active');
    });
  }
  
  if (overlay) {
    overlay.addEventListener('click', function() {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    });
  }
}

// Dropdown Menus
function initDropdowns() {
  document.querySelectorAll('.dropdown').forEach(function(dropdown) {
    const trigger = dropdown.querySelector('.dropdown-trigger');
    
    if (trigger) {
      trigger.addEventListener('click', function(e) {
        e.stopPropagation();
        
        // Close other dropdowns
        document.querySelectorAll('.dropdown.open').forEach(function(d) {
          if (d !== dropdown) d.classList.remove('open');
        });
        
        dropdown.classList.toggle('open');
      });
    }
  });
  
  // Close on outside click
  document.addEventListener('click', function() {
    document.querySelectorAll('.dropdown.open').forEach(function(d) {
      d.classList.remove('open');
    });
  });
}

// Form Validation
function initForms() {
  document.querySelectorAll('form[data-validate]').forEach(function(form) {
    form.addEventListener('submit', function(e) {
      let isValid = true;
      
      form.querySelectorAll('[required]').forEach(function(input) {
        if (!input.value.trim()) {
          isValid = false;
          input.classList.add('is-invalid');
        } else {
          input.classList.remove('is-invalid');
        }
      });
      
      if (!isValid) {
        e.preventDefault();
        showToast('Please fill in all required fields', 'danger');
      }
    });
  });
}

// Toast Notifications
function initToasts() {
  window.showToast = function(message, type = 'info') {
    const container = document.querySelector('.toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = \`toast toast-\${type} animate-fadeIn\`;
    toast.innerHTML = \`
      <div class="toast-content">
        <i class="fas fa-\${getToastIcon(type)} mr-2"></i>
        <span>\${message}</span>
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    \`;
    
    container.appendChild(toast);
    
    setTimeout(function() {
      toast.remove();
    }, 5000);
  };
}

function createToastContainer() {
  const container = document.createElement('div');
  container.className = 'toast-container';
  container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;';
  document.body.appendChild(container);
  return container;
}

function getToastIcon(type) {
  const icons = {
    success: 'check-circle',
    danger: 'exclamation-circle',
    warning: 'exclamation-triangle',
    info: 'info-circle'
  };
  return icons[type] || icons.info;
}

// Copy to Clipboard
function initCopyButtons() {
  document.querySelectorAll('[data-copy]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const text = btn.getAttribute('data-copy');
      navigator.clipboard.writeText(text).then(function() {
        showToast('Copied to clipboard!', 'success');
      });
    });
  });
}

// Confirm Delete
function confirmDelete(message) {
  return confirm(message || 'Are you sure you want to delete this?');
}

// Format Date
function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// API Helper
async function apiCall(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }
    
    return data;
  } catch (error) {
    showToast(error.message, 'danger');
    throw error;
  }
}
`;

  // Generate charts JS
  const generateChartsJS = () => `/**
 * ${config.siteName} - Charts JavaScript
 * Uses Chart.js for visualization
 */

// Initialize charts when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // API Usage Chart
  const usageCtx = document.getElementById('apiUsageChart');
  if (usageCtx) {
    new Chart(usageCtx, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'API Calls',
          data: [1200, 1900, 3000, 5000, 4200, 3500, 4800],
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }
  
  // Game Distribution Chart
  const distCtx = document.getElementById('gameDistChart');
  if (distCtx) {
    new Chart(distCtx, {
      type: 'doughnut',
      data: {
        labels: ['WinGo', 'K3', '5D', 'TRX', 'Numeric'],
        datasets: [{
          data: [35, 25, 20, 12, 8],
          backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }
  
  // Hourly Distribution Chart
  const hourlyCtx = document.getElementById('hourlyChart');
  if (hourlyCtx) {
    const hours = Array.from({length: 24}, (_, i) => i + ':00');
    const data = Array.from({length: 24}, () => Math.floor(Math.random() * 500) + 100);
    
    new Chart(hourlyCtx, {
      type: 'bar',
      data: {
        labels: hours,
        datasets: [{
          label: 'Requests',
          data: data,
          backgroundColor: '#6366f1'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
});

// Real-time update for live monitor
function updateLiveStats(data) {
  const container = document.getElementById('liveRequests');
  if (!container) return;
  
  const row = document.createElement('div');
  row.className = 'live-request animate-fadeIn';
  row.innerHTML = \`
    <span class="time">\${new Date().toLocaleTimeString()}</span>
    <span class="endpoint">\${data.endpoint}</span>
    <span class="game">\${data.game}</span>
    <span class="status badge badge-\${data.status === 'success' ? 'success' : 'danger'}">\${data.status}</span>
    <span class="response">\${data.responseTime}ms</span>
  \`;
  
  container.insertBefore(row, container.firstChild);
  
  // Keep only last 50 items
  while (container.children.length > 50) {
    container.removeChild(container.lastChild);
  }
}
`;

  // Generate install script
  const generateInstallScript = () => `<?php
/**
 * ${config.siteName} - Installation Script
 * Run this script once to set up the database
 */

// Prevent direct access after installation
$lockFile = __DIR__ . '/install.lock';
if (file_exists($lockFile)) {
    die('Installation already completed. Delete install.lock to reinstall.');
}

require_once 'config.php';

$errors = [];
$success = [];

// Check PHP version
if (version_compare(PHP_VERSION, '7.4.0', '<')) {
    $errors[] = 'PHP 7.4 or higher is required. Current version: ' . PHP_VERSION;
}

// Check required extensions
$requiredExtensions = ['pdo', 'pdo_mysql', 'curl', 'json', 'mbstring'];
foreach ($requiredExtensions as $ext) {
    if (!extension_loaded($ext)) {
        $errors[] = "PHP extension '$ext' is not installed.";
    }
}

// Test database connection
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME,
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    $success[] = '✅ Database connection successful';
} catch (PDOException $e) {
    $errors[] = 'Database connection failed: ' . $e->getMessage();
}

// Import database schema
if (empty($errors) && isset($pdo)) {
    try {
        $sql = file_get_contents(__DIR__ . '/database.sql');
        $pdo->exec($sql);
        $success[] = '✅ Database schema imported';
    } catch (PDOException $e) {
        $errors[] = 'Schema import failed: ' . $e->getMessage();
    }
}

// Create admin user if not exists
if (empty($errors) && isset($pdo)) {
    try {
        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = 'admin'");
        $stmt->execute();
        
        if (!$stmt->fetch()) {
            $stmt = $pdo->prepare("INSERT INTO users (username, email, password, role, is_active) VALUES (?, ?, ?, 'admin', 1)");
            $stmt->execute(['admin', ADMIN_EMAIL, password_hash('admin123', PASSWORD_DEFAULT)]);
            $success[] = '✅ Admin user created (username: admin, password: admin123)';
        } else {
            $success[] = '✅ Admin user already exists';
        }
    } catch (PDOException $e) {
        $errors[] = 'Admin user creation failed: ' . $e->getMessage();
    }
}

// Create lock file
if (empty($errors)) {
    file_put_contents($lockFile, date('Y-m-d H:i:s'));
    $success[] = '✅ Installation completed!';
}

?>
<!DOCTYPE html>
<html>
<head>
    <title>${config.siteName} - Installation</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: system-ui, sans-serif; background: #0f172a; color: #f1f5f9; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem; }
        .container { max-width: 600px; width: 100%; }
        h1 { font-size: 2rem; margin-bottom: 2rem; text-align: center; }
        .card { background: #1e293b; border-radius: 12px; padding: 2rem; margin-bottom: 1.5rem; }
        .success { color: #10b981; }
        .error { color: #ef4444; }
        ul { list-style: none; }
        li { padding: 0.5rem 0; }
        .btn { display: inline-block; padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border-radius: 8px; text-decoration: none; margin-top: 1rem; }
        .btn:hover { opacity: 0.9; }
        .warning { background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); padding: 1rem; border-radius: 8px; margin-top: 1rem; color: #f59e0b; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 ${config.siteName}</h1>
        
        <?php if (!empty($errors)): ?>
        <div class="card">
            <h2 class="error">❌ Installation Errors</h2>
            <ul>
                <?php foreach ($errors as $error): ?>
                <li class="error"><?= htmlspecialchars($error) ?></li>
                <?php endforeach; ?>
            </ul>
        </div>
        <?php endif; ?>
        
        <?php if (!empty($success)): ?>
        <div class="card">
            <h2 class="success">Installation Status</h2>
            <ul>
                <?php foreach ($success as $msg): ?>
                <li class="success"><?= htmlspecialchars($msg) ?></li>
                <?php endforeach; ?>
            </ul>
            
            <?php if (empty($errors)): ?>
            <div class="warning">
                ⚠️ <strong>Important:</strong> Change the default admin password immediately after first login!
            </div>
            <a href="admin/login.php" class="btn">Go to Admin Panel →</a>
            <?php endif; ?>
        </div>
        <?php endif; ?>
    </div>
</body>
</html>
`;


  const generateReadme = () => `# ${config.siteName} - Complete PHP Solution

## 📦 What's Included

### 📂 Folder Structure
\`\`\`
${config.siteName.toLowerCase().replace(/\s+/g, '-')}/
├── config.php          # 🔒 Master configuration (EDIT THIS!)
├── helpers.php         # Helper functions
├── database.sql        # MySQL database schema
├── index.php           # Main entry point
├── .htaccess           # Apache security & rewrite rules
├── api/
│   ├── wingo.php       # WinGo API endpoint
│   ├── k3.php          # K3 API endpoint
│   ├── 5d.php          # 5D API endpoint
│   ├── trx.php         # TRX API endpoint
│   ├── numeric.php     # Numeric API endpoint
│   ├── health.php      # Health check endpoint
│   ├── telegram-bot.php    # Telegram bot webhook
│   └── telegram-setup.php  # Telegram setup utility
├── admin/
│   ├── login.php       # Login page
│   ├── dashboard.php   # Admin dashboard
│   ├── users.php       # User management
│   ├── api-keys.php    # API key management
│   ├── api-logs.php    # API request logs
│   ├── ip-whitelist.php # IP whitelist
│   ├── settings.php    # Site settings
│   ├── documentation.php # API documentation
│   └── profile.php     # User profile
└── includes/
    ├── auth.php        # Authentication helper
    ├── header.php      # Common header
    └── footer.php      # Common footer
\`\`\`

## 🚀 Quick Start (3 Steps)

### Step 1: Upload to VPS/cPanel
Upload all files to your web server:
\`\`\`
/www/wwwroot/your-domain.com/
\`\`\`

### Step 2: Configure Database
1. Create a MySQL database
2. Edit \`config.php\`:
   - DB_HOST, DB_USER, DB_PASS, DB_NAME
3. Import database:
   \`\`\`bash
   mysql -u your_user -p your_database < database.sql
   \`\`\`

### Step 3: Login
- URL: \`https://your-domain.com/admin/login.php\`
- Default credentials:
  - Username: \`admin\`
  - Password: \`admin123\`
  
⚠️ **CHANGE THE DEFAULT PASSWORD IMMEDIATELY!**

## 🔒 Security Features

- ✅ IP Whitelisting (IPv4, IPv6, CIDR)
- ✅ Domain Whitelisting
- ✅ API Key validation & expiration
- ✅ Rate limiting
- ✅ Request logging
- ✅ Upstream API completely hidden

## 📡 API Endpoints

| Game | Endpoint | Durations |
|------|----------|-----------|
| WinGo | /api/wingo.php | 30s, 1min, 3min, 5min |
| K3 | /api/k3.php | 1min, 3min, 5min, 10min |
| 5D | /api/5d.php | 1min, 3min, 5min, 10min |
| TRX | /api/trx.php | 1min, 3min, 5min |
| Numeric | /api/numeric.php | 1min, 3min, 5min |
| Health | /api/health.php | - |

### Example Request:
\`\`\`bash
curl "${config.userApiDomain}/api/wingo.php?api_key=YOUR_KEY&duration=1min"
\`\`\`

## 🤖 Telegram Bot

1. Create bot via @BotFather
2. Get your Chat ID via @userinfobot
3. Add to config.php: TELEGRAM_BOT_TOKEN, ADMIN_TELEGRAM_ID
4. Setup webhook: Visit /api/telegram-setup.php

## 📞 Support

- Email: ${config.supportEmail}
- Generated: ${new Date().toLocaleString()}

---
Powered by ${config.siteName} Trend API
`;

  const allFiles = [
    // Config
    { name: 'config.php', icon: Settings, description: 'Master Configuration (HIDDEN!)', category: 'config', color: 'text-red-500' },
    { name: 'helpers.php', icon: Code2, description: 'Helper Functions', category: 'config', color: 'text-purple-500' },
    { name: 'database.sql', icon: Database, description: 'MySQL Schema', category: 'config', color: 'text-blue-500' },
    { name: '.htaccess', icon: Shield, description: 'Apache Security', category: 'config', color: 'text-orange-500' },
    // API
    { name: 'wingo.php', icon: FileCode, description: 'WinGo API', category: 'api', color: 'text-yellow-500' },
    { name: 'k3.php', icon: FileCode, description: 'K3 API', category: 'api', color: 'text-blue-400' },
    { name: '5d.php', icon: FileCode, description: '5D API', category: 'api', color: 'text-green-500' },
    { name: 'trx.php', icon: FileCode, description: 'TRX API', category: 'api', color: 'text-cyan-500' },
    { name: 'numeric.php', icon: FileCode, description: 'Numeric API', category: 'api', color: 'text-pink-500' },
    { name: 'health.php', icon: Shield, description: 'Health Check', category: 'api', color: 'text-emerald-500' },
    { name: 'telegram-bot.php', icon: Bot, description: 'Telegram Bot', category: 'api', color: 'text-blue-500' },
    // Admin
    { name: 'login.php', icon: FileText, description: 'Login Page', category: 'admin', color: 'text-gray-400' },
    { name: 'dashboard.php', icon: Layout, description: 'Dashboard', category: 'admin', color: 'text-indigo-500' },
    { name: 'users.php', icon: Users, description: 'User Management', category: 'admin', color: 'text-green-500' },
    { name: 'api-keys.php', icon: FileCode, description: 'API Keys', category: 'admin', color: 'text-yellow-500' },
    { name: 'settings.php', icon: Settings, description: 'Settings', category: 'admin', color: 'text-gray-500' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Download className="w-8 h-8 text-primary" />
              Complete PHP Solution
            </h1>
            <p className="text-muted-foreground mt-1">
              Frontend + Backend + Telegram Bot + Database - All in One!
            </p>
          </div>
          <Badge variant="default" className="text-sm px-3 py-1.5 bg-green-600">
            <Check className="w-4 h-4 mr-1" />
            Ready to Deploy
          </Badge>
        </div>

        {/* Main Download Card */}
        <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-accent/5 to-background">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center">
                    <FolderArchive className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">All-in-One Download</h3>
                    <p className="text-muted-foreground">
                      Complete PHP solution - just upload to cPanel and run!
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="secondary">Frontend</Badge>
                      <Badge variant="secondary">Backend API</Badge>
                      <Badge variant="secondary">Telegram Bot</Badge>
                      <Badge variant="secondary">Database</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3 w-full lg:w-auto">
                  <Button 
                    size="lg"
                    className="gradient-primary text-primary-foreground h-16 px-10 text-lg font-bold"
                    onClick={downloadAllFiles}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                        Downloading... {downloadProgress}%
                      </>
                    ) : (
                      <>
                        <Download className="w-6 h-6 mr-2" />
                        Download Complete Solution
                      </>
                    )}
                  </Button>
                  {isDownloading && (
                    <Progress value={downloadProgress} className="h-2" />
                  )}
                </div>
              </div>

              {/* Security Notice */}
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-destructive mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-destructive">Upstream API Hidden!</h4>
                    <p className="text-sm text-muted-foreground">
                      Your real data source (<code className="text-destructive">{config.apiDomain}</code>) is completely hidden. 
                      Users will only see: <code className="text-primary">{config.userApiDomain}</code>
                    </p>
                  </div>
                </div>
              </div>

              {/* What's Included Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
                  <Layout className="w-8 h-8 text-indigo-500 mb-2" />
                  <h4 className="font-semibold">Admin Panel</h4>
                  <p className="text-sm text-muted-foreground">12 PHP pages</p>
                </div>
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                  <Server className="w-8 h-8 text-green-500 mb-2" />
                  <h4 className="font-semibold">API Endpoints</h4>
                  <p className="text-sm text-muted-foreground">6 game APIs</p>
                </div>
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <Bot className="w-8 h-8 text-blue-500 mb-2" />
                  <h4 className="font-semibold">Telegram Bot</h4>
                  <p className="text-sm text-muted-foreground">User & Admin</p>
                </div>
                <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                  <Database className="w-8 h-8 text-purple-500 mb-2" />
                  <h4 className="font-semibold">Database</h4>
                  <p className="text-sm text-muted-foreground">Complete MySQL</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Start */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-warning" />
              Quick Start (3 Steps)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold mb-3">1</div>
                <h4 className="font-semibold mb-2">Upload to Server</h4>
                <p className="text-sm text-muted-foreground">
                  Extract ZIP to your server root (cPanel File Manager or FTP)
                </p>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
                <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold mb-3">2</div>
                <h4 className="font-semibold mb-2">Configure Database</h4>
                <p className="text-sm text-muted-foreground">
                  Edit <code className="text-primary">config.php</code> with DB credentials, import <code className="text-primary">database.sql</code>
                </p>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20">
                <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold mb-3">3</div>
                <h4 className="font-semibold mb-2">Login & Go!</h4>
                <p className="text-sm text-muted-foreground">
                  Visit <code className="text-primary">/admin/login.php</code> and login with your credentials
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="structure" className="space-y-4">
          <TabsList>
            <TabsTrigger value="structure">📁 File Structure</TabsTrigger>
            <TabsTrigger value="endpoints">📡 API Endpoints</TabsTrigger>
            <TabsTrigger value="features">✨ Features</TabsTrigger>
          </TabsList>

          {/* Structure Tab */}
          <TabsContent value="structure">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Config Files */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Settings className="w-4 h-4 text-red-500" />
                    Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {allFiles.filter(f => f.category === 'config').map(file => (
                      <div key={file.name} className="flex items-center gap-2 text-sm p-2 rounded bg-muted/50">
                        <file.icon className={`w-4 h-4 ${file.color}`} />
                        <span>{file.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* API Files */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Server className="w-4 h-4 text-green-500" />
                    API Endpoints
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {allFiles.filter(f => f.category === 'api').map(file => (
                      <div key={file.name} className="flex items-center gap-2 text-sm p-2 rounded bg-muted/50">
                        <file.icon className={`w-4 h-4 ${file.color}`} />
                        <span>{file.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Admin Files */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Layout className="w-4 h-4 text-indigo-500" />
                    Admin Panel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {allFiles.filter(f => f.category === 'admin').map(file => (
                      <div key={file.name} className="flex items-center gap-2 text-sm p-2 rounded bg-muted/50">
                        <file.icon className={`w-4 h-4 ${file.color}`} />
                        <span>{file.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Endpoints Tab */}
          <TabsContent value="endpoints">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { game: 'WinGo', durations: ['30s', '1min', '3min', '5min'], endpoint: 'wingo.php', color: 'yellow' },
                    { game: 'K3', durations: ['1min', '3min', '5min', '10min'], endpoint: 'k3.php', color: 'blue' },
                    { game: '5D', durations: ['1min', '3min', '5min', '10min'], endpoint: '5d.php', color: 'green' },
                    { game: 'TRX', durations: ['1min', '3min', '5min'], endpoint: 'trx.php', color: 'cyan' },
                    { game: 'Numeric', durations: ['1min', '3min', '5min'], endpoint: 'numeric.php', color: 'pink' },
                    { game: 'Health', durations: ['status'], endpoint: 'health.php', color: 'emerald' },
                  ].map((item) => (
                    <div key={item.game} className="p-4 rounded-lg bg-muted/50 border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{item.game}</span>
                        <Badge variant="secondary">{item.durations.length} options</Badge>
                      </div>
                      <code className="text-xs text-primary break-all block mb-2">
                        /api/{item.endpoint}
                      </code>
                      <div className="flex flex-wrap gap-1">
                        {item.durations.map(d => (
                          <Badge key={d} variant="outline" className="text-xs">{d}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">🔒 Security Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> IP Whitelisting (IPv4, IPv6, CIDR)</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Domain Whitelisting</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> API Key Authentication</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Rate Limiting</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Upstream API Hidden</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Activity Logging</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">📱 Admin Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> User Management</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> API Key Generator</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Real-time Logs</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Telegram Bot</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Settings Panel</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> API Documentation</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Reference */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Quick Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Server className="w-4 h-4 text-primary" />
                  <span className="font-medium">Login Page</span>
                </div>
                <code className="text-xs text-primary">/admin/login.php</code>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">Admin Panel</span>
                </div>
                <code className="text-xs text-primary">/admin/login.php</code>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-red-500" />
                  <span className="font-medium">Config File</span>
                </div>
                <code className="text-xs text-destructive">config.php</code>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-green-500" />
                  <span className="font-medium">Database</span>
                </div>
                <code className="text-xs text-primary">database.sql</code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BackendDownloadPage;
