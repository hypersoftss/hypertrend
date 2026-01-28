import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockApiKeys, mockApiLogs, getDaysUntilExpiry, isExpired } from '@/lib/mockData';
import { 
  BarChart3, TrendingUp, Activity, Clock, CheckCircle, XCircle, 
  AlertTriangle, Key, Zap, Target, Timer
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const UserAnalyticsPage = () => {
  const { user } = useAuth();

  // Get user's keys and logs
  const userKeys = mockApiKeys.filter(k => k.userId === user?.id);
  const userKeyIds = userKeys.map(k => k.id);
  const userLogs = mockApiLogs.filter(log => userKeyIds.includes(log.apiKeyId));

  // Calculate stats
  const totalCalls = userLogs.length;
  const successCount = userLogs.filter(l => l.status === 'success').length;
  const errorCount = userLogs.filter(l => l.status === 'error').length;
  const blockedCount = userLogs.filter(l => l.status === 'blocked').length;
  const successRate = totalCalls > 0 ? ((successCount / totalCalls) * 100).toFixed(1) : '0';
  const avgResponseTime = totalCalls > 0 
    ? Math.round(userLogs.reduce((sum, l) => sum + l.responseTime, 0) / totalCalls) 
    : 0;

  // Mock hourly data for chart
  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i.toString().padStart(2, '0')}:00`,
    calls: Math.floor(Math.random() * 100) + 20,
    success: Math.floor(Math.random() * 80) + 15,
  }));

  // Game distribution
  const gameDistribution = userKeys.reduce((acc, key) => {
    const game = key.gameType.toUpperCase();
    acc[game] = (acc[game] || 0) + key.totalCalls;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(gameDistribution).map(([name, value]) => ({ name, value }));
  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'];

  // Active vs Expired keys
  const activeKeys = userKeys.filter(k => k.isActive && !isExpired(k.expiresAt)).length;
  const expiredKeys = userKeys.filter(k => isExpired(k.expiresAt)).length;
  const expiringKeys = userKeys.filter(k => {
    const days = getDaysUntilExpiry(k.expiresAt);
    return days > 0 && days <= 7;
  }).length;

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6 pb-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              My Analytics
            </h1>
            <p className="text-muted-foreground text-sm">
              Track your API usage and performance
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="border-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
            <CardContent className="p-3 sm:p-5 relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Total Calls</p>
                  <p className="text-xl sm:text-3xl font-bold text-primary mt-1">{totalCalls.toLocaleString()}</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-success/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-success/10 to-transparent" />
            <CardContent className="p-3 sm:p-5 relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Success Rate</p>
                  <p className="text-xl sm:text-3xl font-bold text-success mt-1">{successRate}%</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-success/20 flex items-center justify-center">
                  <Target className="w-4 h-4 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent" />
            <CardContent className="p-3 sm:p-5 relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Avg Response</p>
                  <p className="text-xl sm:text-3xl font-bold mt-1">{avgResponseTime}ms</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Timer className="w-4 h-4 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <CardContent className="p-3 sm:p-5 relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Active Keys</p>
                  <p className="text-xl sm:text-3xl font-bold mt-1">{activeKeys}</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Key className="w-4 h-4 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Usage Chart */}
          <Card>
            <CardHeader className="p-3 sm:p-6 pb-2">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Hourly Usage
              </CardTitle>
              <CardDescription className="text-xs">API calls over the last 24 hours</CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-6 pt-0">
              <div className="h-[200px] sm:h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyData}>
                    <defs>
                      <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }} 
                    />
                    <Area type="monotone" dataKey="calls" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorCalls)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Game Distribution */}
          <Card>
            <CardHeader className="p-3 sm:p-6 pb-2">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Game Distribution
              </CardTitle>
              <CardDescription className="text-xs">API calls by game type</CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-6 pt-0">
              <div className="h-[200px] sm:h-[250px] flex items-center justify-center">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No data yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Breakdown */}
        <Card>
          <CardHeader className="p-3 sm:p-6 pb-2">
            <CardTitle className="text-sm sm:text-base">Response Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-2">
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 rounded-xl bg-success/10 border border-success/30 text-center">
                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-success mx-auto mb-2" />
                <p className="text-2xl sm:text-3xl font-bold text-success">{successCount}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Successful</p>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-center">
                <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-destructive mx-auto mb-2" />
                <p className="text-2xl sm:text-3xl font-bold text-destructive">{errorCount}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Errors</p>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-warning/10 border border-warning/30 text-center">
                <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-warning mx-auto mb-2" />
                <p className="text-2xl sm:text-3xl font-bold text-warning">{blockedCount}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Blocked</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Status */}
        <Card>
          <CardHeader className="p-3 sm:p-6 pb-2">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <Key className="w-4 h-4 text-primary" />
              Key Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-2">
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 rounded-xl bg-success/10 border border-success/30 text-center">
                <p className="text-2xl sm:text-3xl font-bold text-success">{activeKeys}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Active</p>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-warning/10 border border-warning/30 text-center">
                <p className="text-2xl sm:text-3xl font-bold text-warning">{expiringKeys}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Expiring Soon</p>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-center">
                <p className="text-2xl sm:text-3xl font-bold text-destructive">{expiredKeys}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Expired</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UserAnalyticsPage;
