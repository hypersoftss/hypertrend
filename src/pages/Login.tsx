import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useConfig } from '@/contexts/ConfigContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Moon, Sun, Lock, Mail, Zap, Eye, EyeOff, ArrowRight, Shield, AlertTriangle, MessageCircle, Wrench, User } from 'lucide-react';

// Network Particle Animation Component
const NetworkBackground: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }> = [];

    const particleColor = isDark ? '168, 85, 247' : '139, 92, 246';
    const lineColor = isDark ? '168, 85, 247' : '139, 92, 246';

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      const numParticles = Math.min(60, Math.floor((canvas.width * canvas.height) / 20000));
      particles = [];
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 1.5 + 0.5,
        });
      }
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            const opacity = (1 - distance / 120) * 0.15;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${lineColor}, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      particles.forEach((particle) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${particleColor}, 0.4)`;
        ctx.fill();
      });
    };

    const updateParticles = () => {
      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
      });
    };

    const animate = () => {
      updateParticles();
      drawParticles();
      animationId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    createParticles();
    animate();

    window.addEventListener('resize', () => {
      resizeCanvas();
      createParticles();
    });

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
    />
  );
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const logoClickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { login, signup, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { config } = useConfig();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isDark = theme === 'dark';
  const isMaintenanceMode = config.maintenanceMode;

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Secret admin login: Click logo 5 times quickly
  const handleLogoClick = () => {
    const newCount = logoClickCount + 1;
    setLogoClickCount(newCount);

    if (logoClickTimerRef.current) {
      clearTimeout(logoClickTimerRef.current);
    }

    if (newCount >= 5) {
      setShowAdminLogin(true);
      setLogoClickCount(0);
      return;
    }

    logoClickTimerRef.current = setTimeout(() => {
      setLogoClickCount(0);
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (logoClickTimerRef.current) {
        clearTimeout(logoClickTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (config.faviconUrl) {
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = config.faviconUrl;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  }, [config.faviconUrl]);

  useEffect(() => {
    document.title = isMaintenanceMode ? `Maintenance - ${config.siteName}` : `Login - ${config.siteName}`;
  }, [config.siteName, isMaintenanceMode]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        toast({
          title: '✅ Login Successful',
          description: `Welcome to ${config.siteName}!`,
        });
        navigate('/dashboard');
      } else {
        toast({
          title: '❌ Login Failed',
          description: result.error || 'Invalid credentials',
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signup(email, password, username);
      if (result.success) {
        toast({
          title: '✅ Account Created',
          description: 'You can now sign in with your credentials.',
        });
        setActiveTab('login');
      } else {
        toast({
          title: '❌ Signup Failed',
          description: result.error || 'Could not create account',
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

  // Maintenance Mode Screen
  if (isMaintenanceMode && !showAdminLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        <NetworkBackground isDark={isDark} />
        
        <Button
          variant="outline"
          size="icon"
          className="absolute top-4 right-4 z-50 rounded-full bg-card border-border hover:bg-accent hover:text-accent-foreground transition-all"
          onClick={toggleTheme}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <Card className="w-full max-w-md mx-4 relative z-10 border-border bg-card shadow-xl animate-fade-in">
          <CardHeader className="text-center pb-2 pt-8">
            <div className="flex justify-center mb-4">
              <div 
                className="relative cursor-pointer select-none" 
                onClick={handleLogoClick}
              >
                {config.logoUrl ? (
                  <div className="w-20 h-20 rounded-xl overflow-hidden shadow-lg border border-border">
                    <img 
                      src={config.logoUrl} 
                      alt={config.siteName}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-warning flex items-center justify-center shadow-lg">
                    <AlertTriangle className="w-10 h-10 text-warning-foreground" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-warning rounded-full border-2 border-card flex items-center justify-center animate-pulse">
                  <AlertTriangle className="w-2.5 h-2.5 text-warning-foreground" />
                </div>
              </div>
            </div>
            
            <CardTitle className="text-2xl font-bold text-foreground">
              🚧 Under Maintenance
            </CardTitle>
            <p className="text-warning font-medium text-sm mt-1">{config.siteName}</p>
            <CardDescription className="mt-4 text-muted-foreground">
              {config.maintenanceMessage || 'System is under maintenance. Please try again later.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="pb-8 px-6 space-y-4">
            <div className="flex justify-center py-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-warning/30 rounded-full animate-spin" style={{ borderTopColor: 'hsl(var(--warning))' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-warning" />
                </div>
              </div>
            </div>

            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">Need urgent help?</p>
              <Button
                className="w-full h-11 bg-[#0088cc] hover:bg-[#0088cc]/90 text-white font-medium transition-all"
                onClick={() => window.open(`https://t.me/${config.ownerTelegramId || 'Hyperdeveloperr'}`, '_blank')}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Connect Hyper Softs Owner
              </Button>
            </div>

            <div className="mt-4 p-3 bg-warning/10 rounded-lg border border-warning/20">
              <p className="text-sm text-center text-warning-foreground">
                We'll be back soon! Thank you for your patience. 🙏
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="absolute bottom-4 text-xs text-muted-foreground z-10">
          © {new Date().getFullYear()} {config.siteName}. All rights reserved.
        </p>
      </div>
    );
  }

  // Regular Login/Signup Form
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <NetworkBackground isDark={isDark} />

      <Button
        variant="outline"
        size="icon"
        className="absolute top-4 right-4 z-50 rounded-full bg-card border-border hover:bg-accent hover:text-accent-foreground transition-all"
        onClick={toggleTheme}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>

      <Card className="w-full max-w-md mx-4 relative z-10 border-border bg-card shadow-xl animate-fade-in">
        <CardHeader className="text-center pb-2 pt-8">
          {isMaintenanceMode && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 left-4 text-muted-foreground"
              onClick={() => setShowAdminLogin(false)}
            >
              ← Back
            </Button>
          )}

          <div className="flex justify-center mb-4">
            <div className="relative">
              {config.logoUrl ? (
                <div className="w-20 h-20 rounded-xl overflow-hidden shadow-lg border border-border">
                  <img 
                    src={config.logoUrl} 
                    alt={config.siteName}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                  <Zap className="w-10 h-10 text-primary-foreground" />
                </div>
              )}
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-card flex items-center justify-center ${isMaintenanceMode ? 'bg-warning' : 'bg-success'}`}>
                {isMaintenanceMode ? (
                  <Wrench className="w-2.5 h-2.5 text-warning-foreground" />
                ) : (
                  <Shield className="w-2.5 h-2.5 text-success-foreground" />
                )}
              </div>
            </div>
          </div>
          
          <CardTitle className="text-2xl font-bold text-foreground">
            {isMaintenanceMode ? '🔧 Admin Access' : config.siteName}
          </CardTitle>
          <p className="text-primary font-medium text-sm mt-1">{config.siteDescription}</p>
          <CardDescription className="mt-2 text-muted-foreground">
            {isMaintenanceMode 
              ? 'Administrator authentication required'
              : 'Sign in to access your dashboard'
            }
          </CardDescription>

          {isMaintenanceMode && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-warning/10 border border-warning/30 rounded-full text-xs text-warning">
              <AlertTriangle className="w-3 h-3" />
              Maintenance Mode Active
            </div>
          )}
        </CardHeader>

        <CardContent className="pb-8 px-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'signup')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11 bg-background border-input focus:border-primary"
                      required
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-11 bg-background border-input focus:border-primary"
                      required
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-muted"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all group mt-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Sign In
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-username" className="text-sm font-medium text-foreground">
                    Username
                  </Label>
                  <div className="relative">
                    <Input
                      id="signup-username"
                      type="text"
                      placeholder="Choose a username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10 h-11 bg-background border-input focus:border-primary"
                      required
                    />
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-sm font-medium text-foreground">
                    Email
                  </Label>
                  <div className="relative">
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11 bg-background border-input focus:border-primary"
                      required
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-sm font-medium text-foreground">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-11 bg-background border-input focus:border-primary"
                      required
                      minLength={6}
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-muted"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all group mt-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Create Account
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Contact Support */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground mb-2">Need help?</p>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => window.open(`https://t.me/${config.ownerTelegramId || 'Hyperdeveloperr'}`, '_blank')}
            >
              <MessageCircle className="w-3 h-3 mr-1" />
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="absolute bottom-4 text-xs text-muted-foreground z-10">
        © {new Date().getFullYear()} {config.siteName}. All rights reserved.
      </p>
    </div>
  );
};

export default Login;