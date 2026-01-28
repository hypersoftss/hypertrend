import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, Save, Camera, Shield, Key, Activity, Calendar, AtSign, MessageCircle, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const [profile, setProfile] = useState({
    username: user?.username || '',
    email: user?.email || '',
    telegramId: user?.telegramId || '',
    phone: '',
  });

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: '✅ Profile Updated',
      description: 'Your profile has been saved successfully',
    });
    setIsSaving(false);
  };

  const stats = [
    { label: 'API Keys', value: '24', icon: Key, color: 'from-violet-500 to-purple-600' },
    { label: 'API Calls', value: '1,234', icon: Activity, color: 'from-blue-500 to-cyan-500' },
    { label: 'Active Keys', value: '5', icon: CheckCircle2, color: 'from-emerald-500 to-green-500' },
    { label: 'Days Active', value: '30', icon: Calendar, color: 'from-orange-500 to-amber-500' },
  ];

  const memberSince = new Date(user?.createdAt || '').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-8">
        {/* Header */}
        <div className="relative">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/5 rounded-2xl blur-3xl -z-10" />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
                  <User className="w-6 h-6 text-white" />
                </div>
                Edit Profile
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">Manage your account information</p>
            </div>
            <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary">
              <Sparkles className="w-3 h-3 mr-1" />
              {user?.role === 'admin' ? 'Administrator' : 'Member'}
            </Badge>
          </div>
        </div>

        {/* Profile Card with Avatar */}
        <Card className="border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl shadow-xl overflow-hidden">
          {/* Top Banner */}
          <div className="h-24 sm:h-32 bg-gradient-to-r from-primary via-accent to-primary relative">
            <div className="absolute inset-0 opacity-30 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_25%,rgba(255,255,255,0.1)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.1)_75%)] bg-[length:20px_20px]" />
          </div>
          
          <CardContent className="pt-0 -mt-12 sm:-mt-16">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center border-4 border-background shadow-2xl">
                  <span className="text-4xl sm:text-5xl font-bold text-white">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <Button 
                  size="icon" 
                  className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 bg-background border-2 border-border shadow-lg hover:bg-primary hover:text-white transition-all"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              
              {/* User Info */}
              <div className="text-center sm:text-left pb-2 flex-1">
                <h2 className="text-xl sm:text-2xl font-bold">{user?.username}</h2>
                <p className="text-muted-foreground text-sm">{user?.email}</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    <Calendar className="w-3 h-3 mr-1" />
                    Member since {memberSince}
                  </Badge>
                  {user?.telegramId && (
                    <Badge variant="outline" className="text-xs bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400">
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Telegram Connected
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, idx) => (
            <Card key={idx} className="border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl group hover:shadow-lg transition-all duration-300 overflow-hidden">
              <CardContent className="p-4 relative">
                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} opacity-10 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2`} />
                <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${stat.color} mb-2`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold">{stat.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Profile Form */}
        <Card className="border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              Account Information
            </CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  Username
                </Label>
                <div className="relative group">
                  <Input
                    id="username"
                    value={profile.username}
                    onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                    className="pl-10 h-11 bg-muted/30 border-border/50 focus:border-primary/50 focus:bg-background transition-all"
                  />
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
              </div>
              
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                  Email Address
                </Label>
                <div className="relative group">
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="pl-10 h-11 bg-muted/30 border-border/50 focus:border-primary/50 focus:bg-background transition-all"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Telegram ID */}
              <div className="space-y-2">
                <Label htmlFor="telegramId" className="text-sm font-medium flex items-center gap-2">
                  <MessageCircle className="w-3.5 h-3.5 text-muted-foreground" />
                  Telegram ID
                </Label>
                <div className="relative group">
                  <Input
                    id="telegramId"
                    value={profile.telegramId}
                    onChange={(e) => setProfile({ ...profile, telegramId: e.target.value })}
                    placeholder="Your Telegram user ID"
                    className="pl-10 h-11 bg-muted/30 border-border/50 focus:border-primary/50 focus:bg-background transition-all"
                  />
                  <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Used for notifications and key renewals
                </p>
              </div>
              
              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                  Phone Number
                </Label>
                <div className="relative group">
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="pl-10 h-11 bg-muted/30 border-border/50 focus:border-primary/50 focus:bg-background transition-all"
                    placeholder="+91 XXXXX XXXXX"
                  />
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="flex-1 sm:flex-none h-11 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white shadow-lg shadow-primary/25"
              >
                {isSaving ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button variant="outline" className="h-11 border-border/50">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5 backdrop-blur-xl">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h4 className="font-medium text-amber-700 dark:text-amber-300">Security Notice</h4>
              <p className="text-sm text-amber-600/80 dark:text-amber-400/80 mt-1">
                Keep your account secure by using a strong password and enabling Telegram notifications for important alerts.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
