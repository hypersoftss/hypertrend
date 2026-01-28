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
import { Moon, Sun, Lock, User, Zap, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react';

// Network Particle Animation Component
const NetworkBackground: React.FC = () => {
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

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      const numParticles = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
      particles = [];
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2 + 1,
        });
      }
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            const opacity = (1 - distance / 150) * 0.3;
            ctx.beginPath();
            ctx.strokeStyle = `hsla(var(--primary), ${opacity})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach((particle) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'hsl(var(--primary) / 0.6)';
        ctx.fill();

        // Glow effect
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius * 2, 0, Math.PI * 2);
        ctx.fillStyle = 'hsl(var(--primary) / 0.1)';
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
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ opacity: 0.7 }}
    />
  );
};

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { config } = useConfig();
  const navigate = useNavigate();
  const { toast } = useToast();

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
    document.title = `Login - ${config.siteName}`;
  }, [config.siteName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (success) {
        toast({
          title: '✅ Login Successful',
          description: `Welcome to ${config.siteName}!`,
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
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Network Particle Animation Background */}
      <NetworkBackground />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-[100px]" />
      </div>

      {/* Theme Toggle */}
      <Button
        variant="outline"
        size="icon"
        className="absolute top-4 right-4 z-50 rounded-full border-border/30 bg-background/50 backdrop-blur-xl hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-lg"
        onClick={toggleTheme}
      >
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>

      {/* Login Card */}
      <Card className="w-full max-w-md mx-4 relative z-10 border-border/30 bg-card/80 backdrop-blur-2xl shadow-2xl animate-fade-in overflow-hidden">
        {/* Gradient Border Effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/20 via-transparent to-accent/20 -z-10" />
        <div className="absolute -inset-[1px] bg-gradient-to-br from-primary/30 via-accent/10 to-primary/30 rounded-xl blur-sm -z-20 opacity-50" />
        
        {/* Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

        <CardHeader className="text-center pb-2 pt-10">
          {/* Logo */}
          <div className="flex justify-center mb-5">
            <div className="relative">
              {config.logoUrl ? (
                <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 animate-scale-in ring-2 ring-primary/20">
                  <img 
                    src={config.logoUrl} 
                    alt={config.siteName}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-2xl shadow-primary/30 animate-scale-in ring-2 ring-border/20">
                  <Zap className="w-12 h-12 text-primary-foreground" />
                </div>
              )}
              {/* Status Indicator */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full border-4 border-card flex items-center justify-center">
                <Shield className="w-3 h-3 text-primary-foreground" />
              </div>
            </div>
          </div>
          
          <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
            {config.siteName}
          </CardTitle>
          <p className="text-primary font-semibold text-sm mt-1">{config.siteDescription}</p>
          <CardDescription className="mt-3 text-muted-foreground/80">
            Sign in to access your dashboard
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-10 px-6 sm:px-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-primary" />
                Username
              </Label>
              <div className="relative group">
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-11 h-12 bg-background/50 border-border/40 focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all rounded-xl"
                  required
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center group-focus-within:bg-primary/20 transition-colors">
                  <User className="h-3.5 w-3.5 text-primary" />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-primary" />
                Password
              </Label>
              <div className="relative group">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-12 h-12 bg-background/50 border-border/40 focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all rounded-xl"
                  required
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center group-focus-within:bg-primary/20 transition-colors">
                  <Lock className="h-3.5 w-3.5 text-primary" />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 hover:bg-primary/10 rounded-lg"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                </Button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-primary via-primary to-accent hover:opacity-90 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/30 transition-all duration-300 group mt-2"
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
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          {/* Secure Badge */}
          <div className="flex items-center justify-center gap-2 mt-6 text-xs text-muted-foreground">
            <Shield className="w-3 h-3 text-primary/60" />
            <span>Secured with 256-bit encryption</span>
          </div>
        </CardContent>
      </Card>

      {/* Footer Text */}
      <p className="absolute bottom-4 text-xs text-muted-foreground/50 z-10">
        © {new Date().getFullYear()} {config.siteName}. All rights reserved.
      </p>
    </div>
  );
};

export default Login;
