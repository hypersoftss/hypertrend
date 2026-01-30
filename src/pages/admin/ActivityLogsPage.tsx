import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { formatDate } from '@/lib/mockData';
import { Activity, Search, LogIn, Key, Send, Settings, User, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  details: Json | null;
  ip_address: string | null;
  created_at: string | null;
}

const ActivityLogsPage = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch activity logs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const detailsStr = log.details ? JSON.stringify(log.details).toLowerCase() : '';
    return (
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      detailsStr.includes(searchQuery.toLowerCase()) ||
      (log.ip_address || '').includes(searchQuery)
    );
  });

  const getActionIcon = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('login')) return <LogIn className="w-5 h-5 text-success" />;
    if (actionLower.includes('key') || actionLower.includes('create')) return <Key className="w-5 h-5 text-primary" />;
    if (actionLower.includes('send') || actionLower.includes('reminder')) return <Send className="w-5 h-5 text-info" />;
    if (actionLower.includes('setting') || actionLower.includes('update')) return <Settings className="w-5 h-5 text-warning" />;
    if (actionLower.includes('delete')) return <Trash2 className="w-5 h-5 text-destructive" />;
    return <Activity className="w-5 h-5 text-muted-foreground" />;
  };

  const getActionBadge = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('login')) return <Badge className="bg-success text-success-foreground">Login</Badge>;
    if (actionLower.includes('key') || actionLower.includes('create')) return <Badge>Create</Badge>;
    if (actionLower.includes('send') || actionLower.includes('reminder')) return <Badge className="bg-info text-info-foreground">Reminder</Badge>;
    if (actionLower.includes('setting') || actionLower.includes('update')) return <Badge className="bg-warning text-warning-foreground">Update</Badge>;
    if (actionLower.includes('delete')) return <Badge variant="destructive">Delete</Badge>;
    return <Badge variant="secondary">{action}</Badge>;
  };

  const formatDetails = (details: Json | null): string => {
    if (!details) return 'No details';
    if (typeof details === 'string') return details;
    if (typeof details === 'object' && details !== null && !Array.isArray(details)) {
      return Object.entries(details)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    }
    return JSON.stringify(details);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Activity className="w-8 h-8 text-primary" />
              Activity Logs
            </h1>
            <p className="text-muted-foreground mt-1">Track all admin and user activities</p>
          </div>
          <Button onClick={fetchLogs} disabled={loading} variant="outline" className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
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
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLogs.map((log) => (
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
                        {log.user_id && (
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {log.user_id.slice(0, 8)}...
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-foreground mt-1">{formatDetails(log.details)}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                        {log.ip_address && <span>IP: {log.ip_address}</span>}
                        {log.created_at && <span>{formatDate(log.created_at)}</span>}
                      </div>
                    </div>
                  </div>
                ))}

                {filteredLogs.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No activity logs found</p>
                    <p className="text-sm text-muted-foreground mt-2">Activities will appear here when users perform actions</p>
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

export default ActivityLogsPage;
