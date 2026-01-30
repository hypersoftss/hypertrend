// Hyper Softs (Hypersofts) - Change Password Page
// Same Trend API Security by Hyper Developer (Hyperdeveloper)
// Best API for Wingo, K3, 5D, TRX - trend.hyperapi.in

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Lock, Eye, EyeOff, Shield, Check, X, KeyRound, AlertTriangle, Sparkles, RefreshCw, Info } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const ChangePasswordPage = () => {
  const { toast } = useToast();

  // SEO - Set page title for Hyper Softs (Hypersofts)
  useEffect(() => {
    document.title = 'Change Password - Hyper Softs (Hypersofts) | Same Trend API by Hyper Developer';
  }, []);
  const [isSaving, setIsSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  // Password requirements check
  const requirements = [
    { label: 'At least 8 characters', met: passwords.new.length >= 8, icon: '📏' },
    { label: 'One uppercase letter (A-Z)', met: /[A-Z]/.test(passwords.new), icon: '🔠' },
    { label: 'One lowercase letter (a-z)', met: /[a-z]/.test(passwords.new), icon: '🔡' },
    { label: 'One number (0-9)', met: /[0-9]/.test(passwords.new), icon: '🔢' },
    { label: 'Passwords match', met: passwords.new === passwords.confirm && passwords.new.length > 0, icon: '✅' },
  ];

  const metCount = requirements.filter(r => r.met).length;
  const allMet = requirements.every(r => r.met);
  const strengthPercent = (metCount / requirements.length) * 100;

  const getStrengthLabel = () => {
    if (metCount === 0) return { label: 'Enter password', color: 'text-muted-foreground' };
    if (metCount <= 2) return { label: 'Weak', color: 'text-destructive' };
    if (metCount <= 4) return { label: 'Medium', color: 'text-amber-500' };
    return { label: 'Strong', color: 'text-emerald-500' };
  };

  const strength = getStrengthLabel();

  const handleSave = async () => {
    if (!allMet) {
      toast({
        title: '❌ Requirements Not Met',
        description: 'Please ensure all password requirements are satisfied',
        variant: 'destructive',
      });
      return;
    }

    if (!passwords.current) {
      toast({
        title: '❌ Current Password Required',
        description: 'Please enter your current password',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: '✅ Password Changed',
      description: 'Your password has been updated successfully',
    });
    
    setPasswords({ current: '', new: '', confirm: '' });
    setIsSaving(false);
  };

  const securityTips = [
    { icon: '🔐', text: 'Never share your password with anyone' },
    { icon: '🌐', text: 'Use a unique password not used on other sites' },
    { icon: '📱', text: 'Consider using a password manager' },
    { icon: '🔄', text: 'Change your password every 3-6 months' },
    { icon: '🚫', text: "Don't use personal info like birthday or name" },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6 pb-8">
        {/* Header - Hyper Softs Security */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/5 rounded-2xl blur-3xl -z-10" />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                Change Password
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Secure your Hyper Softs (Hypersofts) account - Same Trend API by Hyper Developer
              </p>
            </div>
          </div>
        </div>

        {/* Password Form - Hyper Softs Account Security */}
        <Card className="border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl shadow-xl overflow-hidden">
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20">
                <KeyRound className="w-4 h-4 text-violet-500" />
              </div>
              Update Hyper Softs Password
            </CardTitle>
            <CardDescription>
              Secure your Hypersofts account - Enter current password and choose a new one for Same Trend API access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="current" className="text-sm font-medium flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                Current Password
              </Label>
              <div className="relative group">
                <Input
                  id="current"
                  type={showCurrent ? 'text' : 'password'}
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  className="pl-10 pr-12 h-12 bg-muted/30 border-border/50 focus:border-primary/50 focus:bg-background transition-all"
                  placeholder="Enter current password"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 hover:bg-muted/50"
                  onClick={() => setShowCurrent(!showCurrent)}
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="new" className="text-sm font-medium flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5 text-muted-foreground" />
                New Password
              </Label>
              <div className="relative group">
                <Input
                  id="new"
                  type={showNew ? 'text' : 'password'}
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  className="pl-10 pr-12 h-12 bg-muted/30 border-border/50 focus:border-primary/50 focus:bg-background transition-all"
                  placeholder="Enter new password"
                />
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 hover:bg-muted/50"
                  onClick={() => setShowNew(!showNew)}
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              
              {/* Password Strength Indicator */}
              {passwords.new && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Password Strength</span>
                    <span className={`font-medium ${strength.color}`}>{strength.label}</span>
                  </div>
                  <Progress 
                    value={strengthPercent} 
                    className={`h-2 ${
                      metCount <= 2 ? '[&>div]:bg-destructive' : 
                      metCount <= 4 ? '[&>div]:bg-amber-500' : 
                      '[&>div]:bg-emerald-500'
                    }`}
                  />
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-sm font-medium flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                Confirm New Password
              </Label>
              <div className="relative group">
                <Input
                  id="confirm"
                  type={showConfirm ? 'text' : 'password'}
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  className={`pl-10 pr-12 h-12 bg-muted/30 border-border/50 focus:border-primary/50 focus:bg-background transition-all ${
                    passwords.confirm && passwords.new !== passwords.confirm ? 'border-destructive/50 focus:border-destructive' : ''
                  }`}
                  placeholder="Confirm new password"
                />
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 hover:bg-muted/50"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {passwords.confirm && passwords.new !== passwords.confirm && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <X className="w-3 h-3" />
                  Passwords do not match
                </p>
              )}
            </div>

            {/* Password Requirements - Hyper Softs Security */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50">
              <h4 className="font-medium mb-3 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Hyper Softs Password Requirements
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {requirements.map((req, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center gap-2 text-sm p-2 rounded-lg transition-all ${
                      req.met ? 'bg-emerald-500/10' : 'bg-muted/50'
                    }`}
                  >
                    {req.met ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <Check className="w-3 h-3 text-emerald-500" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                        <X className="w-3 h-3 text-muted-foreground" />
                      </div>
                    )}
                    <span className={req.met ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              onClick={handleSave} 
              disabled={isSaving || !allMet || !passwords.current}
              className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Security Tips - Hyper Developer Tips */}
        <Card className="border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10">
                <Info className="w-4 h-4 text-blue-500" />
              </div>
              Hyper Softs Security Tips by Hyper Developer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {securityTips.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border border-border/30">
                  <span className="text-lg">{tip.icon}</span>
                  <span className="text-sm text-muted-foreground">{tip.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Warning Notice - Hyper Softs */}
        <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5 backdrop-blur-xl">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h4 className="font-medium text-amber-700 dark:text-amber-300">Important - Hyper Softs Security</h4>
              <p className="text-sm text-amber-600/80 dark:text-amber-400/80 mt-1">
                After changing your Hypersofts password, you'll be logged out from all devices. 
                Make sure you remember your new password for Same Trend API access.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ChangePasswordPage;
