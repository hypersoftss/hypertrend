import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Settings, Save, Globe, Mail, MessageSquare, Bell, Key, Upload } from 'lucide-react';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    siteName: 'Hyper Softs Trend',
    adminEmail: 'admin@hypersofts.com',
    telegramBotToken: '',
    adminTelegramId: '6596742955',
    webhookUrl: '',
    betApiKey: '',
    autoReminderDays: 7,
    enableAutoReminder: true,
    enableLoginAlerts: true,
    enableHealthNotifications: true,
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

        <div className="grid gap-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                General Settings
              </CardTitle>
              <CardDescription>Basic site configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <Label htmlFor="adminEmail">Admin Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo">Site Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <Button variant="outline">Upload Logo</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Telegram Settings */}
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
                  placeholder="Enter your Telegram bot token"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminTelegramId">Admin Telegram ID</Label>
                <Input
                  id="adminTelegramId"
                  value={settings.adminTelegramId}
                  onChange={(e) => setSettings({ ...settings, adminTelegramId: e.target.value })}
                  placeholder="Your Telegram user ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  value={settings.webhookUrl}
                  onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })}
                  placeholder="https://your-domain.com/webhook"
                />
              </div>
            </CardContent>
          </Card>

          {/* API Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" />
                API Configuration
              </CardTitle>
              <CardDescription>BetAPI connection settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          {/* Notification Settings */}
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
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
