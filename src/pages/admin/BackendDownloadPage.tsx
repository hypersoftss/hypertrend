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
  Shield
} from 'lucide-react';

const BackendDownloadPage = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [backendType, setBackendType] = useState<'php' | 'nodejs'>('php');
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
 * 🔒 ${config.siteName.toUpperCase()} - CONFIGURATION
 * Generated: ${new Date().toLocaleString()}
 * =====================================================
 */

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'your_db_user');
define('DB_PASS', 'your_db_password');
define('DB_NAME', 'hyper_softs_db');

// HIDDEN UPSTREAM API (NEVER EXPOSE TO USERS!)
define('UPSTREAM_API_BASE', '${config.apiDomain}');
define('UPSTREAM_API_ENDPOINT', '${config.apiEndpoint}');

// Telegram Bot
define('TELEGRAM_BOT_TOKEN', '${config.telegramBotToken}');
define('ADMIN_TELEGRAM_ID', '${config.adminTelegramId}');

// Site Info
define('SITE_NAME', '${config.siteName}');
define('SITE_DESCRIPTION', '${config.siteDescription}');
define('ADMIN_EMAIL', '${config.adminEmail}');
define('SUPPORT_EMAIL', '${config.supportEmail}');

// Game Type IDs (Internal Mapping - HIDDEN!)
define('GAME_TYPES', [
    'wingo_30s'  => ['typeId' => 'wg30s', 'name' => 'WinGo 30 Seconds'],
    'wingo_1min' => ['typeId' => 'wg1', 'name' => 'WinGo 1 Minute'],
    'wingo_3min' => ['typeId' => 'wg3', 'name' => 'WinGo 3 Minutes'],
    'wingo_5min' => ['typeId' => 'wg5', 'name' => 'WinGo 5 Minutes'],
    'k3_1min'    => ['typeId' => 'k3_1', 'name' => 'K3 1 Minute'],
    'k3_3min'    => ['typeId' => 'k3_3', 'name' => 'K3 3 Minutes'],
    'k3_5min'    => ['typeId' => 'k3_5', 'name' => 'K3 5 Minutes'],
    'k3_10min'   => ['typeId' => 'k3_10', 'name' => 'K3 10 Minutes'],
    '5d_1min'    => ['typeId' => '5d_1', 'name' => '5D 1 Minute'],
    '5d_3min'    => ['typeId' => '5d_3', 'name' => '5D 3 Minutes'],
    '5d_5min'    => ['typeId' => '5d_5', 'name' => '5D 5 Minutes'],
    '5d_10min'   => ['typeId' => '5d_10', 'name' => '5D 10 Minutes'],
    'trx_1min'   => ['typeId' => 'trx_1', 'name' => 'TRX 1 Minute'],
    'trx_3min'   => ['typeId' => 'trx_3', 'name' => 'TRX 3 Minutes'],
    'trx_5min'   => ['typeId' => 'trx_5', 'name' => 'TRX 5 Minutes'],
    'numeric_1min' => ['typeId' => 'num_1', 'name' => 'Numeric 1 Minute'],
    'numeric_3min' => ['typeId' => 'num_3', 'name' => 'Numeric 3 Minutes'],
    'numeric_5min' => ['typeId' => 'num_5', 'name' => 'Numeric 5 Minutes'],
]);

// Security
define('ENABLE_IP_WHITELIST', true);
define('ENABLE_DOMAIN_WHITELIST', true);
define('LOG_ALL_REQUESTS', true);
define('RATE_LIMIT_ENABLED', true);

// CORS
define('ALLOWED_ORIGINS', [
    'https://your-frontend-domain.com',
]);

