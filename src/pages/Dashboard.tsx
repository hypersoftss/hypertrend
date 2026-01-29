import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useApiData } from '@/contexts/ApiDataContext';
import DashboardLayout from '@/components/DashboardLayout';
import StatsCard from '@/components/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { mockDashboardStats, mockApiLogs, formatDate, getDaysUntilExpiry, isExpired, formatDateTime } from '@/lib/mockData';
import { 
  Users, Key, Clock, Activity, TrendingUp, AlertTriangle, CheckCircle, XCircle, 
  BarChart3, ArrowRight, Heart, Zap, Timer, Shield, ArrowUpRight, ArrowDownRight,
  History, Server
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { apiKeys, users } = useApiData();
  const isAdmin = user?.role === 'admin';

  const stats = {
    ...mockDashboardStats,
    totalUsers: users.length,
    activeKeys: apiKeys.filter(k => k.isActive && !isExpired(k.expiresAt)).length,
    expiredKeys: apiKeys.filter(k => isExpired(k.expiresAt)).length,
  };
  const recentLogs = mockApiLogs.slice(0, 5);
  const userKeys = apiKeys.filter(k => k.userId === user?.id);
  const userKeyIds = userKeys.map(k => k.id);
  const userLogs = mockApiLogs.filter(log => userKeyIds.includes(log.apiKeyId));
  const expiringKeys = apiKeys.filter(k => {
    const days = getDaysUntilExpiry(k.expiresAt);
    return days > 0 && days <= 7;
  });

  // User stats calculations
  const successfulCalls = userLogs.filter(l => l.status === 'success').length;
  const errorCalls = userLogs.filter(l => l.status === 'error').length;
  const blockedCalls = userLogs.filter(l => l.status === 'blocked').length;
  const totalCalls = userLogs.length;
  const successRate = totalCalls > 0 ? ((successfulCalls / totalCalls) * 100).toFixed(1) : '0';
  const avgResponseTime = totalCalls > 0 
    ? Math.round(userLogs.reduce((sum, l) => sum + l.responseTime, 0) / totalCalls)
    : 0;

  // Game type colors
  const getGameTypeColor = (gameType: string) => {
    const colors: Record<string, string> = {
      wingo: 'bg-purple-500',
      k3: 'bg-blue-500',
      '5d': 'bg-green-500',
      trx: 'bg-orange-500',
      numeric: 'bg-pink-500'
    };
    return colors[gameType.toLowerCase()] || 'bg-primary';
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              Welcome, {user?.username}! 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isAdmin ? 'System overview at a glance' : 'Your API usage overview'}
            </p>
          </div>
          {isAdmin ? (
            <Link to="/admin/analytics">
              <Button variant="outline" size="sm" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                View Analytics
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <Badge variant="outline" className="text-xs sm:text-sm px-3 py-1.5 w-fit">
              <Server className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
              Hyper Softs trend
            </Badge>
          )}
        </div>

        {/* Stats Grid */}
        {isAdmin ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
          /* User Stats - Enhanced */
          <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex sm:grid sm:grid-cols-5 gap-3 min-w-max sm:min-w-0">
              {/* Active Keys - Primary */}
              <Card className="gradient-primary text-primary-foreground min-w-[130px] sm:min-w-0">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-white/20">
                      <Key className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold">
                        {userKeys.filter(k => k.isActive && !isExpired(k.expiresAt)).length}
                      </p>
                      <p className="text-[10px] sm:text-xs opacity-90">Active Keys</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Calls */}
              <Card className="glass min-w-[130px] sm:min-w-0">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-accent/20">
                      <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-foreground">
                        {userKeys.reduce((sum, k) => sum + k.totalCalls, 0).toLocaleString()}
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Total Calls</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Success Rate */}
              <Card className="glass min-w-[130px] sm:min-w-0">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-success/20">
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-foreground">{successRate}%</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Success Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Avg Response */}
              <Card className="glass min-w-[130px] sm:min-w-0">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-warning/20">
                      <Timer className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-foreground">{avgResponseTime}ms</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Avg Response</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Expiring Soon */}
              <Card className="glass min-w-[130px] sm:min-w-0">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-muted">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-foreground">
                        {userKeys.filter(k => getDaysUntilExpiry(k.expiresAt) <= 7 && getDaysUntilExpiry(k.expiresAt) > 0).length}
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Expiring Soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Server Health - Admin Only */}
        {isAdmin && (
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Heart className="w-5 h-5 text-primary" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

        {/* User - Request Stats Summary */}
        {!isAdmin && (
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="w-5 h-5 text-primary" />
                Request Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20">
                  <ArrowUpRight className="w-4 h-4 text-success shrink-0" />
                  <div>
                    <p className="text-lg sm:text-xl font-bold text-success">{successfulCalls}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Success</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <ArrowDownRight className="w-4 h-4 text-destructive shrink-0" />
                  <div>
                    <p className="text-lg sm:text-xl font-bold text-destructive">{errorCalls}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Errors</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <Shield className="w-4 h-4 text-warning shrink-0" />
                  <div>
                    <p className="text-lg sm:text-xl font-bold text-warning">{blockedCalls}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Blocked</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Recent API Logs */}
          <Card className="glass">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="w-5 h-5 text-primary" />
                  Recent Activity
                </CardTitle>
                <Link to={isAdmin ? "/admin/logs" : "/user/logs"}>
                  <Button variant="ghost" size="sm" className="text-xs h-8">
                    View All <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(isAdmin ? recentLogs : userLogs.slice(0, 5)).map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      {log.status === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-success" />
                      ) : log.status === 'blocked' ? (
                        <Shield className="w-4 h-4 text-warning" />
                      ) : (
                        <XCircle className="w-4 h-4 text-destructive" />
                      )}
                      <div>
                        <p className="font-mono text-xs text-foreground">{log.endpoint}</p>
                        <p className="text-[10px] text-muted-foreground">{log.ip}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        className={`text-[10px] px-1.5 py-0 ${
                          log.status === 'success' ? 'bg-success text-success-foreground' : 
                          log.status === 'blocked' ? 'bg-warning text-warning-foreground' :
                          'bg-destructive text-destructive-foreground'
                        }`}
                      >
                        {log.status}
                      </Badge>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{log.responseTime}ms</p>
                    </div>
                  </div>
                ))}
                {(isAdmin ? recentLogs : userLogs).length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <History className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No activity yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Expiring Keys / User Keys */}
          {isAdmin ? (
            <Card className="glass">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                    Expiring Soon
                  </CardTitle>
                  <Link to="/admin/keys">
                    <Button variant="ghost" size="sm" className="text-xs h-8">
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
                            <Badge className={`${getGameTypeColor(key.gameType)} text-white uppercase text-[10px]`}>{key.gameType}</Badge>
                            <span className="text-xs text-muted-foreground truncate max-w-[100px]">{key.domain}</span>
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
            <Card className="glass">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Key className="w-5 h-5 text-primary" />
                    My API Keys
                  </CardTitle>
                  <Link to="/user/keys">
                    <Button variant="ghost" size="sm" className="text-xs h-8">
                      View All <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {userKeys.length > 0 ? (
                  <div className="space-y-2">
                    {userKeys.map((key) => {
                      const daysLeft = getDaysUntilExpiry(key.expiresAt);
                      const expired = isExpired(key.expiresAt);
                      return (
                        <div
                          key={key.id}
                          className="p-3 rounded-lg bg-muted/30 border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge className={`${getGameTypeColor(key.gameType)} text-white uppercase text-[10px]`}>{key.gameType}</Badge>
                              <Badge variant="outline" className="text-[10px]">{key.duration}</Badge>
                            </div>
                            <Badge 
                              className={`text-[10px] ${
                                expired ? 'bg-destructive text-destructive-foreground' :
                                daysLeft <= 7 ? 'bg-warning text-warning-foreground' :
                                'bg-success text-success-foreground'
                              }`}
                            >
                              {expired ? 'Expired' : `${daysLeft}d left`}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="truncate max-w-[120px]">{key.domain}</span>
                            <span>{key.totalCalls.toLocaleString()} calls</span>
                          </div>
                          <Progress 
                            value={Math.max(0, Math.min(100, (daysLeft / key.validityDays) * 100))}
                            className={`h-1 mt-2 ${
                              daysLeft <= 3 ? '[&>div]:bg-destructive' :
                              daysLeft <= 7 ? '[&>div]:bg-warning' : '[&>div]:bg-success'
                            }`}
                          />
                        </div>
                      );
                    })}
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
