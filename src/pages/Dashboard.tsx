import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import StatsCard from '@/components/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, Key, Clock, Activity, TrendingUp, AlertTriangle, CheckCircle, XCircle, 
  BarChart3, ArrowRight, Heart, Zap, Timer, Shield, ArrowUpRight, ArrowDownRight,
  History, Server, Loader2
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  activeKeys: number;
  expiredKeys: number;
  todayApiCalls: number;
  totalApiCalls: number;
}

interface ApiLogItem {
  id: string;
  endpoint: string;
  ip_address: string | null;
  status: string;
  response_time_ms: number | null;
  created_at: string | null;
  game_type: string | null;
}

interface ApiKeyItem {
  id: string;
  key_name: string;
  status: string;
  expires_at: string | null;
  calls_total: number | null;
  calls_today: number | null;
  created_at: string | null;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeKeys: 0,
    expiredKeys: 0,
    todayApiCalls: 0,
    totalApiCalls: 0
  });
  const [recentLogs, setRecentLogs] = useState<ApiLogItem[]>([]);
  const [userKeys, setUserKeys] = useState<ApiKeyItem[]>([]);
  const [expiringKeys, setExpiringKeys] = useState<ApiKeyItem[]>([]);
  const [systemHealth, setSystemHealth] = useState({
    apiServer: 'healthy',
    database: 'healthy',
    telegramBot: 'healthy'
  });

  // Helper functions
  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const getDaysUntilExpiry = (expiresAt: string | null) => {
    if (!expiresAt) return 0;
    const diff = new Date(expiresAt).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getGameTypeColor = (gameType: string | null) => {
    const colors: Record<string, string> = {
      wingo: 'bg-purple-500',
      k3: 'bg-blue-500',
      '5d': 'bg-green-500',
      trx: 'bg-orange-500',
      numeric: 'bg-pink-500'
    };
    return colors[gameType?.toLowerCase() || ''] || 'bg-primary';
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (isAdmin) {
          // Admin: Fetch all stats
          const [usersRes, keysRes, logsRes] = await Promise.all([
            supabase.from('profiles').select('id', { count: 'exact', head: true }),
            supabase.from('api_keys').select('*'),
            supabase.from('api_logs').select('*').order('created_at', { ascending: false }).limit(100)
          ]);

          const allKeys = keysRes.data || [];
          const allLogs = logsRes.data || [];
          const todayLogs = allLogs.filter(l => l.created_at && new Date(l.created_at) >= today);

          setStats({
            totalUsers: usersRes.count || 0,
            activeKeys: allKeys.filter(k => k.status === 'active' && !isExpired(k.expires_at)).length,
            expiredKeys: allKeys.filter(k => isExpired(k.expires_at)).length,
            todayApiCalls: todayLogs.length,
            totalApiCalls: allLogs.length
          });

          setRecentLogs(allLogs.slice(0, 5));
          setExpiringKeys(allKeys.filter(k => {
            const days = getDaysUntilExpiry(k.expires_at);
            return days > 0 && days <= 7;
          }));

          // Check system health via recent activity
          const recentSuccess = allLogs.filter(l => l.status === 'success').length;
          const healthStatus = recentSuccess > 0 ? 'healthy' : 'warning';
          setSystemHealth({
            apiServer: healthStatus,
            database: 'healthy',
            telegramBot: 'healthy'
          });

        } else {
          // User: Fetch only their data
          const [keysRes, logsRes] = await Promise.all([
            supabase.from('api_keys').select('*').eq('user_id', user.id),
            supabase.from('api_logs').select('*').order('created_at', { ascending: false }).limit(100)
          ]);

          const myKeys = keysRes.data || [];
          const keyIds = myKeys.map(k => k.id);
          
          // Filter logs for user's keys
          let { data: userLogsData } = await supabase
            .from('api_logs')
            .select('*')
            .in('api_key_id', keyIds.length > 0 ? keyIds : ['no-keys'])
            .order('created_at', { ascending: false })
            .limit(50);

          const userLogs = userLogsData || [];
          setUserKeys(myKeys);
          setRecentLogs(userLogs.slice(0, 5));

          const totalCalls = userLogs.length;
          const successfulCalls = userLogs.filter(l => l.status === 'success').length;
          
          setStats({
            totalUsers: 0,
            activeKeys: myKeys.filter(k => k.status === 'active' && !isExpired(k.expires_at)).length,
            expiredKeys: myKeys.filter(k => isExpired(k.expires_at)).length,
            todayApiCalls: totalCalls,
            totalApiCalls: myKeys.reduce((sum, k) => sum + (k.calls_total || 0), 0)
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, isAdmin]);

  // Calculate user stats from logs
  const userLogs = recentLogs;
  const successfulCalls = userLogs.filter(l => l.status === 'success').length;
  const errorCalls = userLogs.filter(l => l.status === 'error').length;
  const blockedCalls = userLogs.filter(l => l.status === 'blocked').length;
  const totalCalls = userLogs.length;
  const successRate = totalCalls > 0 ? ((successfulCalls / totalCalls) * 100).toFixed(1) : '0';
  const avgResponseTime = totalCalls > 0 
    ? Math.round(userLogs.reduce((sum, l) => sum + (l.response_time_ms || 0), 0) / totalCalls)
    : 0;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

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
                        {userKeys.filter(k => k.status === 'active' && !isExpired(k.expires_at)).length}
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
                        {userKeys.reduce((sum, k) => sum + (k.calls_total || 0), 0).toLocaleString()}
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
                        {userKeys.filter(k => getDaysUntilExpiry(k.expires_at) <= 7 && getDaysUntilExpiry(k.expires_at) > 0).length}
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
                <div className={`flex items-center gap-3 p-3 rounded-lg ${systemHealth.apiServer === 'healthy' ? 'bg-success/10 border border-success/20' : 'bg-warning/10 border border-warning/20'}`}>
                  <div className={`w-2.5 h-2.5 rounded-full ${systemHealth.apiServer === 'healthy' ? 'bg-success' : 'bg-warning'} animate-pulse`} />
                  <div>
                    <p className="font-medium text-sm text-foreground">API Server</p>
                    <p className={`text-xs ${systemHealth.apiServer === 'healthy' ? 'text-success' : 'text-warning'}`}>
                      {systemHealth.apiServer === 'healthy' ? 'Healthy' : 'Warning'}
                    </p>
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
                {recentLogs.map((log) => (
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
                        <p className="text-[10px] text-muted-foreground">{log.ip_address || 'N/A'}</p>
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
                      <p className="text-[10px] text-muted-foreground mt-0.5">{log.response_time_ms || 0}ms</p>
                    </div>
                  </div>
                ))}
                {recentLogs.length === 0 && (
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
                            <Badge className="bg-primary text-white uppercase text-[10px]">
                              {key.key_name?.split(' - ')[0] || 'API'}
                            </Badge>
                            <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                              {key.key_name?.split(' - ')[1] || key.key_name}
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline" className="border-warning text-warning text-xs">
                          {getDaysUntilExpiry(key.expires_at)}d left
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
                      const daysLeft = getDaysUntilExpiry(key.expires_at);
                      const expired = isExpired(key.expires_at);
                      const validityDays = key.expires_at && key.created_at 
                        ? Math.ceil((new Date(key.expires_at).getTime() - new Date(key.created_at).getTime()) / (1000 * 60 * 60 * 24))
                        : 30;
                      return (
                        <div
                          key={key.id}
                          className="p-3 rounded-lg bg-muted/30 border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge className={`${getGameTypeColor(key.key_name?.split(' ')[0] || null)} text-white uppercase text-[10px]`}>
                                {key.key_name?.split(' - ')[0] || 'API'}
                              </Badge>
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
                            <span className="truncate max-w-[120px]">{key.key_name?.split(' - ')[1] || key.key_name}</span>
                            <span>{(key.calls_total || 0).toLocaleString()} calls</span>
                          </div>
                          <Progress 
                            value={Math.max(0, Math.min(100, (daysLeft / validityDays) * 100))}
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
