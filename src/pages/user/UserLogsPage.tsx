import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useConfig } from '@/contexts/ConfigContext';
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
  History, Search, CheckCircle, XCircle, AlertTriangle, Clock, 
  Globe, RefreshCw, Activity, Server, ArrowUpRight, ArrowDownRight, 
  Shield, Filter, Zap
} from 'lucide-react';

const UserLogsPage = () => {
  const { user } = useAuth();
  const { config } = useConfig();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [gameFilter, setGameFilter] = useState<string>('all');

  // Get user's keys and their logs
  const userKeys = mockApiKeys.filter(k => k.userId === user?.id);
  const userKeyIds = userKeys.map(k => k.id);
  const allUserLogs = mockApiLogs.filter(log => userKeyIds.includes(log.apiKeyId));
  
  const userLogs = allUserLogs
    .filter(log => {
      if (statusFilter !== 'all' && log.status !== statusFilter) return false;
      if (gameFilter !== 'all' && !log.endpoint.toLowerCase().includes(gameFilter)) return false;
      if (searchQuery && !log.endpoint.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !log.ip.includes(searchQuery)) return false;
      return true;
    })
    .slice(0, 100);

  // Stats from all logs (not filtered)
  const successCount = allUserLogs.filter(l => l.status === 'success').length;
  const errorCount = allUserLogs.filter(l => l.status === 'error').length;
  const blockedCount = allUserLogs.filter(l => l.status === 'blocked').length;
  const avgResponseTime = allUserLogs.length > 0 
    ? Math.round(allUserLogs.reduce((sum, l) => sum + l.responseTime, 0) / allUserLogs.length) 
    : 0;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'success':
        return { icon: <CheckCircle className="w-3.5 h-3.5" />, color: 'text-success', bg: 'bg-success/10', border: 'border-success/30', label: '200 OK', code: 200 };
      case 'error':
        return { icon: <XCircle className="w-3.5 h-3.5" />, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30', label: '500 ERR', code: 500 };
      case 'blocked':
        return { icon: <AlertTriangle className="w-3.5 h-3.5" />, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30', label: '403 BLOCKED', code: 403 };
      default:
        return { icon: null, color: '', bg: '', border: '', label: '', code: 0 };
    }
  };

  const getGameTypeColor = (endpoint: string) => {
    if (endpoint.includes('wingo')) return 'bg-purple-500';
    if (endpoint.includes('k3')) return 'bg-blue-500';
    if (endpoint.includes('5d')) return 'bg-green-500';
    if (endpoint.includes('trx')) return 'bg-orange-500';
    return 'bg-primary';
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setGameFilter('all');
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || gameFilter !== 'all';

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6 pb-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl gradient-primary flex items-center justify-center">
              <History className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                Call Logs
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm">
                View your API request history
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs px-2.5 py-1">
              <Server className="w-3 h-3 mr-1" />
              {config.siteName}
            </Badge>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="w-3.5 h-3.5 sm:mr-2" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Stats - Scrollable on mobile */}
        <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex sm:grid sm:grid-cols-4 gap-3 min-w-max sm:min-w-0">
            <Card className="glass min-w-[130px] sm:min-w-0">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-primary/20">
                    <Activity className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold">{allUserLogs.length}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Total Logs</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass min-w-[130px] sm:min-w-0">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-success/20">
                    <ArrowUpRight className="w-4 h-4 text-success" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-success">{successCount}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Success</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass min-w-[130px] sm:min-w-0">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-destructive/20">
                    <ArrowDownRight className="w-4 h-4 text-destructive" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-destructive">{errorCount}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Errors</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass min-w-[130px] sm:min-w-0">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-warning/20">
                    <Zap className="w-4 h-4 text-warning" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold">{avgResponseTime}ms</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Avg Time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters */}
        <Card className="glass">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search endpoint, IP address..." 
                  className="pl-9 bg-muted/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Filter Row */}
              <div className="flex flex-wrap gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[140px] h-9 text-xs bg-muted/50">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="success">
                      <span className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-success" /> Success
                      </span>
                    </SelectItem>
                    <SelectItem value="error">
                      <span className="flex items-center gap-2">
                        <XCircle className="w-3 h-3 text-destructive" /> Error
                      </span>
                    </SelectItem>
                    <SelectItem value="blocked">
                      <span className="flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3 text-warning" /> Blocked
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={gameFilter} onValueChange={setGameFilter}>
                  <SelectTrigger className="w-full sm:w-[140px] h-9 text-xs bg-muted/50">
                    <SelectValue placeholder="Game Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Games</SelectItem>
                    <SelectItem value="wingo">WinGo</SelectItem>
                    <SelectItem value="k3">K3</SelectItem>
                    <SelectItem value="5d">5D</SelectItem>
                    <SelectItem value="trx">TRX</SelectItem>
                    <SelectItem value="numeric">Numeric</SelectItem>
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 text-xs">
                    <XCircle className="w-3 h-3 mr-1" />
                    Clear
                  </Button>
                )}

                <div className="flex-1" />
                
                <Badge variant="outline" className="h-9 px-3 flex items-center text-xs">
                  Showing {userLogs.length} of {allUserLogs.length}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs List */}
        <Card className="glass">
          <CardHeader className="p-3 sm:p-4 pb-2">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <Server className="w-4 h-4 text-primary" />
              Request History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[450px] sm:h-[550px]">
              <div className="p-2 sm:p-4 pt-0 space-y-2">
                {userLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <History className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-sm font-medium">No logs found</p>
                    <p className="text-xs mt-1">
                      {hasActiveFilters ? 'Try adjusting your filters' : 'Your API calls will appear here'}
                    </p>
                    {hasActiveFilters && (
                      <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4">
                        Clear Filters
                      </Button>
                    )}
                  </div>
                ) : (
                  userLogs.map((log) => {
                    const statusConfig = getStatusConfig(log.status);
                    return (
                      <div 
                        key={log.id}
                        className="p-3 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors"
                      >
                        {/* Mobile Layout */}
                        <div className="flex flex-col gap-2 sm:hidden">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", statusConfig.bg)}>
                                <span className={statusConfig.color}>{statusConfig.icon}</span>
                              </div>
                              <div className={cn("w-2 h-2 rounded-full", getGameTypeColor(log.endpoint))} />
                              <code className="text-xs font-mono truncate max-w-[140px]">{log.endpoint}</code>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={cn("text-[10px] px-1.5 h-5", statusConfig.bg, statusConfig.color, statusConfig.border)}
                            >
                              {statusConfig.code}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground pl-9">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Globe className="w-2.5 h-2.5" />
                                {log.ip}
                              </span>
                              <span className={cn("font-mono", log.responseTime > 100 ? 'text-warning' : 'text-success')}>
                                {log.responseTime}ms
                              </span>
                            </div>
                            <span>{formatDateTime(log.createdAt)}</span>
                          </div>
                        </div>

                        {/* Desktop Layout */}
                        <div className="hidden sm:flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", statusConfig.bg)}>
                              <span className={statusConfig.color}>{statusConfig.icon}</span>
                            </div>
                            <span className="text-xs text-muted-foreground min-w-[130px] shrink-0">
                              {formatDateTime(log.createdAt)}
                            </span>
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", getGameTypeColor(log.endpoint))} />
                              <code className="font-mono text-sm truncate">{log.endpoint}</code>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Globe className="w-3.5 h-3.5" />
                              <span className="font-mono">{log.ip}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs min-w-[60px]">
                              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className={cn("font-mono font-medium", log.responseTime > 100 ? 'text-warning' : 'text-success')}>
                                {log.responseTime}ms
                              </span>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={cn("text-xs min-w-[80px] justify-center", statusConfig.bg, statusConfig.color, statusConfig.border)}
                            >
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
