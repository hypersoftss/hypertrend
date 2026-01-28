import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Moon, Sun, Lock, User, Zap, Shield, TrendingUp } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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

  const features = [
    { icon: Zap, title: 'Fast API', desc: 'Lightning-fast response times' },
    { icon: Shield, title: 'Secure', desc: 'IP & Domain whitelisting' },
    { icon: TrendingUp, title: 'Analytics', desc: 'Real-time usage tracking' },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Theme Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-50"
        onClick={toggleTheme}
      >
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>

      {/* Left Panel - Branding */}
      <div className="lg:w-1/2 gradient-primary p-8 lg:p-12 flex flex-col justify-center items-center text-primary-foreground">
        <div className="max-w-md text-center lg:text-left animate-fade-in">
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
            <div className="w-14 h-14 rounded-xl bg-primary-foreground/20 backdrop-blur flex items-center justify-center">
              <Zap className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Hyper Softs</h1>
              <p className="text-primary-foreground/80 text-sm">Trend API System</p>
            </div>
          </div>

          <h2 className="text-2xl lg:text-4xl font-bold mb-4">
            Powerful API Management for Gaming Trends
          </h2>
          <p className="text-primary-foreground/80 mb-8">
            WinGo • K3 • 5D • TRX - All game types supported with secure API key management and real-time analytics.
          </p>

          <div className="grid gap-4">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-4 rounded-lg bg-primary-foreground/10 backdrop-blur"
              >
                <feature.icon className="w-6 h-6" />
                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-primary-foreground/70">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md glass animate-fade-in">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full gradient-primary text-primary-foreground font-semibold h-11"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground mt-4">
                <p>Demo Credentials:</p>
                <p className="font-mono text-xs mt-1">
                  Admin: admin / admin123 | User: user1 / user123
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
