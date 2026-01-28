import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ApiUsageAreaChart, HourlyBarChart, GameTypePieChart, ResponseTimeChart } from '@/components/charts/ApiUsageChart';
import { BarChart3, TrendingUp, PieChart, Clock } from 'lucide-react';

const AnalyticsPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl gradient-primary">
              <BarChart3 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
              <p className="text-muted-foreground">API usage statistics and trends</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-primary">28.7K</p>
              <p className="text-sm text-muted-foreground">Total API Calls</p>
            </CardContent>
          </Card>
          <Card className="border-success/20 bg-success/5">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-success">99.2%</p>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </CardContent>
          </Card>
          <Card className="border-accent/20 bg-accent/5">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-accent-foreground">45ms</p>
              <p className="text-sm text-muted-foreground">Avg Response</p>
            </CardContent>
          </Card>
          <Card className="border-warning/20 bg-warning/5">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-warning">156</p>
              <p className="text-sm text-muted-foreground">Today's Calls</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-primary" />
                API Usage Trend
              </CardTitle>
              <CardDescription>Daily API calls over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ApiUsageAreaChart />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5 text-primary" />
                Hourly Distribution
              </CardTitle>
              <CardDescription>API calls by hour of day</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <HourlyBarChart />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <PieChart className="w-5 h-5 text-primary" />
                Game Type Distribution
              </CardTitle>
              <CardDescription>API calls by game type</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <GameTypePieChart />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="w-5 h-5 text-primary" />
                Response Time Analysis
              </CardTitle>
              <CardDescription>Average response times by endpoint</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponseTimeChart />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
