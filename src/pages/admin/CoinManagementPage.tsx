import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Coins, Plus, Search, RefreshCw, TrendingUp, TrendingDown, Users, Settings } from 'lucide-react';

interface ResellerData {
  user_id: string;
  username: string | null;
  email: string | null;
  coin_balance: number;
  coin_cost_per_key: number;
}

interface CoinPackage {
  id: string;
  name: string;
  coins: number;
  price_inr: number;
}

const CoinManagementPage = () => {
  const [resellers, setResellers] = useState<ResellerData[]>([]);
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCostDialogOpen, setIsCostDialogOpen] = useState(false);
  const [selectedReseller, setSelectedReseller] = useState<ResellerData | null>(null);
  const [coinAmount, setCoinAmount] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('');
  const [newCost, setNewCost] = useState('');
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Get reseller user_ids
      const { data: roleData } = await supabase.from('user_roles').select('user_id').eq('role', 'reseller');
      const resellerIds = roleData?.map(r => r.user_id) || [];

      if (resellerIds.length > 0) {
        const { data: profiles } = await supabase.from('profiles').select('user_id, username, email, coin_balance, coin_cost_per_key').in('user_id', resellerIds);
        setResellers(profiles || []);
      } else {
        setResellers([]);
      }

      const { data: pkgs } = await supabase.from('coin_packages').select('*').eq('is_active', true).order('coins', { ascending: true });
      setPackages(pkgs || []);
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredResellers = resellers.filter(r =>
    (r.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCoins = async () => {
    if (!selectedReseller) return;
    const amount = parseInt(coinAmount) || (selectedPackage ? packages.find(p => p.id === selectedPackage)?.coins : 0) || 0;
    if (amount <= 0) {
      toast({ title: 'Error', description: 'Enter a valid coin amount', variant: 'destructive' });
      return;
    }

    try {
      const newBalance = selectedReseller.coin_balance + amount;
      await supabase.from('profiles').update({ coin_balance: newBalance }).eq('user_id', selectedReseller.user_id);
      
      const { data: { user: authUser } } = await supabase.auth.getUser();
      await supabase.from('coin_transactions').insert({
        user_id: selectedReseller.user_id,
        amount,
        type: 'credit',
        reason: selectedPackage ? `Package: ${packages.find(p => p.id === selectedPackage)?.name}` : 'Admin added coins',
        package_id: selectedPackage || null,
        admin_id: authUser?.id,
        balance_after: newBalance,
      });

      toast({ title: '✅ Coins Added!', description: `${amount} coins added to ${selectedReseller.username}. New balance: ${newBalance}` });
      setIsAddDialogOpen(false);
      setCoinAmount('');
      setSelectedPackage('');
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Error', description: 'Failed to add coins', variant: 'destructive' });
    }
  };

  const handleUpdateCost = async () => {
    if (!selectedReseller) return;
    const cost = parseInt(newCost);
    if (!cost || cost <= 0) {
      toast({ title: 'Error', description: 'Enter a valid cost', variant: 'destructive' });
      return;
    }

    try {
      await supabase.from('profiles').update({ coin_cost_per_key: cost }).eq('user_id', selectedReseller.user_id);
      toast({ title: '✅ Updated!', description: `Cost per key set to ${cost} coins for ${selectedReseller.username}` });
      setIsCostDialogOpen(false);
      setNewCost('');
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Error', description: 'Failed to update cost', variant: 'destructive' });
    }
  };

  const totalCoins = resellers.reduce((sum, r) => sum + r.coin_balance, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
              <Coins className="w-7 h-7 text-amber-400" />
              Coin Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Manage reseller coins and pricing</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20"><Coins className="w-5 h-5 text-amber-400" /></div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalCoins}</p>
                  <p className="text-xs text-muted-foreground">Total Coins (All Resellers)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20"><Users className="w-5 h-5 text-primary" /></div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{resellers.length}</p>
                  <p className="text-xs text-muted-foreground">Total Resellers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20"><TrendingUp className="w-5 h-5 text-emerald-400" /></div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{packages.length}</p>
                  <p className="text-xs text-muted-foreground">Active Packages</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search resellers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>

        {/* Resellers List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resellers ({filteredResellers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredResellers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No resellers found. Create reseller accounts from Users page.</p>
            ) : (
              <div className="space-y-3">
                {filteredResellers.map(reseller => (
                  <div key={reseller.user_id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <span className="text-amber-400 font-bold text-lg">{(reseller.username || 'R').charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{reseller.username}</span>
                          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Reseller</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>{reseller.email}</span>
                          <span className="flex items-center gap-1"><Coins className="w-3 h-3 text-amber-400" /> {reseller.coin_balance} coins</span>
                          <span className="text-xs">({reseller.coin_cost_per_key}/key)</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => {
                        setSelectedReseller(reseller);
                        setCoinAmount('');
                        setSelectedPackage('');
                        setIsAddDialogOpen(true);
                      }}>
                        <Plus className="w-4 h-4 mr-1" /> Add Coins
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => {
                        setSelectedReseller(reseller);
                        setNewCost(String(reseller.coin_cost_per_key));
                        setIsCostDialogOpen(true);
                      }}>
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Coins Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Coins className="w-5 h-5 text-amber-400" /> Add Coins</DialogTitle>
              <DialogDescription>Add coins to {selectedReseller?.username}'s account (Current: {selectedReseller?.coin_balance})</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {packages.length > 0 && (
                <div className="space-y-2">
                  <Label>Select Package</Label>
                  <Select value={selectedPackage} onValueChange={(v) => { setSelectedPackage(v); setCoinAmount(String(packages.find(p => p.id === v)?.coins || '')); }}>
                    <SelectTrigger><SelectValue placeholder="Choose a package..." /></SelectTrigger>
                    <SelectContent>
                      {packages.map(pkg => (
                        <SelectItem key={pkg.id} value={pkg.id}>{pkg.name} - {pkg.coins} coins (₹{pkg.price_inr})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label>Or Enter Custom Amount</Label>
                <Input type="number" value={coinAmount} onChange={(e) => { setCoinAmount(e.target.value); setSelectedPackage(''); }} placeholder="Enter coins amount" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddCoins} className="gradient-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" /> Add Coins
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Cost Per Key Dialog */}
        <Dialog open={isCostDialogOpen} onOpenChange={setIsCostDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Settings className="w-5 h-5 text-primary" /> Set Cost Per Key</DialogTitle>
              <DialogDescription>Set coin cost per API key for {selectedReseller?.username}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Coins Per API Key</Label>
                <Input type="number" value={newCost} onChange={(e) => setNewCost(e.target.value)} placeholder="e.g. 500" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCostDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdateCost} className="gradient-primary text-primary-foreground">Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default CoinManagementPage;
