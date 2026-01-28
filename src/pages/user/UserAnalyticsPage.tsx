import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useConfig } from '@/contexts/ConfigContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockApiKeys, mockApiLogs, getDaysUntilExpiry, isExpired, formatDate } from '@/lib/mockData';
import { 
  BarChart3, TrendingUp, Activity, Clock, CheckCircle, XCircle, 
  AlertTriangle, Key, Zap, Target, Timer, Server, ArrowUpRight, 
  ArrowDownRight, Shield, Gauge, Sparkles
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, Legend, LineChart, Line
} from 'recharts';

const UserAnalyticsPage = () => {
  const { user } = useAuth();
  const { config } = useConfig();

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
    errors: Math.floor(Math.random() * 10),
  }));

  // Last 7 days data
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      calls: Math.floor(Math.random() * 500) + 100,
      success: Math.floor(Math.random() * 400) + 80,
    };
  });

  // Game distribution
  const gameDistribution = userKeys.reduce((acc, key) => {
    const game = key.gameType.toUpperCase();
    acc[game] = (acc[game] || 0) + key.totalCalls;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(gameDistribution).map(([name, value]) => ({ name, value }));
  
  const COLORS = {
    WINGO: '#8b5cf6',
    K3: '#3b82f6',
    '5D': '#10b981',
    TRX: '#f59e0b',
    NUMERIC: '#ec4899'
  };

  // Response time distribution
  const responseTimeData = [
    { range: '0-50ms', count: Math.floor(totalCalls * 0.4), color: '#10b981' },
    { range: '51-100ms', count: Math.floor(totalCalls * 0.35), color: '#3b82f6' },
    { range: '101-200ms', count: Math.floor(totalCalls * 0.15), color: '#f59e0b' },
    { range: '200ms+', count: Math.floor(totalCalls * 0.1), color: '#ef4444' },
  ];

  // Active vs Expired keys
  const activeKeys = userKeys.filter(k => k.isActive && !isExpired(k.expiresAt)).length;
  const expiredKeys = userKeys.filter(k => isExpired(k.expiresAt)).length;
  const expiringKeys = userKeys.filter(k => {
    const days = getDaysUntilExpiry(k.expiresAt);
    return days > 0 && days <= 7;
  }).length;

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
      <div className="space-y-4 sm:space-y-6 pb-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl gradient-primary flex items-center justify-center">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                Analytics Dashboard
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Track your API usage and performance metrics
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs px-3 py-1.5 w-fit">
            <Server className="w-3 h-3 mr-1.5" />
            {config.siteName}
          </Badge>
        </div>

        {/* Stats Grid - Scrollable on mobile */}
        <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex sm:grid sm:grid-cols-4 gap-3 min-w-max sm:min-w-0">
            <Card className="gradient-primary text-white min-w-[140px] sm:min-w-0">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/20">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold">{totalCalls.toLocaleString()}</p>
                    <p className="text-[10px] sm:text-xs opacity-90">Total Calls</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass min-w-[140px] sm:min-w-0">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/20">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-success">{successRate}%</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Success Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass min-w-[140px] sm:min-w-0">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning/20">
                    <Gauge className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">{avgResponseTime}ms</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Avg Response</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass min-w-[140px] sm:min-w-0">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Key className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">{activeKeys}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Active Keys</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <Card className="glass">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-success shrink-0" />
                <div className="min-w-0">
                  <p className="text-lg sm:text-2xl font-bold text-success">{successCount}</p>
                  <p className="text-[9px] sm:text-xs text-muted-foreground">Successful</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5 text-destructive shrink-0" />
                <div className="min-w-0">
                  <p className="text-lg sm:text-2xl font-bold text-destructive">{errorCount}</p>
                  <p className="text-[9px] sm:text-xs text-muted-foreground">Errors</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-warning shrink-0" />
                <div className="min-w-0">
                  <p className="text-lg sm:text-2xl font-bold text-warning">{blockedCount}</p>
                  <p className="text-[9px] sm:text-xs text-muted-foreground">Blocked</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row - Weekly Trend */}
        <Card className="glass">
          <CardHeader className="p-3 sm:p-6 pb-2">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Weekly API Usage
            </CardTitle>
            <CardDescription className="text-xs">API calls over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-6 pt-0">
            <div className="h-[180px] sm:h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorWeekly" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }} 
                  />
                  <Area type="monotone" dataKey="calls" stroke="hsl(262, 83%, 58%)" strokeWidth={2} fillOpacity={1} fill="url(#colorWeekly)" name="Total Calls" />
                  <Area type="monotone" dataKey="success" stroke="hsl(142, 76%, 36%)" strokeWidth={2} fillOpacity={1} fill="url(#colorSuccess)" name="Success" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Two Column - Hourly & Game Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Hourly Chart */}
          <Card className="glass">
            <CardHeader className="p-3 sm:p-6 pb-2">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Hourly Distribution
              </CardTitle>
              <CardDescription className="text-xs">Requests per hour today</CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-6 pt-0">
              <div className="h-[180px] sm:h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyData.filter((_, i) => i % 2 === 0)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis dataKey="hour" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '11px'
                      }} 
                    />
                    <Bar dataKey="calls" fill="hsl(262, 83%, 58%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Game Distribution */}
          <Card className="glass">
            <CardHeader className="p-3 sm:p-6 pb-2">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Game Distribution
              </CardTitle>
              <CardDescription className="text-xs">API calls by game type</CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-6 pt-0">
              {pieData.length > 0 ? (
                <div className="flex items-center gap-4">
                  <div className="h-[150px] sm:h-[180px] flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={35}
                          outerRadius={60}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#8b5cf6'} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '11px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    {pieData.map((entry, index) => (
                      <div key={entry.name} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-sm" 
                          style={{ backgroundColor: COLORS[entry.name as keyof typeof COLORS] || '#8b5cf6' }}
                        />
                        <span className="text-xs text-muted-foreground">{entry.name}</span>
                        <span className="text-xs font-medium">{entry.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-[180px] flex items-center justify-center text-center text-muted-foreground">
                  <div>
                    <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No data yet</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Response Time Distribution */}
        <Card className="glass">
          <CardHeader className="p-3 sm:p-6 pb-2">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <Timer className="w-4 h-4 text-primary" />
              Response Time Distribution
            </CardTitle>
            <CardDescription className="text-xs">How fast are your API responses</CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-2">
            <div className="space-y-3">
              {responseTimeData.map((item) => (
                <div key={item.range} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{item.range}</span>
                    <span className="font-medium">{item.count} calls</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all" 
                      style={{ 
                        width: `${totalCalls > 0 ? (item.count / totalCalls) * 100 : 0}%`,
                        backgroundColor: item.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Key Performance */}
        <Card className="glass">
          <CardHeader className="p-3 sm:p-6 pb-2">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <Key className="w-4 h-4 text-primary" />
              API Key Performance
            </CardTitle>
            <CardDescription className="text-xs">Individual key statistics</CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-2">
            <div className="space-y-3">
              {userKeys.map((key) => {
                const keyLogs = userLogs.filter(l => l.apiKeyId === key.id);
                const keySuccess = keyLogs.filter(l => l.status === 'success').length;
                const keyTotal = keyLogs.length;
                const keyRate = keyTotal > 0 ? ((keySuccess / keyTotal) * 100) : 0;
                const daysLeft = getDaysUntilExpiry(key.expiresAt);
                
                return (
                  <div key={key.id} className="p-3 rounded-xl bg-muted/30 border space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Badge className={`${getGameTypeColor(key.gameType)} text-white uppercase text-[10px]`}>
                          {key.gameType}
                        </Badge>
                        <span className="text-xs text-muted-foreground truncate max-w-[120px]">{key.domain}</span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] ${
                          daysLeft <= 3 ? 'border-destructive text-destructive' :
                          daysLeft <= 7 ? 'border-warning text-warning' :
                          'border-success text-success'
                        }`}
                      >
                        {daysLeft}d left
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div>
                        <p className="text-sm sm:text-lg font-bold">{key.totalCalls.toLocaleString()}</p>
                        <p className="text-[9px] sm:text-[10px] text-muted-foreground">Calls</p>
                      </div>
                      <div>
                        <p className="text-sm sm:text-lg font-bold text-success">{keySuccess}</p>
                        <p className="text-[9px] sm:text-[10px] text-muted-foreground">Success</p>
                      </div>
                      <div>
                        <p className="text-sm sm:text-lg font-bold text-destructive">{keyTotal - keySuccess}</p>
                        <p className="text-[9px] sm:text-[10px] text-muted-foreground">Failed</p>
                      </div>
                      <div>
                        <p className="text-sm sm:text-lg font-bold">{keyRate.toFixed(0)}%</p>
                        <p className="text-[9px] sm:text-[10px] text-muted-foreground">Rate</p>
                      </div>
                    </div>
                    <Progress 
                      value={keyRate} 
                      className={`h-1.5 ${keyRate >= 90 ? '[&>div]:bg-success' : keyRate >= 70 ? '[&>div]:bg-warning' : '[&>div]:bg-destructive'}`} 
                    />
                  </div>
                );
              })}

              {userKeys.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  <Key className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No API keys to analyze</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UserAnalyticsPage;