// Error Messages
define('ERROR_MESSAGES', [
    'invalid_key' => 'Invalid or expired API key.',
    'ip_blocked' => 'Access denied. Your IP is not authorized.',
    'domain_blocked' => 'Access denied. Domain not authorized.',
    'rate_limited' => 'Too many requests. Please slow down.',
    'key_expired' => 'Your API key has expired. Please renew.',
    'key_disabled' => 'Your API key has been disabled.',
    'server_error' => 'Internal server error. Please try again later.',
    'upstream_error' => 'Data source temporarily unavailable.',
]);
`;

  const downloadAllFiles = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      const zip = new JSZip();
      const folderName = config.siteName.toLowerCase().replace(/\s+/g, '-') + '-backend';
      const backend = zip.folder(folderName);
      
      setDownloadProgress(10);

      if (backendType === 'php') {
        // PHP Backend
        const phpFolder = backend?.folder('php');
        const apiFolder = phpFolder?.folder('api');

        // Fetch PHP files
        const phpFiles = [
          { name: 'helpers.php', path: '/backend/php/helpers.php' },
          { name: 'database.sql', path: '/backend/php/database.sql' },
          { name: '.htaccess', path: '/backend/php/.htaccess' },
          { name: 'README.md', path: '/backend/php/README.md' },
        ];

        const apiFiles = [
          { name: 'wingo.php', path: '/backend/php/api/wingo.php' },
          { name: 'k3.php', path: '/backend/php/api/k3.php' },
          { name: '5d.php', path: '/backend/php/api/5d.php' },
          { name: 'trx.php', path: '/backend/php/api/trx.php' },
          { name: 'numeric.php', path: '/backend/php/api/numeric.php' },
          { name: 'health.php', path: '/backend/php/api/health.php' },
        ];

        // Fetch helper files
        for (let i = 0; i < phpFiles.length; i++) {
          try {
            const response = await fetch(phpFiles[i].path);
            const content = await response.text();
            phpFolder?.file(phpFiles[i].name, content);
          } catch (e) {
            console.log(`Could not fetch ${phpFiles[i].name}`);
          }
          setDownloadProgress(10 + (i + 1) * 8);
        }

        // Fetch API files
        for (let i = 0; i < apiFiles.length; i++) {
          try {
            const response = await fetch(apiFiles[i].path);
            const content = await response.text();
            apiFolder?.file(apiFiles[i].name, content);
          } catch (e) {
            console.log(`Could not fetch ${apiFiles[i].name}`);
          }
          setDownloadProgress(45 + (i + 1) * 8);
        }

        // Add dynamic config
        phpFolder?.file('config.php', generatePhpConfig());
        
      } else {
        // Node.js Backend (existing)
        const nodeFiles = [
          { name: 'server.js', path: '/backend/server.js' },
          { name: 'database.sql', path: '/backend/database.sql' },
          { name: 'telegram-bot.js', path: '/backend/telegram-bot.js' },
          { name: 'README.md', path: '/backend/README.md' },
        ];

        for (let i = 0; i < nodeFiles.length; i++) {
          try {
            const response = await fetch(nodeFiles[i].path);
            const content = await response.text();
            backend?.file(nodeFiles[i].name, content);
          } catch (e) {
            console.log(`Could not fetch ${nodeFiles[i].name}`);
          }
          setDownloadProgress(10 + (i + 1) * 15);
        }
      }

      setDownloadProgress(85);

      // Generate ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      setDownloadProgress(100);
      
      saveAs(content, `${folderName}-${backendType}.zip`);
      
      toast({
        title: '✅ Download Complete!',
        description: `${backendType.toUpperCase()} backend downloaded with your settings`,
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

  const phpFiles = [
    { name: 'config.php', icon: Settings, description: 'Configuration (HIDDEN!)', size: '~3 KB', color: 'text-red-500' },
    { name: 'helpers.php', icon: Code2, description: 'Helper Functions', size: '~8 KB', color: 'text-purple-500' },
    { name: 'wingo.php', icon: FileCode, description: 'WinGo API (All Durations)', size: '~6 KB', color: 'text-yellow-500' },
    { name: 'k3.php', icon: FileCode, description: 'K3 API (All Durations)', size: '~5 KB', color: 'text-blue-500' },
    { name: '5d.php', icon: FileCode, description: '5D API (All Durations)', size: '~5 KB', color: 'text-green-500' },
    { name: 'trx.php', icon: FileCode, description: 'TRX API (All Durations)', size: '~5 KB', color: 'text-orange-500' },
    { name: 'numeric.php', icon: FileCode, description: 'Numeric API (All Durations)', size: '~5 KB', color: 'text-cyan-500' },
    { name: 'health.php', icon: Shield, description: 'Health Check', size: '~4 KB', color: 'text-emerald-500' },
    { name: 'database.sql', icon: Database, description: 'MySQL Schema', size: '~12 KB', color: 'text-blue-500' },
    { name: '.htaccess', icon: FileText, description: 'Apache Security', size: '~2 KB', color: 'text-gray-500' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Download className="w-8 h-8 text-primary" />
              Backend Download
            </h1>
            <p className="text-muted-foreground mt-1">
              Complete PHP backend with hidden upstream API
            </p>
          </div>
          <Badge variant="outline" className="text-sm px-3 py-1.5 font-mono">
            📁 /www/wwwroot/hyperapi.in/
          </Badge>
        </div>

        {/* Backend Type Selection */}
        <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-accent/5 to-background">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-6">
              {/* Backend Type Toggle */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  size="lg"
                  variant={backendType === 'php' ? 'default' : 'outline'}
                  onClick={() => setBackendType('php')}
                  className={backendType === 'php' ? 'gradient-primary text-primary-foreground' : ''}
                >
                  <Code2 className="w-5 h-5 mr-2" />
                  PHP Backend
                  <Badge variant="secondary" className="ml-2 text-xs">Recommended</Badge>
                </Button>
                <Button
                  size="lg"
                  variant={backendType === 'nodejs' ? 'default' : 'outline'}
                  onClick={() => setBackendType('nodejs')}
                  className={backendType === 'nodejs' ? 'gradient-primary text-primary-foreground' : ''}
                >
                  <Server className="w-5 h-5 mr-2" />
                  Node.js Backend
                </Button>
              </div>

              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center">
                    <FolderArchive className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">One-Click Download</h3>
                    <p className="text-muted-foreground">
                      {backendType === 'php' 
                        ? 'PHP files with your upstream API hidden' 
                        : 'Node.js + Express + MySQL'}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3 w-full lg:w-auto">
                  <Button 
                    size="lg"
                    className="gradient-primary text-primary-foreground h-14 px-8 text-lg"
                    onClick={downloadAllFiles}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Downloading... {downloadProgress}%
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5 mr-2" />
                        Download {backendType.toUpperCase()} Backend
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
                      Users will only see your domain: <code className="text-primary">{config.userApiDomain}</code>
                    </p>
                  </div>
                </div>
              </div>

              {/* What's Included */}
              {backendType === 'php' && (
                <div className="p-4 rounded-xl bg-background/50 border">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" />
                    PHP Backend Contains:
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {phpFiles.slice(0, 10).map((file) => (
                      <div key={file.name} className="flex items-center gap-2 text-sm">
                        <file.icon className={`w-4 h-4 ${file.color}`} />
                        <span>{file.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* API Endpoints Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Your API Endpoints (What Users See)
            </CardTitle>
            <CardDescription>
              Users will call these endpoints on YOUR domain - upstream API is hidden
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { game: 'WinGo', durations: ['30s', '1min', '3min', '5min'], endpoint: 'wingo.php' },
                { game: 'K3', durations: ['1min', '3min', '5min', '10min'], endpoint: 'k3.php' },
                { game: '5D', durations: ['1min', '3min', '5min', '10min'], endpoint: '5d.php' },
                { game: 'TRX', durations: ['1min', '3min', '5min'], endpoint: 'trx.php' },
                { game: 'Numeric', durations: ['1min', '3min', '5min'], endpoint: 'numeric.php' },
                { game: 'Health', durations: ['check'], endpoint: 'health.php' },
              ].map((item) => (
                <div key={item.game} className="p-3 rounded-lg bg-muted/50 border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{item.game}</span>
                    <Badge variant="secondary" className="text-xs">{item.durations.length} endpoints</Badge>
                  </div>
                  <code className="text-xs text-primary break-all">
                    {config.userApiDomain}/api/{item.endpoint}
                  </code>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.durations.map(d => (
                      <Badge key={d} variant="outline" className="text-xs">{d}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Start */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-warning" />
              PHP Quick Start (3 Steps)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold mb-3">1</div>
                <h4 className="font-semibold mb-2">Upload to VPS</h4>
                <p className="text-sm text-muted-foreground">
                  Extract ZIP to <code className="text-primary">/www/wwwroot/hyperapi.in/php/</code>
                </p>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
                <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold mb-3">2</div>
                <h4 className="font-semibold mb-2">Update config.php</h4>
                <p className="text-sm text-muted-foreground">
                  Edit database credentials in <code className="text-primary">config.php</code>
                </p>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20">
                <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold mb-3">3</div>
                <h4 className="font-semibold mb-2">Import Database</h4>
                <p className="text-sm text-muted-foreground">
                  Run <code className="text-primary">mysql -u root -p {'<'} database.sql</code>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="files" className="space-y-4">
          <TabsList>
            <TabsTrigger value="files">📁 PHP Files</TabsTrigger>
            <TabsTrigger value="example">📋 Usage Example</TabsTrigger>
            <TabsTrigger value="htaccess">🔒 Security Config</TabsTrigger>
          </TabsList>

          {/* Files Tab */}
          <TabsContent value="files">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {phpFiles.map((file) => (
                <Card key={file.name} className="hover:border-primary/50 transition-all">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between text-base">
                      <span className="flex items-center gap-2">
                        <file.icon className={`w-5 h-5 ${file.color}`} />
                        {file.name}
                      </span>
                      <Badge variant="secondary" className="text-xs">{file.size}</Badge>
                    </CardTitle>
                    <CardDescription>{file.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full"
                      variant="outline"
                      onClick={() => {
                        const basePath = file.name === 'config.php' 
                          ? '' 
                          : ['wingo.php', 'k3.php', '5d.php', 'trx.php', 'numeric.php', 'health.php'].includes(file.name)
                            ? '/backend/php/api/'
                            : '/backend/php/';
                        if (basePath) {
                          window.open(basePath + file.name, '_blank');
                        } else {
                          toast({
                            title: '🔒 Protected File',
                            description: 'config.php contains secrets - included in ZIP only',
                          });
                        }
                      }}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View File
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Example Tab */}
          <TabsContent value="example">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>API Usage Examples</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(`curl "${config.userApiDomain}/api/wingo.php?api_key=YOUR_KEY&duration=1min"`, 'example')}
                  >
                    {copiedFile === 'example' ? (
                      <Check className="w-4 h-4 mr-2 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 mr-2" />
                    )}
                    Copy
                  </Button>
                </CardTitle>
                <CardDescription>
                  These examples show what YOUR users will use - upstream is hidden!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <pre className="p-4 rounded-lg bg-muted/50 text-sm font-mono whitespace-pre-wrap">
{`# =====================================================
# YOUR API ENDPOINTS (Upstream Hidden!)
# =====================================================

