import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Moon, Sun, Lock, User, Zap, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (success) {
        toast({
          title: '✅ Login Successful',
          description: 'Welcome to Hyper Softs Trend!',
        });
        navigate('/dashboard');
      } else {
        toast({
          title: '❌ Login Failed',
          description: 'Invalid username or password',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: '❌ Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/30 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent/30 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      </div>

      {/* Theme Toggle */}
      <Button
        variant="outline"
        size="icon"
        className="absolute top-4 right-4 z-50 rounded-full border-border/50 bg-background/50 backdrop-blur-xl hover:bg-primary hover:text-white transition-all duration-300"
        onClick={toggleTheme}
      >
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>

      {/* Login Card */}
      <Card className="w-full max-w-md relative z-10 border-border/50 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-xl shadow-2xl animate-fade-in">
        {/* Glow Effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-accent to-primary rounded-xl opacity-20 blur-xl -z-10" />
        
        <CardHeader className="text-center pb-2 pt-8">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30 animate-scale-in">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-4 border-background flex items-center justify-center animate-pulse">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
          
          <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Hyper Softs
          </CardTitle>
          <p className="text-primary font-medium text-sm">Trend API System</p>
          <CardDescription className="mt-3">
            Sign in to access your dashboard
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
                Username
              </Label>
              <div className="relative group">
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 h-12 bg-muted/30 border-border/50 focus:border-primary/50 focus:bg-background transition-all rounded-xl"
                  required
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                Password
              </Label>
              <div className="relative group">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-12 h-12 bg-muted/30 border-border/50 focus:border-primary/50 focus:bg-background transition-all rounded-xl"
                  required
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                </Button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold rounded-xl shadow-lg shadow-primary/25 transition-all duration-300 group"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50">
              <p className="text-center text-sm text-muted-foreground mb-2 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Demo Credentials
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2 rounded-lg bg-background/50 text-center">
                  <p className="text-muted-foreground mb-1">Admin</p>
                  <p className="font-mono text-foreground">admin / admin123</p>
                </div>
                <div className="p-2 rounded-lg bg-background/50 text-center">
                  <p className="text-muted-foreground mb-1">User</p>
                  <p className="font-mono text-foreground">user1 / user123</p>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Footer Text */}
      <p className="absolute bottom-4 text-xs text-muted-foreground/50">
        © 2024 Hyper Softs. All rights reserved.
      </p>
    </div>
  );
};

export default Login;
