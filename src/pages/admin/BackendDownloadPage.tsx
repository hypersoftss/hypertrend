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
        setDownloadProgress(5 + (i + 1) * 4);
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
        setDownloadProgress(37 + (i + 1) * 3);
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
        setDownloadProgress(73 + (i + 1) * 3);
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
        setDownloadProgress(82 + (i + 1) * 2);
      }

      // ==================== GENERATED FILES ====================
      // Add dynamic config
      backend?.file('config.php', generatePhpConfig());
      setDownloadProgress(92);

      // Add README
      backend?.file('README.md', generateReadme());
      setDownloadProgress(95);

      // Generate ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      setDownloadProgress(100);
      
      saveAs(content, `${folderName}.zip`);
      
      toast({
        title: '✅ Download Complete!',
        description: 'Complete PHP solution with Frontend + Backend + Bot downloaded!',
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
                  Visit <code className="text-primary">/admin/login.php</code> - Default: admin / admin123
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
                  <span className="font-medium">Default Login</span>
                </div>
                <code className="text-xs text-primary">admin / admin123</code>
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
