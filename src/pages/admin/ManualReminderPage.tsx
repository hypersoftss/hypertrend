import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useApiData } from '@/contexts/ApiDataContext';
import { formatDate, getDaysUntilExpiry } from '@/lib/mockData';
import { Bell, Send, Clock, Key, User } from 'lucide-react';

const ManualReminderPage = () => {
  const { apiKeys, users } = useApiData();
  const [selectedKey, setSelectedKey] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const activeKeys = apiKeys.filter(k => k.isActive);

  const selectedKeyData = activeKeys.find(k => k.id === selectedKey);
  const selectedUser = selectedKeyData ? users.find(u => u.id === selectedKeyData.userId) : null;

  const handleSendReminder = async () => {
    if (!selectedKey) {
      toast({ title: 'Error', description: 'Please select an API key', variant: 'destructive' });
      return;
    }

    setIsSending(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: '📤 Reminder Sent!',
      description: `Reminder sent to ${selectedUser?.telegramId || 'user'}`,
    });

    setIsSending(false);
    setSelectedKey('');
    setCustomMessage('');
  };

  const generatePreview = () => {
    if (!selectedKeyData || !selectedUser) return '';

    const daysLeft = getDaysUntilExpiry(selectedKeyData.expiresAt);
    
    return `📤 📝 MANUAL REMINDER SENT

📋 Reminder Details:
├─ 🔑 API Key: ${selectedKeyData.key.substring(0, 20)}...
├─ 🌐 Domain: ${selectedKeyData.domain}
├─ 📅 Expires: ${formatDate(selectedKeyData.expiresAt, false)}
├─ ⏰ Days Left: ${daysLeft}
├─ 👤 Client TG ID: ${selectedUser.telegramId || 'N/A'}
└─ 🛠️ Sent by: ADMIN

${customMessage ? `\n💬 Message:\n${customMessage}` : ''}

🕒 Time: ${formatDate(new Date().toISOString())}

Manual customer engagement 🎯`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Bell className="w-8 h-8 text-primary" />
            Manual Reminder
          </h1>
          <p className="text-muted-foreground mt-1">Send renewal reminders to users via Telegram</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Send Form */}
          <Card>
            <CardHeader>
              <CardTitle>Send Reminder</CardTitle>
              <CardDescription>Select an API key and send a reminder to the user</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Select API Key</label>
                <Select value={selectedKey} onValueChange={setSelectedKey}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an API key" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeKeys.map((key) => {
                      const user = users.find(u => u.id === key.userId);
                      const daysLeft = getDaysUntilExpiry(key.expiresAt);
                      return (
                        <SelectItem key={key.id} value={key.id}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{user?.username}</span>
                            <span className="text-muted-foreground">-</span>
                            <span className="uppercase">{key.gameType}</span>
                            <span className="text-muted-foreground">({daysLeft} days left)</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {selectedKeyData && selectedUser && (
                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{selectedUser.username}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-mono text-muted-foreground truncate">
                      {selectedKeyData.key.substring(0, 30)}...
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Expires: {formatDate(selectedKeyData.expiresAt, false)} ({getDaysUntilExpiry(selectedKeyData.expiresAt)} days left)
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Custom Message (Optional)</label>
                <Textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Add a custom message to include in the reminder..."
                  rows={4}
                />
              </div>

              <Button
                className="w-full gradient-primary text-primary-foreground"
                onClick={handleSendReminder}
                disabled={!selectedKey || isSending}
              >
                {isSending ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Send Reminder
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Message Preview</CardTitle>
              <CardDescription>This is how the message will look on Telegram</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedKeyData ? (
                <div className="p-4 rounded-lg bg-[#0f1419] text-green-400 font-mono text-sm whitespace-pre-wrap overflow-x-auto">
                  {generatePreview()}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select an API key to preview the message</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Send */}
        <Card>
          <CardHeader>
            <CardTitle>Keys Expiring Soon</CardTitle>
            <CardDescription>Quick send reminders to users with keys expiring in 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeKeys
                .filter(k => getDaysUntilExpiry(k.expiresAt) <= 7 && getDaysUntilExpiry(k.expiresAt) > 0)
                .map((key) => {
                  const user = users.find(u => u.id === key.userId);
                  const daysLeft = getDaysUntilExpiry(key.expiresAt);
                  return (
                    <div
                      key={key.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-warning/10 border border-warning/20"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-warning/20">
                          <Clock className="w-5 h-5 text-warning" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{user?.username}</p>
                          <p className="text-sm text-muted-foreground">
                            {key.domain} • {key.gameType.toUpperCase()} • {daysLeft} days left
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedKey(key.id)}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Remind
                      </Button>
                    </div>
                  );
                })}

              {activeKeys.filter(k => getDaysUntilExpiry(k.expiresAt) <= 7 && getDaysUntilExpiry(k.expiresAt) > 0).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No keys expiring soon!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ManualReminderPage;
