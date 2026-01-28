import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  TrendingUp
} from 'lucide-react';

interface LiveRequest {
  id: string;
  timestamp: Date;
  apiKey: string;
  username: string;
  gameType: string;
  endpoint: string;
  ip: string;
  domain: string;
  status: 'success' | 'error' | 'blocked';
  responseTime: number;
}

const LiveMonitorPage = () => {
  const [isLive, setIsLive] = useState(true);
  const [requests, setRequests] = useState<LiveRequest[]>([]);
  const [stats, setStats] = useState({
    totalToday: 0,
    successRate: 0,
    avgResponseTime: 0,
    activeUsers: 0
  });

  // Generate mock live data
  useEffect(() => {
    // Initial data
    const initialRequests: LiveRequest[] = Array.from({ length: 20 }, (_, i) => ({
      id: `req-${Date.now()}-${i}`,
      timestamp: new Date(Date.now() - i * 30000),
      apiKey: `HYPER_${Math.random().toString(36).substring(2, 15)}`,
      username: ['john_doe', 'alice_smith', 'bob_wilson', 'charlie_brown'][Math.floor(Math.random() * 4)],
      gameType: ['wingo', 'k3', '5d', 'trx'][Math.floor(Math.random() * 4)],
      endpoint: `/api/trend/${['wingo/wg1', 'k3/k31', '5d/5d1', 'trx/trx1'][Math.floor(Math.random() * 4)]}`,
      ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      domain: ['p2plottery.club', '107.172.75.145', 'example.com'][Math.floor(Math.random() * 3)],
      status: Math.random() > 0.1 ? 'success' : Math.random() > 0.5 ? 'error' : 'blocked',
      responseTime: Math.floor(Math.random() * 200) + 50
    }));

    setRequests(initialRequests);
    setStats({
      totalToday: 15234,
      successRate: 98.5,
      avgResponseTime: 87,
      activeUsers: 12
    });

    // Simulate live requests
    if (isLive) {
      const interval = setInterval(() => {
        const newRequest: LiveRequest = {
          id: `req-${Date.now()}`,
          timestamp: new Date(),
          apiKey: `HYPER_${Math.random().toString(36).substring(2, 15)}`,
          username: ['john_doe', 'alice_smith', 'bob_wilson', 'charlie_brown'][Math.floor(Math.random() * 4)],
          gameType: ['wingo', 'k3', '5d', 'trx'][Math.floor(Math.random() * 4)],
          endpoint: `/api/trend/${['wingo/wg1', 'k3/k31', '5d/5d1', 'trx/trx1'][Math.floor(Math.random() * 4)]}`,
          ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          domain: ['p2plottery.club', '107.172.75.145', 'example.com'][Math.floor(Math.random() * 3)],
          status: Math.random() > 0.1 ? 'success' : Math.random() > 0.5 ? 'error' : 'blocked',
          responseTime: Math.floor(Math.random() * 200) + 50
        };

        setRequests(prev => [newRequest, ...prev.slice(0, 49)]);
        setStats(prev => ({
          ...prev,
          totalToday: prev.totalToday + 1,
          avgResponseTime: Math.floor((prev.avgResponseTime + newRequest.responseTime) / 2)
        }));
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isLive]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'blocked':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-success/20 text-success border-success/30">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'blocked':
        return <Badge className="bg-warning/20 text-warning border-warning/30">Blocked</Badge>;
      default:
        return null;
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Radio className={`w-8 h-8 ${isLive ? 'text-success animate-pulse' : 'text-muted-foreground'}`} />
              Live API Monitor
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time view of all API requests
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Auto-refresh</span>
              <Switch checked={isLive} onCheckedChange={setIsLive} />
            </div>
            <Button variant="outline" onClick={() => setRequests([])}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>

        {/* Live Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Requests</p>
                  <p className="text-3xl font-bold text-primary">{stats.totalToday.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-3xl font-bold text-success">{stats.successRate}%</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Response</p>
                  <p className="text-3xl font-bold text-accent-foreground">{stats.avgResponseTime}ms</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-accent-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-3xl font-bold text-purple-500">{stats.activeUsers}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Indicator */}
        <div className="flex items-center gap-3">
          {isLive ? (
            <>
              <div className="relative">
                <div className="w-3 h-3 rounded-full bg-success animate-ping absolute" />
                <div className="w-3 h-3 rounded-full bg-success" />
              </div>
              <span className="text-success font-medium">Live - Streaming requests</span>
              <Button size="sm" variant="ghost" onClick={() => setIsLive(false)}>
                <Pause className="w-4 h-4 mr-1" />
                Pause
              </Button>
            </>
          ) : (
            <>
              <div className="w-3 h-3 rounded-full bg-muted-foreground" />
              <span className="text-muted-foreground font-medium">Paused</span>
              <Button size="sm" variant="ghost" onClick={() => setIsLive(true)}>
                <Play className="w-4 h-4 mr-1" />
                Resume
              </Button>
            </>
          )}
        </div>

        {/* Live Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Live Request Stream
            </CardTitle>
            <CardDescription>
              Showing last {requests.length} requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {requests.map((request, index) => (
                  <div 
                    key={request.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                      index === 0 && isLive 
                        ? 'bg-primary/5 border-primary/30 animate-pulse' 
                        : 'bg-muted/30 border-transparent hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        <span className="text-xs text-muted-foreground font-mono">
                          {formatTime(request.timestamp)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="uppercase text-xs">
                          {request.gameType}
                        </Badge>
                        <span className="font-mono text-sm text-foreground">
                          {request.endpoint}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="w-4 h-4" />
                        {request.username}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Globe className="w-4 h-4" />
                        {request.domain}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className={request.responseTime > 150 ? 'text-warning' : 'text-success'}>
                          {request.responseTime}ms
                        </span>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Game Type Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['wingo', 'k3', '5d', 'trx'].map((game) => {
            const count = requests.filter(r => r.gameType === game).length;
            const colors: Record<string, string> = {
              wingo: 'from-blue-500/10 to-blue-600/5 border-blue-500/20',
              k3: 'from-green-500/10 to-green-600/5 border-green-500/20',
              '5d': 'from-purple-500/10 to-purple-600/5 border-purple-500/20',
              trx: 'from-orange-500/10 to-orange-600/5 border-orange-500/20'
            };
            
            return (
              <Card key={game} className={`bg-gradient-to-br ${colors[game]}`}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Badge className="uppercase mb-2">{game}</Badge>
                    <p className="text-3xl font-bold">{count}</p>
                    <p className="text-sm text-muted-foreground">requests</p>
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
