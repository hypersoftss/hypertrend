import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { mockApiKeys, mockApiLogs, formatDate, getDaysUntilExpiry, isExpired, formatDateTime } from '@/lib/mockData';
import { Key, Copy, RefreshCw, Clock, Globe, Activity, Send, CheckCircle, XCircle, Shield, TrendingUp, History, Heart, AlertTriangle } from 'lucide-react';

const UserKeysPage = () => {
  const { user } = useAuth();
  const [renewalMessage, setRenewalMessage] = useState('');
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const userKeys = mockApiKeys.filter(k => k.userId === user?.id);
  
  // Get user's API call logs (based on their keys)
  const userKeyIds = userKeys.map(k => k.id);
  const userLogs = mockApiLogs.filter(log => userKeyIds.includes(log.apiKeyId)).slice(0, 50);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: 'API key copied to clipboard' });
  };

  const handleRenewalRequest = () => {
    if (!selectedKeyId) return;

    toast({
      title: '📤 Renewal Request Sent!',
      description: 'Admin will be notified about your renewal request via Telegram',
    });

    setIsDialogOpen(false);
    setRenewalMessage('');
    setSelectedKeyId(null);
  };

  const getStatusBadge = (key: typeof userKeys[0]) => {
    if (isExpired(key.expiresAt)) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    const days = getDaysUntilExpiry(key.expiresAt);
    if (days <= 7) {
      return <Badge className="bg-warning text-warning-foreground">Expiring Soon</Badge>;
    }
    return key.isActive 
      ? <Badge className="bg-success text-success-foreground">Active</Badge> 
      : <Badge variant="secondary">Disabled</Badge>;
  };

  const getKeyHealth = (key: typeof userKeys[0]) => {
    const isExp = isExpired(key.expiresAt);
    const daysLeft = getDaysUntilExpiry(key.expiresAt);
    
    if (isExp || !key.isActive) {
      return { status: 'critical', color: 'text-destructive', bg: 'bg-destructive/10', icon: XCircle, label: 'Inactive' };
    }
    if (daysLeft <= 3) {
      return { status: 'warning', color: 'text-destructive', bg: 'bg-destructive/10', icon: AlertTriangle, label: 'Critical' };
    }
    if (daysLeft <= 7) {
      return { status: 'warning', color: 'text-warning', bg: 'bg-warning/10', icon: AlertTriangle, label: 'Warning' };
    }
    return { status: 'healthy', color: 'text-success', bg: 'bg-success/10', icon: Heart, label: 'Healthy' };
  };

  // Calculate success rate for user's logs
  const successfulCalls = userLogs.filter(l => l.status === 'success').length;
  const totalCalls = userLogs.length;
  const successRate = totalCalls > 0 ? ((successfulCalls / totalCalls) * 100).toFixed(1) : '0';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Key className="w-8 h-8 text-primary" />
            My API Keys
          </h1>
          <p className="text-muted-foreground mt-1">Manage your API keys, view usage logs, and check health</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg gradient-primary">
                <Key className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {userKeys.filter(k => k.isActive && !isExpired(k.expiresAt)).length}
                </p>
                <p className="text-sm text-muted-foreground">Active Keys</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg gradient-accent">
                <Activity className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {userKeys.reduce((sum, k) => sum + k.totalCalls, 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total API Calls</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-success">
                <TrendingUp className="w-6 h-6 text-success-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{successRate}%</p>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-warning">
                <Clock className="w-6 h-6 text-warning-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {userKeys.filter(k => getDaysUntilExpiry(k.expiresAt) <= 7 && getDaysUntilExpiry(k.expiresAt) > 0).length}
                </p>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="keys" className="space-y-6">
          <TabsList>
            <TabsTrigger value="keys" className="gap-2">
              <Key className="w-4 h-4" />
              My Keys
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-2">
              <History className="w-4 h-4" />
              API Call Logs
            </TabsTrigger>
          </TabsList>

          {/* Keys Tab */}
          <TabsContent value="keys" className="space-y-4">
            {userKeys.map((key) => {
              const health = getKeyHealth(key);
              const HealthIcon = health.icon;
              
              return (
                <Card key={key.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col lg:flex-row">
                      {/* Key Info */}
                      <div className="flex-1 p-6 space-y-4">
                        <div className="flex items-start justify-between flex-wrap gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className="uppercase text-sm">{key.gameType}</Badge>
                              <Badge variant="outline">{key.duration}</Badge>
                              {getStatusBadge(key)}
                            </div>
                          </div>
                          
                          {/* Health Indicator */}
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${health.bg}`}>
                            <HealthIcon className={`w-4 h-4 ${health.color}`} />
                            <span className={`text-sm font-medium ${health.color}`}>{health.label}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <code className="text-sm font-mono bg-muted px-3 py-2 rounded-lg text-foreground flex-1 min-w-0 truncate">
                            {key.key}
                          </code>
                          <Button variant="outline" size="icon" onClick={() => copyToClipboard(key.key)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Globe className="w-4 h-4" />
                            <span>{key.domain}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Shield className="w-4 h-4" />
                            <span>{key.ipWhitelist[0] || 'No IP'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Activity className="w-4 h-4" />
                            <span>{key.totalCalls.toLocaleString()} calls</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <RefreshCw className="w-4 h-4" />
                            <span>Last: {key.lastUsed ? formatDate(key.lastUsed) : 'Never'}</span>
                          </div>
                        </div>

                        {/* Expiry Progress */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Created: {formatDate(key.createdAt)}</span>
                            <span className={getDaysUntilExpiry(key.expiresAt) <= 7 ? 'text-warning font-medium' : 'text-muted-foreground'}>
                              {getDaysUntilExpiry(key.expiresAt)} days left
                            </span>
                            <span className="text-muted-foreground">Expires: {formatDate(key.expiresAt)}</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all ${
                                getDaysUntilExpiry(key.expiresAt) <= 3 ? 'bg-destructive' :
                                getDaysUntilExpiry(key.expiresAt) <= 7 ? 'bg-warning' : 'bg-success'
                              }`}
                              style={{ 
                                width: `${Math.max(0, Math.min(100, (getDaysUntilExpiry(key.expiresAt) / 30) * 100))}%` 
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex lg:flex-col justify-end gap-2 p-6 bg-muted/30 lg:border-l border-t lg:border-t-0">
                        <Dialog open={isDialogOpen && selectedKeyId === key.id} onOpenChange={(open) => {
                          setIsDialogOpen(open);
                          if (!open) setSelectedKeyId(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => setSelectedKeyId(key.id)}
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Request Renewal
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Request Key Renewal</DialogTitle>
                              <DialogDescription>
                                Send a renewal request to the admin via Telegram
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="p-4 rounded-lg bg-muted/50 space-y-2 text-sm">
                                <p><strong>Game Type:</strong> {key.gameType.toUpperCase()}</p>
                                <p><strong>Domain:</strong> {key.domain}</p>
                                <p><strong>Current Expiry:</strong> {formatDate(key.expiresAt)}</p>
                                <p><strong>Days Remaining:</strong> {getDaysUntilExpiry(key.expiresAt)} days</p>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Message (Optional)</label>
                                <Textarea
                                  value={renewalMessage}
                                  onChange={(e) => setRenewalMessage(e.target.value)}
                                  placeholder="Add a message for the admin..."
                                  rows={3}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleRenewalRequest} className="gradient-primary text-primary-foreground">
                                <Send className="w-4 h-4 mr-2" />
                                Send Request
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {userKeys.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Key className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">You don't have any API keys yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Contact admin to get your first API key</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* API Logs Tab */}
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  Recent API Calls
                </CardTitle>
                <CardDescription>Your last 50 API requests</CardDescription>
              </CardHeader>
              <CardContent>
                {userLogs.length > 0 ? (
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Time</TableHead>
                          <TableHead>Endpoint</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Response Time</TableHead>
                          <TableHead>IP Address</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-mono text-xs">
                              {formatDateTime(log.createdAt)}
                            </TableCell>
                            <TableCell>
                              <code className="text-xs bg-muted px-2 py-1 rounded">{log.endpoint}</code>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                className={log.status === 'success' ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'}
                              >
                                {log.status === 'success' ? '200' : log.status === 'blocked' ? '403' : '500'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {log.responseTime}ms
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              {log.ip}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <History className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No API calls recorded yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Your API usage will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default UserKeysPage;
