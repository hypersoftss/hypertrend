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
      return <Badge variant="destructive" className="gap-1 text-xs"><XCircle className="w-3 h-3" /> Expired</Badge>;
    }
    const days = getDaysUntilExpiry(key.expiresAt);
    if (days <= 7) {
      return <Badge className="bg-warning text-warning-foreground gap-1 text-xs"><AlertTriangle className="w-3 h-3" /> Expiring</Badge>;
    }
    return key.isActive 
      ? <Badge className="bg-success text-success-foreground gap-1 text-xs"><CheckCircle className="w-3 h-3" /> Active</Badge>
      : <Badge variant="secondary" className="text-xs">Disabled</Badge>;
  };

  const getKeyHealth = (key: typeof userKeys[0]) => {
    const isExp = isExpired(key.expiresAt);
    const daysLeft = getDaysUntilExpiry(key.expiresAt);
    
    if (isExp || !key.isActive) {
      return { status: 'critical', color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/30', icon: XCircle, label: 'Inactive' };
    }
    if (daysLeft <= 3) {
      return { status: 'warning', color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/30', icon: AlertTriangle, label: 'Critical' };
    }
    if (daysLeft <= 7) {
      return { status: 'warning', color: 'text-warning', bg: 'bg-warning/10 border-warning/30', icon: AlertTriangle, label: 'Warning' };
    }
    return { status: 'healthy', color: 'text-success', bg: 'bg-success/10 border-success/30', icon: Heart, label: 'Healthy' };
  };

  // Game type colors
  const getGameTypeColor = (gameType: string) => {
    const colors: Record<string, string> = {
      wingo: 'bg-purple-500',
      k3: 'bg-blue-500',
      '5d': 'bg-green-500',
      trx: 'bg-orange-500',
      numeric: 'bg-pink-500'
    };
    return colors[gameType.toLowerCase()] || 'bg-primary';
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
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2 sm:gap-3">
              <Key className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              My API Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your API keys, monitor usage, and track performance</p>
          </div>
          <Badge variant="outline" className="text-xs sm:text-sm px-3 py-1.5 w-fit">
            <Server className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
            {config.siteName}
          </Badge>
        </div>

        {/* Stats Overview - Horizontal scroll on mobile */}
        <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex sm:grid sm:grid-cols-5 gap-3 min-w-max sm:min-w-0">
            {/* Active Keys - Primary gradient */}
            <Card className="gradient-primary text-primary-foreground min-w-[140px] sm:min-w-0">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-white/20">
                    <Key className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold">
                      {userKeys.filter(k => k.isActive && !isExpired(k.expiresAt)).length}
                    </p>
                    <p className="text-[10px] sm:text-xs opacity-90">Active Keys</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Calls */}
            <Card className="glass min-w-[140px] sm:min-w-0">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-accent/20">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">
                      {userKeys.reduce((sum, k) => sum + k.totalCalls, 0).toLocaleString()}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Total Calls</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Success Rate */}
            <Card className="glass min-w-[140px] sm:min-w-0">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-success/20">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">{successRate}%</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Success Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Avg Response */}
            <Card className="glass min-w-[140px] sm:min-w-0">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-warning/20">
                    <Timer className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">{avgResponseTime}ms</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Avg Response</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expiring Soon */}
            <Card className="glass min-w-[140px] sm:min-w-0">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-muted">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">
                      {userKeys.filter(k => getDaysUntilExpiry(k.expiresAt) <= 7 && getDaysUntilExpiry(k.expiresAt) > 0).length}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Expiring Soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="keys" className="space-y-4">
          <TabsList className="w-full sm:w-auto inline-flex h-10 bg-muted/50 p-1 rounded-lg">
            <TabsTrigger value="keys" className="gap-1.5 text-xs sm:text-sm flex-1 sm:flex-none px-3 sm:px-4">
              <Key className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              My Keys
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-1.5 text-xs sm:text-sm flex-1 sm:flex-none px-3 sm:px-4">
              <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Call Logs
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1.5 text-xs sm:text-sm flex-1 sm:flex-none px-3 sm:px-4">
              <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Keys Tab */}
          <TabsContent value="keys" className="space-y-4 mt-4">
            {userKeys.map((key) => {
              const health = getKeyHealth(key);
              const HealthIcon = health.icon;
              const stats = getKeyStats(key.id);
              const keyVisible = showKeys[key.id];
              
              return (
                <Card key={key.id} className="glass overflow-hidden hover:border-primary/30 transition-all">
                  <CardContent className="p-4 sm:p-6 space-y-4">
                    {/* Top row - Game type badges and Health indicator */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`${getGameTypeColor(key.gameType)} text-white uppercase text-xs font-bold px-2.5 py-0.5`}>
                          {key.gameType}
                        </Badge>
                        <Badge variant="outline" className="text-xs">{key.duration}</Badge>
                        {getStatusBadge(key)}
                      </div>
                      
                      {/* Health Indicator */}
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${health.bg}`}>
                        <HealthIcon className={`w-3.5 h-3.5 ${health.color}`} />
                        <span className={`text-xs font-medium ${health.color}`}>{health.label}</span>
                      </div>
                    </div>

                    {/* API Key Section */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">API Key</label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-2 bg-muted/50 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border">
                          <code className="flex-1 text-xs sm:text-sm font-mono text-foreground truncate">
                            {keyVisible ? key.key : '•'.repeat(40)}
                          </code>
                        </div>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-10 w-10 shrink-0"
                          onClick={() => toggleKeyVisibility(key.id)}
                        >
                          {keyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-10 w-10 shrink-0"
                          onClick={() => copyToClipboard(key.key)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Stats Grid - 2x2 on mobile, 4 col on desktop */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-muted/30 border">
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Domain</p>
                        <p className="font-mono text-xs sm:text-sm font-medium text-foreground truncate">{key.domain}</p>
                      </div>
                      <div className="p-2.5 sm:p-3 rounded-lg bg-muted/30 border">
                        <p className="text-[10px] sm:text-xs text-muted-foreground">IP Whitelist</p>
                        <p className="font-mono text-xs sm:text-sm font-medium text-foreground truncate">{key.ipWhitelist[0] || 'Any'}</p>
                      </div>
                      <div className="p-2.5 sm:p-3 rounded-lg bg-muted/30 border">
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Total Calls</p>
                        <p className="text-base sm:text-lg font-bold text-foreground">{key.totalCalls.toLocaleString()}</p>
                      </div>
                      <div className="p-2.5 sm:p-3 rounded-lg bg-muted/30 border">
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Last Used</p>
                        <p className="text-xs sm:text-sm font-medium text-foreground">{key.lastUsed ? formatDate(key.lastUsed, false) : 'Never'}</p>
                      </div>
                    </div>

                    {/* Success/Error/Blocked Stats */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      <div className="flex items-center gap-2 p-2 sm:p-2.5 rounded-lg bg-success/10 border border-success/20">
                        <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm sm:text-lg font-bold text-success">{stats.successCount}</p>
                          <p className="text-[9px] sm:text-[10px] text-muted-foreground truncate">Success</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 sm:p-2.5 rounded-lg bg-destructive/10 border border-destructive/20">
                        <ArrowDownRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-destructive shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm sm:text-lg font-bold text-destructive">{stats.errorCount}</p>
                          <p className="text-[9px] sm:text-[10px] text-muted-foreground truncate">Errors</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 sm:p-2.5 rounded-lg bg-warning/10 border border-warning/20">
                        <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-warning shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm sm:text-lg font-bold text-warning">{stats.blockedCount}</p>
                          <p className="text-[9px] sm:text-[10px] text-muted-foreground truncate">Blocked</p>
                        </div>
                      </div>
                    </div>

                    {/* Expiry Progress */}
                    <div className="space-y-2 pt-2 border-t border-border/50">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Created: {formatDate(key.createdAt, false)}</span>
                        <span className={`font-medium ${getDaysUntilExpiry(key.expiresAt) <= 7 ? 'text-warning' : 'text-foreground'}`}>
                          {getDaysUntilExpiry(key.expiresAt)} days left
                        </span>
                        <span className="text-muted-foreground hidden sm:inline">Expires: {formatDate(key.expiresAt, false)}</span>
                      </div>
                      <Progress 
                        value={Math.max(0, Math.min(100, (getDaysUntilExpiry(key.expiresAt) / key.validityDays) * 100))}
                        className={`h-1.5 ${
                          getDaysUntilExpiry(key.expiresAt) <= 3 ? '[&>div]:bg-destructive' :
                          getDaysUntilExpiry(key.expiresAt) <= 7 ? '[&>div]:bg-warning' : '[&>div]:bg-success'
                        }`}
                      />
                    </div>

                    {/* Action Button */}
                    <div className="pt-2">
                      <Dialog open={isDialogOpen && selectedKeyId === key.id} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) setSelectedKeyId(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="default"
                            size="sm"
                            className="w-full sm:w-auto gradient-primary text-primary-foreground"
                            onClick={() => setSelectedKeyId(key.id)}
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Request Renewal
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md mx-4 sm:mx-auto">
                          <DialogHeader>
                            <DialogTitle>Request Key Renewal</DialogTitle>
                            <DialogDescription>
                              Send a renewal request to the admin via Telegram
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="p-3 rounded-lg bg-muted/50 space-y-1.5 text-sm">
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
                          <DialogFooter className="flex-col sm:flex-row gap-2">
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                              Cancel
                            </Button>
                            <Button onClick={handleRenewalRequest} className="w-full sm:w-auto gradient-primary text-primary-foreground">
                              <Send className="w-4 h-4 mr-2" />
                              Send Request
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {userKeys.length === 0 && (
              <Card className="glass">
                <CardContent className="py-12 sm:py-16 text-center">
                  <Key className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">No API Keys Yet</h3>
                  <p className="text-sm text-muted-foreground">Contact admin to get your first API key</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* API Logs Tab */}
          <TabsContent value="logs" className="mt-4">
            <Card className="glass">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <History className="w-5 h-5 text-primary" />
                      API Call Logs
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Your recent API requests</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs w-fit">
                    {userLogs.length} Records
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {userLogs.length > 0 ? (
                  <div className="space-y-2">
                    {/* Mobile Card View */}
                    <div className="sm:hidden space-y-2">
                      {userLogs.slice(0, 20).map((log) => (
                        <div key={log.id} className="p-3 rounded-lg bg-muted/30 border space-y-2">
                          <div className="flex items-center justify-between">
                            <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">{log.endpoint}</code>
                            <Badge 
                              className={`text-[10px] ${
                                log.status === 'success' ? 'bg-success text-success-foreground' : 
                                log.status === 'blocked' ? 'bg-warning text-warning-foreground' :
                                'bg-destructive text-destructive-foreground'
                              }`}
                            >
                              {log.status === 'success' ? '200' : log.status === 'blocked' ? '403' : '500'}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="font-mono">{log.ip}</span>
                            <span className={`font-mono ${
                              log.responseTime < 50 ? 'text-success' :
                              log.responseTime < 100 ? 'text-warning' : 'text-destructive'
                            }`}>
                              {log.responseTime}ms
                            </span>
                            <span>{formatDateTime(log.createdAt).split(' ')[1]}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden sm:block rounded-lg border overflow-hidden">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead className="w-[140px]">Timestamp</TableHead>
                              <TableHead>Endpoint</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Response</TableHead>
                              <TableHead>IP Address</TableHead>
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
                                    className={`text-xs ${
                                      log.status === 'success' ? 'bg-success text-success-foreground' : 
                                      log.status === 'blocked' ? 'bg-warning text-warning-foreground' :
                                      'bg-destructive text-destructive-foreground'
                                    }`}
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
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <History className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No API Calls Yet</h3>
                    <p className="text-sm text-muted-foreground">Your API usage will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-4">
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="glass">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Total Requests</p>
                        <p className="text-2xl font-bold text-foreground">{totalCalls}</p>
                      </div>
                      <Database className="w-8 h-8 text-primary opacity-50" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="glass">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Success Rate</p>
                        <p className="text-2xl font-bold text-success">{successRate}%</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-success opacity-50" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="glass">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Avg Response</p>
                        <p className="text-2xl font-bold text-foreground">{avgResponseTime}ms</p>
                      </div>
                      <Zap className="w-8 h-8 text-warning opacity-50" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="glass">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Active Keys</p>
                        <p className="text-2xl font-bold text-foreground">{userKeys.filter(k => k.isActive).length}</p>
                      </div>
                      <Key className="w-8 h-8 text-primary opacity-50" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Per-Key Stats */}
              <Card className="glass">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Performance by API Key</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Stats for each key</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {userKeys.map((key) => {
                      const stats = getKeyStats(key.id);
                      return (
                        <div key={key.id} className="p-3 sm:p-4 rounded-lg border bg-muted/20 hover:bg-muted/30 transition-colors">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              <Badge className={`${getGameTypeColor(key.gameType)} text-white uppercase text-xs`}>{key.gameType}</Badge>
                              <span className="text-xs text-muted-foreground truncate max-w-[150px]">{key.domain}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">{stats.total} calls</Badge>
                          </div>
                          <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
                            <div>
                              <p className="text-lg sm:text-2xl font-bold text-success">{stats.successCount}</p>
                              <p className="text-[10px] sm:text-xs text-muted-foreground">Success</p>
                            </div>
                            <div>
                              <p className="text-lg sm:text-2xl font-bold text-destructive">{stats.errorCount}</p>
                              <p className="text-[10px] sm:text-xs text-muted-foreground">Errors</p>
                            </div>
                            <div>
                              <p className="text-lg sm:text-2xl font-bold text-warning">{stats.blockedCount}</p>
                              <p className="text-[10px] sm:text-xs text-muted-foreground">Blocked</p>
                            </div>
                            <div>
                              <p className="text-lg sm:text-2xl font-bold text-foreground">{stats.avgResponseTime}ms</p>
                              <p className="text-[10px] sm:text-xs text-muted-foreground">Avg Time</p>
                            </div>
                          </div>
                          <div className="mt-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Success Rate</span>
                              <span className="font-medium">{stats.successRate}%</span>
                            </div>
                            <Progress value={parseFloat(stats.successRate)} className="h-1.5 [&>div]:bg-success" />
                          </div>
                        </div>
                      );
                    })}

                    {userKeys.length === 0 && (
                      <div className="py-8 text-center text-muted-foreground text-sm">
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
