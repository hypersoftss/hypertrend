import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, CheckCircle, XCircle, Clock, RefreshCw, Search, Coins, AlertTriangle } from 'lucide-react';

interface CoinOrder {
  id: string;
  user_id: string;
  package_id: string | null;
  amount: number;
  price_inr: number;
  utr_number: string | null;
  status: string;
  admin_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

interface UserProfile {
  user_id: string;
  username: string | null;
  email: string | null;
  coin_balance: number;
}

const PaymentApprovalsPage = () => {
  const [orders, setOrders] = useState<(CoinOrder & { profile?: UserProfile })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<(CoinOrder & { profile?: UserProfile }) | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      let query = supabase.from('coin_orders').select('*').order('created_at', { ascending: false });
      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data: ordersData, error } = await query;
      if (error) throw error;

      // Fetch profiles for all user_ids
      const userIds = [...new Set((ordersData || []).map(o => o.user_id))];
      let profiles: UserProfile[] = [];
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, username, email, coin_balance')
          .in('user_id', userIds);
        profiles = profilesData || [];
      }

      const enriched = (ordersData || []).map(order => ({
        ...order,
        profile: profiles.find(p => p.user_id === order.user_id),
      }));

      setOrders(enriched as (CoinOrder & { profile?: UserProfile })[]);
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Error', description: 'Failed to load orders', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  const handleReview = (order: CoinOrder & { profile?: UserProfile }) => {
    setSelectedOrder(order);
    setAdminNote('');
    setIsReviewDialogOpen(true);
  };

  const processOrder = async (action: 'approved' | 'rejected') => {
    if (!selectedOrder) return;
    setIsProcessing(true);

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();

      // Update order status
      const { error: orderError } = await supabase.from('coin_orders').update({
        status: action,
        admin_note: adminNote || null,
        reviewed_by: authUser?.id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('id', selectedOrder.id);

      if (orderError) throw orderError;

      // If approved, add coins
      if (action === 'approved' && selectedOrder.profile) {
        const newBalance = selectedOrder.profile.coin_balance + selectedOrder.amount;

        const { error: balError } = await supabase.from('profiles')
          .update({ coin_balance: newBalance })
          .eq('user_id', selectedOrder.user_id);
        if (balError) throw balError;

        const { error: txError } = await supabase.from('coin_transactions').insert({
          user_id: selectedOrder.user_id,
          amount: selectedOrder.amount,
          type: 'credit',
          reason: `Payment approved (₹${selectedOrder.price_inr}) - UTR: ${selectedOrder.utr_number || 'N/A'}`,
          package_id: selectedOrder.package_id,
          admin_id: authUser?.id,
          balance_after: newBalance,
        });
        if (txError) throw txError;
      }

      // Send Telegram notification to fixed chat ID
      try {
        const { data: settingsData } = await supabase.from('settings').select('key, value').in('key', ['telegram_bot_token']);
        const botToken = settingsData?.find(s => s.key === 'telegram_bot_token')?.value;
        if (botToken) {
          const emoji = action === 'approved' ? '✅' : '❌';
          const statusText = action === 'approved' ? 'APPROVED' : 'REJECTED';
          const balanceInfo = action === 'approved' && selectedOrder.profile 
            ? `\n🪙 New Balance: ${selectedOrder.profile.coin_balance + selectedOrder.amount} coins` 
            : '';
          const msg = `${emoji} *Payment ${statusText}*\n\n👤 Reseller: ${selectedOrder.profile?.username || 'Unknown'}\n💵 Amount: ₹${selectedOrder.price_inr}\n🪙 Coins: ${selectedOrder.amount}\n🏦 UTR: \`${selectedOrder.utr_number || 'N/A'}\`${balanceInfo}${adminNote ? `\n📝 Note: ${adminNote}` : ''}`;
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: '1896145195', text: msg, parse_mode: 'Markdown' }),
          });
        }
      } catch (tgErr) {
        console.error('Telegram notification error:', tgErr);
      }

      toast({
        title: action === 'approved' ? '✅ Payment Approved!' : '❌ Payment Rejected',
        description: action === 'approved'
          ? `${selectedOrder.amount} coins added to ${selectedOrder.profile?.username}`
          : `Order rejected for ${selectedOrder.profile?.username}`,
      });

      setIsReviewDialogOpen(false);
      fetchOrders();
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Error', description: 'Failed to process order', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredOrders = orders.filter(o =>
    (o.profile?.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o.utr_number || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = orders.filter(o => o.status === 'pending').length;

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
              <CreditCard className="w-7 h-7 text-primary" />
              Payment Approvals
              {pendingCount > 0 && (
                <Badge className="bg-amber-500 text-white animate-pulse">{pendingCount} Pending</Badge>
              )}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Review and approve reseller coin purchases</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchOrders} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {(['pending', 'approved', 'rejected', 'all'] as const).map(f => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className={filter === f ? 'gradient-primary text-primary-foreground' : ''}
            >
              {f === 'pending' && <Clock className="w-3 h-3 mr-1" />}
              {f === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
              {f === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by username or UTR..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Orders ({filteredOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No orders found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map(order => (
                  <div key={order.id} className={`p-4 rounded-lg border transition-all ${order.status === 'pending' ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40' : 'bg-muted/30 hover:bg-muted/50'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-medium text-foreground">{order.profile?.username || 'Unknown'}</span>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-muted-foreground mt-2">
                          <div><span className="text-foreground font-medium">{order.amount}</span> coins</div>
                          <div>₹<span className="text-foreground font-medium">{order.price_inr}</span></div>
                          <div>UTR: <span className="text-foreground font-mono">{order.utr_number || 'N/A'}</span></div>
                          <div>{new Date(order.created_at).toLocaleString('en-IN')}</div>
                        </div>
                        {order.admin_note && (
                          <p className="text-xs text-amber-400 mt-2">Note: {order.admin_note}</p>
                        )}
                      </div>
                      {order.status === 'pending' && (
                        <Button size="sm" onClick={() => handleReview(order)} className="gradient-primary text-primary-foreground shrink-0">
                          Review
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Review Dialog */}
        <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" /> Review Payment
              </DialogTitle>
              <DialogDescription>Verify the payment and approve or reject</DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Reseller</p>
                    <p className="font-medium text-foreground">{selectedOrder.profile?.username}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Current Balance</p>
                    <p className="font-medium text-foreground">{selectedOrder.profile?.coin_balance} coins</p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-xs text-muted-foreground">Amount</p>
                    <p className="font-bold text-primary">{selectedOrder.amount} coins</p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-xs text-muted-foreground">Paid</p>
                    <p className="font-bold text-primary">₹{selectedOrder.price_inr}</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-xs text-muted-foreground">UTR / Transaction ID</p>
                  <p className="font-mono font-bold text-foreground text-lg">{selectedOrder.utr_number || 'N/A'}</p>
                </div>

                <div className="space-y-2">
                  <Label>Admin Note (Optional)</Label>
                  <Input value={adminNote} onChange={(e) => setAdminNote(e.target.value)} placeholder="Add a note..." />
                </div>

                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-xs text-muted-foreground">After Approval</p>
                  <p className="text-sm text-foreground">
                    New balance: <span className="font-bold text-emerald-400">{(selectedOrder.profile?.coin_balance || 0) + selectedOrder.amount} coins</span>
                  </p>
                </div>
              </div>
            )}
            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)} disabled={isProcessing}>Cancel</Button>
              <Button variant="destructive" onClick={() => processOrder('rejected')} disabled={isProcessing}>
                <XCircle className="w-4 h-4 mr-1" /> Reject
              </Button>
              <Button onClick={() => processOrder('approved')} disabled={isProcessing} className="gradient-primary text-primary-foreground">
                <CheckCircle className="w-4 h-4 mr-1" /> {isProcessing ? 'Processing...' : 'Approve'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default PaymentApprovalsPage;
