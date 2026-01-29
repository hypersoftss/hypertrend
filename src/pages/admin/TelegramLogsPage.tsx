import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApiData } from '@/contexts/ApiDataContext';
import { formatDate } from '@/lib/mockData';
import { MessageSquare, Search, Send, Bell, RefreshCw, UserCheck, Heart, Filter, CheckCircle, XCircle } from 'lucide-react';

const TelegramLogsPage = () => {
  const { telegramLogs: logs } = useApiData();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.recipientId.includes(searchQuery);
    const matchesType = typeFilter === 'all' || log.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'new_key':
        return <Send className="w-5 h-5 text-success" />;
      case 'reminder':
        return <Bell className="w-5 h-5 text-warning" />;
      case 'renewal_request':
        return <RefreshCw className="w-5 h-5 text-info" />;
      case 'login_alert':
        return <UserCheck className="w-5 h-5 text-primary" />;
      case 'health_status':
        return <Heart className="w-5 h-5 text-destructive" />;
      default:
        return <MessageSquare className="w-5 h-5" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'new_key':
        return <Badge className="bg-success text-success-foreground">New Key</Badge>;
      case 'reminder':
        return <Badge className="bg-warning text-warning-foreground">Reminder</Badge>;
      case 'renewal_request':
        return <Badge className="bg-info text-info-foreground">Renewal</Badge>;
      case 'login_alert':
        return <Badge>Login Alert</Badge>;
      case 'health_status':
        return <Badge className="bg-destructive text-destructive-foreground">Health</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-primary" />
            Telegram Logs
          </h1>
          <p className="text-muted-foreground mt-1">View all Telegram bot notifications</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by message or recipient ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="new_key">New Key</SelectItem>
                <SelectItem value="reminder">Reminder</SelectItem>
                <SelectItem value="renewal_request">Renewal Request</SelectItem>
                <SelectItem value="login_alert">Login Alert</SelectItem>
                <SelectItem value="health_status">Health Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{logs.length}</p>
              <p className="text-sm text-muted-foreground">Total Messages</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-success">{logs.filter(l => l.status === 'sent').length}</p>
              <p className="text-sm text-muted-foreground">Sent</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-destructive">{logs.filter(l => l.status === 'failed').length}</p>
              <p className="text-sm text-muted-foreground">Failed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {new Set(logs.map(l => l.recipientId)).size}
              </p>
              <p className="text-sm text-muted-foreground">Recipients</p>
            </CardContent>
          </Card>
        </div>

        {/* Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Message History ({filteredLogs.length})</CardTitle>
            <CardDescription>All Telegram notifications sent by the bot</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-card">
                      {getTypeIcon(log.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {getTypeBadge(log.type)}
                        <span className="text-sm text-muted-foreground">
                          To: {log.recipientId}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">{log.message}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1">
                      {log.status === 'sent' ? (
                        <CheckCircle className="w-4 h-4 text-success" />
                      ) : (
                        <XCircle className="w-4 h-4 text-destructive" />
                      )}
                      <span className={`text-sm ${log.status === 'sent' ? 'text-success' : 'text-destructive'}`}>
                        {log.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(log.createdAt)}
                    </p>
                  </div>
                </div>
              ))}

              {filteredLogs.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No logs found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TelegramLogsPage;
