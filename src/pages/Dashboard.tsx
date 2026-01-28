import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import StatsCard from '@/components/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockDashboardStats, mockApiKeys, mockApiLogs, formatDate, getDaysUntilExpiry } from '@/lib/mockData';
import { Users, Key, Clock, Activity, TrendingUp, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const stats = mockDashboardStats;
  const recentLogs = mockApiLogs.slice(0, 5);
  const userKeys = mockApiKeys.filter(k => k.userId === user?.id);
  const expiringKeys = mockApiKeys.filter(k => {
    const days = getDaysUntilExpiry(k.expiresAt);
    return days > 0 && days <= 7;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.username}! 👋
          </h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Here\'s your system overview' : 'Here\'s your API usage overview'}
          </p>
        </div>

        {/* Stats Grid */}
        {isAdmin ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total Users"
              value={stats.totalUsers}
              icon={Users}
              variant="primary"
              description="Registered users"
            />
            <StatsCard
              title="Active Keys"
              value={stats.activeKeys}
              icon={Key}
              variant="accent"
              description="Currently active"
            />
            <StatsCard
              title="Expired Keys"
              value={stats.expiredKeys}
              icon={Clock}
              variant="warning"
              description="Need renewal"
            />
            <StatsCard
              title="Today's API Calls"
              value={stats.todayApiCalls.toLocaleString()}
              icon={Activity}
              trend={{ value: 12, isPositive: true }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatsCard
              title="My Active Keys"
              value={userKeys.filter(k => k.isActive).length}
              icon={Key}
              variant="primary"
            />
            <StatsCard
              title="Total API Calls"
              value={userKeys.reduce((sum, k) => sum + k.totalCalls, 0).toLocaleString()}
              icon={TrendingUp}
              variant="accent"
            />
            <StatsCard
              title="Keys Expiring Soon"
              value={userKeys.filter(k => getDaysUntilExpiry(k.expiresAt) <= 7 && getDaysUntilExpiry(k.expiresAt) > 0).length}
              icon={AlertTriangle}
              variant="warning"
            />
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent API Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Recent API Activity
              </CardTitle>
              <CardDescription>Latest API requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {log.status === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-success" />
                      ) : (
                        <XCircle className="w-5 h-5 text-destructive" />
                      )}
                      <div>
                        <p className="font-mono text-sm text-foreground">{log.endpoint}</p>
                        <p className="text-xs text-muted-foreground">{log.ip}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                        {log.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{log.responseTime}ms</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Expiring Keys / Server Health */}
          {isAdmin ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  Keys Expiring Soon
                </CardTitle>
                <CardDescription>Keys expiring in next 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                {expiringKeys.length > 0 ? (
                  <div className="space-y-3">
                    {expiringKeys.map((key) => (
                      <div
                        key={key.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/20"
                      >
                        <div>
                          <p className="font-mono text-sm text-foreground truncate max-w-[200px]">
                            {key.key.substring(0, 20)}...
                          </p>
                          <p className="text-xs text-muted-foreground">{key.domain}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="border-warning text-warning">
                            {getDaysUntilExpiry(key.expiresAt)} days left
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(key.expiresAt, false)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 text-success" />
                    <p>No keys expiring soon!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-primary" />
                  My API Keys
                </CardTitle>
                <CardDescription>Your active API keys</CardDescription>
              </CardHeader>
              <CardContent>
                {userKeys.length > 0 ? (
                  <div className="space-y-3">
                    {userKeys.map((key) => (
                      <div
                        key={key.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge className="uppercase">{key.gameType}</Badge>
                            <span className="text-xs text-muted-foreground">{key.duration}</span>
                          </div>
                          <p className="font-mono text-xs text-muted-foreground mt-1 truncate max-w-[200px]">
                            {key.key.substring(0, 25)}...
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={key.isActive ? 'default' : 'destructive'}>
                            {key.isActive ? 'Active' : 'Expired'}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {key.totalCalls.toLocaleString()} calls
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Key className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No API keys yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Server Health for Admin */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Server Health Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-success/10 border border-success/20">
                  <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
                  <div>
                    <p className="font-medium text-foreground">API Server</p>
                    <p className="text-sm text-success">Healthy</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-success/10 border border-success/20">
                  <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
                  <div>
                    <p className="font-medium text-foreground">Database</p>
                    <p className="text-sm text-success">Connected</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-success/10 border border-success/20">
                  <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
                  <div>
                    <p className="font-medium text-foreground">Telegram Bot</p>
                    <p className="text-sm text-success">Online</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
