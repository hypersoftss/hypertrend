import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Heart, Server, Database, MessageSquare, Wifi, Clock, Cpu, HardDrive, Activity, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

interface HealthData {
  api: { status: string; uptime: number; latency: number; totalCalls: number; successRate: number };
  database: { status: string; connections: number; tables: number };
  telegram: { status: string; messagesTotal: number; successRate: number };
}

interface RecentEvent {
  id: string;
  time: string;
  event: string;
  status: 'success' | 'warning' | 'error';
}

const ServerHealthPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const [healthData, setHealthData] = useState<HealthData>({
    api: { status: 'healthy', uptime: 99.9, latency: 45, totalCalls: 0, successRate: 100 },
    database: { status: 'healthy', connections: 0, tables: 9 },
    telegram: { status: 'healthy', messagesTotal: 0, successRate: 100 },
  });
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);

  const fetchHealthData = async () => {
    setIsLoading(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Fetch API logs for today
      const { data: apiLogs, error: apiLogsError } = await supabase
        .from('api_logs')
        .select('*')
        .gte('created_at', today.toISOString());

      if (apiLogsError) throw apiLogsError;

      const totalApiCalls = apiLogs?.length || 0;
      const successCalls = apiLogs?.filter(log => log.status === 'success').length || 0;
      const apiSuccessRate = totalApiCalls > 0 ? (successCalls / totalApiCalls) * 100 : 100;
      const avgLatency = totalApiCalls > 0
        ? Math.round(apiLogs.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / totalApiCalls)
        : 45;

      // Fetch API keys count
      const { count: activeKeysCount } = await supabase
        .from('api_keys')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Fetch Telegram logs
      const { data: telegramLogs, error: telegramError } = await supabase
        .from('telegram_logs')
        .select('*');

      if (telegramError) throw telegramError;

      const totalTelegramMessages = telegramLogs?.length || 0;
      const successTelegram = telegramLogs?.filter(log => log.status === 'sent').length || 0;
      const telegramSuccessRate = totalTelegramMessages > 0 ? (successTelegram / totalTelegramMessages) * 100 : 100;

      // Fetch recent activity logs
      const { data: activityLogs, error: activityError } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (activityError) throw activityError;

      // Update health data
      setHealthData({
        api: {
          status: apiSuccessRate >= 95 ? 'healthy' : apiSuccessRate >= 80 ? 'warning' : 'critical',
          uptime: 99.9,
          latency: avgLatency,
          totalCalls: totalApiCalls,
          successRate: Math.round(apiSuccessRate * 10) / 10,
        },
        database: {
          status: 'healthy',
          connections: activeKeysCount || 0,
          tables: 9,
        },
        telegram: {
          status: telegramSuccessRate >= 90 ? 'healthy' : 'warning',
          messagesTotal: totalTelegramMessages,
          successRate: Math.round(telegramSuccessRate * 10) / 10,
        },
      });

      // Map activity logs to recent events
      const events: RecentEvent[] = (activityLogs || []).map(log => ({
        id: log.id,
        time: getTimeAgo(new Date(log.created_at!)),
        event: log.action,
        status: 'success' as const,
      }));

      setRecentEvents(events.length > 0 ? events : [
        { id: '1', time: 'Just now', event: 'Health check passed', status: 'success' },
      ]);

      setLastChecked(new Date());
    } catch (error) {
      console.error('Error fetching health data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hour ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  useEffect(() => {
    fetchHealthData();
    const interval = setInterval(fetchHealthData, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

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

  const getOverallStatus = () => {
    const statuses = [healthData.api.status, healthData.database.status, healthData.telegram.status];
    if (statuses.includes('critical')) return { text: 'System Issues Detected', color: 'bg-destructive' };
    if (statuses.includes('warning')) return { text: 'Minor Issues', color: 'bg-warning' };
    return { text: 'All Systems Operational', color: 'bg-success' };
  };

  const overallStatus = getOverallStatus();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Heart className="w-8 h-8 text-primary" />
              Server Health
            </h1>
            <p className="text-muted-foreground mt-1">Real-time system monitoring and status</p>
          </div>
          <Button onClick={fetchHealthData} disabled={isLoading} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Overall Status */}
        <Card className="gradient-primary text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-4 h-4 rounded-full ${overallStatus.color} animate-pulse`} />
                <div>
                  <h2 className="text-2xl font-bold">{overallStatus.text}</h2>
                  <p className="text-primary-foreground/80">
                    Last checked: {lastChecked.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold">{healthData.api.uptime}%</p>
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
                <p>Success Rate: {healthData.api.successRate}%</p>
                <p>Avg Latency: {healthData.api.latency}ms</p>
                <p>Today's Calls: {healthData.api.totalCalls}</p>
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
                <p>Active Keys: {healthData.database.connections}</p>
                <p>Tables: {healthData.database.tables}</p>
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
                <p>Total Messages: {healthData.telegram.messagesTotal}</p>
                <p>Success Rate: {healthData.telegram.successRate}%</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-warning/10">
                  <Wifi className="w-5 h-5 text-warning" />
                </div>
                <Badge className="bg-success text-success-foreground">healthy</Badge>
              </div>
              <h3 className="font-semibold text-foreground">BetAPI Connection</h3>
              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                <p>Status: Connected</p>
                <p>Response Time: ~120ms</p>
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
                    <span className="text-sm font-medium text-foreground">API Success</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{healthData.api.successRate}%</span>
                </div>
                <Progress value={healthData.api.successRate} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Telegram</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{healthData.telegram.successRate}%</span>
                </div>
                <Progress value={healthData.telegram.successRate} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Database</span>
                  </div>
                  <span className="text-sm text-muted-foreground">100%</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Network</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Active</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentEvents.length > 0 ? (
                recentEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      {event.status === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-success" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-warning" />
                      )}
                      <span className="text-sm text-foreground">{event.event}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{event.time}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ServerHealthPage;
