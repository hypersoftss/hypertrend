import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Heart, Server, Database, MessageSquare, Wifi, Clock, Cpu, HardDrive, Activity } from 'lucide-react';

const ServerHealthPage = () => {
  // Mock server health data
  const healthData = {
    api: { status: 'healthy', uptime: 99.9, latency: 45 },
    database: { status: 'healthy', connections: 12, maxConnections: 100, size: '256 MB' },
    telegram: { status: 'healthy', messagesPerDay: 150, lastMessage: '2 min ago' },
    betApi: { status: 'healthy', responseTime: 120, successRate: 99.5 },
  };

  const systemMetrics = {
    cpu: 35,
    memory: 62,
    disk: 45,
    network: 78,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-success text-success-foreground';
      case 'warning':
        return 'bg-warning text-warning-foreground';
      case 'critical':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Heart className="w-8 h-8 text-primary" />
            Server Health
          </h1>
          <p className="text-muted-foreground mt-1">Real-time system monitoring and status</p>
        </div>

        {/* Overall Status */}
        <Card className="gradient-primary text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 rounded-full bg-success animate-pulse" />
                <div>
                  <h2 className="text-2xl font-bold">All Systems Operational</h2>
                  <p className="text-primary-foreground/80">Last checked: Just now</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold">99.9%</p>
                <p className="text-primary-foreground/80">Uptime</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Server className="w-5 h-5 text-primary" />
                </div>
                <Badge className={getStatusColor(healthData.api.status)}>
                  {healthData.api.status}
                </Badge>
              </div>
              <h3 className="font-semibold text-foreground">API Server</h3>
              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                <p>Uptime: {healthData.api.uptime}%</p>
                <p>Latency: {healthData.api.latency}ms</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Database className="w-5 h-5 text-accent" />
                </div>
                <Badge className={getStatusColor(healthData.database.status)}>
                  {healthData.database.status}
                </Badge>
              </div>
              <h3 className="font-semibold text-foreground">Database</h3>
              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                <p>Connections: {healthData.database.connections}/{healthData.database.maxConnections}</p>
                <p>Size: {healthData.database.size}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-info/10">
                  <MessageSquare className="w-5 h-5 text-info" />
                </div>
                <Badge className={getStatusColor(healthData.telegram.status)}>
                  {healthData.telegram.status}
                </Badge>
              </div>
              <h3 className="font-semibold text-foreground">Telegram Bot</h3>
              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                <p>Messages/Day: {healthData.telegram.messagesPerDay}</p>
                <p>Last Message: {healthData.telegram.lastMessage}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-warning/10">
                  <Wifi className="w-5 h-5 text-warning" />
                </div>
                <Badge className={getStatusColor(healthData.betApi.status)}>
                  {healthData.betApi.status}
                </Badge>
              </div>
              <h3 className="font-semibold text-foreground">BetAPI Connection</h3>
              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                <p>Response Time: {healthData.betApi.responseTime}ms</p>
                <p>Success Rate: {healthData.betApi.successRate}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              System Metrics
            </CardTitle>
            <CardDescription>Real-time resource utilization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">CPU Usage</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{systemMetrics.cpu}%</span>
                </div>
                <Progress value={systemMetrics.cpu} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Memory</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{systemMetrics.memory}%</span>
                </div>
                <Progress value={systemMetrics.memory} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Disk</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{systemMetrics.disk}%</span>
                </div>
                <Progress value={systemMetrics.disk} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Network</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{systemMetrics.network}%</span>
                </div>
                <Progress value={systemMetrics.network} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recent Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { time: '2 min ago', event: 'Health check passed', status: 'success' },
                { time: '5 min ago', event: 'API request completed', status: 'success' },
                { time: '10 min ago', event: 'Database backup completed', status: 'success' },
                { time: '15 min ago', event: 'Telegram bot reconnected', status: 'warning' },
                { time: '1 hour ago', event: 'SSL certificate renewed', status: 'success' },
              ].map((event, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${event.status === 'success' ? 'bg-success' : 'bg-warning'}`} />
                    <span className="text-sm text-foreground">{event.event}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{event.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ServerHealthPage;
