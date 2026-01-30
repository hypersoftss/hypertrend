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
  Code, Server, Smartphone, Send, MessageCircle, ExternalLink,
  Star, Quote, Sparkles, TrendingUp, Lock, Cpu, Award, Download
} from 'lucide-react';

// Animated Gradient Orbs Background
const GradientOrbs: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-3/4 -right-32 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl" />
    </div>
  );
};

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
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          radius: Math.random() * 2 + 1,
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

          if (distance < 180) {
            const opacity = (1 - distance / 180) * 0.15;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${lineColor}, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      particles.forEach((particle) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${particleColor}, 0.5)`;
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
    title: 'Real-time Same Trends',
    description: 'Hyper Softs provides instant access to live same trend predictions with millisecond accuracy for Wingo, K3, 5D, TRX games',
    gradient: 'from-red-500 to-orange-500'
  },
  {
    icon: Shield,
    title: 'Secure & Reliable API',
    description: 'Hypersofts ensures 99.9% uptime with enterprise-grade security. Trusted by 1000+ developers worldwide',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: BarChart3,
    title: 'Advanced Trend Analytics',
    description: 'Hyper Developer built detailed statistics and performance metrics for color prediction games',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: Globe,
    title: 'Global API Access',
    description: 'Hypersofts Trend API endpoints available worldwide 24/7 with low-latency responses',
    gradient: 'from-emerald-500 to-teal-500'
  },
  {
    icon: Clock,
    title: 'Lightning Fast Response',
    description: 'Hyper Softs API average response time under 50ms for Wingo, K3, 5D, TRX predictions',
    gradient: 'from-amber-500 to-yellow-500'
  },
  {
    icon: Cpu,
    title: 'AI-Powered Predictions',
    description: 'Hyper Developer\'s smart same trend predictions powered by advanced machine learning algorithms',
    gradient: 'from-indigo-500 to-violet-500'
  }
];

const games = [
  { name: 'Wingo API', color: 'from-red-500 to-orange-500', icon: '🎯' },
  { name: 'K3 API', color: 'from-blue-500 to-cyan-500', icon: '🎲' },
  { name: '5D API', color: 'from-purple-500 to-pink-500', icon: '⭐' },
  { name: 'TRX API', color: 'from-emerald-500 to-teal-500', icon: '💎' }
];

const reviews = [
  {
    name: 'Rahul Sharma',
    role: 'Full Stack Developer',
    avatar: 'RS',
    rating: 5,
    text: 'Hyper Softs Same Trend API is the best I have ever used. Hypersofts accuracy is incredible and Hyper Developer support is very responsive!',
    date: '2 days ago'
  },
  {
    name: 'Amit Kumar',
    role: 'App Developer',
    avatar: 'AK',
    rating: 5,
    text: 'Hypersofts Trend API has completely transformed my Wingo and K3 predictions. 99.9% uptime by Hyper Developer. Best Same Trend API!',
    date: '5 days ago'
  },
  {
    name: 'Priya Singh',
    role: 'Tech Lead',
    avatar: 'PS',
    rating: 5,
    text: 'We integrated Hyper Softs API for 5D and TRX games. Hyper Developer documentation is excellent. Best color prediction API in India!',
    date: '1 week ago'
  },
  {
    name: 'Vikash Verma',
    role: 'Backend Developer',
    avatar: 'VV',
    rating: 5,
    text: 'Amazing Wingo API accuracy! Hypersofts Telegram support from @Hyperdeveloperr is quick. Hyper Softs is best in the market!',
    date: '1 week ago'
  },
  {
    name: 'Deepak Patel',
    role: 'Freelancer',
    avatar: 'DP',
    rating: 5,
    text: 'I tried many APIs but Hyper Developer\'s Hypersofts is on another level. K3, 5D, TRX trend predictions are super accurate!',
    date: '2 weeks ago'
  },
  {
    name: 'Suresh Yadav',
    role: 'Startup Founder',
    avatar: 'SY',
    rating: 5,
    text: 'Our users love Hyper Softs real-time Wingo data. Hyper Developer team provides 24/7 support. Best Same Trend API service!',
    date: '2 weeks ago'
  }
];

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { config } = useConfig();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <GradientOrbs />
      <NetworkBackground isDark={isDark} />

      {/* Header */}
      <header className="relative z-20 border-b border-border/50 backdrop-blur-xl bg-background/60 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {config.logoUrl ? (
                <img src={config.logoUrl} alt={config.siteName} className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover ring-2 ring-primary/20" />
              ) : (
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                  <Zap className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="hidden sm:block">
                <span className="font-bold text-lg text-foreground">{config.siteName}</span>
                <p className="text-xs text-muted-foreground -mt-0.5">by Hyper Developer</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full w-9 h-9"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Link to="/login">
                <Button variant="outline" size="sm" className="h-9 border-border/50">
                  Sign In
                </Button>
              </Link>
              <Link to="/login" className="hidden sm:block">
                <Button size="sm" className="h-9 bg-gradient-to-r from-primary to-accent hover:opacity-90 border-0 shadow-lg shadow-primary/25">
                  Get Started <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 py-12 sm:py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollAnimation animation="fade-up" delay={0}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 text-primary text-sm font-medium mb-6 backdrop-blur-sm">
              <Sparkles className="w-4 h-4" />
              <span>Hypersofts - Trusted by 1000+ Developers</span>
              <Award className="w-4 h-4" />
            </div>
          </ScrollAnimation>
          
          <ScrollAnimation animation="fade-up" delay={100}>
            <h1 className="text-3xl sm:text-4xl lg:text-6xl xl:text-7xl font-extrabold text-foreground mb-6 leading-tight">
              <span className="bg-gradient-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent">
                Hyper Softs
              </span>
              {' '}- India's #1
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              Same Trend API by{' '}
              <span className="text-primary">Hyper Developer</span>
            </h1>
          </ScrollAnimation>
          
          <ScrollAnimation animation="fade-up" delay={200}>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              <strong className="text-foreground">Hypersofts</strong> provides reliable, real-time Wingo, K3, 5D, TRX trend predictions. 
              Best color prediction API built by <span className="text-primary font-semibold">Hyper Developer</span> for seamless integration and maximum accuracy.
            </p>
          </ScrollAnimation>

          {/* Game Tags */}
          <ScrollAnimation animation="fade-up" delay={300}>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8">
              {games.map((game, i) => (
                <div 
                  key={game.name}
                  className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-r ${game.color} text-white text-sm font-semibold shadow-lg flex items-center gap-2 hover:scale-105 transition-transform cursor-default`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <span>{game.icon}</span>
                  <span>{game.name}</span>
                </div>
              ))}
            </div>
          </ScrollAnimation>

          <ScrollAnimation animation="fade-up" delay={400}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12">
              <Link to="/login" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:opacity-90 text-base sm:text-lg px-8 py-6 shadow-xl shadow-primary/30 border-0 group">
                  <Zap className="w-5 h-5 mr-2" />
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/install" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base sm:text-lg px-8 py-6 border-primary/50 bg-primary/5 hover:bg-primary/10 group">
                  <Download className="w-5 h-5 mr-2" />
                  Install App
                  <Smartphone className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
                </Button>
              </Link>
              <Link to="/docs" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base sm:text-lg px-8 py-6 border-border/50 backdrop-blur-sm">
                  <Code className="w-5 h-5 mr-2" />
                  View Docs
                </Button>
              </Link>
            </div>
          </ScrollAnimation>

          {/* Stats */}
          <ScrollAnimation animation="fade-up" delay={500}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {[
                { value: '99.9%', label: 'Uptime', icon: TrendingUp },
                { value: '<50ms', label: 'Response', icon: Zap },
                { value: '10M+', label: 'API Calls', icon: Activity },
                { value: '24/7', label: 'Support', icon: Shield }
              ].map((stat, i) => (
                <div 
                  key={i} 
                  className="relative group p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-border/50 hover:border-primary/30 transition-all hover:-translate-y-1"
                >
                  <stat.icon className="w-5 h-5 text-primary mb-2 mx-auto" />
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation animation="fade-up">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
                <Sparkles className="w-3 h-3" />
                HYPERSOFTS FEATURES
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Why Choose <span className="text-primary">Hyper Softs</span> Same Trend API?
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Hyper Developer built this API for developers who demand reliability, speed, and accuracy in Wingo, K3, 5D, TRX predictions.
              </p>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, i) => (
              <ScrollAnimation key={i} animation="fade-up" delay={i * 80}>
                <Card className="h-full group bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-all hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/10 overflow-hidden">
                  <CardContent className="p-5 sm:p-6 relative">
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`} />
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="relative z-10 py-16 sm:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation animation="fade-up">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
                <Star className="w-3 h-3 fill-current" />
                HYPERSOFTS REVIEWS
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Loved by <span className="text-primary">Developers</span> Worldwide
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                See what developers are saying about Hyper Softs Same Trend API by Hyper Developer
              </p>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {reviews.map((review, i) => (
              <ScrollAnimation key={i} animation="fade-up" delay={i * 100}>
                <Card className="h-full bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-all hover:-translate-y-1">
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {review.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground truncate">{review.name}</h4>
                        <p className="text-xs text-muted-foreground">{review.role}</p>
                        <div className="flex items-center gap-0.5 mt-1">
                          {[...Array(review.rating)].map((_, j) => (
                            <Star key={j} className="w-3 h-3 text-yellow-500 fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <Quote className="absolute -top-1 -left-1 w-6 h-6 text-primary/20" />
                      <p className="text-sm text-muted-foreground leading-relaxed pl-4">
                        {review.text}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground/60 mt-4">{review.date}</p>
                  </CardContent>
                </Card>
              </ScrollAnimation>
            ))}
          </div>

          {/* Trust Badges */}
          <ScrollAnimation animation="fade-up" delay={300}>
            <div className="flex flex-wrap items-center justify-center gap-6 mt-12 pt-8 border-t border-border/50">
              {[
                { icon: Shield, text: 'SSL Secured' },
                { icon: Lock, text: '256-bit Encryption' },
                { icon: Award, text: 'ISO Certified' },
                { icon: CheckCircle, text: '99.9% Uptime' }
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <badge.icon className="w-4 h-4 text-primary" />
                  <span>{badge.text}</span>
                </div>
              ))}
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation animation="fade-up">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
                <Code className="w-3 h-3" />
                HYPERSOFTS INTEGRATION
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Simple <span className="text-primary">Hyper Softs API</span> Integration
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Get started with Hypersofts Wingo, K3, 5D, TRX API in minutes - by Hyper Developer
              </p>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              { icon: Users, step: '01', title: 'Create Hypersofts Account', desc: 'Sign up and get your Hyper Softs API key instantly', color: 'from-blue-500 to-cyan-500' },
              { icon: Server, step: '02', title: 'Integrate Hyper Developer API', desc: 'Use Hypersofts comprehensive documentation for Wingo, K3, 5D, TRX', color: 'from-purple-500 to-pink-500' },
              { icon: Smartphone, step: '03', title: 'Go Live with Hyper Softs', desc: 'Start receiving real-time same trend predictions', color: 'from-emerald-500 to-teal-500' }
            ].map((item, i) => (
              <ScrollAnimation key={i} animation="scale" delay={i * 150}>
                <div className="relative text-center p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-border/50 hover:border-primary/30 transition-all hover:-translate-y-1">
                  {i < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 w-8 text-muted-foreground/30">
                      <ArrowRight className="w-8 h-8" />
                    </div>
                  )}
                  <div className="relative inline-block mb-5">
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                      <item.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-background border-2 border-primary text-primary text-sm font-bold flex items-center justify-center shadow-lg">
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
      <section className="relative z-10 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation animation="fade-up">
            <Card className="bg-gradient-to-br from-blue-500/10 via-primary/5 to-cyan-500/10 border-primary/20 overflow-hidden backdrop-blur-xl">
              <CardContent className="p-6 sm:p-10 text-center relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-primary to-cyan-500" />
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/30">
                  <Send className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                  Contact Hyper Developer
                </h2>
                <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                  Need help with Hypersofts API? Connect directly with Hyper Developer on Telegram for instant Hyper Softs support.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                  <a
                    href="https://t.me/Hyperdeveloperr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto"
                  >
                    <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-5 shadow-lg shadow-blue-500/30 group">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      @Hyperdeveloperr
                      <ExternalLink className="w-4 h-4 ml-2 opacity-70 group-hover:opacity-100" />
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
                      <ExternalLink className="w-4 h-4 ml-2 opacity-70 group-hover:opacity-100" />
                    </Button>
                  </a>
                </div>
                
                <p className="text-xs text-muted-foreground mt-6">
                  Join Hyper Softs Telegram channel for Hypersofts updates, announcements, and 24/7 Hyper Developer support
                </p>
              </CardContent>
            </Card>
          </ScrollAnimation>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 py-8 backdrop-blur-sm bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {config.logoUrl ? (
                <img src={config.logoUrl} alt={config.siteName} className="w-8 h-8 rounded-lg object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
              )}
              <span className="font-semibold text-foreground">{config.siteName}</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="https://t.me/Hyperdeveloperr" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                <MessageCircle className="w-4 h-4" />
              </a>
              <a href="https://t.me/hypersoftstech" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                <Send className="w-4 h-4" />
              </a>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-right">
              © {new Date().getFullYear()} Hyper Softs (Hypersofts). Best Same Trend API by Hyper Developer
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
