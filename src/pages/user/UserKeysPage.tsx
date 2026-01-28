import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useConfig } from '@/contexts/ConfigContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { mockApiKeys, mockApiLogs, formatDate, getDaysUntilExpiry, isExpired, formatDateTime } from '@/lib/mockData';
import { 
  Key, Copy, RefreshCw, Clock, Globe, Activity, Send, CheckCircle, XCircle, Shield, 
  TrendingUp, History, Heart, AlertTriangle, Eye, EyeOff, BarChart3, Zap, Timer,
  ArrowUpRight, ArrowDownRight, Server, Database
} from 'lucide-react';

const UserKeysPage = () => {
  const { user } = useAuth();
  const { config } = useConfig();
  const [renewalMessage, setRenewalMessage] = useState('');
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const userKeys = mockApiKeys.filter(k => k.userId === user?.id);
  
  // Get user's API call logs (based on their keys)
  const userKeyIds = userKeys.map(k => k.id);
  const userLogs = mockApiLogs.filter(log => userKeyIds.includes(log.apiKeyId)).slice(0, 100);

  // Calculate statistics per key
  const getKeyStats = (keyId: string) => {
    const keyLogs = mockApiLogs.filter(l => l.apiKeyId === keyId);
    const successCount = keyLogs.filter(l => l.status === 'success').length;
    const errorCount = keyLogs.filter(l => l.status === 'error').length;
    const blockedCount = keyLogs.filter(l => l.status === 'blocked').length;
    const total = keyLogs.length;
    const avgResponseTime = total > 0 
      ? Math.round(keyLogs.reduce((sum, l) => sum + l.responseTime, 0) / total)
      : 0;
    const successRate = total > 0 ? ((successCount / total) * 100).toFixed(1) : '0';
    
    return { successCount, errorCount, blockedCount, total, avgResponseTime, successRate };
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: '📋 Copied!', description: 'API key copied to clipboard' });
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
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
      return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" /> Expired</Badge>;
    }
    const days = getDaysUntilExpiry(key.expiresAt);
    if (days <= 7) {
      return <Badge className="bg-warning text-warning-foreground gap-1"><AlertTriangle className="w-3 h-3" /> Expiring Soon</Badge>;
    }
    return key.isActive 
      ? <Badge className="bg-success text-success-foreground gap-1"><CheckCircle className="w-3 h-3" /> Active</Badge>
      : <Badge variant="secondary">Disabled</Badge>;
  };

  const getKeyHealth = (key: typeof userKeys[0]) => {
    const isExp = isExpired(key.expiresAt);
    const daysLeft = getDaysUntilExpiry(key.expiresAt);
    
    if (isExp || !key.isActive) {
      return { status: 'critical', color: 'text-destructive', bg: 'bg-destructive/10', icon: XCircle, label: 'Inactive', percentage: 0 };
    }
    if (daysLeft <= 3) {
      return { status: 'warning', color: 'text-destructive', bg: 'bg-destructive/10', icon: AlertTriangle, label: 'Critical', percentage: 15 };
    }
    if (daysLeft <= 7) {
      return { status: 'warning', color: 'text-warning', bg: 'bg-warning/10', icon: AlertTriangle, label: 'Warning', percentage: 40 };
    }
    return { status: 'healthy', color: 'text-success', bg: 'bg-success/10', icon: Heart, label: 'Healthy', percentage: 100 };
  };

  // Calculate overall success rate for user's logs
  const successfulCalls = userLogs.filter(l => l.status === 'success').length;
  const totalCalls = userLogs.length;
  const successRate = totalCalls > 0 ? ((successfulCalls / totalCalls) * 100).toFixed(1) : '0';
  const avgResponseTime = totalCalls > 0 
    ? Math.round(userLogs.reduce((sum, l) => sum + l.responseTime, 0) / totalCalls)
    : 0;

  // API Base URL for documentation
  const apiBaseUrl = `${config.userApiDomain}${config.userApiEndpoint}`;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Key className="w-8 h-8 text-primary" />
              My API Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">Manage your API keys, monitor usage, and track performance</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm px-3 py-1">
              <Server className="w-4 h-4 mr-2" />
              {config.siteName}
            </Badge>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="gradient-primary text-primary-foreground">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary-foreground/20">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {userKeys.filter(k => k.isActive && !isExpired(k.expiresAt)).length}
                  </p>
                  <p className="text-xs opacity-90">Active Keys</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/20">
                  <Activity className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {userKeys.reduce((sum, k) => sum + k.totalCalls, 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Calls</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/20">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{successRate}%</p>
                  <p className="text-xs text-muted-foreground">Success Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Timer className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{avgResponseTime}ms</p>
                  <p className="text-xs text-muted-foreground">Avg Response</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/20">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {userKeys.filter(k => getDaysUntilExpiry(k.expiresAt) <= 7 && getDaysUntilExpiry(k.expiresAt) > 0).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Expiring Soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="keys" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="keys" className="gap-2">
              <Key className="w-4 h-4" />
              My Keys
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-2">
              <History className="w-4 h-4" />
              Call Logs
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Keys Tab */}
          <TabsContent value="keys" className="space-y-4">
            {userKeys.map((key) => {
              const health = getKeyHealth(key);
              const HealthIcon = health.icon;
              const stats = getKeyStats(key.id);
              const keyVisible = showKeys[key.id];
              
              return (
                <Card key={key.id} className="overflow-hidden border-2 hover:border-primary/30 transition-colors">
                  <CardContent className="p-0">
                    <div className="flex flex-col lg:flex-row">
                      {/* Key Info */}
                      <div className="flex-1 p-6 space-y-5">
                        {/* Header */}
                        <div className="flex items-start justify-between flex-wrap gap-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="uppercase text-sm font-bold">{key.gameType}</Badge>
                            <Badge variant="outline">{key.duration}</Badge>
                            {getStatusBadge(key)}
                          </div>
                          
                          {/* Health Indicator */}
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${health.bg}`}>
                            <HealthIcon className={`w-4 h-4 ${health.color}`} />
                            <span className={`text-sm font-medium ${health.color}`}>{health.label}</span>
                          </div>
                        </div>

                        {/* API Key with visibility toggle */}
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">API Key</label>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 text-sm font-mono bg-muted px-4 py-3 rounded-lg text-foreground truncate border">
                              {keyVisible ? key.key : '•'.repeat(48)}
                            </code>
                            <Button variant="outline" size="icon" onClick={() => toggleKeyVisibility(key.id)}>
                              {keyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => copyToClipboard(key.key)}>
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Key Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-3 rounded-lg bg-muted/50 border">
                            <p className="text-xs text-muted-foreground">Domain</p>
                            <p className="font-mono text-sm font-medium text-foreground truncate">{key.domain}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/50 border">
                            <p className="text-xs text-muted-foreground">IP Whitelist</p>
                            <p className="font-mono text-sm font-medium text-foreground">{key.ipWhitelist[0] || 'N/A'}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/50 border">
                            <p className="text-xs text-muted-foreground">Total Calls</p>
                            <p className="text-lg font-bold text-foreground">{key.totalCalls.toLocaleString()}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/50 border">
                            <p className="text-xs text-muted-foreground">Last Used</p>
                            <p className="text-sm font-medium text-foreground">{key.lastUsed ? formatDate(key.lastUsed, false) : 'Never'}</p>
                          </div>
                        </div>

                        {/* Mini Stats */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-success/10 border border-success/20">
                            <ArrowUpRight className="w-4 h-4 text-success" />
                            <div>
                              <p className="text-lg font-bold text-success">{stats.successCount}</p>
                              <p className="text-[10px] text-muted-foreground">Success</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 border border-destructive/20">
                            <ArrowDownRight className="w-4 h-4 text-destructive" />
                            <div>
                              <p className="text-lg font-bold text-destructive">{stats.errorCount}</p>
                              <p className="text-[10px] text-muted-foreground">Errors</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-warning/10 border border-warning/20">
                            <Shield className="w-4 h-4 text-warning" />
                            <div>
                              <p className="text-lg font-bold text-warning">{stats.blockedCount}</p>
                              <p className="text-[10px] text-muted-foreground">Blocked</p>
                            </div>
                          </div>
                        </div>

                        {/* Expiry Progress */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Created: {formatDate(key.createdAt, false)}</span>
                            <span className={getDaysUntilExpiry(key.expiresAt) <= 7 ? 'text-warning font-bold' : 'text-muted-foreground'}>
                              {getDaysUntilExpiry(key.expiresAt)} days remaining
                            </span>
                            <span className="text-muted-foreground">Expires: {formatDate(key.expiresAt, false)}</span>
                          </div>
                          <Progress 
                            value={Math.max(0, Math.min(100, (getDaysUntilExpiry(key.expiresAt) / key.validityDays) * 100))}
                            className={`h-2 ${
                              getDaysUntilExpiry(key.expiresAt) <= 3 ? '[&>div]:bg-destructive' :
                              getDaysUntilExpiry(key.expiresAt) <= 7 ? '[&>div]:bg-warning' : '[&>div]:bg-success'
                            }`}
                          />
                        </div>

                        {/* API Endpoint */}
                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                          <p className="text-xs text-muted-foreground mb-1">Your API Endpoint:</p>
                          <code className="text-xs font-mono text-primary break-all">
                            {apiBaseUrl}?typeId={key.gameType === 'wingo' ? 'wg1' : key.gameType === 'k3' ? 'k31' : key.gameType === '5d' ? '5d1' : key.gameType === 'trx' ? 'trx1' : '1'}&apiKey={keyVisible ? key.key : '***'}
                          </code>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex lg:flex-col justify-end gap-2 p-6 bg-muted/30 lg:border-l border-t lg:border-t-0 min-w-[180px]">
                        <Dialog open={isDialogOpen && selectedKeyId === key.id} onOpenChange={(open) => {
                          setIsDialogOpen(open);
                          if (!open) setSelectedKeyId(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="default"
                              className="w-full gradient-primary text-primary-foreground"
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
                <CardContent className="py-16 text-center">
                  <Key className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No API Keys Yet</h3>
                  <p className="text-muted-foreground">Contact admin to get your first API key</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* API Logs Tab */}
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <History className="w-5 h-5 text-primary" />
                      API Call Logs
                    </CardTitle>
                    <CardDescription>Your recent API requests (last 100)</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-sm">
                    {userLogs.length} Records
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {userLogs.length > 0 ? (
                  <div className="rounded-lg border overflow-hidden">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="w-[160px]">Timestamp</TableHead>
                            <TableHead>Endpoint</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Response</TableHead>
                            <TableHead>IP Address</TableHead>
                            <TableHead>Domain</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {userLogs.map((log) => (
                            <TableRow key={log.id} className="hover:bg-muted/30">
                              <TableCell className="font-mono text-xs">
                                {formatDateTime(log.createdAt)}
                              </TableCell>
                              <TableCell>
                                <code className="text-xs bg-muted px-2 py-1 rounded font-mono">{log.endpoint}</code>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  className={
                                    log.status === 'success' ? 'bg-success text-success-foreground' : 
                                    log.status === 'blocked' ? 'bg-warning text-warning-foreground' :
                                    'bg-destructive text-destructive-foreground'
                                  }
                                >
                                  {log.status === 'success' ? '200 OK' : log.status === 'blocked' ? '403 Blocked' : '500 Error'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <span className={`font-mono text-sm ${
                                  log.responseTime < 50 ? 'text-success' :
                                  log.responseTime < 100 ? 'text-warning' : 'text-destructive'
                                }`}>
                                  {log.responseTime}ms
                                </span>
                              </TableCell>
                              <TableCell className="font-mono text-xs text-muted-foreground">
                                {log.ip}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {log.domain}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <History className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">No API Calls Yet</h3>
                    <p className="text-muted-foreground">Your API usage will appear here once you start making requests</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid gap-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Requests</p>
                        <p className="text-3xl font-bold text-foreground">{totalCalls}</p>
                      </div>
                      <Database className="w-10 h-10 text-primary opacity-50" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Success Rate</p>
                        <p className="text-3xl font-bold text-success">{successRate}%</p>
                      </div>
                      <CheckCircle className="w-10 h-10 text-success opacity-50" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Response Time</p>
                        <p className="text-3xl font-bold text-foreground">{avgResponseTime}ms</p>
                      </div>
                      <Zap className="w-10 h-10 text-warning opacity-50" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Active Keys</p>
                        <p className="text-3xl font-bold text-foreground">{userKeys.filter(k => k.isActive).length}</p>
                      </div>
                      <Key className="w-10 h-10 text-primary opacity-50" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Per-Key Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance by API Key</CardTitle>
                  <CardDescription>Detailed statistics for each of your API keys</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userKeys.map((key) => {
                      const stats = getKeyStats(key.id);
                      return (
                        <div key={key.id} className="p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Badge className="uppercase">{key.gameType}</Badge>
                              <span className="text-sm text-muted-foreground">{key.domain}</span>
                            </div>
                            <Badge variant="outline">{stats.total} calls</Badge>
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-center">
                            <div>
                              <p className="text-2xl font-bold text-success">{stats.successCount}</p>
                              <p className="text-xs text-muted-foreground">Success</p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-destructive">{stats.errorCount}</p>
                              <p className="text-xs text-muted-foreground">Errors</p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-warning">{stats.blockedCount}</p>
                              <p className="text-xs text-muted-foreground">Blocked</p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-foreground">{stats.avgResponseTime}ms</p>
                              <p className="text-xs text-muted-foreground">Avg Time</p>
                            </div>
                          </div>
                          <div className="mt-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Success Rate</span>
                              <span className="font-medium">{stats.successRate}%</span>
                            </div>
                            <Progress value={parseFloat(stats.successRate)} className="h-2 [&>div]:bg-success" />
                          </div>
                        </div>
                      );
                    })}

                    {userKeys.length === 0 && (
                      <div className="py-8 text-center text-muted-foreground">
                        No API keys to analyze
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default UserKeysPage;