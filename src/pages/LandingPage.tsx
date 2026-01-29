import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useConfig } from '@/contexts/ConfigContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ScrollAnimation from '@/components/ScrollAnimation';
import { 
  Zap, ArrowRight, Shield, Activity, BarChart3, 
  Globe, Clock, Users, CheckCircle, Moon, Sun,
  Code, Server, Smartphone, Send, MessageCircle, ExternalLink
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
      <header className="relative z-10 border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0">
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
              <span className="font-bold text-xl text-foreground hidden sm:block">{config.siteName}</span>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
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
              <Link to="/login" className="hidden sm:block">
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  Get Started <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 py-16 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollAnimation animation="fade-up" delay={0}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              <span>Trusted by 1000+ Developers</span>
            </div>
          </ScrollAnimation>
          
          <ScrollAnimation animation="fade-up" delay={100}>
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-foreground mb-6">
              Professional{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Same Trend API
              </span>
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              Management System
            </h1>
          </ScrollAnimation>
          
          <ScrollAnimation animation="fade-up" delay={200}>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Get reliable, real-time game trend predictions with our enterprise-grade API. 
              Built by Hyper Developer for seamless integration and maximum accuracy.
            </p>
          </ScrollAnimation>

          {/* Game Tags */}
          <ScrollAnimation animation="fade-up" delay={300}>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8">
              {games.map((game, i) => (
                <span 
                  key={game.name}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r ${game.color} text-white text-xs sm:text-sm font-semibold shadow-lg`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {game.name}
                </span>
              ))}
            </div>
          </ScrollAnimation>

          <ScrollAnimation animation="fade-up" delay={400}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link to="/login" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 group">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/docs" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6">
                  <Code className="w-5 h-5 mr-2" />
                  View Docs
                </Button>
              </Link>
            </div>
          </ScrollAnimation>

          {/* Stats */}
          <ScrollAnimation animation="fade-up" delay={500}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-12 sm:mt-16">
              {[
                { value: '99.9%', label: 'Uptime' },
                { value: '<50ms', label: 'Response' },
                { value: '10M+', label: 'API Calls' },
                { value: '24/7', label: 'Support' }
              ].map((stat, i) => (
                <div key={i} className="text-center p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-16 sm:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation animation="fade-up">
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Why Choose Hyper Softs?
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Built for developers who demand reliability, speed, and accuracy in their trend predictions.
              </p>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, i) => (
              <ScrollAnimation key={i} animation="fade-up" delay={i * 100}>
                <Card className="h-full bg-card border-border hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-lg">
                  <CardContent className="p-5 sm:p-6">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation animation="fade-up">
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Simple Integration
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Get started in minutes with our easy-to-use API
              </p>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              { icon: Users, step: '01', title: 'Create Account', desc: 'Sign up and get your API key instantly' },
              { icon: Server, step: '02', title: 'Integrate API', desc: 'Use our comprehensive documentation' },
              { icon: Smartphone, step: '03', title: 'Go Live', desc: 'Start receiving real-time trends' }
            ].map((item, i) => (
              <ScrollAnimation key={i} animation="scale" delay={i * 150}>
                <div className="text-center p-6 rounded-2xl bg-card/50 border border-border/50">
                  <div className="relative inline-block mb-5">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <item.icon className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary text-primary-foreground text-xs sm:text-sm font-bold flex items-center justify-center">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">{item.desc}</p>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Developer Section */}
      <section className="relative z-10 py-16 sm:py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation animation="fade-up">
            <Card className="bg-gradient-to-br from-blue-500/10 via-primary/5 to-cyan-500/10 border-primary/20 overflow-hidden">
              <CardContent className="p-6 sm:p-10 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Send className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                  Contact Developer
                </h2>
                <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                  Need help or have questions? Connect directly with the developer on Telegram.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                  <a
                    href="https://t.me/Hyperdeveloperr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto"
                  >
                    <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-5 group">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      @Hyperdeveloperr
                      <ExternalLink className="w-4 h-4 ml-2 opacity-70" />
                    </Button>
                  </a>
                  <a
                    href="https://t.me/hypersoftstech"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto"
                  >
                    <Button size="lg" variant="outline" className="w-full sm:w-auto border-blue-500/50 text-blue-500 hover:bg-blue-500/10 px-6 py-5 group">
                      <Users className="w-5 h-5 mr-2" />
                      Join Channel
                      <ExternalLink className="w-4 h-4 ml-2 opacity-70" />
                    </Button>
                  </a>
                </div>
                
                <p className="text-xs text-muted-foreground mt-6">
                  Join our Telegram channel for updates, announcements, and support
                </p>
              </CardContent>
            </Card>
          </ScrollAnimation>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollAnimation animation="scale">
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 p-6 sm:p-10 lg:p-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
                Join thousands of developers using Hyper Softs for reliable trend predictions.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <Link to="/login" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-base sm:text-lg px-6 sm:px-8">
                    Get Your API Key <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" /> Free trial available
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" /> No credit card required
                </span>
              </div>
            </Card>
          </ScrollAnimation>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-6 sm:py-8">
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
            <div className="flex items-center gap-4">
              <a href="https://t.me/Hyperdeveloperr" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="https://t.me/hypersoftstech" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Send className="w-5 h-5" />
              </a>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-right">
              © {new Date().getFullYear()} {config.siteName}. Built by Hyper Developer.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
