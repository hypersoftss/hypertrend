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
  const scrollRef = useRef<HTMLDivElement>(null);

  // Generate random request
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

  // Initialize and stream data
  useEffect(() => {
    // Initial data
    const initialRequests = Array.from({ length: 25 }, () => {
      const req = generateRequest();
      req.timestamp = new Date(Date.now() - Math.floor(Math.random() * 300000));
      return req;
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    setRequests(initialRequests);

    // Simulate live requests
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
        return { 
          icon: <CheckCircle className="w-4 h-4" />, 
          color: 'text-success',
          bg: 'bg-success/10',
          border: 'border-success/30',
          label: 'OK'
        };
      case 'error':
        return { 
          icon: <XCircle className="w-4 h-4" />, 
          color: 'text-destructive',
          bg: 'bg-destructive/10',
          border: 'border-destructive/30',
          label: 'ERR'
        };
      case 'blocked':
        return { 
          icon: <AlertTriangle className="w-4 h-4" />, 
          color: 'text-warning',
          bg: 'bg-warning/10',
          border: 'border-warning/30',
          label: 'BLOCKED'
        };
      default:
        return { icon: null, color: '', bg: '', border: '', label: '' };
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false 
    });
  };

  const getGameColor = (game: string) => gameColors[game] || gameColors.wingo;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center relative",
              isLive ? "bg-success/20" : "bg-muted"
            )}>
              {isLive ? (
                <>
                  <Radio className="w-7 h-7 text-success" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full animate-ping" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full" />
                </>
              ) : (
                <WifiOff className="w-7 h-7 text-muted-foreground" />
              )}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Live API Monitor
              </h1>
              <p className="text-muted-foreground text-sm">
                {isLive ? 'Real-time streaming of API requests' : 'Stream paused'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border">
              <span className="text-sm text-muted-foreground">Auto-refresh</span>
              <Switch checked={isLive} onCheckedChange={setIsLive} />
            </div>
            <Button variant="outline" size="sm" onClick={() => setRequests([])}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>

        {/* Live Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-primary/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
            <CardContent className="pt-5 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Today's Requests</p>
                  <p className="text-2xl sm:text-3xl font-bold text-primary mt-1">
                    {stats.totalToday.toLocaleString()}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-success/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-success/10 to-transparent" />
            <CardContent className="pt-5 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Success Rate</p>
                  <p className="text-2xl sm:text-3xl font-bold text-success mt-1">{stats.successRate}%</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent" />
            <CardContent className="pt-5 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Avg Response</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1">{stats.avgResponseTime}ms</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <CardContent className="pt-5 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Active Users</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1">{stats.activeUsers}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Stream Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isLive ? (
              <>
                <div className="relative flex items-center gap-2">
                  <div className="relative">
                    <div className="w-3 h-3 rounded-full bg-success animate-ping absolute" />
                    <div className="w-3 h-3 rounded-full bg-success" />
                  </div>
                  <span className="text-success font-semibold">LIVE</span>
                </div>
                <span className="text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">Streaming requests in real-time</span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                <span className="text-muted-foreground font-medium">PAUSED</span>
              </>
            )}
          </div>
          
          <Button 
            variant={isLive ? "outline" : "default"}
            size="sm" 
            onClick={() => setIsLive(!isLive)}
            className={cn(!isLive && "gradient-primary text-primary-foreground")}
          >
            {isLive ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause Stream
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Resume Stream
              </>
            )}
          </Button>
        </div>

        {/* Live Requests Stream */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Server className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Request Stream</CardTitle>
                  <CardDescription className="text-xs">
                    Last {requests.length} requests
                  </CardDescription>
                </div>
              </div>
              
              {/* Game Type Filter Pills */}
              <div className="hidden md:flex items-center gap-1">
                {games.map((game) => {
                  const count = requests.filter(r => r.gameType === game).length;
                  const colors = getGameColor(game);
                  return (
                    <Badge 
                      key={game} 
                      variant="outline" 
                      className={cn("uppercase text-xs", colors.bg, colors.text, colors.border)}
                    >
                      {game}: {count}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="h-[450px]" ref={scrollRef}>
              <div className="space-y-1 p-4 pt-0">
                {requests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <Wifi className="w-12 h-12 mb-4 opacity-50" />
                    <p>No requests yet</p>
                    <p className="text-sm">Waiting for incoming API calls...</p>
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
                          "flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border transition-all duration-300",
                          isNew 
                            ? "bg-primary/5 border-primary/30 shadow-sm scale-[1.01]" 
                            : "bg-muted/30 border-transparent hover:bg-muted/50 hover:border-border"
                        )}
                      >
                        {/* Left Side */}
                        <div className="flex items-center gap-3 flex-wrap">
                          {/* Status Icon */}
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            statusConfig.bg
                          )}>
                            <span className={statusConfig.color}>{statusConfig.icon}</span>
                          </div>
                          
                          {/* Time */}
                          <span className="text-xs text-muted-foreground font-mono min-w-[60px]">
                            {formatTime(request.timestamp)}
                          </span>
                          
                          {/* Game Badge */}
                          <Badge 
                            variant="outline" 
                            className={cn("uppercase text-xs font-bold", gameColor.bg, gameColor.text, gameColor.border)}
                          >
                            {request.gameType}
                          </Badge>
                          
                          {/* Duration */}
                          <Badge variant="secondary" className="text-xs">
                            {request.duration}
                          </Badge>
                          
                          {/* Endpoint - Hidden on mobile */}
                          <span className="hidden lg:inline font-mono text-xs text-muted-foreground truncate max-w-[200px]">
                            {request.endpoint}
                          </span>
                        </div>

                        {/* Right Side */}
                        <div className="flex items-center gap-3 mt-2 sm:mt-0">
                          {/* User */}
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="w-3 h-3" />
                            <span className="hidden sm:inline">{request.username}</span>
                          </div>
                          
                          {/* Domain */}
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Globe className="w-3 h-3" />
                            <span className="max-w-[100px] truncate">{request.domain}</span>
                          </div>
                          
                          {/* Response Time */}
                          <div className="flex items-center gap-1 text-xs">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className={cn(
                              "font-mono font-medium",
                              request.responseTime > 150 ? 'text-warning' : 'text-success'
                            )}>
                              {request.responseTime}ms
                            </span>
                          </div>
                          
                          {/* Status Badge */}
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs font-bold min-w-[60px] justify-center", statusConfig.bg, statusConfig.color, statusConfig.border)}
                          >
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

        {/* Game Distribution Cards - Mobile Friendly */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {games.map((game) => {
            const count = requests.filter(r => r.gameType === game).length;
            const colors = getGameColor(game);
            const percentage = requests.length > 0 ? Math.round((count / requests.length) * 100) : 0;
            
            return (
              <Card 
                key={game} 
                className={cn("border overflow-hidden", colors.border)}
              >
                <div className={cn("absolute inset-0", colors.bg)} />
                <CardContent className="pt-4 pb-4 relative">
                  <div className="text-center">
                    <Badge 
                      variant="outline" 
                      className={cn("uppercase mb-2 font-bold", colors.text, colors.border)}
                    >
                      {game}
                    </Badge>
                    <p className={cn("text-2xl font-bold", colors.text)}>{count}</p>
                    <p className="text-xs text-muted-foreground">{percentage}%</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LiveMonitorPage;
