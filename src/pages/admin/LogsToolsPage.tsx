import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Globe, Search, Bot, Activity, Clock, CheckCircle, XCircle, AlertTriangle, RefreshCw, Send, FileText, User, Filter } from 'lucide-react';

// Mock DNS records
const mockDnsRecords = [
  { type: 'A', name: '@', value: '192.168.1.100', ttl: '3600' },
  { type: 'AAAA', name: '@', value: '2001:0db8:85a3::8a2e:0370:7334', ttl: '3600' },
  { type: 'MX', name: '@', value: 'mail.example.com', ttl: '3600', priority: '10' },
  { type: 'TXT', name: '@', value: 'v=spf1 include:_spf.google.com ~all', ttl: '3600' },
  { type: 'CNAME', name: 'www', value: 'example.com', ttl: '3600' },
];

// Mock Telegram logs
const mockTelegramLogs = [
  { id: 1, time: '10:45:23', chatId: '189614****', username: '@user1', type: 'command', message: '/status', status: 'success' },
  { id: 2, time: '10:43:15', chatId: '189614****', username: '@admin', type: 'outgoing', message: '🔑 New API Key Generated...', status: 'success' },
  { id: 3, time: '10:40:08', chatId: '123456****', username: '@user2', type: 'command', message: '/keys', status: 'success' },
  { id: 4, time: '10:38:55', chatId: '189614****', username: '@admin', type: 'outgoing', message: '⚠️ Key Expiring Soon...', status: 'success' },
  { id: 5, time: '10:35:12', chatId: '789012****', username: '@user3', type: 'command', message: '/renew', status: 'success' },
  { id: 6, time: '10:30:00', chatId: '189614****', username: '@admin', type: 'outgoing', message: '🔄 Renewal Request from...', status: 'success' },
];

// Mock Activity logs
const mockActivityLogs = [
  { id: 1, time: '10:45:23', user: 'admin', action: 'Created API Key', target: 'user@example.com', ip: '192.168.1.***' },
  { id: 2, time: '10:40:15', user: 'admin', action: 'Updated Settings', target: 'Site Configuration', ip: '192.168.1.***' },
  { id: 3, time: '10:35:08', user: 'admin', action: 'Deleted User', target: 'olduser@example.com', ip: '192.168.1.***' },
  { id: 4, time: '10:30:55', user: 'merchant1', action: 'Viewed Keys', target: 'Own Keys', ip: '103.45.67.***' },
  { id: 5, time: '10:25:12', user: 'admin', action: 'Sent Reminder', target: 'user2@example.com', ip: '192.168.1.***' },
  { id: 6, time: '10:20:00', user: 'admin', action: 'IP Whitelist Added', target: '45.123.89.100', ip: '192.168.1.***' },
];

const LogsToolsPage = () => {
  const [dnsQuery, setDnsQuery] = useState('');
  const [dnsResults, setDnsResults] = useState<typeof mockDnsRecords | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('dns');
  const [logFilter, setLogFilter] = useState('all');

  const handleDnsLookup = () => {
    if (!dnsQuery.trim()) return;
    setIsSearching(true);
    // Simulate DNS lookup
    setTimeout(() => {
      setDnsResults(mockDnsRecords);
      setIsSearching(false);
    }, 1000);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'command': return 'text-blue-500';
      case 'outgoing': return 'text-green-500';
      case 'incoming': return 'text-purple-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              Logs & Tools
            </h1>
            <p className="text-muted-foreground mt-1">
              DNS checker, Telegram logs & activity tracking
            </p>
          </div>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dns" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              DNS Checker
            </TabsTrigger>
            <TabsTrigger value="telegram" className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Telegram Logs
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Activity Logs
            </TabsTrigger>
          </TabsList>

          {/* DNS Checker Tab */}
          <TabsContent value="dns" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  DNS Record Lookup
                </CardTitle>
                <CardDescription>
                  Check DNS records for client domains (useful for whitelist verification)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter domain (e.g., example.com)"
                    value={dnsQuery}
                    onChange={(e) => setDnsQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleDnsLookup()}
                    className="flex-1"
                  />
                  <Button onClick={handleDnsLookup} disabled={isSearching}>
                    {isSearching ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4 mr-2" />
                    )}
                    Lookup
                  </Button>
                </div>

                {dnsResults && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {dnsResults.length} records found
                      </Badge>
                      <span className="text-sm text-muted-foreground">for {dnsQuery}</span>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>TTL</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dnsResults.map((record, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              <Badge variant="outline">{record.type}</Badge>
                            </TableCell>
                            <TableCell className="font-mono">{record.name}</TableCell>
                            <TableCell className="font-mono text-sm max-w-xs truncate">
                              {record.value}
                            </TableCell>
                            <TableCell>{record.ttl}s</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    <div className="p-4 rounded-lg bg-muted/50 border">
                      <h4 className="font-medium mb-2">Quick Info</h4>
                      <p className="text-sm text-muted-foreground">
                        A record IP: <code className="text-primary">{dnsResults.find(r => r.type === 'A')?.value}</code>
                        {' — '}Use this IP for domain whitelisting.
                      </p>
                    </div>
                  </div>
                )}

                {!dnsResults && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Globe className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>Enter a domain to lookup DNS records</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Telegram Logs Tab */}
          <TabsContent value="telegram" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-primary" />
                    Telegram Bot Logs
                  </span>
                  <div className="flex items-center gap-2">
                    <select 
                      className="text-sm border rounded px-2 py-1 bg-background"
                      value={logFilter}
                      onChange={(e) => setLogFilter(e.target.value)}
                    >
                      <option value="all">All Types</option>
                      <option value="command">Commands</option>
                      <option value="outgoing">Outgoing</option>
                      <option value="incoming">Incoming</option>
                    </select>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Chat ID</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockTelegramLogs
                        .filter(log => logFilter === 'all' || log.type === logFilter)
                        .map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-mono text-sm">{log.time}</TableCell>
                            <TableCell className="font-mono text-sm">{log.chatId}</TableCell>
                            <TableCell>{log.username}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getTypeColor(log.type)}>
                                {log.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">{log.message}</TableCell>
                            <TableCell>
                              {log.status === 'success' ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-500" />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Test Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm">
                    <Send className="w-4 h-4 mr-2" />
                    Test Bot Connection
                  </Button>
                  <Button variant="outline" size="sm">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Send Test Alert
                  </Button>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Check Webhook
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Logs Tab */}
          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Admin Activity Logs
                  </span>
                  <Badge variant="outline">{mockActivityLogs.length} activities</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>IP</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockActivityLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-sm">{log.time}</TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {log.user}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{log.action}</Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{log.target}</TableCell>
                          <TableCell className="font-mono text-sm">{log.ip}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold">24</p>
                  <p className="text-sm text-muted-foreground">Today's Actions</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold">5</p>
                  <p className="text-sm text-muted-foreground">Active Admins</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm text-muted-foreground">Keys Created</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-muted-foreground">Settings Changed</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default LogsToolsPage;
