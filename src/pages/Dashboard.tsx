import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import StatsCard from '@/components/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { mockDashboardStats, mockApiKeys, mockApiLogs, formatDate, getDaysUntilExpiry } from '@/lib/mockData';
import { Users, Key, Clock, Activity, TrendingUp, AlertTriangle, CheckCircle, XCircle, BarChart3, ArrowRight, MessageSquare, Heart } from 'lucide-react';

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {user?.username}! 👋
            </h1>
            <p className="text-muted-foreground">
              {isAdmin ? 'System overview at a glance' : 'Your API usage overview'}
            </p>
          </div>
          {isAdmin && (
            <Link to="/admin/analytics">
              <Button variant="outline" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                View Analytics
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>

        {/* Stats Grid */}
        {isAdmin ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
              title="Today's Calls"
              value={stats.todayApiCalls.toLocaleString()}
              icon={Activity}
              trend={{ value: 12, isPositive: true }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              title="Expiring Soon"
              value={userKeys.filter(k => getDaysUntilExpiry(k.expiresAt) <= 7 && getDaysUntilExpiry(k.expiresAt) > 0).length}
              icon={AlertTriangle}
              variant="warning"
            />
          </div>
        )}

        {/* Server Health - Admin Only */}
        {isAdmin && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Heart className="w-5 h-5 text-primary" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
                  <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
                  <div>
                    <p className="font-medium text-sm text-foreground">API Server</p>
                    <p className="text-xs text-success">Healthy</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
                  <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
                  <div>
                    <p className="font-medium text-sm text-foreground">Database</p>
                    <p className="text-xs text-success">Connected</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
                  <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
                  <div>
                    <p className="font-medium text-sm text-foreground">Telegram Bot</p>
                    <p className="text-xs text-success">Running</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent API Logs */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="w-5 h-5 text-primary" />
                  Recent Activity
                </CardTitle>
                {isAdmin && (
                  <Link to="/admin/logs">
                    <Button variant="ghost" size="sm" className="text-xs">
                      View All <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      {log.status === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-success" />
                      ) : (
                        <XCircle className="w-4 h-4 text-destructive" />
                      )}
                      <div>
                        <p className="font-mono text-xs text-foreground">{log.endpoint}</p>
                        <p className="text-[10px] text-muted-foreground">{log.ip}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={log.status === 'success' ? 'default' : 'destructive'} className="text-[10px] px-1.5 py-0">
                        {log.status}
                      </Badge>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{log.responseTime}ms</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Expiring Keys / User Keys */}
          {isAdmin ? (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                    Expiring Soon
                  </CardTitle>
                  <Link to="/admin/keys">
                    <Button variant="ghost" size="sm" className="text-xs">
                      Manage <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {expiringKeys.length > 0 ? (
                  <div className="space-y-2">
                    {expiringKeys.slice(0, 4).map((key) => (
                      <div
                        key={key.id}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-warning/10 border border-warning/20"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge className="uppercase text-[10px]">{key.gameType}</Badge>
                            <span className="text-xs text-muted-foreground">{key.domain}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="border-warning text-warning text-xs">
                          {getDaysUntilExpiry(key.expiresAt)}d left
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <CheckCircle className="w-10 h-10 mx-auto mb-2 text-success" />
                    <p className="text-sm">All keys are healthy!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Key className="w-5 h-5 text-primary" />
                    My API Keys
                  </CardTitle>
                  <Link to="/user/keys">
                    <Button variant="ghost" size="sm" className="text-xs">
                      View All <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {userKeys.length > 0 ? (
                  <div className="space-y-2">
                    {userKeys.map((key) => (
                      <div
                        key={key.id}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          <Badge className="uppercase text-[10px]">{key.gameType}</Badge>
                          <span className="text-xs text-muted-foreground">{key.duration}</span>
                        </div>
                        <div className="text-right">
                          <Badge variant={key.isActive ? 'default' : 'destructive'} className="text-[10px]">
                            {key.isActive ? 'Active' : 'Expired'}
                          </Badge>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {key.totalCalls.toLocaleString()} calls
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Key className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No API keys yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
