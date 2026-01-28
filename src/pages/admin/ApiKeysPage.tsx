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
import { mockApiKeys, mockUsers, generateApiKey, formatDate, getDaysUntilExpiry, isExpired } from '@/lib/mockData';
import { ApiKey, GameType, GameDuration } from '@/types';
import { Key, Plus, Search, Copy, Trash2, RefreshCw, Clock, Globe, Server, Shield, CheckCircle, AlertCircle } from 'lucide-react';

// Game Types with their available durations
const gameTypesConfig: Record<GameType, { label: string; durations: { value: string; label: string; typeId: string }[] }> = {
  wingo: {
    label: 'WinGo',
    durations: [
      { value: '30sec', label: '30 Seconds', typeId: 'wg30s' },
      { value: '1min', label: '1 Minute', typeId: 'wg1' },
      { value: '3min', label: '3 Minutes', typeId: 'wg3' },
      { value: '5min', label: '5 Minutes', typeId: 'wg5' },
    ]
  },
  k3: {
    label: 'K3',
    durations: [
      { value: '1min', label: '1 Minute', typeId: 'k31' },
      { value: '3min', label: '3 Minutes', typeId: 'k33' },
      { value: '5min', label: '5 Minutes', typeId: 'k35' },
      { value: '10min', label: '10 Minutes', typeId: 'k310' },
    ]
  },
  '5d': {
    label: '5D',
    durations: [
      { value: '1min', label: '1 Minute', typeId: '5d1' },
      { value: '3min', label: '3 Minutes', typeId: '5d3' },
      { value: '5min', label: '5 Minutes', typeId: '5d5' },
      { value: '10min', label: '10 Minutes', typeId: '5d10' },
    ]
  },
  trx: {
    label: 'TRX',
    durations: [
      { value: '1min', label: '1 Minute', typeId: 'trx1' },
      { value: '3min', label: '3 Minutes', typeId: 'trx3' },
      { value: '5min', label: '5 Minutes', typeId: 'trx5' },
      { value: '10min', label: '10 Minutes', typeId: 'trx10' },
    ]
  },
  numeric: {
    label: 'Numeric',
    durations: [
      { value: '1min', label: '1 Minute', typeId: '1' },
      { value: '3min', label: '3 Minutes', typeId: '2' },
      { value: '5min', label: '5 Minutes', typeId: '3' },
      { value: '30min', label: '30 Minutes', typeId: '30' },
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
  const [keys, setKeys] = useState<ApiKey[]>(mockApiKeys);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDurations, setSelectedDurations] = useState<string[]>(['1min']);
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

  const filteredKeys = keys.filter(
    (key) =>
      key.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.gameType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentGameConfig = gameTypesConfig[formData.gameType];

  const handleGameTypeChange = (gameType: GameType) => {
    setFormData({ ...formData, gameType });
    // Reset to all durations when game type changes
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
    // IPv4
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    // IPv6
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    // Wildcard
    const wildcardRegex = /^(\d{1,3}\.){2,3}\*$/;
    
    return ipv4Regex.test(ip) || ipv6Regex.test(ip) || wildcardRegex.test(ip);
  };

  const validateDomain = (domain: string): boolean => {
    const domainRegex = /^(\*\.)?([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    return domainRegex.test(domain) || ipRegex.test(domain);
  };

  const handleGenerateKey = () => {
    // Validation
    if (!formData.userId) {
      toast({ title: '❌ Error', description: 'Please select a user', variant: 'destructive' });
      return;
    }
    if (!formData.domain) {
      toast({ title: '❌ Error', description: 'Primary domain is required', variant: 'destructive' });
      return;
    }

    // Validate IP whitelist
    const ipList = formData.ipWhitelist.split(',').map(ip => ip.trim()).filter(Boolean);
    for (const ip of ipList) {
      if (!validateIpAddress(ip)) {
        toast({ title: '❌ Invalid IP', description: `"${ip}" is not a valid IP address`, variant: 'destructive' });
        return;
      }
    }

    // Validate domain whitelist
    const domainList = formData.domainWhitelist.split(',').map(d => d.trim()).filter(Boolean);
    for (const domain of domainList) {
      if (!validateDomain(domain)) {
        toast({ title: '❌ Invalid Domain', description: `"${domain}" is not a valid domain`, variant: 'destructive' });
        return;
      }
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + formData.validityDays);

    // Create key with all selected durations info
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

    setKeys([newKey, ...keys]);
    setIsDialogOpen(false);
    
    toast({
      title: '✅ API Key Generated Successfully!',
      description: `Key created for ${currentGameConfig.label} with ${durationsText} duration(s)`,
    });

    // Reset form
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
    setKeys(keys.filter(k => k.id !== keyId));
    toast({ title: '🗑️ Deleted', description: 'API key has been removed' });
  };

  const toggleKeyStatus = (keyId: string) => {
    setKeys(keys.map(k => k.id === keyId ? { ...k, isActive: !k.isActive } : k));
    const key = keys.find(k => k.id === keyId);
    toast({ 
      title: key?.isActive ? '⏸️ Disabled' : '▶️ Enabled', 
      description: `API key has been ${key?.isActive ? 'disabled' : 'enabled'}` 
    });
  };

  const getStatusBadge = (key: ApiKey) => {
    if (isExpired(key.expiresAt)) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    const days = getDaysUntilExpiry(key.expiresAt);
    if (days <= 7) {
      return <Badge className="bg-warning text-warning-foreground">Expiring Soon</Badge>;
    }
    return key.isActive ? <Badge className="bg-success text-success-foreground">Active</Badge> : <Badge variant="secondary">Disabled</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Key className="w-8 h-8 text-primary" />
              API Keys Management
            </h1>
            <p className="text-muted-foreground mt-1">Generate and manage API keys with IP/Domain whitelisting</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground" size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Generate New Key
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Key className="w-6 h-6 text-primary" />
                  Generate New API Key
                </DialogTitle>
                <DialogDescription>
                  Create a new API key with game type, durations, and security whitelisting
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* User Selection */}
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Select User *</Label>
                  <Select value={formData.userId} onValueChange={(v) => setFormData({ ...formData, userId: v })}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Choose a user for this API key" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockUsers.filter(u => u.role === 'user').map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{user.username}</span>
                            <span className="text-muted-foreground">({user.email})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Game Type Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Game Type *</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {(Object.keys(gameTypesConfig) as GameType[]).map((type) => (
                      <Button
                        key={type}
                        type="button"
                        variant={formData.gameType === type ? 'default' : 'outline'}
                        className={`h-12 ${formData.gameType === type ? 'gradient-primary text-primary-foreground' : ''}`}
                        onClick={() => handleGameTypeChange(type)}
                      >
                        {gameTypesConfig[type].label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Duration Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Time Durations</Label>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="allowAll"
                        checked={formData.allowAllDurations}
                        onCheckedChange={handleAllowAllDurationsChange}
                      />
                      <Label htmlFor="allowAll" className="text-sm cursor-pointer">
                        Allow All Durations
                      </Label>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                    {currentGameConfig.durations.map((dur) => {
                      const isSelected = formData.allowAllDurations || selectedDurations.includes(dur.value);
                      return (
                        <Button
                          key={dur.value}
                          type="button"
                          variant={isSelected ? 'default' : 'outline'}
                          className={`h-auto py-3 flex flex-col gap-1 ${isSelected ? 'bg-success text-success-foreground hover:bg-success/90' : ''}`}
                          onClick={() => toggleDuration(dur.value)}
                          disabled={formData.allowAllDurations}
                        >
                          <span className="font-semibold">{dur.label}</span>
                          <span className="text-xs opacity-80">ID: {dur.typeId}</span>
                        </Button>
                      );
                    })}
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    {formData.allowAllDurations 
                      ? `✅ User can access ALL ${currentGameConfig.label} durations with this key`
                      : `Selected: ${selectedDurations.join(', ')}`}
                  </p>
                </div>

                <Separator />

                {/* Validity Period */}
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Validity Period *</Label>
                  <Select value={formData.validityDays.toString()} onValueChange={(v) => setFormData({ ...formData, validityDays: parseInt(v) })}>
                    <SelectTrigger className="h-12">
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
                  <p className="text-xs text-muted-foreground">
                    Key will expire on: {new Date(Date.now() + formData.validityDays * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN')}
                  </p>
                </div>

                <Separator />

                {/* Security Settings */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    <Label className="text-base font-semibold">Security Whitelisting</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="domain">Primary Domain / IP *</Label>
                    <Input
                      id="domain"
                      value={formData.domain}
                      onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                      placeholder="example.com or 192.168.1.1"
                      className="h-12 font-mono"
                    />
                    <p className="text-xs text-muted-foreground">
                      The main domain or IP address where this API key will be used
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ipWhitelist">
                      IP Whitelist 
                      <span className="text-muted-foreground font-normal ml-2">(comma separated, optional)</span>
                    </Label>
                    <Textarea
                      id="ipWhitelist"
                      value={formData.ipWhitelist}
                      onChange={(e) => setFormData({ ...formData, ipWhitelist: e.target.value })}
                      placeholder="192.168.1.1, 10.0.0.1, 2001:db8::1"
                      rows={2}
                      className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground">
                      Supports IPv4, IPv6, and wildcards (e.g., 192.168.1.*)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="domainWhitelist">
                      Domain Whitelist 
                      <span className="text-muted-foreground font-normal ml-2">(comma separated, optional)</span>
                    </Label>
                    <Textarea
                      id="domainWhitelist"
                      value={formData.domainWhitelist}
                      onChange={(e) => setFormData({ ...formData, domainWhitelist: e.target.value })}
                      placeholder="example.com, *.example.com, www.example.com"
                      rows={2}
                      className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground">
                      Supports wildcards for subdomains (e.g., *.example.com)
                    </p>
                  </div>
                </div>

                {/* Preview */}
                <Card className="bg-muted/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Key Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Game:</span>
                      <Badge>{currentGameConfig.label}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Durations:</span>
                      <span>{formData.allowAllDurations ? 'ALL' : selectedDurations.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Validity:</span>
                      <span>{formData.validityDays} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">IPs Whitelisted:</span>
                      <span>{formData.ipWhitelist.split(',').filter(Boolean).length || 1}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleGenerateKey} className="gradient-primary text-primary-foreground">
                  <Key className="w-4 h-4 mr-2" />
                  Generate API Key
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-primary">{keys.length}</div>
              <div className="text-sm text-muted-foreground">Total Keys</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-success/10 to-success/5">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-success">{keys.filter(k => k.isActive && !isExpired(k.expiresAt)).length}</div>
              <div className="text-sm text-muted-foreground">Active</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-warning/10 to-warning/5">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-warning">{keys.filter(k => getDaysUntilExpiry(k.expiresAt) <= 7 && getDaysUntilExpiry(k.expiresAt) > 0).length}</div>
              <div className="text-sm text-muted-foreground">Expiring Soon</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-destructive">{keys.filter(k => isExpired(k.expiresAt)).length}</div>
              <div className="text-sm text-muted-foreground">Expired</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by key, domain, or game type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Keys Grid */}
        <div className="grid gap-4">
          {filteredKeys.map((key) => (
            <Card key={key.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
                  {/* Key Info */}
                  <div className="flex-1 p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="uppercase text-sm px-3 py-1">{key.gameType}</Badge>
                          <Badge variant="outline" className="font-mono">{key.duration}</Badge>
                          {getStatusBadge(key)}
                        </div>
                        <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-2">
                          <code className="text-sm font-mono text-foreground flex-1">
                            {key.key}
                          </code>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(key.key)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Globe className="w-4 h-4 text-primary" />
                        <span className="truncate">{key.domain}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4 text-warning" />
                        <span>{getDaysUntilExpiry(key.expiresAt)} days left</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <RefreshCw className="w-4 h-4 text-success" />
                        <span>{key.totalCalls.toLocaleString()} calls</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Shield className="w-4 h-4 text-accent-foreground" />
                        <span>{key.ipWhitelist.length} IPs, {key.domainWhitelist.length} domains</span>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground flex gap-4">
                      <span>Created: {formatDate(key.createdAt)}</span>
                      <span>Expires: {formatDate(key.expiresAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col justify-end gap-2 p-4 bg-muted/30 lg:border-l border-t lg:border-t-0">
                    <Button
                      variant={key.isActive ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => toggleKeyStatus(key.id)}
                      className="min-w-[80px]"
                    >
                      {key.isActive ? 'Disable' : 'Enable'}
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
          ))}
        </div>

        {filteredKeys.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Key className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No API keys found</p>
              <p className="text-muted-foreground">Create your first API key using the button above</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ApiKeysPage;
