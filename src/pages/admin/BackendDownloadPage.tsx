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
  Zap
} from 'lucide-react';

// Backend file contents
const serverJsContent = `// Full server.js content - see public/backend/server.js`;
const databaseSqlContent = `-- Full database.sql content - see public/backend/database.sql`;
const telegramBotContent = `// Full telegram-bot.js content - see public/backend/telegram-bot.js`;

const packageJsonContent = `{
  "name": "hyper-softs-trend-backend",
  "version": "1.0.0",
  "description": "Hyper Softs Trend API Management System",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "bot": "node telegram-bot.js",
    "start:all": "concurrently \\"npm run start\\" \\"npm run bot\\"",
    "db:setup": "mysql -u root -p < database.sql"
  },
  "dependencies": {
    "axios": "^1.6.2",
    "bcryptjs": "^2.4.3",
    "compression": "^1.7.4",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "express-rate-limit": "^7.1.5",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "mysql2": "^3.6.5",
    "node-cron": "^3.0.3",
    "node-telegram-bot-api": "^0.64.0",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "concurrently": "^8.2.2",
    "nodemon": "^3.0.2"
  }
}`;

const envExampleContent = `# =====================================================
# HYPER SOFTS TREND - ENVIRONMENT CONFIGURATION
# Path: /www/wwwroot/hyperapi.in/backend/.env
# =====================================================

PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.lovable.app

# JWT Secret (Generate: openssl rand -hex 32)
JWT_SECRET=change-this-to-a-random-string

# MySQL Database
DB_HOST=localhost
DB_USER=hyper_user
DB_PASSWORD=your_password
DB_NAME=hyper_softs_db

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
ADMIN_TELEGRAM_ID=your_telegram_id

# BetAPI
BETAPI_URL=https://betapi.space/api
BETAPI_KEY=your_betapi_key`;

const setupScriptContent = `#!/bin/bash
# =====================================================
# HYPER SOFTS TREND - AUTO SETUP SCRIPT
# Run this on your VPS: bash setup.sh
# =====================================================

echo "🚀 Starting Hyper Softs Trend Setup..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy env file if not exists
if [ ! -f .env ]; then
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration!"
    echo "    nano .env"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file: nano .env"
echo "2. Setup database: mysql -u root -p < database.sql"
echo "3. Start server: pm2 start server.js --name hyper-api"
echo "4. Start bot: pm2 start telegram-bot.js --name hyper-bot"
echo "5. Save PM2: pm2 save && pm2 startup"
echo ""
`;

