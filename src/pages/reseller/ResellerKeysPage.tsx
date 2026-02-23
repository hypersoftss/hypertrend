import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Key, Plus, Copy, RefreshCw, Clock, Shield, CheckCircle, AlertTriangle, Eye, EyeOff, Coins, Globe, XCircle, Heart } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

type GameType = 'wingo' | 'k3' | '5d' | 'trx';

const gameTypesConfig: Record<GameType, { label: string; color: string }> = {
  wingo: { label: 'WinGo', color: 'text-blue-400' },
  k3: { label: 'K3', color: 'text-emerald-400' },
  '5d': { label: '5D', color: 'text-violet-400' },
  trx: { label: 'TRX', color: 'text-orange-400' },
};

const validityOptions = [
  { value: 7, label: '7 Days' },
  { value: 15, label: '15 Days' },
  { value: 30, label: '1 Month' },
  { value: 60, label: '2 Months' },
  { value: 90, label: '3 Months' },
  { value: 180, label: '6 Months' },
  { value: 365, label: '1 Year' },
];

interface ApiKeyData {
  id: string;
  api_key: string;
  key_name: string;
  status: string;
  calls_today: number | null;
  calls_total: number | null;
  expires_at: string | null;
  created_at: string | null;
  ipCount: number;
  domainCount: number;
}

