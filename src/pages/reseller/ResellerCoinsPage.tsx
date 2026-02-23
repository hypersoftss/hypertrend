import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Coins, TrendingUp, TrendingDown, Key, RefreshCw, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CoinTransaction {
  id: string;
  amount: number;
  type: string;
  reason: string;
  balance_after: number;
  created_at: string;
}

interface CoinPackage {
  id: string;
  name: string;
  coins: number;
  price_inr: number;
  is_active: boolean;
}

const ResellerCoinsPage = () => {
  const { user } = useAuth();
  const [coinBalance, setCoinBalance] = useState(0);
  const [coinCostPerKey, setCoinCostPerKey] = useState(500);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [profileRes, transRes, pkgRes] = await Promise.all([
        supabase.from('profiles').select('coin_balance, coin_cost_per_key').eq('user_id', user.id).single(),
        supabase.from('coin_transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
        supabase.from('coin_packages').select('*').eq('is_active', true).order('coins', { ascending: true }),
      ]);

      setCoinBalance(profileRes.data?.coin_balance ?? 0);
      setCoinCostPerKey(profileRes.data?.coin_cost_per_key ?? 500);
      setTransactions(transRes.data || []);
      setPackages(pkgRes.data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [user]);

  const totalSpent = transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
  const totalAdded = transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
  const keysCanCreate = Math.floor(coinBalance / coinCostPerKey);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
              <Coins className="w-7 h-7 text-amber-400" />
              Coin Balance
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Track your coins and transaction history</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20"><Coins className="w-5 h-5 text-amber-400" /></div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{coinBalance}</p>
                  <p className="text-xs text-muted-foreground">Current Balance</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20"><TrendingUp className="w-5 h-5 text-emerald-400" /></div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalAdded}</p>
                  <p className="text-xs text-muted-foreground">Total Added</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/20"><TrendingDown className="w-5 h-5 text-red-400" /></div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalSpent}</p>
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20"><Key className="w-5 h-5 text-primary" /></div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{keysCanCreate}</p>
                  <p className="text-xs text-muted-foreground">Keys Can Create</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Packages */}
        {packages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Package className="w-5 h-5 text-primary" /> Available Packages</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">Contact admin to purchase coins. Available packages:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {packages.map(pkg => (
                  <div key={pkg.id} className="p-4 rounded-lg border bg-muted/30 text-center">
                    <p className="text-2xl font-bold text-primary">{pkg.coins}</p>
                    <p className="text-xs text-muted-foreground">coins</p>
                    <p className="text-lg font-semibold text-foreground mt-2">₹{pkg.price_inr}</p>
                    <p className="text-xs text-muted-foreground">{pkg.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No transactions yet</p>
            ) : (
              <div className="space-y-3">
                {transactions.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${tx.type === 'credit' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                        {tx.type === 'credit' ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{tx.reason}</p>
                        <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${tx.type === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {tx.type === 'credit' ? '+' : '-'}{tx.amount}
                      </p>
                      <p className="text-xs text-muted-foreground">Bal: {tx.balance_after}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ResellerCoinsPage;
