import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { mockActivityLogs, mockUsers, formatDate } from '@/lib/mockData';
import { Activity, Search, LogIn, Key, Send, Settings, User, Trash2 } from 'lucide-react';

const ActivityLogsPage = () => {
  const [logs] = useState(mockActivityLogs);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = logs.filter((log) =>
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.ip.includes(searchQuery)
  );

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return <LogIn className="w-5 h-5 text-success" />;
      case 'CREATE_KEY':
        return <Key className="w-5 h-5 text-primary" />;
      case 'SEND_REMINDER':
        return <Send className="w-5 h-5 text-info" />;
      case 'UPDATE_SETTINGS':
        return <Settings className="w-5 h-5 text-warning" />;
      case 'DELETE_USER':
        return <Trash2 className="w-5 h-5 text-destructive" />;
      default:
        return <Activity className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return <Badge className="bg-success text-success-foreground">Login</Badge>;
      case 'CREATE_KEY':
        return <Badge>Create Key</Badge>;
      case 'SEND_REMINDER':
        return <Badge className="bg-info text-info-foreground">Reminder</Badge>;
      case 'UPDATE_SETTINGS':
        return <Badge className="bg-warning text-warning-foreground">Settings</Badge>;
      case 'DELETE_USER':
        return <Badge variant="destructive">Delete</Badge>;
      default:
        return <Badge variant="secondary">{action}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Activity className="w-8 h-8 text-primary" />
            Activity Logs
          </h1>
          <p className="text-muted-foreground mt-1">Track all admin and user activities</p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Activity History ({filteredLogs.length})</CardTitle>
            <CardDescription>All system activities in chronological order</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredLogs.map((log) => {
                const user = mockUsers.find(u => u.id === log.userId);
                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-card">
                      {getActionIcon(log.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getActionBadge(log.action)}
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {user?.username || 'Unknown'}
                        </span>
                      </div>
                      <p className="text-sm text-foreground mt-1">{log.details}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                        <span>IP: {log.ip}</span>
                        <span>{formatDate(log.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredLogs.length === 0 && (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No activities found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ActivityLogsPage;
