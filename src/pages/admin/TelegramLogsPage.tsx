import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { formatDate } from '@/lib/mockData';
import { MessageSquare, Search, Send, Bell, RefreshCw, UserCheck, Heart, Filter, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface TelegramLog {
  id: string;
  chat_id: string;
  message_type: string;
  message: string | null;
  status: string;
  error_message: string | null;
  created_at: string | null;
}

const TelegramLogsPage = () => {
  const [logs, setLogs] = useState<TelegramLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('telegram_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching telegram logs:', err);
      toast.error('Failed to fetch telegram logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      (log.message?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      log.chat_id.includes(searchQuery) ||
      log.message_type.includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || log.message_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'new_key':
        return <Send className="w-5 h-5 text-success" />;
      case 'reminder':
        return <Bell className="w-5 h-5 text-warning" />;
      case 'renewal_request':
      case 'expiring':
      case 'expired':
        return <RefreshCw className="w-5 h-5 text-info" />;
      case 'welcome':
      case 'test':
        return <UserCheck className="w-5 h-5 text-primary" />;
      case 'health':
        return <Heart className="w-5 h-5 text-success" />;
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
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
      case 'expiring':
        return <Badge className="bg-orange-500 text-white">Expiring</Badge>;
      case 'expired':
        return <Badge className="bg-destructive text-destructive-foreground">Expired</Badge>;
      case 'welcome':
        return <Badge className="bg-primary text-primary-foreground">Welcome</Badge>;
      case 'test':
        return <Badge className="bg-blue-500 text-white">Test</Badge>;
      case 'health':
        return <Badge className="bg-green-500 text-white">Health</Badge>;
      case 'alert':
        return <Badge className="bg-destructive text-destructive-foreground">Alert</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  // Get unique message types for filter
  const messageTypes = [...new Set(logs.map(l => l.message_type))];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-primary" />
              Telegram Logs
            </h1>
            <p className="text-muted-foreground mt-1">View all Telegram bot notifications</p>
          </div>
          <Button onClick={fetchLogs} variant="outline" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by message or chat ID..."
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
                {messageTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
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
                {new Set(logs.map(l => l.chat_id)).size}
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
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="p-2 rounded-lg bg-card flex-shrink-0">
                        {getTypeIcon(log.message_type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {getTypeBadge(log.message_type)}
                          <span className="text-sm text-muted-foreground">
                            To: {log.chat_id}
                          </span>
                        </div>
                        <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                          {log.message?.substring(0, 200) || 'No message content'}
                          {log.message && log.message.length > 200 && '...'}
                        </p>
                        {log.error_message && (
                          <p className="text-sm text-destructive mt-1">
                            Error: {log.error_message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
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
                        {log.created_at ? formatDate(log.created_at) : 'Unknown'}
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
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TelegramLogsPage;
