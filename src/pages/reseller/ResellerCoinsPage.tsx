import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Coins, TrendingUp, TrendingDown, Key, RefreshCw, Package, QrCode, CheckCircle, Clock, XCircle, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

interface CoinOrder {
  id: string;
  amount: number;
  price_inr: number;
  utr_number: string | null;
  status: string;
  admin_note: string | null;
  created_at: string;
  package_id: string | null;
}

const UPI_ID = 'payjha@fam';

const ResellerCoinsPage = () => {
  const { user } = useAuth();
  const [coinBalance, setCoinBalance] = useState(0);
  const [coinCostPerKey, setCoinCostPerKey] = useState(500);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [orders, setOrders] = useState<CoinOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuyDialogOpen, setIsBuyDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(null);
  const [utrNumber, setUtrNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [profileRes, transRes, pkgRes, ordersRes] = await Promise.all([
        supabase.from('profiles').select('coin_balance, coin_cost_per_key').eq('user_id', user.id).single(),
        supabase.from('coin_transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
        supabase.from('coin_packages').select('*').eq('is_active', true).order('coins', { ascending: true }),
        supabase.from('coin_orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      ]);

      setCoinBalance(profileRes.data?.coin_balance ?? 0);
      setCoinCostPerKey(profileRes.data?.coin_cost_per_key ?? 500);
      setTransactions(transRes.data || []);
      setPackages(pkgRes.data || []);
      setOrders((ordersRes.data as CoinOrder[]) || []);
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

  const generateQrUrl = (amount: number) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${UPI_ID}&pn=HyperSofts&am=${amount}&cu=INR&tn=CoinPurchase`;
  };

  const handleBuyClick = (pkg: CoinPackage) => {
    setSelectedPackage(pkg);
    setUtrNumber('');
    setIsBuyDialogOpen(true);
  };

  const handleSubmitOrder = async () => {
    if (!selectedPackage || !user) return;
    if (!utrNumber.trim()) {
      toast({ title: 'Error', description: 'Please enter UTR/Transaction ID', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('coin_orders').insert({
        user_id: user.id,
        package_id: selectedPackage.id,
        amount: selectedPackage.coins,
        price_inr: selectedPackage.price_inr,
        utr_number: utrNumber.trim(),
      });

      if (error) throw error;

      toast({ title: '✅ Order Submitted!', description: 'Your payment is under review. Coins will be added once approved by admin.' });
      setIsBuyDialogOpen(false);
      setUtrNumber('');
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Error', description: 'Failed to submit order', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID);
    toast({ title: 'Copied!', description: 'UPI ID copied to clipboard' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
              <Coins className="w-7 h-7 text-amber-400" />
              Coin Balance
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Track your coins and purchase more</p>
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

        {/* Packages - Buy with UPI */}
        {packages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Package className="w-5 h-5 text-primary" /> Buy Coins</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Select a package, pay via UPI, and submit your UTR number for verification.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {packages.map(pkg => (
                  <div key={pkg.id} className="p-5 rounded-xl border bg-gradient-to-br from-muted/50 to-muted/20 text-center hover:border-primary/50 transition-all">
                    <p className="text-3xl font-bold text-primary">{pkg.coins}</p>
                    <p className="text-xs text-muted-foreground mb-2">coins</p>
                    <p className="text-2xl font-bold text-foreground">₹{pkg.price_inr}</p>
                    <p className="text-sm text-muted-foreground mb-4">{pkg.name}</p>
                    <Button className="w-full gradient-primary text-primary-foreground" onClick={() => handleBuyClick(pkg)}>
                      <QrCode className="w-4 h-4 mr-2" /> Buy Now
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* My Orders */}
        {orders.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">My Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {orders.map(order => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{order.amount} coins - ₹{order.price_inr}</p>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        UTR: {order.utr_number || 'N/A'} • {new Date(order.created_at).toLocaleString('en-IN')}
                      </p>
                      {order.admin_note && (
                        <p className="text-xs text-amber-400 mt-1">Note: {order.admin_note}</p>
                      )}
                    </div>
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

        {/* Buy Dialog with QR Code */}
        <Dialog open={isBuyDialogOpen} onOpenChange={setIsBuyDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-primary" /> Pay via UPI
              </DialogTitle>
              <DialogDescription>
                Scan QR code or pay to UPI ID, then enter your UTR number
              </DialogDescription>
            </DialogHeader>
            {selectedPackage && (
              <div className="space-y-4 py-2">
                {/* Package Info */}
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-center">
                  <p className="text-lg font-bold text-primary">{selectedPackage.coins} Coins</p>
                  <p className="text-2xl font-bold text-foreground">₹{selectedPackage.price_inr}</p>
                  <p className="text-xs text-muted-foreground">{selectedPackage.name}</p>
                </div>

                {/* QR Code */}
                <div className="flex justify-center">
                  <div className="p-3 bg-white rounded-xl">
                    <img 
                      src={generateQrUrl(Number(selectedPackage.price_inr))} 
                      alt="UPI QR Code" 
                      className="w-[200px] h-[200px]"
                    />
                  </div>
                </div>

                {/* UPI ID */}
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">UPI ID</p>
                    <p className="font-mono font-bold text-foreground">{UPI_ID}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={copyUpiId}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                {/* UTR Input */}
                <div className="space-y-2">
                  <Label>UTR / Transaction ID *</Label>
                  <Input 
                    value={utrNumber} 
                    onChange={(e) => setUtrNumber(e.target.value)} 
                    placeholder="Enter 12-digit UTR number"
                  />
                  <p className="text-xs text-muted-foreground">After payment, enter the UTR number from your payment app</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsBuyDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmitOrder} disabled={isSubmitting} className="gradient-primary text-primary-foreground">
                {isSubmitting ? 'Submitting...' : 'Submit Payment'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default ResellerCoinsPage;
