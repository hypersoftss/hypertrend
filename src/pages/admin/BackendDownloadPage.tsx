import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Download, Copy, Check, FileCode, Database, Bot, FileText, Package, Settings } from 'lucide-react';

const BackendDownloadPage = () => {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const { toast } = useToast();

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

  const files = [
    {
      name: 'server.js',
      icon: FileCode,
      description: 'Main Express API Server',
      path: '/backend/server.js',
      size: '~25 KB'
    },
    {
      name: 'database.sql',
      icon: Database,
      description: 'MySQL Database Schema',
      path: '/backend/database.sql',
      size: '~12 KB'
    },
    {
      name: 'telegram-bot.js',
      icon: Bot,
      description: 'Telegram Bot Handler',
      path: '/backend/telegram-bot.js',
      size: '~18 KB'
    },
    {
      name: 'package.json',
      icon: Package,
      description: 'Node.js Dependencies',
      path: '/backend/package.json',
      size: '~1 KB'
    },
    {
      name: '.env.example',
      icon: Settings,
      description: 'Environment Variables Template',
      path: '/backend/.env.example',
      size: '~1 KB'
    },
    {
      name: 'README.md',
      icon: FileText,
      description: 'Setup Instructions',
      path: '/backend/README.md',
      size: '~5 KB'
    }
  ];

  const setupCommands = `# =====================================================
# 🚀 VPS SETUP COMMANDS
# Path: /www/wwwroot/hyperapi.in/
# =====================================================

# 1. SSH into your VPS
ssh root@your-server-ip

# 2. Navigate to your domain folder
cd /www/wwwroot/hyperapi.in/

# 3. Create backend folder
mkdir backend
cd backend

# 4. Upload all files here (use SFTP/SCP)
# Or copy-paste each file content

# 5. Install Node.js (if not installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# 6. Setup MySQL Database
mysql -u root -p
# Then run: source database.sql

# 7. Configure environment
cp .env.example .env
nano .env
# Fill in your values

# 8. Install dependencies
npm install

# 9. Install PM2 for process management
npm install -g pm2

# 10. Start the API server
pm2 start server.js --name "hyper-api"

# 11. Start Telegram bot
pm2 start telegram-bot.js --name "hyper-bot"

# 12. Save PM2 config
pm2 save
pm2 startup

# 13. Setup Nginx reverse proxy (if using aaPanel)
# Add this to your domain's Nginx config:
location /api {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_cache_bypass $http_upgrade;
}

# =====================================================
# ✅ Done! Your API is now live at:
# https://hyperapi.in/api/health
# =====================================================`;

  const envTemplate = `# =====================================================
# 🚀 HYPER SOFTS TREND - ENVIRONMENT CONFIGURATION
# Path: /www/wwwroot/hyperapi.in/backend/.env
# =====================================================

# Server Configuration
PORT=3000
NODE_ENV=production

# Frontend URL (for CORS)
FRONTEND_URL=https://hyper-softs-trend.lovable.app

# JWT Secret (Generate a strong random string - use: openssl rand -hex 32)
JWT_SECRET=your-super-secret-jwt-key-change-this

# MySQL Database Configuration
DB_HOST=localhost
DB_USER=hyper_user
DB_PASSWORD=your_database_password
DB_NAME=hyper_softs_db

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_from_botfather
ADMIN_TELEGRAM_ID=6596742955

# BetAPI Configuration
BETAPI_URL=https://betapi.space/api
BETAPI_KEY=your_betapi_key

# Rate Limiting
RATE_LIMIT_PER_MINUTE=100
RATE_LIMIT_PER_DAY=10000`;

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
              Download all backend files for your VPS
            </p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            📁 /www/wwwroot/hyperapi.in/backend/
          </Badge>
        </div>

        {/* Download All Card */}
        <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold">Download All Backend Files</h3>
                <p className="text-muted-foreground">
                  Click each file below to view and copy, then paste in your VPS
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  className="gradient-primary"
                  onClick={() => window.open('/backend/server.js', '_blank')}
                >
                  <FileCode className="w-4 h-4 mr-2" />
                  View server.js
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.open('/backend/database.sql', '_blank')}
                >
                  <Database className="w-4 h-4 mr-2" />
                  View database.sql
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="files" className="space-y-4">
          <TabsList>
            <TabsTrigger value="files">📁 Files</TabsTrigger>
            <TabsTrigger value="setup">🛠️ Setup Commands</TabsTrigger>
            <TabsTrigger value="env">⚙️ .env Template</TabsTrigger>
          </TabsList>

          {/* Files Tab */}
          <TabsContent value="files">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file) => (
                <Card key={file.name} className="hover:border-primary/50 transition-all">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <file.icon className="w-5 h-5 text-primary" />
                        {file.name}
                      </span>
                      <Badge variant="secondary">{file.size}</Badge>
                    </CardTitle>
                    <CardDescription>{file.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1"
                        variant="outline"
                        onClick={() => window.open(file.path, '_blank')}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = file.path;
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

          {/* Setup Tab */}
          <TabsContent value="setup">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>VPS Setup Commands</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(setupCommands, 'setup-commands')}
                  >
                    {copiedFile === 'setup-commands' ? (
                      <Check className="w-4 h-4 mr-2 text-success" />
                    ) : (
                      <Copy className="w-4 h-4 mr-2" />
                    )}
                    Copy All
                  </Button>
                </CardTitle>
                <CardDescription>
                  Step-by-step commands for /www/wwwroot/hyperapi.in/
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <pre className="p-4 rounded-lg bg-muted/50 text-sm font-mono whitespace-pre-wrap">
                    {setupCommands}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Env Tab */}
          <TabsContent value="env">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>.env Configuration</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(envTemplate, 'env-template')}
                  >
                    {copiedFile === 'env-template' ? (
                      <Check className="w-4 h-4 mr-2 text-success" />
                    ) : (
                      <Copy className="w-4 h-4 mr-2" />
                    )}
                    Copy
                  </Button>
                </CardTitle>
                <CardDescription>
                  Copy this and update with your values
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <pre className="p-4 rounded-lg bg-muted/50 text-sm font-mono whitespace-pre-wrap">
                    {envTemplate}
                  </pre>
                </ScrollArea>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-semibold mb-2">📁 VPS Path</h4>
                <code className="text-xs text-primary">/www/wwwroot/hyperapi.in/backend/</code>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-semibold mb-2">🔌 API Port</h4>
                <code className="text-xs text-primary">3000</code>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-semibold mb-2">📊 Database</h4>
                <code className="text-xs text-primary">hyper_softs_db</code>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-semibold mb-2">🤖 PM2 Apps</h4>
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
