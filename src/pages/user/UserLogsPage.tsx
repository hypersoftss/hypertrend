import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { mockApiKeys, mockApiLogs, formatDateTime } from '@/lib/mockData';
import { 
  History, Search, Filter, CheckCircle, XCircle, AlertTriangle, Clock, 
  Globe, RefreshCw, Activity, TrendingUp, Server
} from 'lucide-react';

const UserLogsPage = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [gameFilter, setGameFilter] = useState<string>('all');

  // Get user's keys and their logs
  const userKeys = mockApiKeys.filter(k => k.userId === user?.id);
  const userKeyIds = userKeys.map(k => k.id);
  const userLogs = mockApiLogs
    .filter(log => userKeyIds.includes(log.apiKeyId))
    .filter(log => {
      if (statusFilter !== 'all' && log.status !== statusFilter) return false;
      if (gameFilter !== 'all' && !log.endpoint.toLowerCase().includes(gameFilter)) return false;
      if (searchQuery && !log.endpoint.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !log.ip.includes(searchQuery)) return false;
      return true;
    })
    .slice(0, 100);

  // Stats
  const successCount = userLogs.filter(l => l.status === 'success').length;
  const errorCount = userLogs.filter(l => l.status === 'error').length;
  const blockedCount = userLogs.filter(l => l.status === 'blocked').length;
  const avgResponseTime = userLogs.length > 0 
    ? Math.round(userLogs.reduce((sum, l) => sum + l.responseTime, 0) / userLogs.length) 
    : 0;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'success':
        return { icon: <CheckCircle className="w-4 h-4" />, color: 'text-success', bg: 'bg-success/10', border: 'border-success/30', label: 'OK' };
      case 'error':
        return { icon: <XCircle className="w-4 h-4" />, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30', label: 'ERR' };
      case 'blocked':
        return { icon: <AlertTriangle className="w-4 h-4" />, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30', label: 'BLOCKED' };
      default:
        return { icon: null, color: '', bg: '', border: '', label: '' };
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6 pb-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <History className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                My Call Logs
              </h1>
              <p className="text-muted-foreground text-sm">
                View your API request history
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="border-primary/20">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{userLogs.length}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Total Logs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-success/20">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-success" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-success">{successCount}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Success</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/20">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <XCircle className="w-4 h-4 text-destructive" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-destructive">{errorCount}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Errors</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{avgResponseTime}ms</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Avg Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search endpoint or IP..." 
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
              <Select value={gameFilter} onValueChange={setGameFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Game" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Games</SelectItem>
                  <SelectItem value="wingo">WinGo</SelectItem>
                  <SelectItem value="k3">K3</SelectItem>
                  <SelectItem value="5d">5D</SelectItem>
                  <SelectItem value="trx">TRX</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Logs List */}
        <Card>
          <CardHeader className="p-3 sm:p-6 pb-2">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <Server className="w-4 h-4 text-primary" />
              Request History
            </CardTitle>
            <CardDescription className="text-xs">
              Showing {userLogs.length} requests
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px] sm:h-[500px]">
              <div className="space-y-1 p-2 sm:p-4 pt-0">
                {userLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <History className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-sm">No logs found</p>
                    <p className="text-xs">Your API calls will appear here</p>
                  </div>
                ) : (
                  userLogs.map((log) => {
                    const statusConfig = getStatusConfig(log.status);
                    return (
                      <div 
                        key={log.id}
                        className="p-2 sm:p-3 rounded-lg sm:rounded-xl border bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        {/* Mobile Layout */}
                        <div className="flex flex-col gap-1.5 sm:hidden">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={cn("w-6 h-6 rounded flex items-center justify-center", statusConfig.bg)}>
                                <span className={statusConfig.color}>{statusConfig.icon}</span>
                              </div>
                              <span className="text-[10px] text-muted-foreground">
                                {formatDateTime(log.createdAt)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={cn("text-[10px] font-mono", log.responseTime > 150 ? 'text-warning' : 'text-success')}>
                                {log.responseTime}ms
                              </span>
                              <Badge variant="outline" className={cn("text-[10px] px-1.5", statusConfig.bg, statusConfig.color, statusConfig.border)}>
                                {statusConfig.label}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground pl-8">
                            <span className="font-mono truncate">{log.endpoint}</span>
                            <span className="flex items-center gap-0.5 shrink-0">
                              <Globe className="w-2.5 h-2.5" />
                              {log.ip}
                            </span>
                          </div>
                        </div>

                        {/* Desktop Layout */}
                        <div className="hidden sm:flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", statusConfig.bg)}>
                              <span className={statusConfig.color}>{statusConfig.icon}</span>
                            </div>
                            <span className="text-xs text-muted-foreground min-w-[130px]">
                              {formatDateTime(log.createdAt)}
                            </span>
                            <span className="font-mono text-sm truncate">{log.endpoint}</span>
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Globe className="w-3 h-3" />
                              <span>{log.ip}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              <span className={cn("font-mono", log.responseTime > 150 ? 'text-warning' : 'text-success')}>
                                {log.responseTime}ms
                              </span>
                            </div>
                            <Badge variant="outline" className={cn("text-xs min-w-[60px] justify-center", statusConfig.bg, statusConfig.color, statusConfig.border)}>
                              {statusConfig.label}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UserLogsPage;
