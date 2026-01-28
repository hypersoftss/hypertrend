import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Settings, Save, Globe, Mail, MessageSquare, Bell, Key, Upload, Link, Server, Database, Shield, Palette } from 'lucide-react';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    // General
    siteName: 'Hyper Softs Trend',
    siteDescription: 'Professional API Management System',
    adminEmail: 'admin@hypersofts.com',
    supportEmail: 'support@hypersofts.com',
    
    // URLs
    frontendUrl: 'https://hyper-softs-trend.lovable.app',
    backendUrl: 'https://api.hypersofts.com',
    docsUrl: 'https://docs.hypersofts.com',
    
    // Telegram
    telegramBotToken: '',
    adminTelegramId: '6596742955',
    webhookUrl: '',
    
    // API
    betApiKey: '',
    betApiBaseUrl: 'https://betapi.space/api',
    rateLimitPerMinute: 100,
    rateLimitPerDay: 10000,
    
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
  const { toast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: '✅ Settings Saved',
      description: 'Your settings have been updated successfully',
    });
    setIsSaving(false);
  };

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

                <div className="space-y-2">
                  <Label htmlFor="logo">Site Logo</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-2 border-dashed border-primary/30">
                      <Upload className="w-8 h-8 text-primary/50" />
                    </div>
                    <div className="space-y-2">
                      <Button variant="outline">Upload Logo</Button>
                      <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB</p>
                    </div>
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
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Input
                    id="webhookUrl"
                    value={settings.webhookUrl}
                    onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })}
                    placeholder="https://your-domain.com/telegram/webhook"
                  />
                  <p className="text-xs text-muted-foreground">For receiving Telegram updates (optional)</p>
                </div>

                <Separator />

                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    Bot Commands Available
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p><code>/stats</code> - Dashboard stats</p>
                    <p><code>/users</code> - List users</p>
                    <p><code>/keys</code> - List API keys</p>
                    <p><code>/expiring</code> - Expiring keys</p>
                    <p><code>/health</code> - Server health</p>
                    <p><code>/help</code> - All commands</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Settings */}
          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-primary" />
                  API Configuration
                </CardTitle>
                <CardDescription>BetAPI connection and rate limiting settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="betApiBaseUrl">BetAPI Base URL</Label>
                  <Input
                    id="betApiBaseUrl"
                    value={settings.betApiBaseUrl}
                    onChange={(e) => setSettings({ ...settings, betApiBaseUrl: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="betApiKey">BetAPI Key</Label>
                  <Input
                    id="betApiKey"
                    type="password"
                    value={settings.betApiKey}
                    onChange={(e) => setSettings({ ...settings, betApiKey: e.target.value })}
                    placeholder="Enter your BetAPI key"
                  />
                </div>

                <Separator />

                <h4 className="font-medium">Rate Limiting</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rateLimitPerMinute">Requests per Minute</Label>
                    <Input
                      id="rateLimitPerMinute"
                      type="number"
                      value={settings.rateLimitPerMinute}
                      onChange={(e) => setSettings({ ...settings, rateLimitPerMinute: parseInt(e.target.value) || 100 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rateLimitPerDay">Requests per Day</Label>
                    <Input
                      id="rateLimitPerDay"
                      type="number"
                      value={settings.rateLimitPerDay}
                      onChange={(e) => setSettings({ ...settings, rateLimitPerDay: parseInt(e.target.value) || 10000 })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
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
