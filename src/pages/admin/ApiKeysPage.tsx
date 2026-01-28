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
import { useToast } from '@/hooks/use-toast';
import { mockApiKeys, mockUsers, generateApiKey, formatDate, getDaysUntilExpiry, isExpired } from '@/lib/mockData';
import { ApiKey, GameType, GameDuration } from '@/types';
import { Key, Plus, Search, Copy, Trash2, RefreshCw, Clock, Globe, Server } from 'lucide-react';

const gameTypes: { value: GameType; label: string }[] = [
  { value: 'wingo', label: 'WinGo' },
  { value: 'k3', label: 'K3' },
  { value: '5d', label: '5D' },
  { value: 'trx', label: 'TRX' },
  { value: 'numeric', label: 'Numeric' },
];

const durations: { value: GameDuration; label: string }[] = [
  { value: '1min', label: '1 Minute' },
  { value: '3min', label: '3 Minutes' },
  { value: '5min', label: '5 Minutes' },
  { value: '10min', label: '10 Minutes' },
  { value: '30min', label: '30 Minutes' },
];

const validityOptions = [
  { value: 7, label: '7 Days' },
  { value: 15, label: '15 Days' },
  { value: 30, label: '30 Days' },
  { value: 60, label: '60 Days' },
  { value: 90, label: '90 Days' },
  { value: 180, label: '180 Days' },
  { value: 365, label: '1 Year' },
];

const ApiKeysPage = () => {
  const [keys, setKeys] = useState<ApiKey[]>(mockApiKeys);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    gameType: 'wingo' as GameType,
    duration: '1min' as GameDuration,
    domain: '',
    ipWhitelist: '',
    domainWhitelist: '',
    validityDays: 30,
  });
  const { toast } = useToast();

  const filteredKeys = keys.filter(
    (key) =>
      key.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.gameType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGenerateKey = () => {
    if (!formData.userId || !formData.domain) {
      toast({ title: 'Error', description: 'User and Domain are required', variant: 'destructive' });
      return;
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + formData.validityDays);

    const newKey: ApiKey = {
      id: Date.now().toString(),
      key: generateApiKey(),
      userId: formData.userId,
      gameType: formData.gameType,
      duration: formData.duration,
      domain: formData.domain,
      ipWhitelist: formData.ipWhitelist.split(',').map(ip => ip.trim()).filter(Boolean),
      domainWhitelist: formData.domainWhitelist.split(',').map(d => d.trim()).filter(Boolean),
      validityDays: formData.validityDays,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
      isActive: true,
      totalCalls: 0,
    };

    setKeys([newKey, ...keys]);
    setIsDialogOpen(false);
    
    toast({
      title: '✅ API Key Generated',
      description: 'New key has been created successfully',
    });

    // Reset form
    setFormData({
      userId: '',
      gameType: 'wingo',
      duration: '1min',
      domain: '',
      ipWhitelist: '',
      domainWhitelist: '',
      validityDays: 30,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: 'API key copied to clipboard' });
  };

  const deleteKey = (keyId: string) => {
    setKeys(keys.filter(k => k.id !== keyId));
    toast({ title: 'Deleted', description: 'API key has been removed' });
  };

  const toggleKeyStatus = (keyId: string) => {
    setKeys(keys.map(k => k.id === keyId ? { ...k, isActive: !k.isActive } : k));
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
            <p className="text-muted-foreground mt-1">Generate and manage API keys for all game types</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Generate New Key
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Generate New API Key</DialogTitle>
                <DialogDescription>
                  Create a new API key with specific game type and validity
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label>Select User</Label>
                  <Select value={formData.userId} onValueChange={(v) => setFormData({ ...formData, userId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockUsers.filter(u => u.role === 'user').map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.username} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Game Type</Label>
                    <Select value={formData.gameType} onValueChange={(v: GameType) => setFormData({ ...formData, gameType: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {gameTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Select value={formData.duration} onValueChange={(v: GameDuration) => setFormData({ ...formData, duration: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {durations.map((dur) => (
                          <SelectItem key={dur.value} value={dur.value}>
                            {dur.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Validity Period</Label>
                  <Select value={formData.validityDays.toString()} onValueChange={(v) => setFormData({ ...formData, validityDays: parseInt(v) })}>
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

                <div className="space-y-2">
                  <Label htmlFor="domain">Primary Domain</Label>
                  <Input
                    id="domain"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    placeholder="example.com or IP address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ipWhitelist">IP Whitelist (comma separated)</Label>
                  <Textarea
                    id="ipWhitelist"
                    value={formData.ipWhitelist}
                    onChange={(e) => setFormData({ ...formData, ipWhitelist: e.target.value })}
                    placeholder="192.168.1.1, 10.0.0.1"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domainWhitelist">Domain Whitelist (comma separated)</Label>
                  <Textarea
                    id="domainWhitelist"
                    value={formData.domainWhitelist}
                    onChange={(e) => setFormData({ ...formData, domainWhitelist: e.target.value })}
                    placeholder="example.com, www.example.com"
                    rows={2}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleGenerateKey} className="gradient-primary text-primary-foreground">
                  <Key className="w-4 h-4 mr-2" />
                  Generate Key
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
            <Card key={key.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
                  {/* Key Info */}
                  <div className="flex-1 p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="uppercase">{key.gameType}</Badge>
                          <Badge variant="outline">{key.duration}</Badge>
                          {getStatusBadge(key)}
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono bg-muted px-2 py-1 rounded text-foreground">
                            {key.key.substring(0, 30)}...
                          </code>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(key.key)}>
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
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
                        <RefreshCw className="w-4 h-4" />
                        <span>{key.totalCalls.toLocaleString()} calls</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Server className="w-4 h-4" />
                        <span>{key.ipWhitelist.length} IPs whitelisted</span>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Created: {formatDate(key.createdAt)} | Expires: {formatDate(key.expiresAt)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col justify-end gap-2 p-4 bg-muted/30 lg:border-l border-t lg:border-t-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleKeyStatus(key.id)}
                    >
                      {key.isActive ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
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
              <p className="text-muted-foreground">No API keys found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ApiKeysPage;
