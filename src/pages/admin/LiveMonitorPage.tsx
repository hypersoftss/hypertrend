import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { 
  Activity, Radio, Pause, Play, RefreshCw, CheckCircle, XCircle, AlertTriangle,
  Clock, Globe, User, Zap, TrendingUp, Wifi, WifiOff, Server
} from 'lucide-react';

interface LiveRequest {
  id: string;
  timestamp: Date;
  apiKey: string;
  gameType: string;
  duration: string;
  endpoint: string;
  ip: string;
  domain: string;
  status: 'success' | 'error' | 'blocked';
  responseTime: number;
}

const gameColors: Record<string, { bg: string; text: string; border: string }> = {
  wingo: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/30' },
  k3: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/30' },
  '5d': { bg: 'bg-violet-500/10', text: 'text-violet-500', border: 'border-violet-500/30' },
  trx: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/30' },
  numeric: { bg: 'bg-pink-500/10', text: 'text-pink-500', border: 'border-pink-500/30' },
};

const games = ['wingo', 'k3', '5d', 'trx', 'numeric'];

const LiveMonitorPage: React.FC = () => {
  const [isLive, setIsLive] = useState(true);
  const [requests, setRequests] = useState<LiveRequest[]>([]);
  const [stats, setStats] = useState({
    totalToday: 0,
    successRate: 100,
    avgResponseTime: 0,
    activeUsers: 0
  });

  const fetchInitialData = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Fetch today's logs
      const { data: logs, error } = await supabase
        .from('api_logs')
        .select('*')
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const mappedRequests: LiveRequest[] = (logs || []).map(log => ({
        id: log.id,
        timestamp: new Date(log.created_at!),
        apiKey: log.api_key_id?.substring(0, 12) || 'N/A',
        gameType: log.game_type || 'wingo',
        duration: log.duration || '1min',
        endpoint: log.endpoint,
        ip: log.ip_address || 'Unknown',
        domain: log.domain || 'Unknown',
        status: log.status as 'success' | 'error' | 'blocked',
        responseTime: log.response_time_ms || 0,
      }));

      setRequests(mappedRequests);
      calculateStats(logs || []);

      // Fetch active keys count
      const { count } = await supabase
        .from('api_keys')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      setStats(prev => ({ ...prev, activeUsers: count || 0 }));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const calculateStats = (logs: any[]) => {
    const totalToday = logs.length;
    const successLogs = logs.filter(l => l.status === 'success').length;
    const successRate = totalToday > 0 ? (successLogs / totalToday) * 100 : 100;
    const avgResponseTime = totalToday > 0
      ? Math.round(logs.reduce((sum, l) => sum + (l.response_time_ms || 0), 0) / totalToday)
      : 0;

    setStats(prev => ({
      ...prev,
      totalToday,
      successRate: Math.round(successRate * 10) / 10,
      avgResponseTime,
    }));
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Real-time subscription
  useEffect(() => {
    if (!isLive) return;

    const channel = supabase
      .channel('api_logs_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'api_logs' },
        (payload) => {
          const log = payload.new as any;
          const newRequest: LiveRequest = {
            id: log.id,
            timestamp: new Date(log.created_at),
            apiKey: log.api_key_id?.substring(0, 12) || 'N/A',
            gameType: log.game_type || 'wingo',
            duration: log.duration || '1min',
            endpoint: log.endpoint,
            ip: log.ip_address || 'Unknown',
            domain: log.domain || 'Unknown',
            status: log.status as 'success' | 'error' | 'blocked',
            responseTime: log.response_time_ms || 0,
          };

          setRequests(prev => [newRequest, ...prev.slice(0, 49)]);
          setStats(prev => ({
            ...prev,
            totalToday: prev.totalToday + 1,
            avgResponseTime: Math.floor((prev.avgResponseTime * 0.9 + newRequest.responseTime * 0.1))
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isLive]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'success':
        return { icon: <CheckCircle className="w-3.5 h-3.5" />, color: 'text-success', bg: 'bg-success/10', border: 'border-success/30', label: 'OK' };
      case 'error':
        return { icon: <XCircle className="w-3.5 h-3.5" />, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30', label: 'ERR' };
      case 'blocked':
        return { icon: <AlertTriangle className="w-3.5 h-3.5" />, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30', label: 'BLOCKED' };
      default:
        return { icon: null, color: '', bg: '', border: '', label: '' };
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  const getGameColor = (game: string) => gameColors[game?.toLowerCase()] || gameColors.wingo;

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6 pb-20 lg:pb-0">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center relative shrink-0",
              isLive ? "bg-success/20" : "bg-muted"
            )}>
              {isLive ? (
                <>
                  <Radio className="w-6 h-6 sm:w-7 sm:h-7 text-success" />
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-success rounded-full animate-ping" />
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-success rounded-full" />
                </>
              ) : (
                <WifiOff className="w-6 h-6 sm:w-7 sm:h-7 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground truncate">
                Live API Monitor
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm truncate">
                {isLive ? 'Real-time streaming from Supabase' : 'Stream paused'}
              </p>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border text-sm">
              <span className="text-muted-foreground hidden sm:inline">Auto-refresh</span>
              <Switch checked={isLive} onCheckedChange={setIsLive} />
            </div>
            <Button variant="outline" size="sm" onClick={() => { setRequests([]); fetchInitialData(); }}>
              <RefreshCw className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <Card className="border-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
            <CardContent className="p-3 sm:pt-5 sm:p-6 relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Today's Requests</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary mt-0.5 sm:mt-1">
                    {stats.totalToday.toLocaleString()}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/20 flex items-center justify-center">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-success/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-success/10 to-transparent" />
            <CardContent className="p-3 sm:pt-5 sm:p-6 relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Success Rate</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-success mt-0.5 sm:mt-1">{stats.successRate}%</p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-success/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent" />
            <CardContent className="p-3 sm:pt-5 sm:p-6 relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Avg Response</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-0.5 sm:mt-1">{stats.avgResponseTime}ms</p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-accent/20 flex items-center justify-center">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <CardContent className="p-3 sm:pt-5 sm:p-6 relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Active Keys</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-0.5 sm:mt-1">{stats.activeUsers}</p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            {isLive ? (
              <>
                <div className="relative flex items-center gap-1.5 sm:gap-2">
                  <div className="relative">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-success animate-ping absolute" />
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-success" />
                  </div>
                  <span className="text-success font-semibold text-sm sm:text-base">LIVE</span>
                </div>
                <span className="text-muted-foreground hidden sm:inline">•</span>
                <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">Streaming from database</span>
              </>
            ) : (
              <>
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-muted-foreground" />
                <span className="text-muted-foreground font-medium text-sm sm:text-base">PAUSED</span>
              </>
            )}
          </div>
          
          <Button 
            variant={isLive ? "outline" : "default"}
            size="sm" 
            onClick={() => setIsLive(!isLive)}
            className={cn("text-xs sm:text-sm", !isLive && "gradient-primary text-primary-foreground")}
          >
            {isLive ? (
              <>
                <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Resume
              </>
            )}
          </Button>
        </div>

        {/* Request Stream Card */}
        <Card>
          <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Server className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-sm sm:text-base">Request Stream</CardTitle>
                  <CardDescription className="text-[10px] sm:text-xs">
                    Last {requests.length} requests
                  </CardDescription>
                </div>
              </div>
              
              {/* Game Type Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
                {games.map((game) => {
                  const count = requests.filter(r => r.gameType?.toLowerCase() === game).length;
                  const colors = getGameColor(game);
                  return (
                    <Badge 
                      key={game} 
                      variant="outline" 
                      className={cn("uppercase text-[10px] sm:text-xs shrink-0 px-1.5 sm:px-2", colors.bg, colors.text, colors.border)}
                    >
                      {game}: {count}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="h-[350px] sm:h-[400px] lg:h-[450px]">
              <div className="space-y-1 p-2 sm:p-4 pt-0">
                {requests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Wifi className="w-10 h-10 mb-3 opacity-50" />
                    <p className="text-sm">No requests yet</p>
                    <p className="text-xs">Waiting for incoming API calls...</p>
                  </div>
                ) : (
                  requests.map((request, index) => {
                    const statusConfig = getStatusConfig(request.status);
                    const gameColor = getGameColor(request.gameType);
                    const isNew = index === 0 && isLive;
                    
                    return (
                      <div 
                        key={request.id}
                        className={cn(
                          "p-2 sm:p-3 rounded-lg sm:rounded-xl border transition-all duration-300",
                          isNew 
                            ? "bg-primary/5 border-primary/30 shadow-sm" 
                            : "bg-muted/30 border-transparent hover:bg-muted/50"
                        )}
                      >
                        {/* Mobile Layout */}
                        <div className="flex flex-col gap-1.5 sm:hidden">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-6 h-6 rounded flex items-center justify-center shrink-0", statusConfig.bg)}>
                              <span className={statusConfig.color}>{statusConfig.icon}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {formatTime(request.timestamp)}
                            </span>
                            <Badge variant="outline" className={cn("uppercase text-[10px] px-1.5 py-0", gameColor.bg, gameColor.text, gameColor.border)}>
                              {request.gameType}
                            </Badge>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              {request.duration}
                            </Badge>
                            <div className="ml-auto flex items-center gap-1.5">
                              <span className={cn("text-[10px] font-mono", request.responseTime > 150 ? 'text-warning' : 'text-success')}>
                                {request.responseTime}ms
                              </span>
                              <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 font-bold", statusConfig.bg, statusConfig.color, statusConfig.border)}>
                                {statusConfig.label}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground pl-8">
                            <span className="font-mono truncate flex-1">{request.endpoint}</span>
                            <span className="flex items-center gap-0.5 shrink-0">
                              <Globe className="w-2.5 h-2.5" />
                              {request.domain.length > 12 ? request.domain.substring(0, 12) + '...' : request.domain}
                            </span>
                          </div>
                        </div>

                        {/* Desktop Layout */}
                        <div className="hidden sm:flex items-center gap-3">
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", statusConfig.bg)}>
                            <span className={statusConfig.color}>{statusConfig.icon}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono min-w-[70px]">
                            <Clock className="w-3 h-3" />
                            {formatTime(request.timestamp)}
                          </div>
                          
                          <Badge variant="outline" className={cn("uppercase text-xs", gameColor.bg, gameColor.text, gameColor.border)}>
                            {request.gameType}
                          </Badge>
                          
                          <Badge variant="secondary" className="text-xs">{request.duration}</Badge>
                          
                          <span className="font-mono text-xs text-foreground truncate flex-1 max-w-[200px]">
                            {request.endpoint}
                          </span>
                          
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Globe className="w-3 h-3" />
                            <span className="truncate max-w-[100px]">{request.domain}</span>
                          </div>
                          
                          <span className={cn(
                            "text-xs font-mono min-w-[50px] text-right",
                            request.responseTime > 150 ? 'text-warning' : 'text-success'
                          )}>
                            {request.responseTime}ms
                          </span>
                          
                          <Badge variant="outline" className={cn("text-xs font-bold min-w-[60px] justify-center", statusConfig.bg, statusConfig.color, statusConfig.border)}>
                            {statusConfig.label}
                          </Badge>
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

export default LiveMonitorPage;
