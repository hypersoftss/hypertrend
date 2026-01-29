import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useApiData } from '@/contexts/ApiDataContext';
import { formatDate, getDaysUntilExpiry, isExpired } from '@/lib/mockData';
import { ApiKey, GameType, GameDuration } from '@/types';
import { Key, Plus, Search, Copy, Trash2, RefreshCw, Clock, Globe, Server, Shield, CheckCircle, AlertCircle, Zap, User, Calendar, Activity, Eye, EyeOff, MoreVertical, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';

// Game Types with their available durations and colors
const gameTypesConfig: Record<GameType, { label: string; color: string; bgColor: string; durations: { value: string; label: string; typeId: string }[] }> = {
  wingo: {
    label: 'WinGo',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20 border-blue-500/30',
    durations: [
      { value: '30sec', label: '30 Sec', typeId: 'wg30s' },
      { value: '1min', label: '1 Min', typeId: 'wg1' },
      { value: '3min', label: '3 Min', typeId: 'wg3' },
      { value: '5min', label: '5 Min', typeId: 'wg5' },
    ]
  },
  k3: {
    label: 'K3',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20 border-emerald-500/30',
    durations: [
      { value: '1min', label: '1 Min', typeId: 'k31' },
      { value: '3min', label: '3 Min', typeId: 'k33' },
      { value: '5min', label: '5 Min', typeId: 'k35' },
      { value: '10min', label: '10 Min', typeId: 'k310' },
    ]
  },
  '5d': {
    label: '5D',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/20 border-violet-500/30',
    durations: [
      { value: '1min', label: '1 Min', typeId: '5d1' },
      { value: '3min', label: '3 Min', typeId: '5d3' },
      { value: '5min', label: '5 Min', typeId: '5d5' },
      { value: '10min', label: '10 Min', typeId: '5d10' },
    ]
  },
  trx: {
    label: 'TRX',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20 border-orange-500/30',
    durations: [
      { value: '1min', label: '1 Min', typeId: 'trx1' },
      { value: '3min', label: '3 Min', typeId: 'trx3' },
      { value: '5min', label: '5 Min', typeId: 'trx5' },
      { value: '10min', label: '10 Min', typeId: 'trx10' },
    ]
  },
  numeric: {
    label: 'Numeric',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20 border-pink-500/30',
    durations: [
      { value: '1min', label: '1 Min', typeId: '1' },
      { value: '3min', label: '3 Min', typeId: '2' },
      { value: '5min', label: '5 Min', typeId: '3' },
      { value: '30min', label: '30 Min', typeId: '30' },
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

const ApiKeysPage = () => {
  const { apiKeys: keys, users, addApiKey, updateApiKey, deleteApiKey: removeApiKey, generateApiKey, addActivityLog, addTelegramLog } = useApiData();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDurations, setSelectedDurations] = useState<string[]>(['1min']);
  const [showKeyMap, setShowKeyMap] = useState<Record<string, boolean>>({});
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'expiring'>('all');
  const [formData, setFormData] = useState({
    userId: '',
    gameType: 'wingo' as GameType,
    domain: '',
    ipWhitelist: '',
    domainWhitelist: '',
    validityDays: 30,
    allowAllDurations: true,
  });
  const { toast } = useToast();

  const getFilteredKeys = () => {
    let filtered = keys.filter(
      (key) =>
        key.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        key.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        key.gameType.toLowerCase().includes(searchQuery.toLowerCase())
    );

    switch (filterStatus) {
      case 'active':
        filtered = filtered.filter(k => k.isActive && !isExpired(k.expiresAt));
        break;
      case 'expired':
        filtered = filtered.filter(k => isExpired(k.expiresAt));
        break;
      case 'expiring':
        filtered = filtered.filter(k => getDaysUntilExpiry(k.expiresAt) <= 7 && getDaysUntilExpiry(k.expiresAt) > 0);
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

  const handleAllowAllDurationsChange = (checked: boolean) => {
    setFormData({ ...formData, allowAllDurations: checked });
    if (checked) {
      setSelectedDurations(currentGameConfig.durations.map(d => d.value));
    } else {
      setSelectedDurations([currentGameConfig.durations[0].value]);
    }
  };

  const toggleDuration = (duration: string) => {
    if (formData.allowAllDurations) return;
    
    if (selectedDurations.includes(duration)) {
      if (selectedDurations.length > 1) {
        setSelectedDurations(selectedDurations.filter(d => d !== duration));
      }
    } else {
      setSelectedDurations([...selectedDurations, duration]);
    }
  };

  const validateIpAddress = (ip: string): boolean => {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    const wildcardRegex = /^(\d{1,3}\.){2,3}\*$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip) || wildcardRegex.test(ip);
  };

  const validateDomain = (domain: string): boolean => {
    const domainRegex = /^(\*\.)?([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    return domainRegex.test(domain) || ipRegex.test(domain);
  };

  const handleGenerateKey = () => {
    if (!formData.userId) {
      toast({ title: '❌ Error', description: 'Please select a user', variant: 'destructive' });
      return;
    }
    if (!formData.domain) {
      toast({ title: '❌ Error', description: 'Primary domain is required', variant: 'destructive' });
      return;
    }

    const ipList = formData.ipWhitelist.split(',').map(ip => ip.trim()).filter(Boolean);
    for (const ip of ipList) {
      if (!validateIpAddress(ip)) {
        toast({ title: '❌ Invalid IP', description: `"${ip}" is not a valid IP address`, variant: 'destructive' });
        return;
      }
    }

    const domainList = formData.domainWhitelist.split(',').map(d => d.trim()).filter(Boolean);
    for (const domain of domainList) {
      if (!validateDomain(domain)) {
        toast({ title: '❌ Invalid Domain', description: `"${domain}" is not a valid domain`, variant: 'destructive' });
        return;
      }
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + formData.validityDays);

    const durationsText = formData.allowAllDurations 
      ? 'ALL' 
      : selectedDurations.join(', ');

    const newKey: ApiKey = {
      id: Date.now().toString(),
      key: generateApiKey(),
      userId: formData.userId,
      gameType: formData.gameType,
      duration: durationsText as GameDuration,
      domain: formData.domain,
      ipWhitelist: ipList.length > 0 ? ipList : [formData.domain],
      domainWhitelist: domainList.length > 0 ? domainList : [formData.domain],
      validityDays: formData.validityDays,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
      isActive: true,
      totalCalls: 0,
    };

    // Use context to add key - this syncs across all pages
    addApiKey(newKey);
    
    // Log the activity
    const selectedUser = users.find(u => u.id === formData.userId);
    addActivityLog('CREATE_KEY', `Created API key for ${selectedUser?.username || 'user'} (${currentGameConfig.label})`);
    
    // Log telegram notification (simulated)
    if (selectedUser?.telegramId) {
      addTelegramLog('new_key', selectedUser.telegramId, `New ${currentGameConfig.label} API Key Generated`);
    }
    
    setIsDialogOpen(false);
    
    toast({
      title: '✅ API Key Generated!',
      description: `Key created for ${currentGameConfig.label}`,
    });

    setFormData({
      userId: '',
      gameType: 'wingo',
      domain: '',
      ipWhitelist: '',
      domainWhitelist: '',
      validityDays: 30,
      allowAllDurations: true,
    });
    setSelectedDurations(['1min']);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: '📋 Copied!', description: 'API key copied to clipboard' });
  };

  const deleteKey = (keyId: string) => {
    const key = keys.find(k => k.id === keyId);
    const keyUser = key ? users.find(u => u.id === key.userId) : null;
    removeApiKey(keyId);
    addActivityLog('DELETE_KEY', `Deleted API key for ${keyUser?.username || 'user'} (${key?.gameType.toUpperCase() || 'unknown'})`);
    toast({ title: '🗑️ Deleted', description: 'API key has been removed' });
  };

  const toggleKeyStatus = (keyId: string) => {
    const key = keys.find(k => k.id === keyId);
    if (key) {
      updateApiKey(keyId, { isActive: !key.isActive });
      toast({ 
        title: key.isActive ? '⏸️ Disabled' : '▶️ Enabled', 
        description: `API key has been ${key.isActive ? 'disabled' : 'enabled'}` 
      });
    }
  };

  const toggleShowKey = (keyId: string) => {
    setShowKeyMap(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const getStatusBadge = (key: ApiKey) => {
    if (isExpired(key.expiresAt)) {
      return <Badge className="bg-red-500/20 text-red-400 border border-red-500/30">Expired</Badge>;
    }
    const days = getDaysUntilExpiry(key.expiresAt);
    if (days <= 7) {
      return <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30">Expiring</Badge>;
    }
    return key.isActive 
      ? <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Active</Badge> 
      : <Badge className="bg-slate-500/20 text-slate-400 border border-slate-500/30">Disabled</Badge>;
  };

  const getGameBadge = (gameType: GameType) => {
    const config = gameTypesConfig[gameType];
    return (
      <Badge className={cn("uppercase font-bold border", config.bgColor, config.color)}>
        {config.label}
      </Badge>
    );
  };

  const maskKey = (key: string) => {
    return key.slice(0, 8) + '••••••••••••••••' + key.slice(-4);
  };

  // Stats
  const stats = {
    total: keys.length,
    active: keys.filter(k => k.isActive && !isExpired(k.expiresAt)).length,
    expiring: keys.filter(k => getDaysUntilExpiry(k.expiresAt) <= 7 && getDaysUntilExpiry(k.expiresAt) > 0).length,
    expired: keys.filter(k => isExpired(k.expiresAt)).length,
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
                <p className="text-xs sm:text-sm text-muted-foreground">Manage API keys with security whitelisting</p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary text-primary-foreground shadow-lg shadow-primary/25 w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Generate Key
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass-card">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Key className="w-5 h-5 text-primary" />
                    Generate New API Key
                  </DialogTitle>
                  <DialogDescription>
                    Create a new API key with game type and security settings
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-5 py-4">
                  {/* User Selection */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      Select User *
                    </Label>
                    <Select value={formData.userId} onValueChange={(v) => setFormData({ ...formData, userId: v })}>
                      <SelectTrigger className="h-11 bg-background/50">
                        <SelectValue placeholder="Choose a user" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.filter(u => u.role === 'user').map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{user.username}</span>
                              <span className="text-muted-foreground text-xs">({user.email})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator className="bg-border/50" />

                  {/* Game Type */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold flex items-center gap-2">
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
                            "h-10 text-xs sm:text-sm transition-all",
                            formData.gameType === type 
                              ? cn("border", gameTypesConfig[type].bgColor, gameTypesConfig[type].color, "hover:opacity-90") 
                              : "bg-background/50"
                          )}
                          onClick={() => handleGameTypeChange(type)}
                        >
                          {gameTypesConfig[type].label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Duration Selection */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        Durations
                      </Label>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="allowAll"
                          checked={formData.allowAllDurations}
                          onCheckedChange={handleAllowAllDurationsChange}
                        />
                        <Label htmlFor="allowAll" className="text-xs cursor-pointer text-muted-foreground">
                          All Durations
                        </Label>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {currentGameConfig.durations.map((dur) => {
                        const isSelected = formData.allowAllDurations || selectedDurations.includes(dur.value);
                        return (
                          <Button
                            key={dur.value}
                            type="button"
                            variant={isSelected ? 'default' : 'outline'}
                            className={cn(
                              "h-auto py-2.5 flex flex-col gap-0.5 transition-all",
                              isSelected 
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30" 
                                : "bg-background/50"
                            )}
                            onClick={() => toggleDuration(dur.value)}
                            disabled={formData.allowAllDurations}
                          >
                            <span className="font-semibold text-xs">{dur.label}</span>
                            <span className="text-[10px] opacity-70">ID: {dur.typeId}</span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <Separator className="bg-border/50" />

                  {/* Validity */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      Validity Period *
                    </Label>
                    <Select value={formData.validityDays.toString()} onValueChange={(v) => setFormData({ ...formData, validityDays: parseInt(v) })}>
                      <SelectTrigger className="h-11 bg-background/50">
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
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      Expires: {new Date(Date.now() + formData.validityDays * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN')}
                    </p>
                  </div>

                  <Separator className="bg-border/50" />

                  {/* Security */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      <Label className="text-sm font-semibold">Security Whitelisting</Label>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="domain" className="text-xs">Primary Domain / IP *</Label>
                      <Input
                        id="domain"
                        value={formData.domain}
                        onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                        placeholder="example.com or 192.168.1.1"
                        className="h-10 font-mono text-xs sm:text-sm bg-background/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ipWhitelist" className="text-xs">
                        IP Whitelist <span className="text-muted-foreground">(comma separated)</span>
                      </Label>
                      <Textarea
                        id="ipWhitelist"
                        value={formData.ipWhitelist}
                        onChange={(e) => setFormData({ ...formData, ipWhitelist: e.target.value })}
                        placeholder="192.168.1.1, 10.0.0.1"
                        rows={2}
                        className="font-mono text-xs sm:text-sm bg-background/50 resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="domainWhitelist" className="text-xs">
                        Domain Whitelist <span className="text-muted-foreground">(comma separated)</span>
                      </Label>
                      <Textarea
                        id="domainWhitelist"
                        value={formData.domainWhitelist}
                        onChange={(e) => setFormData({ ...formData, domainWhitelist: e.target.value })}
                        placeholder="example.com, *.example.com"
                        rows={2}
                        className="font-mono text-xs sm:text-sm bg-background/50 resize-none"
                      />
                    </div>
                  </div>

                  {/* Preview */}
                  <Card className="bg-muted/30 border-border/50">
                    <CardContent className="p-3 sm:p-4">
                      <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Game:</span>
                          {getGameBadge(formData.gameType)}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Durations:</span>
                          <span className="font-medium">{formData.allowAllDurations ? 'ALL' : selectedDurations.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Validity:</span>
                          <span className="font-medium">{formData.validityDays} days</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">IPs:</span>
                          <span className="font-medium">{formData.ipWhitelist.split(',').filter(Boolean).length || 1}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                  <Button onClick={handleGenerateKey} className="gradient-primary text-primary-foreground w-full sm:w-auto">
                    <Key className="w-4 h-4 mr-2" />
                    Generate
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          <Card 
            className={cn(
              "glass-card cursor-pointer transition-all hover:scale-[1.02]",
              filterStatus === 'all' && "ring-2 ring-primary"
            )}
            onClick={() => setFilterStatus('all')}
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Key className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.total}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Total Keys</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card 
            className={cn(
              "glass-card cursor-pointer transition-all hover:scale-[1.02]",
              filterStatus === 'active' && "ring-2 ring-emerald-500"
            )}
            onClick={() => setFilterStatus('active')}
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-emerald-400">{stats.active}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card 
            className={cn(
              "glass-card cursor-pointer transition-all hover:scale-[1.02]",
              filterStatus === 'expiring' && "ring-2 ring-amber-500"
            )}
            onClick={() => setFilterStatus('expiring')}
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-amber-400">{stats.expiring}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Expiring</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card 
            className={cn(
              "glass-card cursor-pointer transition-all hover:scale-[1.02]",
              filterStatus === 'expired' && "ring-2 ring-red-500"
            )}
            onClick={() => setFilterStatus('expired')}
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 rounded-lg bg-red-500/20">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-red-400">{stats.expired}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Expired</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by key, domain, or game type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 sm:h-11 bg-background/50 text-sm"
          />
        </div>

        {/* Keys List */}
        <div className="space-y-3">
          {filteredKeys.map((key) => {
            const gameConfig = gameTypesConfig[key.gameType];
            const isShown = showKeyMap[key.id];
            
            return (
              <Card 
                key={key.id} 
                className={cn(
                  "glass-card overflow-hidden transition-all hover:shadow-lg",
                  !key.isActive && "opacity-60"
                )}
              >
                <CardContent className="p-0">
                  {/* Mobile Layout */}
                  <div className="sm:hidden p-3 space-y-3">
                    {/* Top Row - Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {getGameBadge(key.gameType)}
                        <Badge variant="outline" className="font-mono text-[10px]">{key.duration}</Badge>
                        {getStatusBadge(key)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => toggleKeyStatus(key.id)}
                        >
                          {key.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => deleteKey(key.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* API Key */}
                    <div className="flex items-center gap-2 bg-muted/30 rounded-lg p-2">
                      <code className="text-[10px] font-mono text-foreground flex-1 truncate">
                        {isShown ? key.key : maskKey(key.key)}
                      </code>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleShowKey(key.id)}>
                        {isShown ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(key.key)}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Globe className="w-3 h-3 text-primary" />
                        <span className="truncate">{key.domain}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>{getDaysUntilExpiry(key.expiresAt)}d left</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Activity className="w-3 h-3 text-emerald-400" />
                        <span>{key.totalCalls.toLocaleString()} calls</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Shield className="w-3 h-3 text-violet-400" />
                        <span>{key.ipWhitelist.length} IPs</span>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden sm:flex">
                    {/* Key Info */}
                    <div className="flex-1 p-4 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {getGameBadge(key.gameType)}
                            <Badge variant="outline" className="font-mono text-xs">{key.duration}</Badge>
                            {getStatusBadge(key)}
                          </div>
                          <div className="flex items-center gap-2 bg-muted/30 rounded-lg p-2.5 max-w-xl">
                            <code className="text-xs font-mono text-foreground flex-1 truncate">
                              {isShown ? key.key : maskKey(key.key)}
                            </code>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleShowKey(key.id)}>
                              {isShown ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(key.key)}>
                              <Copy className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Globe className="w-4 h-4 text-primary shrink-0" />
                          <span className="truncate">{key.domain}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>{getDaysUntilExpiry(key.expiresAt)} days left</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{key.totalCalls.toLocaleString()} calls</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Shield className="w-4 h-4 text-violet-400 shrink-0" />
                          <span>{key.ipWhitelist.length} IPs, {key.domainWhitelist.length} domains</span>
                        </div>
                      </div>

                      <div className="text-[10px] text-muted-foreground flex gap-4">
                        <span>Created: {formatDate(key.createdAt)}</span>
                        <span>Expires: {formatDate(key.expiresAt)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col justify-center gap-2 p-4 bg-muted/20 border-l border-border/50 min-w-[100px]">
                      <Button
                        variant={key.isActive ? 'outline' : 'default'}
                        size="sm"
                        onClick={() => toggleKeyStatus(key.id)}
                        className="text-xs"
                      >
                        {key.isActive ? 'Disable' : 'Enable'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteKey(key.id)}
                        className="text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredKeys.length === 0 && (
          <Card className="glass-card">
            <CardContent className="py-12 text-center">
              <div className="p-4 rounded-full bg-muted/30 w-fit mx-auto mb-4">
                <Key className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-base font-medium">No API keys found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {filterStatus !== 'all' 
                  ? 'Try changing the filter or search query' 
                  : 'Create your first API key using the button above'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ApiKeysPage;
