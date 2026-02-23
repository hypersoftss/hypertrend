import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Package, Plus, Trash2, Edit, RefreshCw, Coins } from 'lucide-react';

interface CoinPackage {
  id: string;
  name: string;
  coins: number;
  price_inr: number;
  is_active: boolean;
  created_at: string;
}

const CoinPackagesPage = () => {
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CoinPackage | null>(null);
  const [formData, setFormData] = useState({ name: '', coins: '', price_inr: '' });
  const { toast } = useToast();

  const fetchPackages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('coin_packages').select('*').order('coins', { ascending: true });
      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load packages', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPackages(); }, []);

  const handleSave = async () => {
    if (!formData.name || !formData.coins || !formData.price_inr) {
      toast({ title: 'Error', description: 'All fields are required', variant: 'destructive' });
      return;
    }

    try {
      if (editing) {
        await supabase.from('coin_packages').update({
          name: formData.name,
          coins: parseInt(formData.coins),
          price_inr: parseFloat(formData.price_inr),
        }).eq('id', editing.id);
        toast({ title: '✅ Updated!', description: 'Package updated successfully' });
      } else {
        await supabase.from('coin_packages').insert({
          name: formData.name,
          coins: parseInt(formData.coins),
          price_inr: parseFloat(formData.price_inr),
        });
        toast({ title: '✅ Created!', description: 'Package created successfully' });
      }
      setIsDialogOpen(false);
      setEditing(null);
      setFormData({ name: '', coins: '', price_inr: '' });
      fetchPackages();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save package', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await supabase.from('coin_packages').update({ is_active: false }).eq('id', id);
      toast({ title: '🗑️ Removed', description: 'Package deactivated' });
      fetchPackages();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
    }
  };

  const openEdit = (pkg: CoinPackage) => {
    setEditing(pkg);
    setFormData({ name: pkg.name, coins: String(pkg.coins), price_inr: String(pkg.price_inr) });
    setIsDialogOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    setFormData({ name: '', coins: '', price_inr: '' });
    setIsDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
              <Package className="w-7 h-7 text-primary" />
              Coin Packages
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Manage fixed coin packages for resellers</p>
          </div>
          <Button className="gradient-primary text-primary-foreground" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" /> Add Package
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12"><RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" /></div>
        ) : packages.length === 0 ? (
          <Card className="glass">
            <CardContent className="p-8 text-center">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No Packages Yet</h3>
              <p className="text-sm text-muted-foreground mt-2">Create coin packages for resellers to purchase</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map(pkg => (
              <Card key={pkg.id} className={`glass ${!pkg.is_active ? 'opacity-50' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge className={pkg.is_active ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-muted text-muted-foreground'}>
                      {pkg.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(pkg)}><Edit className="w-4 h-4" /></Button>
                      {pkg.is_active && <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(pkg.id)}><Trash2 className="w-4 h-4" /></Button>}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-amber-500/20 mx-auto flex items-center justify-center mb-3">
                      <Coins className="w-8 h-8 text-amber-400" />
                    </div>
                    <p className="text-3xl font-bold text-foreground">{pkg.coins}</p>
                    <p className="text-xs text-muted-foreground mb-2">coins</p>
                    <p className="text-xl font-semibold text-primary">₹{pkg.price_inr}</p>
                    <p className="text-sm text-muted-foreground mt-1">{pkg.name}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Package' : 'Create Package'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Package Name</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Starter Pack" />
              </div>
              <div className="space-y-2">
                <Label>Coins</Label>
                <Input type="number" value={formData.coins} onChange={(e) => setFormData({ ...formData, coins: e.target.value })} placeholder="e.g. 1000" />
              </div>
              <div className="space-y-2">
                <Label>Price (₹ INR)</Label>
                <Input type="number" value={formData.price_inr} onChange={(e) => setFormData({ ...formData, price_inr: e.target.value })} placeholder="e.g. 1500" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} className="gradient-primary text-primary-foreground">{editing ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default CoinPackagesPage;
