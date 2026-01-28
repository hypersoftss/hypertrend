import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Activity, Server, Cpu, MemoryStick, HardDrive, Wifi, Clock, TrendingUp, BarChart3, RefreshCw, Play, Pause, CheckCircle, XCircle, AlertTriangle, Zap, Globe } from 'lucide-react';

// Mock data for live monitor
const mockLiveRequests = [
  { id: 1, time: '10:45:23', ip: '192.168.1.***', endpoint: '/api/wingo.php', duration: '45ms', status: 'success', game: 'WinGo' },
  { id: 2, time: '10:45:21', ip: '103.45.67.***', endpoint: '/api/k3.php', duration: '38ms', status: 'success', game: 'K3' },
  { id: 3, time: '10:45:18', ip: '45.123.89.***', endpoint: '/api/5d.php', duration: '52ms', status: 'error', game: '5D' },
  { id: 4, time: '10:45:15', ip: '192.168.1.***', endpoint: '/api/trx.php', duration: '41ms', status: 'success', game: 'TRX' },
  { id: 5, time: '10:45:12', ip: '78.90.12.***', endpoint: '/api/wingo.php', duration: '0ms', status: 'blocked', game: 'WinGo' },
  { id: 6, time: '10:45:10', ip: '192.168.1.***', endpoint: '/api/numeric.php', duration: '35ms', status: 'success', game: 'Numeric' },
];

const mockServerHealth = {
  status: 'healthy',
  uptime: '15 days, 7 hours',
  cpu: 23,
  memory: 45,
  disk: 38,
  network: 'Online',
  lastCheck: new Date().toLocaleTimeString(),
  checks: {
    database: { status: 'ok', latency: '12ms' },
    upstream: { status: 'ok', latency: '145ms' },
    telegram: { status: 'ok', latency: '89ms' },
    cache: { status: 'ok', latency: '2ms' },
  }
};

const mockAnalytics = {
  todayCalls: 12450,
  successRate: 98.5,
  avgResponse: 42,
  peakHour: '14:00',
  gameDistribution: [
    { game: 'WinGo', calls: 4500, percentage: 36 },
    { game: 'K3', calls: 3200, percentage: 26 },
    { game: '5D', calls: 2100, percentage: 17 },
    { game: 'TRX', calls: 1800, percentage: 14 },
    { game: 'Numeric', calls: 850, percentage: 7 },
  ],
  hourlyTrend: [
    { hour: '00:00', calls: 320 },
    { hour: '06:00', calls: 890 },
    { hour: '12:00', calls: 2100 },
    { hour: '18:00', calls: 1800 },
    { hour: '23:00', calls: 450 },
  ]
};

const SystemMonitorPage = () => {
  const [isLive, setIsLive] = useState(true);
  const [activeTab, setActiveTab] = useState('live');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'blocked': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success': return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Success</Badge>;
      case 'error': return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Error</Badge>;
      case 'blocked': return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Blocked</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Activity className="w-8 h-8 text-primary" />
              System Monitor
            </h1>
            <p className="text-muted-foreground mt-1">
              Live requests, server health & analytics in one place
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isLive ? 'default' : 'secondary'} className={isLive ? 'animate-pulse' : ''}>
              {isLive ? '🔴 LIVE' : '⏸️ PAUSED'}
            </Badge>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsLive(!isLive)}
            >
              {isLive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isLive ? 'Pause' : 'Resume'}
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Server Status</p>
                  <p className="text-2xl font-bold text-green-500">Healthy</p>
                </div>
                <Server className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Calls</p>
                  <p className="text-2xl font-bold">{mockAnalytics.todayCalls.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">{mockAnalytics.successRate}%</p>
                </div>
                <CheckCircle className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Response</p>
                  <p className="text-2xl font-bold">{mockAnalytics.avgResponse}ms</p>
                </div>
                <Zap className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="live" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Live Monitor
            </TabsTrigger>
            <TabsTrigger value="health" className="flex items-center gap-2">
              <Server className="w-4 h-4" />
              Server Health
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Live Monitor Tab */}
          <TabsContent value="live" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Live API Requests
                  </span>
                  <Badge variant="outline" className="font-mono">
                    {mockLiveRequests.length} requests
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>IP</TableHead>
                        <TableHead>Endpoint</TableHead>
                        <TableHead>Game</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockLiveRequests.map((req) => (
                        <TableRow key={req.id} className="hover:bg-muted/50">
                          <TableCell className="font-mono text-sm">{req.time}</TableCell>
                          <TableCell className="font-mono text-sm">{req.ip}</TableCell>
                          <TableCell className="font-mono text-sm text-primary">{req.endpoint}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{req.game}</Badge>
                          </TableCell>
                          <TableCell>{req.duration}</TableCell>
                          <TableCell>{getStatusBadge(req.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Game Distribution */}
            <div className="grid grid-cols-5 gap-2">
              {mockAnalytics.gameDistribution.map((game) => (
                <Card key={game.game} className="text-center">
                  <CardContent className="pt-4">
                    <p className="font-semibold">{game.game}</p>
                    <p className="text-2xl font-bold text-primary">{game.percentage}%</p>
                    <p className="text-xs text-muted-foreground">{game.calls.toLocaleString()} calls</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Server Health Tab */}
          <TabsContent value="health" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* System Resources */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-primary" />
                    System Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Cpu className="w-4 h-4" /> CPU Usage
                      </span>
                      <span className="font-bold">{mockServerHealth.cpu}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${mockServerHealth.cpu}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <MemoryStick className="w-4 h-4" /> Memory Usage
                      </span>
                      <span className="font-bold">{mockServerHealth.memory}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${mockServerHealth.memory}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4" /> Disk Usage
                      </span>
                      <span className="font-bold">{mockServerHealth.disk}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full transition-all"
                        style={{ width: `${mockServerHealth.disk}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Service Checks */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    Service Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(mockServerHealth.checks).map(([name, info]) => (
                    <div key={name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="flex items-center gap-2 capitalize">
                        {info.status === 'ok' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        {name}
                      </span>
                      <Badge variant="outline">{info.latency}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Uptime Info */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Server Uptime</p>
                      <p className="text-xl font-bold">{mockServerHealth.uptime}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Last Health Check</p>
                    <p className="font-mono">{mockServerHealth.lastCheck}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Hourly Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Hourly API Calls</CardTitle>
                  <CardDescription>Today's traffic distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {mockAnalytics.hourlyTrend.map((item) => (
                      <div key={item.hour} className="flex items-center gap-3">
                        <span className="w-12 text-sm font-mono">{item.hour}</span>
                        <div className="flex-1 h-6 bg-muted rounded overflow-hidden">
                          <div 
                            className="h-full bg-primary/70 rounded"
                            style={{ width: `${(item.calls / 2100) * 100}%` }}
                          />
                        </div>
                        <span className="w-16 text-right text-sm">{item.calls}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Game Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Game Type Distribution</CardTitle>
                  <CardDescription>API calls by game type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockAnalytics.gameDistribution.map((game) => (
                      <div key={game.game} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{game.game}</span>
                          <span>{game.calls.toLocaleString()} ({game.percentage}%)</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
                            style={{ width: `${game.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Peak Stats */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Peak Hour</p>
                    <p className="text-2xl font-bold text-primary">{mockAnalytics.peakHour}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Today</p>
                    <p className="text-2xl font-bold">{mockAnalytics.todayCalls.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold text-green-500">{mockAnalytics.successRate}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Response</p>
                    <p className="text-2xl font-bold text-blue-500">{mockAnalytics.avgResponse}ms</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SystemMonitorPage;
