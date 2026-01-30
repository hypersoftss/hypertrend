import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useConfig } from '@/contexts/ConfigContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Key, Copy, RefreshCw, Clock, Send, CheckCircle, XCircle, Shield, 
  TrendingUp, Heart, AlertTriangle, Eye, EyeOff, Timer, Globe,
  ArrowUpRight, ArrowDownRight, Server, Activity
} from 'lucide-react';

interface UserApiKey {
  id: string;
  api_key: string;
  key_name: string;
  status: string;
  daily_limit: number | null;
  calls_today: number | null;
  calls_total: number | null;
  expires_at: string | null;
  created_at: string | null;
  ipCount: number;
  domainCount: number;
}

const UserKeysPage = () => {
  const { user } = useAuth();
  const { config } = useConfig();
  const [keys, setKeys] = useState<UserApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [renewalMessage, setRenewalMessage] = useState('');
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const fetchKeys = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Fetch user's API keys
      const { data: keysData, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch whitelist counts
      const [ipsData, domainsData] = await Promise.all([
        supabase.from('allowed_ips').select('api_key_id'),
        supabase.from('allowed_domains').select('api_key_id'),
      ]);

      const ipCounts = new Map<string, number>();
      const domainCounts = new Map<string, number>();
      
      ipsData.data?.forEach(ip => {
        ipCounts.set(ip.api_key_id, (ipCounts.get(ip.api_key_id) || 0) + 1);
      });
      domainsData.data?.forEach(d => {
        domainCounts.set(d.api_key_id, (domainCounts.get(d.api_key_id) || 0) + 1);
      });

      const enhancedKeys: UserApiKey[] = (keysData || []).map(key => ({
        ...key,
        ipCount: ipCounts.get(key.id) || 0,
        domainCount: domainCounts.get(key.id) || 0,
      }));

      setKeys(enhancedKeys);
    } catch (error) {
      console.error('Error fetching keys:', error);
      toast({ title: 'Error', description: 'Failed to load API keys', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, [user]);

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  const getDaysUntilExpiry = (expiresAt: string | null): number => {
    if (!expiresAt) return 999;
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const isExpired = (expiresAt: string | null): boolean => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: '📋 Copied!', description: 'API key copied to clipboard' });
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const handleRenewalRequest = () => {
    if (!selectedKeyId) return;

    toast({
      title: '📤 Renewal Request Sent!',
      description: 'Admin will be notified about your renewal request via Telegram',
    });

    setIsDialogOpen(false);
    setRenewalMessage('');
    setSelectedKeyId(null);
  };

  const getStatusBadge = (key: UserApiKey) => {
    if (isExpired(key.expires_at)) {
      return <Badge variant="destructive" className="gap-1 text-xs"><XCircle className="w-3 h-3" /> Expired</Badge>;
    }
    const days = getDaysUntilExpiry(key.expires_at);
    if (days <= 7) {
      return <Badge className="bg-warning text-warning-foreground gap-1 text-xs"><AlertTriangle className="w-3 h-3" /> Expiring</Badge>;
    }
    return key.status === 'active' 
      ? <Badge className="bg-success text-success-foreground gap-1 text-xs"><CheckCircle className="w-3 h-3" /> Active</Badge>
      : <Badge variant="secondary" className="text-xs">Disabled</Badge>;
  };

  const getKeyHealth = (key: UserApiKey) => {
    const isExp = isExpired(key.expires_at);
    const daysLeft = getDaysUntilExpiry(key.expires_at);
    
    // Check whitelist - if no whitelist, key won't work
    if (key.ipCount === 0 || key.domainCount === 0) {
      return { status: 'critical', color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/30', icon: AlertTriangle, label: 'No Whitelist' };
    }
    if (isExp || key.status !== 'active') {
      return { status: 'critical', color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/30', icon: XCircle, label: 'Inactive' };
    }
    if (daysLeft <= 3) {
      return { status: 'warning', color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/30', icon: AlertTriangle, label: 'Critical' };
    }
    if (daysLeft <= 7) {
      return { status: 'warning', color: 'text-warning', bg: 'bg-warning/10 border-warning/30', icon: AlertTriangle, label: 'Warning' };
    }
    return { status: 'healthy', color: 'text-success', bg: 'bg-success/10 border-success/30', icon: Heart, label: 'Healthy' };
  };

  // Calculate stats
  const activeKeys = keys.filter(k => k.status === 'active' && !isExpired(k.expires_at)).length;
  const totalCalls = keys.reduce((sum, k) => sum + (k.calls_total || 0), 0);
  const expiringKeys = keys.filter(k => getDaysUntilExpiry(k.expires_at) <= 7 && getDaysUntilExpiry(k.expires_at) > 0).length;

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2 sm:gap-3">
              <Key className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              My API Keys
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your API keys and track usage</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchKeys} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Badge variant="outline" className="text-xs sm:text-sm px-3 py-1.5">
              <Server className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
              {config.siteName}
            </Badge>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="gradient-primary text-primary-foreground">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-white/20">
                  <Key className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{activeKeys}</p>
                  <p className="text-[10px] sm:text-xs opacity-90">Active Keys</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-accent/20">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{totalCalls.toLocaleString()}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Total Calls</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-warning/20">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{expiringKeys}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Expiring Soon</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-muted">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{keys.length}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Total Keys</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* API Keys List */}
        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">Loading your API keys...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {keys.map((key) => {
              const health = getKeyHealth(key);
              const HealthIcon = health.icon;
              const keyVisible = showKeys[key.id];
              const hasNoWhitelist = key.ipCount === 0 || key.domainCount === 0;
              
              return (
                <Card key={key.id} className={`glass overflow-hidden transition-all ${hasNoWhitelist ? 'border-destructive/50' : 'hover:border-primary/30'}`}>
                  <CardContent className="p-4 sm:p-6 space-y-4">
                    {/* Warning Banner for No Whitelist */}
                    {hasNoWhitelist && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <div>
                          <p className="font-semibold text-sm">⚠️ Key Won't Work!</p>
                          <p className="text-xs">No IP or Domain whitelisted. Contact admin to configure whitelist.</p>
                        </div>
                      </div>
                    )}

                    {/* Top row - Status and Health */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getStatusBadge(key)}
                        <span className="text-sm font-medium text-foreground">{key.key_name}</span>
                      </div>
                      
                      {/* Health Indicator */}
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${health.bg}`}>
                        <HealthIcon className={`w-3.5 h-3.5 ${health.color}`} />
                        <span className={`text-xs font-medium ${health.color}`}>{health.label}</span>
                      </div>
                    </div>

                    {/* API Key Section */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">API Key</label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-2 bg-muted/50 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border">
                          <code className="flex-1 text-xs sm:text-sm font-mono text-foreground truncate">
                            {keyVisible ? key.api_key : '•'.repeat(40)}
                          </code>
                        </div>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-10 w-10 shrink-0"
                          onClick={() => toggleKeyVisibility(key.id)}
                        >
                          {keyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-10 w-10 shrink-0"
                          onClick={() => copyToClipboard(key.api_key)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Stats Grid with IP/Domain Count */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                      <div className={`p-2.5 sm:p-3 rounded-lg border ${key.ipCount === 0 ? 'bg-destructive/10 border-destructive/30' : 'bg-muted/30'}`}>
                        <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                          <Shield className="w-3 h-3" /> Whitelisted IPs
                        </p>
                        <p className={`text-base sm:text-lg font-bold ${key.ipCount === 0 ? 'text-destructive' : 'text-emerald-500'}`}>
                          {key.ipCount}
                        </p>
                      </div>
                      <div className={`p-2.5 sm:p-3 rounded-lg border ${key.domainCount === 0 ? 'bg-destructive/10 border-destructive/30' : 'bg-muted/30'}`}>
                        <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                          <Globe className="w-3 h-3" /> Whitelisted Domains
                        </p>
                        <p className={`text-base sm:text-lg font-bold ${key.domainCount === 0 ? 'text-destructive' : 'text-blue-500'}`}>
                          {key.domainCount}
                        </p>
                      </div>
                      <div className="p-2.5 sm:p-3 rounded-lg bg-muted/30 border">
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Total Calls</p>
                        <p className="text-base sm:text-lg font-bold text-foreground">{(key.calls_total || 0).toLocaleString()}</p>
                      </div>
                      <div className="p-2.5 sm:p-3 rounded-lg bg-muted/30 border">
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Today's Calls</p>
                        <p className="text-base sm:text-lg font-bold text-foreground">{(key.calls_today || 0).toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Expiry Progress */}
                    <div className="space-y-2 pt-2 border-t border-border/50">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Created: {formatDate(key.created_at)}</span>
                        <span className={`font-medium ${getDaysUntilExpiry(key.expires_at) <= 7 ? 'text-warning' : 'text-foreground'}`}>
                          {getDaysUntilExpiry(key.expires_at)} days left
                        </span>
                        <span className="text-muted-foreground hidden sm:inline">Expires: {formatDate(key.expires_at)}</span>
                      </div>
                      <Progress 
                        value={Math.max(0, Math.min(100, (getDaysUntilExpiry(key.expires_at) / 30) * 100))}
                        className={`h-1.5 ${
                          getDaysUntilExpiry(key.expires_at) <= 3 ? '[&>div]:bg-destructive' :
                          getDaysUntilExpiry(key.expires_at) <= 7 ? '[&>div]:bg-warning' : '[&>div]:bg-success'
                        }`}
                      />
                    </div>

                    {/* Action Button */}
                    <div className="pt-2">
                      <Dialog open={isDialogOpen && selectedKeyId === key.id} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) setSelectedKeyId(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="default"
                            size="sm"
                            className="w-full sm:w-auto gradient-primary text-primary-foreground"
                            onClick={() => setSelectedKeyId(key.id)}
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Request Renewal
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md mx-4 sm:mx-auto">
                          <DialogHeader>
                            <DialogTitle>Request Key Renewal</DialogTitle>
                            <DialogDescription>
                              Send a renewal request to the admin via Telegram
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="p-3 rounded-lg bg-muted/50 space-y-1.5 text-sm">
                              <p><strong>Key Name:</strong> {key.key_name}</p>
                              <p><strong>Current Expiry:</strong> {formatDate(key.expires_at)}</p>
                              <p><strong>Days Remaining:</strong> {getDaysUntilExpiry(key.expires_at)} days</p>
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
                          <DialogFooter className="flex-col sm:flex-row gap-2">
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                              Cancel
                            </Button>
                            <Button onClick={handleRenewalRequest} className="w-full sm:w-auto gradient-primary text-primary-foreground">
                              <Send className="w-4 h-4 mr-2" />
                              Send Request
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {keys.length === 0 && (
              <Card className="glass">
                <CardContent className="py-12 sm:py-16 text-center">
                  <Key className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">No API Keys Yet</h3>
                  <p className="text-sm text-muted-foreground">Contact admin to get your first API key</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserKeysPage;