# WinGo API
curl "${config.userApiDomain}/api/wingo.php?api_key=YOUR_KEY&duration=30s"
curl "${config.userApiDomain}/api/wingo.php?api_key=YOUR_KEY&duration=1min"
curl "${config.userApiDomain}/api/wingo.php?api_key=YOUR_KEY&duration=3min"
curl "${config.userApiDomain}/api/wingo.php?api_key=YOUR_KEY&duration=5min"

# K3 API
curl "${config.userApiDomain}/api/k3.php?api_key=YOUR_KEY&duration=1min"
curl "${config.userApiDomain}/api/k3.php?api_key=YOUR_KEY&duration=3min"

# 5D API
curl "${config.userApiDomain}/api/5d.php?api_key=YOUR_KEY&duration=1min"

# TRX API
curl "${config.userApiDomain}/api/trx.php?api_key=YOUR_KEY&duration=1min"

# Numeric API
curl "${config.userApiDomain}/api/numeric.php?api_key=YOUR_KEY&duration=1min"

# Health Check (No API key needed)
curl "${config.userApiDomain}/api/health.php"

# =====================================================
# RESPONSE FORMAT
# =====================================================
{
  "success": true,
  "game": "wingo",
  "duration": "1min",
  "game_name": "WinGo 1 Minute",
  "data": { ... },
  "meta": {
    "response_time_ms": 245,
    "timestamp": "2024-01-15T10:30:00+00:00",
    "powered_by": "${config.siteName} Trend API"
  }
}

