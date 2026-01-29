import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useConfig } from '@/contexts/ConfigContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Zap, ArrowRight, Shield, Activity, BarChart3, 
  Globe, Clock, Users, CheckCircle, Moon, Sun,
  Code, Server, Smartphone
} from 'lucide-react';

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
      const numParticles = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
      particles = [];
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
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

          if (distance < 150) {
            const opacity = (1 - distance / 150) * 0.1;
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
        ctx.fillStyle = `rgba(${particleColor}, 0.3)`;
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
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
};

const features = [
  {
    icon: Activity,
    title: 'Real-time Trends',
    description: 'Get instant access to live game trends with millisecond accuracy'
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    description: '99.9% uptime with enterprise-grade security and encryption'
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Detailed statistics and performance metrics at your fingertips'
  },
  {
    icon: Globe,
    title: 'Global Access',
    description: 'Low-latency API endpoints available worldwide 24/7'
  },
  {
    icon: Clock,
    title: 'Lightning Fast',
    description: 'Average response time under 50ms for all API calls'
  },
  {
    icon: Users,
    title: 'Developer Friendly',
    description: 'Easy integration with comprehensive documentation'
  }
];

const games = [
  { name: 'Wingo', color: 'from-red-500 to-orange-500' },
  { name: 'K3', color: 'from-blue-500 to-cyan-500' },
  { name: '5D', color: 'from-purple-500 to-pink-500' },
  { name: 'TRX', color: 'from-green-500 to-emerald-500' }
];

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { config } = useConfig();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <NetworkBackground isDark={isDark} />

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 backdrop-blur-sm bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {config.logoUrl ? (
                <img src={config.logoUrl} alt={config.siteName} className="w-10 h-10 rounded-lg object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary-foreground" />
                </div>
              )}
              <span className="font-bold text-xl text-foreground">{config.siteName}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/login">
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  Get Started <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6 animate-fade-in">
            <Zap className="w-4 h-4" />
            <span>Trusted by 1000+ Developers</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-in">
            Professional{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Same Trend API
            </span>
            <br />
            Management System
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 animate-fade-in">
            Get reliable, real-time game trend predictions with our enterprise-grade API. 
            Built by Hyper Developer for seamless integration and maximum accuracy.
          </p>

          {/* Game Tags */}
          <div className="flex flex-wrap justify-center gap-3 mb-10 animate-fade-in">
            {games.map((game) => (
              <span 
                key={game.name}
                className={`px-4 py-2 rounded-full bg-gradient-to-r ${game.color} text-white text-sm font-semibold shadow-lg`}
              >
                {game.name}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
            <Link to="/login">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 group">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/docs">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                <Code className="w-5 h-5 mr-2" />
                View Documentation
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 animate-fade-in">
            {[
              { value: '99.9%', label: 'Uptime' },
              { value: '<50ms', label: 'Response Time' },
              { value: '10M+', label: 'API Calls/Day' },
              { value: '24/7', label: 'Support' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Why Choose Hyper Softs?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built for developers who demand reliability, speed, and accuracy in their trend predictions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Card key={i} className="bg-card border-border hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Simple Integration
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes with our easy-to-use API
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Users, step: '01', title: 'Create Account', desc: 'Sign up and get your API key instantly' },
              { icon: Server, step: '02', title: 'Integrate API', desc: 'Use our comprehensive documentation' },
              { icon: Smartphone, step: '03', title: 'Go Live', desc: 'Start receiving real-time trends' }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <item.icon className="w-8 h-8 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 p-8 sm:p-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of developers using Hyper Softs for reliable trend predictions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8">
                  Get Your API Key <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center gap-6 mt-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" /> Free trial available
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" /> No credit card required
              </span>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {config.logoUrl ? (
                <img src={config.logoUrl} alt={config.siteName} className="w-8 h-8 rounded-lg object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              <span className="font-semibold text-foreground">{config.siteName}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {config.siteName}. Built by Hyper Developer. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
