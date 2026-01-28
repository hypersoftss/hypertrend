import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const dailyData = [
  { date: 'Mon', success: 4000, error: 240, blocked: 100 },
  { date: 'Tue', success: 3000, error: 139, blocked: 80 },
  { date: 'Wed', success: 5000, error: 280, blocked: 120 },
  { date: 'Thu', success: 4500, error: 200, blocked: 90 },
  { date: 'Fri', success: 6000, error: 350, blocked: 150 },
  { date: 'Sat', success: 5500, error: 180, blocked: 70 },
  { date: 'Sun', success: 4800, error: 160, blocked: 60 },
];

const hourlyData = [
  { hour: '00:00', calls: 120 },
  { hour: '02:00', calls: 80 },
  { hour: '04:00', calls: 60 },
  { hour: '06:00', calls: 150 },
  { hour: '08:00', calls: 300 },
  { hour: '10:00', calls: 450 },
  { hour: '12:00', calls: 500 },
  { hour: '14:00', calls: 480 },
  { hour: '16:00', calls: 520 },
  { hour: '18:00', calls: 600 },
  { hour: '20:00', calls: 550 },
  { hour: '22:00', calls: 350 },
];

const gameTypeData = [
  { name: 'WinGo', value: 4500, color: 'hsl(var(--primary))' },
  { name: 'K3', value: 3200, color: 'hsl(var(--success))' },
  { name: '5D', value: 2100, color: 'hsl(var(--warning))' },
  { name: 'TRX', value: 1800, color: 'hsl(var(--accent))' },
  { name: 'Numeric', value: 900, color: 'hsl(280 70% 50%)' },
];

export const ApiUsageAreaChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Usage Trend</CardTitle>
        <CardDescription>Daily API calls over the past week</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorError" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--warning))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--warning))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--popover-foreground))'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="success" 
                stroke="hsl(var(--success))" 
                fillOpacity={1} 
                fill="url(#colorSuccess)" 
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="error" 
                stroke="hsl(var(--destructive))" 
                fillOpacity={1} 
                fill="url(#colorError)"
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="blocked" 
                stroke="hsl(var(--warning))" 
                fillOpacity={1} 
                fill="url(#colorBlocked)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-sm text-muted-foreground">Success</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span className="text-sm text-muted-foreground">Error</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-sm text-muted-foreground">Blocked</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const HourlyBarChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hourly Distribution</CardTitle>
        <CardDescription>API calls per hour today</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="hour" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--popover-foreground))'
                }}
              />
              <Bar 
                dataKey="calls" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export const GameTypePieChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Type Distribution</CardTitle>
        <CardDescription>API calls by game type</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={gameTypeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {gameTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--popover-foreground))'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export const ResponseTimeChart = () => {
  const data = [
    { range: '<50ms', count: 2500, color: 'hsl(var(--success))' },
    { range: '50-100ms', count: 1800, color: 'hsl(var(--primary))' },
    { range: '100-200ms', count: 900, color: 'hsl(var(--warning))' },
    { range: '>200ms', count: 200, color: 'hsl(var(--destructive))' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Response Time Distribution</CardTitle>
        <CardDescription>API response times breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => {
            const percentage = (item.count / data.reduce((sum, d) => sum + d.count, 0)) * 100;
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.range}</span>
                  <span className="text-muted-foreground">{item.count.toLocaleString()} ({percentage.toFixed(1)}%)</span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: item.color
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