# =====================================================
# NOTE: Users NEVER see your upstream API!
# They only see: ${config.userApiDomain}
# Hidden source: ${config.apiDomain} (only you know this!)
# =====================================================`}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* htaccess Tab */}
          <TabsContent value="htaccess">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>.htaccess Security Configuration</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open('/backend/php/.htaccess', '_blank')}
                  >
                    View Full File
                  </Button>
                </CardTitle>
                <CardDescription>
                  Protects config.php and adds security headers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="p-4 rounded-lg bg-muted/50 text-sm font-mono whitespace-pre-wrap">
{`# Block access to config files
<FilesMatch "^(config\\.php|helpers\\.php|\\.env)$">
    Order Allow,Deny
    Deny from all
</FilesMatch>

# Security Headers
Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "DENY"
Header always set X-XSS-Protection "1; mode=block"

# Clean URLs
RewriteRule ^(wingo|k3|5d|trx|numeric)/([0-9]+min?)$ api/$1.php?duration=$2 [L,QSA]`}
                </pre>
              </CardContent>
            </Card>
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
                  <span className="font-medium">VPS Path</span>
                </div>
                <code className="text-xs text-primary break-all">/www/wwwroot/hyperapi.in/php/</code>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">User API</span>
                </div>
                <code className="text-xs text-primary break-all">{config.userApiDomain}</code>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-red-500" />
                  <span className="font-medium">Hidden Source</span>
                </div>
                <code className="text-xs text-destructive break-all">{config.apiDomain}</code>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-green-500" />
                  <span className="font-medium">Database</span>
                </div>
                <code className="text-xs text-primary">hyper_softs_db</code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BackendDownloadPage;