const ResellerKeysPage = () => {
  const { user } = useAuth();
  const [keys, setKeys] = useState<ApiKeyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [coinBalance, setCoinBalance] = useState(0);
  const [coinCostPerKey, setCoinCostPerKey] = useState(500);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({
    gameType: 'wingo' as GameType,
    domain: '',
    validityDays: 30,
    whitelistIps: '',
    whitelistDomains: '',
  });
  const { toast } = useToast();

  const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // Fetch coin balance
      const { data: profile } = await supabase
        .from('profiles')
        .select('coin_balance, coin_cost_per_key')
        .eq('user_id', user.id)
        .single();
      
      setCoinBalance(profile?.coin_balance ?? 0);
      setCoinCostPerKey(profile?.coin_cost_per_key ?? 500);

      // Fetch keys
      const { data: keysData, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const [ipsData, domainsData] = await Promise.all([
        supabase.from('allowed_ips').select('api_key_id'),
        supabase.from('allowed_domains').select('api_key_id'),
      ]);

      const ipCounts = new Map<string, number>();
      const domainCounts = new Map<string, number>();
      ipsData.data?.forEach(ip => ipCounts.set(ip.api_key_id, (ipCounts.get(ip.api_key_id) || 0) + 1));
      domainsData.data?.forEach(d => domainCounts.set(d.api_key_id, (domainCounts.get(d.api_key_id) || 0) + 1));

      setKeys((keysData || []).map(key => ({
        ...key,
        ipCount: ipCounts.get(key.id) || 0,
        domainCount: domainCounts.get(key.id) || 0,
      })));
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [user]);

  const generateApiKey = (): string => {
    const chars = 'abcdef0123456789';
    let key = 'HYPER_';
    for (let i = 0; i < 48; i++) key += chars.charAt(Math.floor(Math.random() * chars.length));
    return key;
  };

  const handleCreateKey = async () => {
    if (!user) return;
    if (!formData.domain) {
      toast({ title: 'Error', description: 'Domain/Key name is required', variant: 'destructive' });
      return;
    }
    if (!formData.whitelistIps.trim() || !formData.whitelistDomains.trim()) {
      toast({ title: 'Error', description: 'IP and Domain whitelist are required', variant: 'destructive' });
      return;
    }
    if (coinBalance < coinCostPerKey) {
      toast({ title: '❌ Insufficient Coins', description: `You need ${coinCostPerKey} coins. Current balance: ${coinBalance}`, variant: 'destructive' });
      return;
    }

    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + formData.validityDays);

      const newKey = {
        api_key: generateApiKey(),
        key_name: `${gameTypesConfig[formData.gameType].label} - ${formData.domain}`,
        user_id: user.id,
        status: 'active',
        daily_limit: 1000,
        expires_at: expiresAt.toISOString(),
      };

      const { data: insertedKey, error } = await supabase.from('api_keys').insert(newKey).select().single();
      if (error) throw error;

      // Insert whitelists
      const ips = formData.whitelistIps.split(',').map(ip => ip.trim()).filter(Boolean);
      const domains = formData.whitelistDomains.split(',').map(d => d.trim()).filter(Boolean);
      
      await Promise.all([
        ips.length > 0 && supabase.from('allowed_ips').insert(ips.map(ip => ({ api_key_id: insertedKey.id, ip_address: ip }))),
        domains.length > 0 && supabase.from('allowed_domains').insert(domains.map(domain => ({ api_key_id: insertedKey.id, domain }))),
      ]);

      // Deduct coins
      const newBalance = coinBalance - coinCostPerKey;
      await supabase.from('profiles').update({ coin_balance: newBalance }).eq('user_id', user.id);

      // Log transaction
      await supabase.from('coin_transactions').insert({
        user_id: user.id,
        amount: coinCostPerKey,
        type: 'debit',
        reason: `API Key Created: ${newKey.key_name}`,
        api_key_id: insertedKey.id,
        balance_after: newBalance,
      });

      setCoinBalance(newBalance);
      toast({ title: '✅ API Key Created!', description: `${coinCostPerKey} coins deducted. Balance: ${newBalance}` });
      setIsDialogOpen(false);
      setFormData({ gameType: 'wingo', domain: '', validityDays: 30, whitelistIps: '', whitelistDomains: '' });
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Error', description: 'Failed to create API key', variant: 'destructive' });
    }
  };

  const isExpired = (d: string | null) => d ? new Date(d) < new Date() : false;
  const getDaysLeft = (d: string | null) => d ? Math.ceil((new Date(d).getTime() - Date.now()) / 86400000) : 999;
  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A';

  const activeKeys = keys.filter(k => k.status === 'active' && !isExpired(k.expires_at)).length;

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
              <Key className="w-7 h-7 text-primary" />
              My API Keys
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Create and manage your API keys using coins</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground" disabled={coinBalance < coinCostPerKey}>
                <Plus className="w-4 h-4 mr-2" />
                Create Key ({coinCostPerKey} Coins)
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>🔑 Create API Key</DialogTitle>
                <DialogDescription>
                  Cost: {coinCostPerKey} coins | Balance: {coinBalance} coins
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Game Type</Label>
                  <Select value={formData.gameType} onValueChange={(v) => setFormData({ ...formData, gameType: v as GameType })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(gameTypesConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Domain / Key Name *</Label>
                  <Input value={formData.domain} onChange={(e) => setFormData({ ...formData, domain: e.target.value })} placeholder="e.g. mysite.com" />
                </div>
                <div className="space-y-2">
                  <Label>Validity</Label>
                  <Select value={String(formData.validityDays)} onValueChange={(v) => setFormData({ ...formData, validityDays: parseInt(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {validityOptions.map(opt => (
                        <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Whitelist IPs * (comma separated)</Label>
                  <Input value={formData.whitelistIps} onChange={(e) => setFormData({ ...formData, whitelistIps: e.target.value })} placeholder="1.2.3.4, 5.6.7.8" />
                </div>
                <div className="space-y-2">
                  <Label>Whitelist Domains * (comma separated)</Label>
                  <Input value={formData.whitelistDomains} onChange={(e) => setFormData({ ...formData, whitelistDomains: e.target.value })} placeholder="example.com, *.mysite.com" />
                </div>
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-2"><Coins className="w-4 h-4 text-primary" /> Cost</span>
                    <span className="font-bold text-primary">{coinCostPerKey} coins</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">After creation</span>
                    <span className="text-sm text-muted-foreground">{coinBalance - coinCostPerKey} coins remaining</span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateKey} className="gradient-primary text-primary-foreground" disabled={coinBalance < coinCostPerKey}>
                  <Key className="w-4 h-4 mr-2" /> Create Key
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/30">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20"><Coins className="w-5 h-5 text-amber-400" /></div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{coinBalance}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Coin Balance</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="gradient-primary text-primary-foreground">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/20"><Key className="w-5 h-5" /></div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{activeKeys}</p>
                  <p className="text-[10px] sm:text-xs opacity-90">Active Keys</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted"><Shield className="w-5 h-5 text-muted-foreground" /></div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{keys.length}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Total Keys</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted"><Key className="w-5 h-5 text-muted-foreground" /></div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{coinCostPerKey}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Cost/Key</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Keys List */}
        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : keys.length === 0 ? (
          <Card className="glass">
            <CardContent className="p-8 text-center">
              <Key className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No API Keys Yet</h3>
              <p className="text-sm text-muted-foreground mt-2">Create your first API key using coins</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {keys.map((key) => {
              const expired = isExpired(key.expires_at);
              const daysLeft = getDaysLeft(key.expires_at);
              const keyVisible = showKeys[key.id];
              const hasNoWhitelist = key.ipCount === 0 || key.domainCount === 0;

              return (
                <Card key={key.id} className={`glass overflow-hidden ${hasNoWhitelist ? 'border-destructive/50' : 'hover:border-primary/30'} transition-all`}>
                  <CardContent className="p-4 sm:p-6 space-y-4">
                    {hasNoWhitelist && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <div>
                          <p className="font-semibold text-sm">⚠️ Key Won't Work!</p>
                          <p className="text-xs">No IP or Domain whitelisted.</p>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {expired ? <Badge variant="destructive">Expired</Badge> :
                         daysLeft <= 7 ? <Badge className="bg-warning text-warning-foreground">Expiring</Badge> :
                         key.status === 'active' ? <Badge className="bg-success text-success-foreground">Active</Badge> :
                         <Badge variant="secondary">Disabled</Badge>}
                        <span className="text-sm font-medium text-foreground">{key.key_name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted/50 px-4 py-2.5 rounded-lg border">
                        <code className="text-xs sm:text-sm font-mono text-foreground truncate block">
                          {keyVisible ? key.api_key : '•'.repeat(40)}
                        </code>
                      </div>
                      <Button variant="outline" size="icon" onClick={() => setShowKeys(p => ({ ...p, [key.id]: !p[key.id] }))}>
                        {keyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText(key.api_key); toast({ title: '📋 Copied!' }); }}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className={`p-2.5 rounded-lg border ${key.ipCount === 0 ? 'bg-destructive/10 border-destructive/30' : 'bg-muted/30'}`}>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Shield className="w-3 h-3" /> IPs</p>
                        <p className={`text-lg font-bold ${key.ipCount === 0 ? 'text-destructive' : 'text-emerald-500'}`}>{key.ipCount}</p>
                      </div>
                      <div className={`p-2.5 rounded-lg border ${key.domainCount === 0 ? 'bg-destructive/10 border-destructive/30' : 'bg-muted/30'}`}>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Globe className="w-3 h-3" /> Domains</p>
                        <p className={`text-lg font-bold ${key.domainCount === 0 ? 'text-destructive' : 'text-blue-500'}`}>{key.domainCount}</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-muted/30 border">
                        <p className="text-[10px] text-muted-foreground">Total Calls</p>
                        <p className="text-lg font-bold text-foreground">{(key.calls_total || 0).toLocaleString()}</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-muted/30 border">
                        <p className="text-[10px] text-muted-foreground">Today</p>
                        <p className="text-lg font-bold text-foreground">{(key.calls_today || 0).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="space-y-2 pt-2 border-t border-border/50">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Created: {formatDate(key.created_at)}</span>
                        <span className={`font-medium ${daysLeft <= 7 ? 'text-warning' : 'text-foreground'}`}>{daysLeft} days left</span>
                      </div>
                      <Progress value={Math.max(0, Math.min(100, (daysLeft / 30) * 100))} className={`h-1.5 ${daysLeft <= 3 ? '[&>div]:bg-destructive' : daysLeft <= 7 ? '[&>div]:bg-warning' : '[&>div]:bg-success'}`} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ResellerKeysPage;
