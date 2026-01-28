import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useConfig } from '@/contexts/ConfigContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Key,
  FileText,
  Activity,
  Settings,
  Bell,
  Heart,
  LogOut,
  Moon,
  Sun,
  Zap,
  MessageSquare,
  BookOpen,
  Globe,
  Download,
  BarChart3,
  User,
  Lock,
  ChevronDown,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Analytics', href: '/admin/analytics', icon: BarChart3, adminOnly: true },
  { title: 'Users', href: '/admin/users', icon: Users, adminOnly: true },
  { title: 'API Keys', href: '/admin/keys', icon: Key, adminOnly: true },
  { title: 'My Keys', href: '/user/keys', icon: Key },
  { title: 'API Logs', href: '/admin/logs', icon: FileText, adminOnly: true },
  { title: 'Live Monitor', href: '/admin/live', icon: Activity, adminOnly: true },
  { title: 'Telegram Logs', href: '/admin/telegram', icon: MessageSquare, adminOnly: true },
  { title: 'DNS Checker', href: '/admin/dns', icon: Globe, adminOnly: true },
  { title: 'Server Health', href: '/admin/health', icon: Heart, adminOnly: true },
  { title: 'Manual Reminder', href: '/admin/reminder', icon: Bell, adminOnly: true },
  { title: 'Activity Logs', href: '/admin/activity', icon: Activity, adminOnly: true },
  { title: 'Settings', href: '/admin/settings', icon: Settings, adminOnly: true },
  { title: 'Backend Download', href: '/admin/download', icon: Download, adminOnly: true },
  { title: 'Documentation', href: '/docs', icon: BookOpen },
];

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { config } = useConfig();
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';

  const filteredNavItems = navItems.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.href === '/user/keys' && isAdmin) return false;
    return true;
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card hidden lg:flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-3">
            {config.logoUrl ? (
              <img src={config.logoUrl} alt={config.siteName} className="w-10 h-10 rounded-lg object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
            )}
            <div>
              <h1 className="font-bold text-foreground">{config.siteName}</h1>
              <p className="text-xs text-muted-foreground">{config.siteDescription}</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="px-3 space-y-1">
            {filteredNavItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2">
            {config.logoUrl ? (
              <img src={config.logoUrl} alt={config.siteName} className="w-8 h-8 rounded-lg object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
            )}
            <span className="font-bold text-foreground">{config.siteName}</span>
          </div>
          
          {/* Page Title - Desktop */}
          <div className="hidden lg:block">
            <h2 className="text-lg font-semibold text-foreground">
              {filteredNavItems.find(item => item.href === location.pathname)?.title || 'Dashboard'}
            </h2>
          </div>

          {/* Right Side - Profile Dropdown, Theme Toggle, Logout */}
          <div className="flex items-center gap-2">
            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-10 px-2">
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                    <span className="text-accent-foreground font-semibold text-sm">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-foreground leading-none">{user?.username}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover border z-50">
                <DropdownMenuLabel>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                      <span className="text-accent-foreground font-semibold">
                        {user?.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{user?.username}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                  <User className="w-4 h-4 mr-2" />
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/change-password')} className="cursor-pointer">
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate('/admin/settings')} className="cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" />
                    Site Settings
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Divider */}
            <div className="h-8 w-px bg-border" />

            {/* Theme Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className="h-9 w-9"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-2 flex justify-around z-50">
        {filteredNavItems.slice(0, 5).map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-lg transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px]">{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default DashboardLayout;
