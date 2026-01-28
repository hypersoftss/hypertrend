import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { mockApiKeys, formatDate, getDaysUntilExpiry, isExpired } from '@/lib/mockData';
import { Key, Copy, RefreshCw, Clock, Globe, Activity, Send } from 'lucide-react';

const UserKeysPage = () => {
  const { user } = useAuth();
  const [renewalMessage, setRenewalMessage] = useState('');
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const userKeys = mockApiKeys.filter(k => k.userId === user?.id);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: 'API key copied to clipboard' });
  };

  const handleRenewalRequest = () => {
    if (!selectedKeyId) return;

    toast({
      title: '📤 Renewal Request Sent!',
      description: 'Admin will be notified about your renewal request',
    });

    setIsDialogOpen(false);
    setRenewalMessage('');
    setSelectedKeyId(null);
  };

  const getStatusBadge = (key: typeof userKeys[0]) => {
    if (isExpired(key.expiresAt)) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    const days = getDaysUntilExpiry(key.expiresAt);
    if (days <= 7) {
      return <Badge className="bg-warning text-warning-foreground">Expiring Soon</Badge>;
    }
    return key.isActive 
      ? <Badge className="bg-success text-success-foreground">Active</Badge> 
      : <Badge variant="secondary">Disabled</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Key className="w-8 h-8 text-primary" />
            My API Keys
          </h1>
          <p className="text-muted-foreground mt-1">Manage your API keys and usage</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg gradient-primary">
                <Key className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {userKeys.filter(k => k.isActive && !isExpired(k.expiresAt)).length}
                </p>
                <p className="text-sm text-muted-foreground">Active Keys</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg gradient-accent">
                <Activity className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {userKeys.reduce((sum, k) => sum + k.totalCalls, 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total API Calls</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-warning">
                <Clock className="w-6 h-6 text-warning-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {userKeys.filter(k => getDaysUntilExpiry(k.expiresAt) <= 7 && getDaysUntilExpiry(k.expiresAt) > 0).length}
                </p>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Keys List */}
        <div className="space-y-4">
          {userKeys.map((key) => (
            <Card key={key.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
                  {/* Key Info */}
                  <div className="flex-1 p-6 space-y-4">
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="uppercase text-sm">{key.gameType}</Badge>
                          <Badge variant="outline">{key.duration}</Badge>
                          {getStatusBadge(key)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-sm font-mono bg-muted px-3 py-2 rounded-lg text-foreground flex-1 min-w-0 truncate">
                        {key.key}
                      </code>
                      <Button variant="outline" size="icon" onClick={() => copyToClipboard(key.key)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Globe className="w-4 h-4" />
                        <span>{key.domain}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{getDaysUntilExpiry(key.expiresAt)} days left</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Activity className="w-4 h-4" />
                        <span>{key.totalCalls.toLocaleString()} calls</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <RefreshCw className="w-4 h-4" />
                        <span>Last: {key.lastUsed ? formatDate(key.lastUsed) : 'Never'}</span>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      <span>Created: {formatDate(key.createdAt)}</span>
                      <span className="mx-2">•</span>
                      <span>Expires: {formatDate(key.expiresAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col justify-end gap-2 p-6 bg-muted/30 lg:border-l border-t lg:border-t-0">
                    <Dialog open={isDialogOpen && selectedKeyId === key.id} onOpenChange={(open) => {
                      setIsDialogOpen(open);
                      if (!open) setSelectedKeyId(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setSelectedKeyId(key.id)}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Request Renewal
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Request Key Renewal</DialogTitle>
                          <DialogDescription>
                            Send a renewal request to the admin
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="p-4 rounded-lg bg-muted/50 space-y-2 text-sm">
                            <p><strong>Game Type:</strong> {key.gameType.toUpperCase()}</p>
                            <p><strong>Domain:</strong> {key.domain}</p>
                            <p><strong>Current Expiry:</strong> {formatDate(key.expiresAt)}</p>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Message (Optional)</label>
                            <Textarea
                              value={renewalMessage}
                              onChange={(e) => setRenewalMessage(e.target.value)}
                              placeholder="Add a message for the admin..."
                              rows={3}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleRenewalRequest} className="gradient-primary text-primary-foreground">
                            <Send className="w-4 h-4 mr-2" />
                            Send Request
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {userKeys.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Key className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">You don't have any API keys yet</p>
                <p className="text-sm text-muted-foreground mt-1">Contact admin to get your first API key</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserKeysPage;
