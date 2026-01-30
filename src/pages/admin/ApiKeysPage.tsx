import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Key, Plus, Search, Copy, Trash2, RefreshCw, Clock, Globe, Shield, CheckCircle, AlertCircle, Zap, User, Calendar, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

type GameType = 'wingo' | 'k3' | '5d' | 'trx' | 'numeric';

interface ApiKeyData {
  id: string;
  api_key: string;
  key_name: string;
  user_id: string;
  status: string;
  daily_limit: number | null;
  calls_today: number | null;
  calls_total: number | null;
  expires_at: string | null;
  created_at: string | null;
  username?: string;
  email?: string;
}

interface UserProfile {
  user_id: string;
  username: string | null;
  email: string | null;
}

const gameTypesConfig: Record<GameType, { label: string; color: string; bgColor: string; durations: { value: string; label: string }[] }> = {
  wingo: {
    label: 'WinGo',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20 border-blue-500/30',
    durations: [
      { value: '30sec', label: '30 Sec' },
      { value: '1min', label: '1 Min' },
      { value: '3min', label: '3 Min' },
      { value: '5min', label: '5 Min' },
    ]
  },
  k3: {
    label: 'K3',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20 border-emerald-500/30',
    durations: [
      { value: '1min', label: '1 Min' },
      { value: '3min', label: '3 Min' },
      { value: '5min', label: '5 Min' },
      { value: '10min', label: '10 Min' },
    ]
  },
  '5d': {
    label: '5D',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/20 border-violet-500/30',
    durations: [
      { value: '1min', label: '1 Min' },
      { value: '3min', label: '3 Min' },
      { value: '5min', label: '5 Min' },
      { value: '10min', label: '10 Min' },
    ]
  },
  trx: {
    label: 'TRX',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20 border-orange-500/30',
    durations: [
      { value: '1min', label: '1 Min' },
      { value: '3min', label: '3 Min' },
      { value: '5min', label: '5 Min' },
      { value: '10min', label: '10 Min' },
    ]
  },
  numeric: {
    label: 'Numeric',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20 border-pink-500/30',
    durations: [
      { value: '1min', label: '1 Min' },
      { value: '3min', label: '3 Min' },
      { value: '5min', label: '5 Min' },
      { value: '30min', label: '30 Min' },
    ]
  }
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

const ApiKeysPage: React.FC = () => {
  const [keys, setKeys] = useState<ApiKeyData[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDurations, setSelectedDurations] = useState<string[]>(['1min']);
  const [showKeyMap, setShowKeyMap] = useState<Record<string, boolean>>({});
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'expiring'>('all');
  const [formData, setFormData] = useState({
    userId: '',
    gameType: 'wingo' as GameType,
    domain: '',
    validityDays: 30,
    allowAllDurations: true,
    whitelistIps: '',
    whitelistDomains: '',
  });
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch API keys
      const { data: keysData, error: keysError } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (keysError) throw keysError;

      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, username, email');

      if (profilesError) throw profilesError;

      // Map profiles to a lookup
      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);

      // Enhance keys with user info
      const enhancedKeys: ApiKeyData[] = (keysData || []).map(key => ({
        ...key,
        username: profilesMap.get(key.user_id)?.username || 'Unknown',
        email: profilesMap.get(key.user_id)?.email || '',
      }));

      setKeys(enhancedKeys);
      setUsers(profilesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const generateApiKey = (): string => {
    const chars = 'abcdef0123456789';
    let key = 'HYPER_';
    for (let i = 0; i < 48; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  };

  const isExpired = (expiresAt: string | null): boolean => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const getDaysUntilExpiry = (expiresAt: string | null): number => {
    if (!expiresAt) return 999;
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  const getFilteredKeys = () => {
    let filtered = keys.filter(
      (key) =>
        key.api_key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        key.key_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (key.username?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
    );

    switch (filterStatus) {
      case 'active':
        filtered = filtered.filter(k => k.status === 'active' && !isExpired(k.expires_at));
        break;
      case 'expired':
        filtered = filtered.filter(k => isExpired(k.expires_at));
        break;
      case 'expiring':
        filtered = filtered.filter(k => getDaysUntilExpiry(k.expires_at) <= 7 && getDaysUntilExpiry(k.expires_at) > 0);
        break;
    }
    return filtered;
  };

  const filteredKeys = getFilteredKeys();
  const currentGameConfig = gameTypesConfig[formData.gameType];

  const handleGameTypeChange = (gameType: GameType) => {
    setFormData({ ...formData, gameType });
    if (formData.allowAllDurations) {
      setSelectedDurations(gameTypesConfig[gameType].durations.map(d => d.value));
    } else {
      setSelectedDurations([gameTypesConfig[gameType].durations[0].value]);
    }
  };

  const handleGenerateKey = async () => {
    if (!formData.userId) {
      toast({ title: 'Error', description: 'Please select a user', variant: 'destructive' });
      return;
    }
    if (!formData.domain) {
      toast({ title: 'Error', description: 'Domain/Key name is required', variant: 'destructive' });
      return;
    }
    if (!formData.whitelistIps.trim()) {
      toast({ title: 'Error', description: 'At least one IP address is required for whitelisting', variant: 'destructive' });
      return;
    }
    if (!formData.whitelistDomains.trim()) {
      toast({ title: 'Error', description: 'At least one domain is required for whitelisting', variant: 'destructive' });
      return;
    }

    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + formData.validityDays);

      const newKey = {
        api_key: generateApiKey(),
        key_name: `${currentGameConfig.label} - ${formData.domain}`,
        user_id: formData.userId,
        status: 'active',
        daily_limit: 1000,
        expires_at: expiresAt.toISOString(),
      };

      const { data: insertedKey, error } = await supabase.from('api_keys').insert(newKey).select().single();

      if (error) throw error;

      // Insert whitelisted IPs
      if (formData.whitelistIps.trim()) {
        const ips = formData.whitelistIps.split(',').map(ip => ip.trim()).filter(Boolean);
        if (ips.length > 0) {
          const ipRecords = ips.map(ip => ({
            api_key_id: insertedKey.id,
            ip_address: ip,
          }));
          await supabase.from('allowed_ips').insert(ipRecords);
        }
      }

      // Insert whitelisted domains
      if (formData.whitelistDomains.trim()) {
        const domains = formData.whitelistDomains.split(',').map(d => d.trim()).filter(Boolean);
        if (domains.length > 0) {
          const domainRecords = domains.map(domain => ({
            api_key_id: insertedKey.id,
            domain: domain,
          }));
          await supabase.from('allowed_domains').insert(domainRecords);
        }
      }

      // Log activity
      await supabase.from('activity_logs').insert({
        action: 'CREATE_KEY',
        details: { game: currentGameConfig.label, domain: formData.domain },
      });

      toast({
        title: '✅ API Key Generated!',
        description: `Key created for ${currentGameConfig.label}`,
      });

      setIsDialogOpen(false);
      setFormData({
        userId: '',
        gameType: 'wingo',
        domain: '',
        validityDays: 30,
        allowAllDurations: true,
        whitelistIps: '',
        whitelistDomains: '',
      });
      
      fetchData();
    } catch (error) {
      console.error('Error creating key:', error);
      toast({ title: 'Error', description: 'Failed to create API key', variant: 'destructive' });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: '📋 Copied!', description: 'API key copied to clipboard' });
  };

  const deleteKey = async (keyId: string) => {
    try {
      const { error } = await supabase.from('api_keys').delete().eq('id', keyId);
      if (error) throw error;

      await supabase.from('activity_logs').insert({
        action: 'DELETE_KEY',
        details: { keyId },
      });

      toast({ title: '🗑️ Deleted', description: 'API key has been removed' });
      fetchData();
    } catch (error) {
      console.error('Error deleting key:', error);
      toast({ title: 'Error', description: 'Failed to delete API key', variant: 'destructive' });
    }
  };

  const toggleKeyStatus = async (keyId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const { error } = await supabase.from('api_keys').update({ status: newStatus }).eq('id', keyId);
      if (error) throw error;

      toast({ 
        title: newStatus === 'active' ? '▶️ Enabled' : '⏸️ Disabled', 
        description: `API key has been ${newStatus === 'active' ? 'enabled' : 'disabled'}` 
      });
      fetchData();
    } catch (error) {
      console.error('Error updating key:', error);
      toast({ title: 'Error', description: 'Failed to update API key', variant: 'destructive' });
    }
  };

  const toggleShowKey = (keyId: string) => {
    setShowKeyMap(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const getStatusBadge = (key: ApiKeyData) => {
    if (isExpired(key.expires_at)) {
      return <Badge className="bg-red-500/20 text-red-400 border border-red-500/30">Expired</Badge>;
    }
    const days = getDaysUntilExpiry(key.expires_at);
    if (days <= 7) {
      return <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30">Expiring</Badge>;
    }
    return key.status === 'active' 
      ? <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Active</Badge> 
      : <Badge className="bg-slate-500/20 text-slate-400 border border-slate-500/30">Disabled</Badge>;
  };

  const maskKey = (key: string) => key.slice(0, 8) + '••••••••••••••••' + key.slice(-4);

  // Stats
  const stats = {
    total: keys.length,
    active: keys.filter(k => k.status === 'active' && !isExpired(k.expires_at)).length,
    expiring: keys.filter(k => getDaysUntilExpiry(k.expires_at) <= 7 && getDaysUntilExpiry(k.expires_at) > 0).length,
    expired: keys.filter(k => isExpired(k.expires_at)).length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                <Key className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">API Keys</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Manage API keys from Supabase</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-primary text-primary-foreground shadow-lg shadow-primary/25">
                    <Plus className="w-4 h-4 mr-2" />
                    Generate Key
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg glass-card">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Key className="w-5 h-5 text-primary" />
                      Generate New API Key
                    </DialogTitle>
                    <DialogDescription>Create a new API key for a user</DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    {/* User Selection */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        Select User *
                      </Label>
                      <Select value={formData.userId} onValueChange={(v) => setFormData({ ...formData, userId: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a user" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.user_id} value={user.user_id}>
                              <span className="font-medium">{user.username || 'Unknown'}</span>
                              <span className="text-muted-foreground text-xs ml-2">({user.email})</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    {/* Game Type */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary" />
                        Game Type *
                      </Label>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {(Object.keys(gameTypesConfig) as GameType[]).map((type) => (
                          <Button
                            key={type}
                            type="button"
                            variant={formData.gameType === type ? 'default' : 'outline'}
                            className={cn(
                              "h-10 text-xs",
                              formData.gameType === type && cn("border", gameTypesConfig[type].bgColor, gameTypesConfig[type].color)
                            )}
                            onClick={() => handleGameTypeChange(type)}
                          >
                            {gameTypesConfig[type].label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Domain */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-primary" />
                        Domain / Key Name *
                      </Label>
                      <Input
                        value={formData.domain}
                        onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                        placeholder="example.com or key description"
                      />
                    </div>

                    {/* Validity */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        Validity Period
                      </Label>
                      <Select 
                        value={formData.validityDays.toString()} 
                        onValueChange={(v) => setFormData({ ...formData, validityDays: parseInt(v) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {validityOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value.toString()}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    {/* Whitelist IP */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" />
                        Whitelist IPs * (comma separated)
                      </Label>
                      <Input
                        value={formData.whitelistIps}
                        onChange={(e) => setFormData({ ...formData, whitelistIps: e.target.value })}
                        placeholder="192.168.1.1, 10.0.0.1"
                        required
                      />
                      <p className="text-xs text-amber-500">⚠️ Required - Only whitelisted IPs can use this key</p>
                    </div>

                    {/* Whitelist Domains */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-primary" />
                        Whitelist Domains * (comma separated)
                      </Label>
                      <Input
                        value={formData.whitelistDomains}
                        onChange={(e) => setFormData({ ...formData, whitelistDomains: e.target.value })}
                        placeholder="example.com, app.example.com"
                        required
                      />
                      <p className="text-xs text-amber-500">⚠️ Required - Only whitelisted domains can use this key</p>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button className="gradient-primary text-primary-foreground" onClick={handleGenerateKey}>
                      <Key className="w-4 h-4 mr-2" />
                      Generate
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className={cn("cursor-pointer transition-all", filterStatus === 'all' && "ring-2 ring-primary")} onClick={() => setFilterStatus('all')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Keys</p>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
                <Key className="w-8 h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className={cn("cursor-pointer transition-all", filterStatus === 'active' && "ring-2 ring-emerald-500")} onClick={() => setFilterStatus('active')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-emerald-500">{stats.active}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className={cn("cursor-pointer transition-all", filterStatus === 'expiring' && "ring-2 ring-amber-500")} onClick={() => setFilterStatus('expiring')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Expiring</p>
                  <p className="text-2xl font-bold text-amber-500">{stats.expiring}</p>
                </div>
                <Clock className="w-8 h-8 text-amber-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className={cn("cursor-pointer transition-all", filterStatus === 'expired' && "ring-2 ring-red-500")} onClick={() => setFilterStatus('expired')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Expired</p>
                  <p className="text-2xl font-bold text-red-500">{stats.expired}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by key, name, or user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Keys List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
              <p className="text-muted-foreground">Loading API keys...</p>
            </div>
          ) : filteredKeys.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Key className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                <p className="text-lg font-medium text-foreground">No API keys found</p>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? 'Try adjusting your search' : 'Generate your first API key'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredKeys.map((key) => (
              <Card key={key.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Key Info */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getStatusBadge(key)}
                        <span className="text-sm font-medium text-foreground truncate">{key.key_name}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono bg-muted px-2 py-1 rounded text-foreground">
                          {showKeyMap[key.id] ? key.api_key : maskKey(key.api_key)}
                        </code>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleShowKey(key.id)}>
                          {showKeyMap[key.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(key.api_key)}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {key.username}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Expires: {formatDate(key.expires_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          {getDaysUntilExpiry(key.expires_at)} days left
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleKeyStatus(key.id, key.status)}
                      >
                        {key.status === 'active' ? 'Disable' : 'Enable'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteKey(key.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ApiKeysPage;