const nginxConfigContent = `# =====================================================
# NGINX REVERSE PROXY CONFIGURATION
# Add this to your domain's Nginx config in aaPanel
# =====================================================

location /api {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    proxy_read_timeout 86400;
}`;

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

  // Generate .env content dynamically from config
  const generateEnvContent = () => `# =====================================================
# ${config.siteName.toUpperCase()} - ENVIRONMENT CONFIGURATION
# Generated on: ${new Date().toLocaleString()}
# =====================================================

PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.lovable.app

# JWT Secret (Generate: openssl rand -hex 32)
JWT_SECRET=change-this-to-a-random-string

# MySQL Database
DB_HOST=localhost
DB_USER=hyper_user
DB_PASSWORD=your_password
DB_NAME=hyper_softs_db

# Telegram Bot
TELEGRAM_BOT_TOKEN=${config.telegramBotToken}
ADMIN_TELEGRAM_ID=${config.adminTelegramId}

# API Configuration
API_DOMAIN=${config.apiDomain}
API_ENDPOINT=${config.apiEndpoint}

# Site Info
SITE_NAME=${config.siteName}
SITE_DESCRIPTION=${config.siteDescription}
ADMIN_EMAIL=${config.adminEmail}
SUPPORT_EMAIL=${config.supportEmail}`;

  const downloadAllFiles = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      const zip = new JSZip();
      
      // Create backend folder with config site name
      const folderName = config.siteName.toLowerCase().replace(/\s+/g, '-') + '-backend';
      const backend = zip.folder(folderName);
      
      setDownloadProgress(10);

      // Fetch actual file contents
      const files = [
        { name: 'server.js', path: '/backend/server.js' },
        { name: 'database.sql', path: '/backend/database.sql' },
        { name: 'telegram-bot.js', path: '/backend/telegram-bot.js' },
        { name: 'README.md', path: '/backend/README.md' },
      ];

      for (let i = 0; i < files.length; i++) {
        try {
          const response = await fetch(files[i].path);
          const content = await response.text();
          backend?.file(files[i].name, content);
        } catch (e) {
          console.log(`Could not fetch ${files[i].name}, using template`);
        }
        setDownloadProgress(10 + (i + 1) * 15);
      }

      // Add dynamically generated files with current config
      backend?.file('package.json', packageJsonContent.replace('hyper-softs-trend-backend', folderName));
      backend?.file('.env.example', generateEnvContent());
      backend?.file('setup.sh', setupScriptContent);
      backend?.file('nginx.conf', nginxConfigContent);
      
      setDownloadProgress(80);

      // Generate ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      
      setDownloadProgress(100);
      
      // Download with config site name
      saveAs(content, `${folderName}.zip`);
      
      toast({
        title: '✅ Download Complete!',
        description: `${folderName}.zip downloaded with your current settings`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: '❌ Download Failed',
        description: 'Please try downloading individual files',
        variant: 'destructive'
      });
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const files = [
    { name: 'server.js', icon: FileCode, description: 'Express API Server', size: '~25 KB', color: 'text-yellow-500' },
    { name: 'database.sql', icon: Database, description: 'MySQL Schema', size: '~12 KB', color: 'text-blue-500' },
    { name: 'telegram-bot.js', icon: Bot, description: 'Telegram Bot', size: '~18 KB', color: 'text-cyan-500' },
    { name: 'package.json', icon: Package, description: 'Dependencies', size: '~1 KB', color: 'text-green-500' },
    { name: '.env.example', icon: Settings, description: 'Environment Template', size: '~1 KB', color: 'text-purple-500' },
    { name: 'setup.sh', icon: FileText, description: 'Auto Setup Script', size: '~1 KB', color: 'text-orange-500' },
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
              One-click download for VPS deployment
            </p>
          </div>
          <Badge variant="outline" className="text-sm px-3 py-1.5 font-mono">
            📁 /www/wwwroot/hyperapi.in/
          </Badge>
        </div>

        {/* One-Click Download Card */}
        <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-accent/5 to-background overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center">
                  <FolderArchive className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">One-Click Download</h3>
                  <p className="text-muted-foreground">
                    Download all files as ready-to-use ZIP
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
                      Download All (ZIP)
                    </>
                  )}
                </Button>
                {isDownloading && (
                  <Progress value={downloadProgress} className="h-2" />
                )}
              </div>
            </div>

            {/* What's Included */}
            <div className="mt-6 p-4 rounded-xl bg-background/50 border">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                ZIP Contains:
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                {files.map((file) => (
                  <div key={file.name} className="flex items-center gap-2 text-sm">
                    <file.icon className={`w-4 h-4 ${file.color}`} />
                    <span>{file.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Start Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-warning" />
              Quick Start (3 Easy Steps)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold mb-3">1</div>
                <h4 className="font-semibold mb-2">Upload & Extract</h4>
                <p className="text-sm text-muted-foreground">
                  Upload ZIP to <code className="text-primary">/www/wwwroot/hyperapi.in/</code> and extract
                </p>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
                <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold mb-3">2</div>
                <h4 className="font-semibold mb-2">Configure .env</h4>
                <p className="text-sm text-muted-foreground">
                  Copy <code className="text-primary">.env.example</code> to <code className="text-primary">.env</code> and fill your values
                </p>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20">
                <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold mb-3">3</div>
                <h4 className="font-semibold mb-2">Run Setup Script</h4>
                <p className="text-sm text-muted-foreground">
                  Run <code className="text-primary">bash setup.sh</code> and follow instructions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="files" className="space-y-4">
          <TabsList>
            <TabsTrigger value="files">📁 Individual Files</TabsTrigger>
            <TabsTrigger value="commands">🛠️ Commands</TabsTrigger>
            <TabsTrigger value="nginx">🌐 Nginx Config</TabsTrigger>
          </TabsList>

          {/* Files Tab */}
          <TabsContent value="files">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file) => (
                <Card key={file.name} className="hover:border-primary/50 transition-all group">
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
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1"
                        variant="outline"
                        onClick={() => window.open(`/backend/${file.name}`, '_blank')}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = `/backend/${file.name}`;
                          link.download = file.name;
                          link.click();
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Commands Tab */}
          <TabsContent value="commands">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>VPS Setup Commands</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(setupScriptContent, 'commands')}
                  >
                    {copiedFile === 'commands' ? (
                      <Check className="w-4 h-4 mr-2 text-success" />
                    ) : (
                      <Copy className="w-4 h-4 mr-2" />
                    )}
                    Copy
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <pre className="p-4 rounded-lg bg-muted/50 text-sm font-mono whitespace-pre-wrap">
{`# =====================================================
# SSH into your VPS
# =====================================================
ssh root@your-server-ip

# Navigate to your domain folder
cd /www/wwwroot/hyperapi.in/

# Upload and extract the ZIP file
# (Use SFTP to upload hyper-softs-backend.zip)
unzip hyper-softs-backend.zip
cd hyper-softs-backend

# Run the setup script
chmod +x setup.sh
bash setup.sh

# Edit your configuration
nano .env

# Setup MySQL database
mysql -u root -p
# In MySQL: CREATE DATABASE hyper_softs_db;
# Exit and run:
mysql -u root -p hyper_softs_db < database.sql

# Start with PM2
pm2 start server.js --name "hyper-api"
pm2 start telegram-bot.js --name "hyper-bot"
pm2 save
pm2 startup

# Check status
pm2 status

# View logs
pm2 logs hyper-api`}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nginx Tab */}
          <TabsContent value="nginx">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Nginx Reverse Proxy Configuration</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(nginxConfigContent, 'nginx')}
                  >
                    {copiedFile === 'nginx' ? (
                      <Check className="w-4 h-4 mr-2 text-success" />
                    ) : (
                      <Copy className="w-4 h-4 mr-2" />
                    )}
                    Copy
                  </Button>
                </CardTitle>
                <CardDescription>
                  Add this to your domain's Nginx config in aaPanel/CyberPanel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="p-4 rounded-lg bg-muted/50 text-sm font-mono whitespace-pre-wrap">
                  {nginxConfigContent}
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
                <code className="text-xs text-primary break-all">/www/wwwroot/hyperapi.in/</code>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">API Port</span>
                </div>
                <code className="text-xs text-primary">3000</code>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-green-500" />
                  <span className="font-medium">Database</span>
                </div>
                <code className="text-xs text-primary">hyper_softs_db</code>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-4 h-4 text-cyan-500" />
                  <span className="font-medium">PM2 Apps</span>
                </div>
                <code className="text-xs text-primary">hyper-api, hyper-bot</code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BackendDownloadPage;
