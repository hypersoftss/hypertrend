import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  Activity, 
  Radio, 
  Pause, 
  Play, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Globe,
  User,
  Zap,
  TrendingUp,
  Wifi,
  WifiOff,
  Server
} from 'lucide-react';

interface LiveRequest {
  id: string;
  timestamp: Date;
  apiKey: string;
  username: string;
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

const durations = ['30s', '1min', '3min', '5min', '10min'];
const games = ['wingo', 'k3', '5d', 'trx', 'numeric'];
const usernames = ['john_doe', 'alice_smith', 'bob_wilson', 'charlie_brown', 'david_lee', 'emma_jones'];
const domains = ['p2plottery.club', '107.172.75.145', 'example.com', 'myapp.com', 'localhost'];

const LiveMonitorPage = () => {
  const [isLive, setIsLive] = useState(true);
  const [requests, setRequests] = useState<LiveRequest[]>([]);
  const [stats, setStats] = useState({
    totalToday: 15234,
    successRate: 98.5,
    avgResponseTime: 87,
    activeUsers: 12
  });

  const generateRequest = (): LiveRequest => {
    const game = games[Math.floor(Math.random() * games.length)];
    const duration = durations[Math.floor(Math.random() * durations.length)];
    return {
      id: `req-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp: new Date(),
      apiKey: `HYPER_${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
      username: usernames[Math.floor(Math.random() * usernames.length)],
      gameType: game,
      duration: duration,
      endpoint: `/api/${game}.php?duration=${duration}`,
      ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      domain: domains[Math.floor(Math.random() * domains.length)],
      status: Math.random() > 0.1 ? 'success' : Math.random() > 0.5 ? 'error' : 'blocked',
      responseTime: Math.floor(Math.random() * 200) + 30
    };
  };

  useEffect(() => {
    const initialRequests = Array.from({ length: 30 }, () => {
      const req = generateRequest();
      req.timestamp = new Date(Date.now() - Math.floor(Math.random() * 300000));
      return req;
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    setRequests(initialRequests);

    let interval: NodeJS.Timeout;
    if (isLive) {
      interval = setInterval(() => {
        const newRequest = generateRequest();
        setRequests(prev => [newRequest, ...prev.slice(0, 49)]);
        setStats(prev => ({
          ...prev,
          totalToday: prev.totalToday + 1,
          avgResponseTime: Math.floor((prev.avgResponseTime * 0.9 + newRequest.responseTime * 0.1))
        }));
      }, 1500 + Math.random() * 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
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

  const getGameColor = (game: string) => gameColors[game] || gameColors.wingo;

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6 pb-20 lg:pb-0">
        {/* Header - Mobile Optimized */}
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
                {isLive ? 'Real-time streaming of API requests' : 'Stream paused'}
              </p>
            </div>
          </div>
          
          {/* Controls - Mobile Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border text-sm">
              <span className="text-muted-foreground hidden sm:inline">Auto-refresh</span>
              <Switch checked={isLive} onCheckedChange={setIsLive} />
            </div>
            <Button variant="outline" size="sm" onClick={() => setRequests([])}>
              <RefreshCw className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          </div>
        </div>

        {/* Stats Grid - 2x2 on mobile, 4 on desktop */}
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
                  <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Active Users</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-0.5 sm:mt-1">{stats.activeUsers}</p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Indicator & Play/Pause */}
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
                <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">Streaming requests in real-time</span>
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
                <span className="hidden sm:inline">Pause</span> Stream
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Resume</span> Stream
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
              
              {/* Game Type Pills - Scrollable on mobile */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
                {games.map((game) => {
                  const count = requests.filter(r => r.gameType === game).length;
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
                        {/* Mobile: 2 Row Layout */}
                        <div className="flex flex-col gap-1.5 sm:hidden">
                          {/* Row 1: Status, Time, Game, Duration */}
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
                          {/* Row 2: Endpoint, User, Domain */}
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground pl-8">
                            <span className="font-mono truncate flex-1">{request.endpoint}</span>
                            <span className="flex items-center gap-0.5 shrink-0">
                              <User className="w-2.5 h-2.5" />
                              {request.username.split('_')[0]}
                            </span>
                            <span className="flex items-center gap-0.5 shrink-0">
                              <Globe className="w-2.5 h-2.5" />
                              {request.domain.length > 12 ? request.domain.substring(0, 12) + '...' : request.domain}
                            </span>
                          </div>
                        </div>

                        {/* Desktop: Single Row Layout */}
                        <div className="hidden sm:flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", statusConfig.bg)}>
                              <span className={statusConfig.color}>{statusConfig.icon}</span>
                            </div>
                            <span className="text-xs text-muted-foreground font-mono min-w-[60px]">
                              {formatTime(request.timestamp)}
                            </span>
                            <Badge variant="outline" className={cn("uppercase text-xs font-bold", gameColor.bg, gameColor.text, gameColor.border)}>
                              {request.gameType}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {request.duration}
                            </Badge>
                            <span className="font-mono text-xs text-muted-foreground truncate hidden lg:inline max-w-[180px]">
                              {request.endpoint}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <User className="w-3 h-3" />
                              <span>{request.username}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Globe className="w-3 h-3" />
                              <span className="max-w-[100px] truncate">{request.domain}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              <span className={cn("font-mono font-medium", request.responseTime > 150 ? 'text-warning' : 'text-success')}>
                                {request.responseTime}ms
                              </span>
                            </div>
                            <Badge variant="outline" className={cn("text-xs font-bold min-w-[55px] justify-center", statusConfig.bg, statusConfig.color, statusConfig.border)}>
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

        {/* Game Distribution - Horizontal Scroll on Mobile */}
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-2">
          <div className="flex sm:grid sm:grid-cols-5 gap-2 sm:gap-3 min-w-max sm:min-w-0">
            {games.map((game) => {
              const count = requests.filter(r => r.gameType === game).length;
              const colors = getGameColor(game);
              const percentage = requests.length > 0 ? Math.round((count / requests.length) * 100) : 0;
              
              return (
                <Card key={game} className={cn("border relative overflow-hidden w-[100px] sm:w-auto shrink-0", colors.border)}>
                  <div className={cn("absolute inset-0", colors.bg)} />
                  <CardContent className="p-3 sm:p-4 relative">
                    <div className="text-center">
                      <Badge variant="outline" className={cn("uppercase mb-1 sm:mb-2 font-bold text-[10px] sm:text-xs", colors.text, colors.border)}>
                        {game}
                      </Badge>
                      <p className={cn("text-xl sm:text-2xl font-bold", colors.text)}>{count}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{percentage}%</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LiveMonitorPage;
