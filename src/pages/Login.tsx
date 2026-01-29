import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useConfig } from '@/contexts/ConfigContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Moon, Sun, Lock, User, Zap, Eye, EyeOff, ArrowRight, Shield, AlertTriangle, MessageCircle, Wrench } from 'lucide-react';

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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const logoClickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { config } = useConfig();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isDark = theme === 'dark';
  const isMaintenanceMode = config.maintenanceMode;

  // Secret admin login: Click logo 5 times quickly
  const handleLogoClick = () => {
    const newCount = logoClickCount + 1;
    setLogoClickCount(newCount);

    // Clear previous timer
    if (logoClickTimerRef.current) {
      clearTimeout(logoClickTimerRef.current);
    }

    // If 5 clicks reached, show admin login
    if (newCount >= 5) {
      setShowAdminLogin(true);
      setLogoClickCount(0);
      return;
    }

    // Reset count after 2 seconds of no clicks
    logoClickTimerRef.current = setTimeout(() => {
      setLogoClickCount(0);
    }, 2000);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (logoClickTimerRef.current) {
        clearTimeout(logoClickTimerRef.current);
      }
    };
  }, []);

  // Update favicon dynamically
  useEffect(() => {
    if (config.faviconUrl) {
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = config.faviconUrl;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  }, [config.faviconUrl]);

  // Update page title dynamically
  useEffect(() => {
    document.title = isMaintenanceMode ? `Maintenance - ${config.siteName}` : `Login - ${config.siteName}`;
  }, [config.siteName, isMaintenanceMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (success) {
        // Get user data from localStorage to check role
        const storedUser = localStorage.getItem('hyper_user');
        const userData = storedUser ? JSON.parse(storedUser) : null;
        
        // If maintenance mode is on and user is NOT admin, block login
        if (isMaintenanceMode && userData?.role !== 'admin') {
          // Logout the non-admin user
          localStorage.removeItem('hyper_user');
          toast({
            title: '🚧 Site Under Maintenance',
            description: 'Only administrators can login during maintenance. Please try again later.',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }

        toast({
          title: '✅ Login Successful',
          description: userData?.role === 'admin' && isMaintenanceMode 
            ? `Welcome Admin! Site is in maintenance mode.` 
            : `Welcome to ${config.siteName}!`,
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

  // Maintenance Mode Screen (for regular users)
  if (isMaintenanceMode && !showAdminLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        <NetworkBackground isDark={isDark} />
        
        {/* Theme Toggle */}
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
            {/* Logo - Click 5 times for secret admin login */}
            <div className="flex justify-center mb-4">
              <div 
                className="relative cursor-pointer select-none" 
                onClick={handleLogoClick}
                title=""
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
                {/* Warning Indicator */}
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
            {/* Maintenance Animation */}
            <div className="flex justify-center py-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-warning/30 rounded-full animate-spin" style={{ borderTopColor: 'hsl(var(--warning))' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-warning" />
                </div>
              </div>
            </div>

            {/* Contact Owner */}
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">Need urgent help?</p>
              <Button
                className="w-full h-11 bg-[#0088cc] hover:bg-[#0088cc]/90 text-white font-medium transition-all"
                onClick={() => window.open(`https://t.me/${config.ownerTelegramId || 'Hyperdeveloperr'}`, '_blank')}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Connect Hyper Softs Owner
              </Button>
              <p className="text-xs text-muted-foreground">
                @{config.ownerTelegramId || 'Hyperdeveloperr'}
              </p>
            </div>

            {/* Estimated Time */}
            <div className="mt-4 p-3 bg-warning/10 rounded-lg border border-warning/20">
              <p className="text-sm text-center text-warning-foreground">
                We'll be back soon! Thank you for your patience. 🙏
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer Text */}
        <p className="absolute bottom-4 text-xs text-muted-foreground z-10">
          © {new Date().getFullYear()} {config.siteName}. All rights reserved.
        </p>
      </div>
    );
  }

  // Regular Login Form (shown when not maintenance OR admin wants to login)
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Network Particle Animation Background */}
      <NetworkBackground isDark={isDark} />

      {/* Theme Toggle */}
      <Button
        variant="outline"
        size="icon"
        className="absolute top-4 right-4 z-50 rounded-full bg-card border-border hover:bg-accent hover:text-accent-foreground transition-all"
        onClick={toggleTheme}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>

      {/* Login Card */}
      <Card className="w-full max-w-md mx-4 relative z-10 border-border bg-card shadow-xl animate-fade-in">
        <CardHeader className="text-center pb-2 pt-8">
          {/* Back to Maintenance Screen (if in maintenance mode) */}
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

          {/* Logo */}
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
              {/* Status Indicator */}
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

          {/* Maintenance Mode Warning Badge */}
          {isMaintenanceMode && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-warning/10 border border-warning/30 rounded-full text-xs text-warning">
              <AlertTriangle className="w-3 h-3" />
              Maintenance Mode Active
            </div>
          )}
        </CardHeader>

        <CardContent className="pb-8 px-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-foreground">
                Username
              </Label>
              <div className="relative">
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 h-11 bg-background border-input focus:border-primary"
                  required
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Password Field */}
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

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all group mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          {/* Secure Badge */}
          <div className="flex items-center justify-center gap-2 mt-5 text-xs text-muted-foreground">
            <Shield className="w-3 h-3" />
            <span>Secured with 256-bit encryption</span>
          </div>
        </CardContent>
      </Card>

      {/* Footer Text */}
      <p className="absolute bottom-4 text-xs text-muted-foreground z-10">
        © {new Date().getFullYear()} {config.siteName}. All rights reserved.
      </p>
    </div>
  );
};

export default Login;