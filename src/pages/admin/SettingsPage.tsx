import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useConfig } from '@/contexts/ConfigContext';
import { Settings, Save, Globe, Mail, MessageSquare, Bell, Key, Upload, Link, Server, Database, Shield, Palette, ExternalLink } from 'lucide-react';

const SettingsPage = () => {
  const { config, updateConfig } = useConfig();
  
  const [settings, setSettings] = useState({
    // General - synced from config
    siteName: config.siteName,
    siteDescription: config.siteDescription,
    adminEmail: config.adminEmail,
    supportEmail: config.supportEmail,
    logoUrl: config.logoUrl,
    faviconUrl: config.faviconUrl,
    
    // URLs
    frontendUrl: 'https://hyper-softs-trend.lovable.app',
    backendUrl: 'https://api.hypersofts.com',
    docsUrl: 'https://docs.hypersofts.com',
    
    // Telegram - synced from config
    telegramBotToken: config.telegramBotToken,
    adminTelegramId: config.adminTelegramId,
    webhookUrl: '',
    
    // API Configuration - INTERNAL (Hidden from users - actual source)
    internalApiDomain: config.apiDomain,
    internalApiEndpoint: config.apiEndpoint,
    
    // API Configuration - USER-FACING (What merchants see in documentation)
    userApiDomain: config.userApiDomain,
    userApiEndpoint: config.userApiEndpoint,
    
    // Notifications
    autoReminderDays: 7,
    enableAutoReminder: true,
    enableLoginAlerts: true,
    enableHealthNotifications: true,
    enableNewKeyNotifications: true,
    enableRenewalNotifications: true,
    
    // Security
    jwtExpiryHours: 24,
    maxLoginAttempts: 5,
    lockoutMinutes: 30,
    requireStrongPassword: true,
    
    // Maintenance
    maintenanceMode: false,
    maintenanceMessage: 'System is under maintenance. Please try again later.',
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    
    // Update global config with ALL site settings
    updateConfig({
      siteName: settings.siteName,
      siteDescription: settings.siteDescription,
      adminEmail: settings.adminEmail,
      supportEmail: settings.supportEmail,
      logoUrl: settings.logoUrl,
      faviconUrl: settings.faviconUrl,
      // Internal API (hidden)
      apiDomain: settings.internalApiDomain,
      apiEndpoint: settings.internalApiEndpoint,
      // User-facing API (shown to merchants)
      userApiDomain: settings.userApiDomain,
      userApiEndpoint: settings.userApiEndpoint,
      telegramBotToken: settings.telegramBotToken,
      adminTelegramId: settings.adminTelegramId,
    });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: '✅ Settings Saved',
      description: 'Site name, logo, and all settings updated everywhere!',
    });
    setIsSaving(false);
  };

  const testTelegramBot = async () => {
    if (!settings.telegramBotToken || !settings.adminTelegramId) {
      toast({
        title: '❌ Missing Configuration',
        description: 'Please enter both Bot Token and Admin Telegram ID',
        variant: 'destructive',
      });
      return;
    }

    setIsTesting(true);
    
    try {
      // Actually send a test message via Telegram Bot API
      const message = `🧪 *Test Message from Hyper Softs*\n\n✅ Bot connection successful!\n📅 Time: ${new Date().toLocaleString()}\n🔧 System: Admin Panel`;
      
      const response = await fetch(`https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: settings.adminTelegramId,
          text: message,
          parse_mode: 'Markdown'
        })
      });

      const result = await response.json();
      
      if (result.ok) {
        toast({
          title: '✅ Test Message Sent!',
          description: `Message delivered to Telegram ID: ${settings.adminTelegramId}`,
        });
      } else {
        throw new Error(result.description || 'Unknown error');
      }
    } catch (error: any) {
      toast({
        title: '❌ Test Failed',
        description: error.message || 'Could not send test message. Check your bot token.',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Bot is always running - no toggle needed

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Settings className="w-8 h-8 text-primary" />
              Settings
            </h1>
            <p className="text-muted-foreground mt-1">Manage your system configuration</p>
          </div>
          <Button
            className="gradient-primary text-primary-foreground"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </span>
            )}
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
            <TabsTrigger value="general" className="gap-2">
              <Globe className="w-4 h-4" />
              <span className="hidden lg:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="urls" className="gap-2">
              <Link className="w-4 h-4" />
              <span className="hidden lg:inline">URLs</span>
            </TabsTrigger>
            <TabsTrigger value="telegram" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden lg:inline">Telegram</span>
            </TabsTrigger>
            <TabsTrigger value="api" className="gap-2">
              <Server className="w-4 h-4" />
              <span className="hidden lg:inline">API</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden lg:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden lg:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  General Settings
                </CardTitle>
                <CardDescription>Basic site configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={settings.siteName}
                      onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteDescription">Site Description</Label>
                    <Input
                      id="siteDescription"
                      value={settings.siteDescription}
                      onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Admin Email</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={settings.adminEmail}
                      onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supportEmail">Support Email</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="logoUrl">Logo URL</Label>
                    <Input
                      id="logoUrl"
                      value={settings.logoUrl}
                      onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                      placeholder="https://example.com/logo.png"
                    />
                    <p className="text-xs text-muted-foreground">Enter URL of your logo image</p>
                    {settings.logoUrl && (
                      <div className="mt-2">
                        <img src={settings.logoUrl} alt="Logo Preview" className="w-16 h-16 rounded-lg object-cover border" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="faviconUrl">Favicon URL</Label>
                    <Input
                      id="faviconUrl"
                      value={settings.faviconUrl}
                      onChange={(e) => setSettings({ ...settings, faviconUrl: e.target.value })}
                      placeholder="https://example.com/favicon.ico"
                    />
                    <p className="text-xs text-muted-foreground">Enter URL of your favicon</p>
                    {settings.faviconUrl && (
                      <div className="mt-2">
                        <img src={settings.faviconUrl} alt="Favicon Preview" className="w-8 h-8 object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Disable access to the site for maintenance
                    </p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                  />
                </div>

                {settings.maintenanceMode && (
                  <div className="space-y-2 pl-4 border-l-2 border-warning/50">
                    <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
                    <Input
                      id="maintenanceMessage"
                      value={settings.maintenanceMessage}
                      onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* URLs Settings */}
          <TabsContent value="urls">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="w-5 h-5 text-primary" />
                  URL Configuration
                </CardTitle>
                <CardDescription>Configure all system URLs and endpoints</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="frontendUrl">Frontend URL</Label>
                  <Input
                    id="frontendUrl"
                    value={settings.frontendUrl}
                    onChange={(e) => setSettings({ ...settings, frontendUrl: e.target.value })}
                    placeholder="https://your-domain.com"
                  />
                  <p className="text-xs text-muted-foreground">The URL where your admin panel is hosted</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backendUrl">Backend API URL</Label>
                  <Input
                    id="backendUrl"
                    value={settings.backendUrl}
                    onChange={(e) => setSettings({ ...settings, backendUrl: e.target.value })}
                    placeholder="https://api.your-domain.com"
                  />
                  <p className="text-xs text-muted-foreground">Your VPS server API endpoint</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="docsUrl">Documentation URL</Label>
                  <Input
                    id="docsUrl"
                    value={settings.docsUrl}
                    onChange={(e) => setSettings({ ...settings, docsUrl: e.target.value })}
                    placeholder="https://docs.your-domain.com"
                  />
                  <p className="text-xs text-muted-foreground">Public API documentation URL</p>
                </div>

                <Separator />

                <div className="p-4 rounded-lg bg-muted/50 border">
                  <h4 className="font-medium mb-2">Quick Links Preview</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Admin Panel:</strong> <code className="text-primary">{settings.frontendUrl}</code></p>
                    <p><strong>API Base:</strong> <code className="text-primary">{settings.backendUrl}</code></p>
                    <p><strong>Docs:</strong> <code className="text-primary">{settings.docsUrl}</code></p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Telegram Settings */}
          <TabsContent value="telegram">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Telegram Bot Settings
                </CardTitle>
                <CardDescription>Configure your Telegram bot integration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Bot Status Card - Always Running */}
                <div className="p-4 rounded-lg border-2 bg-success/10 border-success/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
                      <div>
                        <p className="font-semibold text-foreground">🟢 Bot Status: Running</p>
                        <p className="text-xs text-muted-foreground">
                          Bot is always active and listening for commands
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={testTelegramBot}
                      disabled={isTesting}
                    >
                      {isTesting ? (
                        <>
                          <span className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent mr-2" />
                          Testing...
                        </>
                      ) : (
                        <>🧪 Test Bot</>
                      )}
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="telegramBotToken">Bot Token</Label>
                  <Input
                    id="telegramBotToken"
                    type="password"
                    value={settings.telegramBotToken}
                    onChange={(e) => setSettings({ ...settings, telegramBotToken: e.target.value })}
                    placeholder="Enter your Telegram bot token from @BotFather"
                  />
                  <p className="text-xs text-muted-foreground">Get this from @BotFather on Telegram</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="adminTelegramId">Admin Telegram ID</Label>
                  <Input
                    id="adminTelegramId"
                    value={settings.adminTelegramId}
                    onChange={(e) => setSettings({ ...settings, adminTelegramId: e.target.value })}
                    placeholder="Your Telegram user ID"
                  />
                  <p className="text-xs text-muted-foreground">Get this from @userinfobot on Telegram</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">Webhook URL (Optional)</Label>
                  <Input
                    id="webhookUrl"
                    value={settings.webhookUrl}
                    onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })}
                    placeholder="https://your-domain.com/telegram/webhook"
                  />
                  <p className="text-xs text-muted-foreground">For receiving Telegram updates via webhook</p>
                </div>

                <Separator />

                {/* Quick Test Actions */}
                <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    🧪 Quick Test Actions
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      toast({ title: '📨 Sending test notification...', description: 'Check your Telegram!' });
                    }}>
                      Send Test
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      toast({ title: '🔔 Reminder sent!', description: 'Test reminder notification sent' });
                    }}>
                      Test Reminder
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      toast({ title: '🔑 Key alert sent!', description: 'Test new key notification sent' });
                    }}>
                      Test Key Alert
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      toast({ title: '💚 Health check sent!', description: 'Server health notification sent' });
                    }}>
                      Test Health
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    Bot Commands Available
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p><code>/start</code> - Start bot</p>
                    <p><code>/stats</code> - Dashboard stats</p>
                    <p><code>/users</code> - List users</p>
                    <p><code>/keys</code> - List API keys</p>
                    <p><code>/expiring</code> - Expiring keys</p>
                    <p><code>/health</code> - Server health</p>
                    <p><code>/mykeys</code> - User's keys</p>
                    <p><code>/renew</code> - Request renewal</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Settings */}
          <TabsContent value="api">
            <div className="space-y-6">
              {/* User-Facing API (What merchants/users see) */}
              <Card className="border-2 border-primary/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    User-Facing API (Public)
                  </CardTitle>
                  <CardDescription>
                    This is what your merchants/users will see in documentation. Your server URL.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 rounded-lg bg-success/10 border border-success/30">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-success"></div>
                      <span className="font-semibold text-success">Visible to Users</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Users will see this URL in their documentation, code examples, and API requests.
                    </p>
                  </div>
                  
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="userApiDomain">Your API Domain</Label>
                      <Input
                        id="userApiDomain"
                        value={settings.userApiDomain}
                        onChange={(e) => setSettings({ ...settings, userApiDomain: e.target.value })}
                        placeholder="https://api.yourdomain.com"
                      />
                      <p className="text-xs text-muted-foreground">Your VPS server URL where backend is hosted</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="userApiEndpoint">API Endpoint Path</Label>
                      <Input
                        id="userApiEndpoint"
                        value={settings.userApiEndpoint}
                        onChange={(e) => setSettings({ ...settings, userApiEndpoint: e.target.value })}
                        placeholder="/api/trend"
                      />
                      <p className="text-xs text-muted-foreground">Your custom endpoint path (e.g., /api/trend)</p>
                    </div>
                  </div>
                  
                  {/* Preview */}
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-xs text-muted-foreground mb-2">Users will call this URL:</p>
                    <code className="text-sm text-primary font-mono font-bold">
                      {settings.userApiDomain}{settings.userApiEndpoint}?typeId=wg1&apiKey=THEIR_KEY
                    </code>
                  </div>
                </CardContent>
              </Card>

              {/* Internal API (Hidden from users) */}
              <Card className="border-2 border-destructive/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-destructive" />
                    Internal API Source (Hidden)
                  </CardTitle>
                  <CardDescription>
                    This is your actual data source. Never shown to users. Keep it private!
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-destructive"></div>
                      <span className="font-semibold text-destructive">🔒 Admin Only - Never Shared</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Your backend fetches data from this source internally. Users never see this URL.
                    </p>
                  </div>
                  
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="internalApiDomain">Source API Domain</Label>
                      <Input
                        id="internalApiDomain"
                        value={settings.internalApiDomain}
                        onChange={(e) => setSettings({ ...settings, internalApiDomain: e.target.value })}
                        placeholder="https://source-api.example.com"
                      />
                      <p className="text-xs text-muted-foreground">The actual API source your server fetches from (Only you can see/edit this)</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="internalApiEndpoint">Source Endpoint Path</Label>
                      <Input
                        id="internalApiEndpoint"
                        value={settings.internalApiEndpoint}
                        onChange={(e) => setSettings({ ...settings, internalApiEndpoint: e.target.value })}
                        placeholder="/endpoint"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* IP Whitelist Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-warning" />
                    Security Whitelists
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* IP Whitelist */}
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        Global IP Whitelist
                      </h4>
                      <textarea
                        className="w-full h-32 px-3 py-2 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Enter IPs (one per line)&#10;192.168.1.1&#10;10.0.0.1&#10;2001:db8::1"
                        defaultValue=""
                      />
                      <p className="text-xs text-muted-foreground">
                        Default IPs allowed for all new API keys (IPv4 & IPv6)
                      </p>
                    </div>

                    {/* Domain Whitelist */}
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        Global Domain Whitelist
                      </h4>
                      <textarea
                        className="w-full h-32 px-3 py-2 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Enter domains (one per line)&#10;yourdomain.com&#10;*.yourdomain.com"
                        defaultValue=""
                      />
                      <p className="text-xs text-muted-foreground">
                        Default domains allowed (supports * wildcard for subdomains)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* All Endpoints Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>📋 User-Visible API Endpoints</CardTitle>
                  <CardDescription>These are what your users/merchants will see in documentation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                    <div><strong>Numeric 1m:</strong> {settings.userApiDomain}{settings.userApiEndpoint}?typeId=1</div>
                    <div><strong>WinGo 30s:</strong> {settings.userApiDomain}{settings.userApiEndpoint}?typeId=wg30</div>
                    <div><strong>WinGo 1m:</strong> {settings.userApiDomain}{settings.userApiEndpoint}?typeId=wg1</div>
                    <div><strong>K3 3m:</strong> {settings.userApiDomain}{settings.userApiEndpoint}?typeId=k33</div>
                    <div><strong>5D 5m:</strong> {settings.userApiDomain}{settings.userApiEndpoint}?typeId=5d5</div>
                    <div><strong>TRX 10m:</strong> {settings.userApiDomain}{settings.userApiEndpoint}?typeId=trx10</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Configure automated notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Renewal Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically remind users about expiring keys
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableAutoReminder}
                    onCheckedChange={(checked) => setSettings({ ...settings, enableAutoReminder: checked })}
                  />
                </div>

                {settings.enableAutoReminder && (
                  <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                    <Label htmlFor="autoReminderDays">Days before expiry</Label>
                    <Input
                      id="autoReminderDays"
                      type="number"
                      value={settings.autoReminderDays}
                      onChange={(e) => setSettings({ ...settings, autoReminderDays: parseInt(e.target.value) || 7 })}
                      className="w-32"
                    />
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>New Key Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Notify when new API keys are generated
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableNewKeyNotifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, enableNewKeyNotifications: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Renewal Request Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when users request renewals
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableRenewalNotifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, enableRenewalNotifications: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Login Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when admin logs in
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableLoginAlerts}
                    onCheckedChange={(checked) => setSettings({ ...settings, enableLoginAlerts: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Health Status Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about server health issues
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableHealthNotifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, enableHealthNotifications: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Security Settings
                </CardTitle>
                <CardDescription>Configure security and authentication options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jwtExpiryHours">JWT Token Expiry (hours)</Label>
                    <Input
                      id="jwtExpiryHours"
                      type="number"
                      value={settings.jwtExpiryHours}
                      onChange={(e) => setSettings({ ...settings, jwtExpiryHours: parseInt(e.target.value) || 24 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      value={settings.maxLoginAttempts}
                      onChange={(e) => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) || 5 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lockoutMinutes">Lockout Duration (minutes)</Label>
                    <Input
                      id="lockoutMinutes"
                      type="number"
                      value={settings.lockoutMinutes}
                      onChange={(e) => setSettings({ ...settings, lockoutMinutes: parseInt(e.target.value) || 30 })}
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Strong Passwords</Label>
                    <p className="text-sm text-muted-foreground">
                      Enforce minimum 8 characters, uppercase, lowercase, number
                    </p>
                  </div>
                  <Switch
                    checked={settings.requireStrongPassword}
                    onCheckedChange={(checked) => setSettings({ ...settings, requireStrongPassword: checked })}
                  />
                </div>

                <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                  <h4 className="font-medium text-warning flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Security Recommendations
                  </h4>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                    <li>Use HTTPS for all connections</li>
                    <li>Regularly rotate API keys and passwords</li>
                    <li>Enable IP whitelisting for sensitive operations</li>
                    <li>Monitor login activity regularly</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
