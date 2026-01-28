import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { mockUsers } from '@/lib/mockData';
import { User } from '@/types';
import { Users as UsersIcon, Plus, Search, Edit, Trash2, MessageSquare, Mail, Shield, User as UserIcon, Key, Send, Copy, CheckCircle, RefreshCw, Eye, EyeOff } from 'lucide-react';

// Telegram Bot Token (from settings)
const TELEGRAM_BOT_TOKEN = '7843243355:AAFaHx7XrIAehoIqVRw83uEkZGjT8G75HO8';

// Generate random password
const generatePassword = (length: number = 12): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [sendViaTelegram, setSendViaTelegram] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    telegramId: '',
    role: 'user' as 'admin' | 'user',
  });
  const { toast } = useToast();

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.telegramId?.includes(searchQuery)
  );

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        telegramId: user.telegramId || '',
        role: user.role,
      });
      setGeneratedPassword('');
    } else {
      setEditingUser(null);
      setFormData({ username: '', email: '', telegramId: '', role: 'user' });
      // Auto-generate password for new users
      setGeneratedPassword(generatePassword());
    }
    setShowPassword(false);
    setIsDialogOpen(true);
  };

  const regeneratePassword = () => {
    setGeneratedPassword(generatePassword());
    toast({ title: '🔄 Password Regenerated', description: 'New password generated' });
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(generatedPassword);
    toast({ title: '📋 Copied!', description: 'Password copied to clipboard' });
  };

  const sendCredentialsViaTelegram = async (username: string, password: string, telegramId: string) => {
    if (!telegramId) return false;

    const message = `🔐 *Your Login Credentials*

👤 *Username:* \`${username}\`
🔑 *Password:* \`${password}\`

🌐 *Login URL:* ${window.location.origin}/login

⚠️ _Please save these credentials securely and change your password after first login._

— Hyper Softs Team`;

    try {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramId,
          text: message,
          parse_mode: 'Markdown'
        })
      });

      const result = await response.json();
      return result.ok;
    } catch (error) {
      console.error('Telegram send error:', error);
      return false;
    }
  };

  const handleSave = async () => {
    if (!formData.username || !formData.email) {
      toast({ title: 'Error', description: 'Username and email are required', variant: 'destructive' });
      return;
    }

    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
      toast({ title: '✅ Success', description: 'User updated successfully' });
    } else {
      // Creating new user
      if (!generatedPassword) {
        toast({ title: 'Error', description: 'Password is required for new users', variant: 'destructive' });
        return;
      }

      setIsSending(true);

      const newUser: User = {
        id: Date.now().toString(),
        ...formData,
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      // Send credentials via Telegram if enabled
      if (sendViaTelegram && formData.telegramId) {
        const sent = await sendCredentialsViaTelegram(formData.username, generatedPassword, formData.telegramId);
        
        if (sent) {
          toast({ 
            title: '✅ User Created & Credentials Sent!', 
            description: `Login credentials sent to Telegram ID: ${formData.telegramId}` 
          });
        } else {
          toast({ 
            title: '⚠️ User Created', 
            description: 'User created but failed to send Telegram message. Share password manually.',
            variant: 'destructive'
          });
        }
      } else {
        toast({ 
          title: '✅ User Created', 
          description: 'Remember to share the password with the user!' 
        });
      }

      setUsers([...users, newUser]);
      setIsSending(false);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
    toast({ title: '✅ Success', description: 'User deleted successfully' });
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(users.map(u => u.id === userId ? { ...u, isActive: !u.isActive } : u));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <UsersIcon className="w-8 h-8 text-primary" />
              User Management
            </h1>
            <p className="text-muted-foreground mt-1">Manage all registered users</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground" onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingUser ? 'Edit User' : '👤 Create New User'}</DialogTitle>
                <DialogDescription>
                  {editingUser ? 'Update user information' : 'Add a new user and send login credentials via Telegram'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Enter username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telegramId">Telegram Chat ID</Label>
                  <Input
                    id="telegramId"
                    value={formData.telegramId}
                    onChange={(e) => setFormData({ ...formData, telegramId: e.target.value })}
                    placeholder="Enter Telegram ID (for sending credentials)"
                  />
                  <p className="text-xs text-muted-foreground">User can get their ID from @userinfobot on Telegram</p>
                </div>
                
                {/* Password Section - Only for new users */}
                {!editingUser && (
                  <div className="space-y-3 p-4 rounded-lg bg-muted/50 border">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-primary" />
                        Generated Password
                      </Label>
                      <Button variant="ghost" size="sm" onClick={regeneratePassword}>
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Regenerate
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={generatedPassword}
                          onChange={(e) => setGeneratedPassword(e.target.value)}
                          className="pr-10 font-mono"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                      <Button variant="outline" size="icon" onClick={copyPassword}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>

                    {formData.telegramId && (
                      <div className="flex items-center justify-between pt-2 border-t">
                        <Label htmlFor="sendTelegram" className="flex items-center gap-2 cursor-pointer">
                          <Send className="w-4 h-4 text-primary" />
                          Send credentials via Telegram
                        </Label>
                        <Switch
                          id="sendTelegram"
                          checked={sendViaTelegram}
                          onCheckedChange={setSendViaTelegram}
                        />
                      </div>
                    )}

                    {!formData.telegramId && (
                      <p className="text-xs text-warning flex items-center gap-1">
                        ⚠️ Enter Telegram ID to auto-send credentials
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Role</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={formData.role === 'user' ? 'default' : 'outline'}
                      onClick={() => setFormData({ ...formData, role: 'user' })}
                      className="flex-1"
                    >
                      <UserIcon className="w-4 h-4 mr-2" />
                      User
                    </Button>
                    <Button
                      type="button"
                      variant={formData.role === 'admin' ? 'default' : 'outline'}
                      onClick={() => setFormData({ ...formData, role: 'admin' })}
                      className="flex-1"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Admin
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button 
                  onClick={handleSave} 
                  className="gradient-primary text-primary-foreground"
                  disabled={isSending}
                >
                  {isSending ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      {!editingUser && sendViaTelegram && formData.telegramId ? (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Create & Send
                        </>
                      ) : (
                        editingUser ? 'Update' : 'Create'
                      )}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Info Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">How User Login Works</p>
                <p className="text-sm text-muted-foreground mt-1">
                  1. Admin creates user with username, email & Telegram ID<br/>
                  2. System generates a secure password automatically<br/>
                  3. Credentials are sent to user's Telegram (if ID provided)<br/>
                  4. User logs in at <code className="bg-muted px-1 rounded">/login</code> with those credentials
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>All Users ({filteredUsers.length})</CardTitle>
            <CardDescription>Click on a user to view details or edit</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-lg">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{user.username}</span>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                        <Badge variant={user.isActive ? 'outline' : 'destructive'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </span>
                        {user.telegramId && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {user.telegramId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => toggleUserStatus(user.id)}>
                      {user.isActive ? 'Disable' : 'Enable'}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(user)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(user.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UsersPage;
