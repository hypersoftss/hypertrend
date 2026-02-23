// Hyper Softs (Hypersofts) - Dashboard Layout Component
// Same Trend API Management System by Hyper Developer (Hyperdeveloper)
// Best API for Wingo, K3, 5D, TRX games - trend.hyperapi.in
// India's #1 Same Trend Prediction API

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useConfig } from '@/contexts/ConfigContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
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
  LogOut,
  Moon,
  Sun,
  Zap,
  MessageSquare,
  BookOpen,
  Download,
  BarChart3,
  User,
  Lock,
  ChevronDown,
  Server,
  Heart,
  Search,
  Wrench,
  Menu,
  X,
  History,
  TrendingUp,
  Coins,
  Package,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  userOnly?: boolean;
  resellerOnly?: boolean;
}

interface NavGroup {
  title: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  userOnly?: boolean;
  resellerOnly?: boolean;
  items: NavItem[];
}

// Hyper Softs Admin Navigation Groups - Same Trend API Management
const adminNavGroups: NavGroup[] = [
  {
    title: 'System Monitor',
    icon: Activity,
    adminOnly: true,
    items: [
      { title: 'Live Monitor', href: '/admin/live-monitor', icon: Zap },
      { title: 'Server Health', href: '/admin/server-health', icon: Heart },
      { title: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Logs & Tools',
    icon: Wrench,
    adminOnly: true,
    items: [
      { title: 'DNS Checker', href: '/admin/dns-checker', icon: Search },
      { title: 'Telegram Logs', href: '/admin/telegram-logs', icon: MessageSquare },
      { title: 'Activity Logs', href: '/admin/activity-logs', icon: FileText },
    ],
  },
];

// Hyper Softs User Navigation - Simple flat list for Same Trend API users
const userNavGroups: NavGroup[] = [];

// Reseller Navigation Groups
const resellerNavGroups: NavGroup[] = [];

// Hyper Softs Admin Standalone Items - Hypersofts Management by Hyper Developer
const adminStandaloneItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Users', href: '/admin/users', icon: Users, adminOnly: true },
  { title: 'API Keys', href: '/admin/keys', icon: Key, adminOnly: true },
  { title: 'API Logs', href: '/admin/logs', icon: FileText, adminOnly: true },
  { title: 'Coin Management', href: '/admin/coins', icon: Coins, adminOnly: true },
  { title: 'Coin Packages', href: '/admin/coin-packages', icon: Package, adminOnly: true },
  { title: 'Manual Reminder', href: '/admin/reminder', icon: Bell, adminOnly: true },
  { title: 'Settings', href: '/admin/settings', icon: Settings, adminOnly: true },
  { title: 'Documentation', href: '/docs', icon: BookOpen },
];

// Hyper Softs User Standalone Items - Same Trend API Access
const userStandaloneItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'My Keys', href: '/user/keys', icon: Key },
  { title: 'Call Logs', href: '/user/logs', icon: History },
  { title: 'Analytics', href: '/user/analytics', icon: BarChart3 },
  { title: 'Documentation', href: '/docs', icon: BookOpen },
];

// Reseller Standalone Items
const resellerStandaloneItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'My API Keys', href: '/reseller/keys', icon: Key },
  { title: 'Coin Balance', href: '/reseller/coins', icon: Coins },
  { title: 'Call Logs', href: '/reseller/logs', icon: History },
  { title: 'Documentation', href: '/docs', icon: BookOpen },
];

// Hyper Softs Dashboard Layout - Same Trend API by Hyper Developer (Hyperdeveloper)
const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { config } = useConfig();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isAdmin = user?.role === 'admin';
  const isReseller = user?.role === 'reseller';
  const navGroups = isAdmin ? adminNavGroups : isReseller ? resellerNavGroups : userNavGroups;
  const standaloneItems = isAdmin ? adminStandaloneItems : isReseller ? resellerStandaloneItems : userStandaloneItems;

  // Track which group is open (accordion behavior)
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  // Auto-open group based on current route
  useEffect(() => {
    const currentPath = location.pathname;
    for (const group of navGroups) {
      if (group.items.some(item => item.href === currentPath)) {
        setOpenGroup(group.title);
        return;
      }
    }
  }, [location.pathname, navGroups]);

  const toggleGroup = (groupTitle: string) => {
    setOpenGroup(prev => prev === groupTitle ? null : groupTitle);
  };

  // Filter standalone items based on role
  const filteredStandaloneItems = standaloneItems.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.userOnly && isAdmin) return false;
    return true;
  });

  // Filter groups based on role
  const filteredGroups = navGroups.filter(group => {
    if (group.adminOnly && !isAdmin) return false;
    if (group.userOnly && isAdmin) return false;
    return true;
  });

  // Get all nav items for page title
  const getAllNavItems = (): NavItem[] => {
    const items = [...standaloneItems];
    navGroups.forEach(group => items.push(...group.items));
    return items;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Check if any item in a group is active
  const isGroupActive = (group: NavGroup) => {
    return group.items.some(item => location.pathname === item.href);
  };

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Navigation content - reusable for both desktop and mobile
  const NavigationContent = () => (
    <nav className="px-3 space-y-1">
      {/* Dashboard - always first */}
      <Link
        to="/dashboard"
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
          location.pathname === '/dashboard'
            ? 'bg-primary text-primary-foreground shadow-md'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        )}
      >
        <LayoutDashboard className="w-5 h-5" />
        Dashboard
      </Link>

      {/* Collapsible Groups - Accordion Behavior */}
      {filteredGroups.map((group) => (
        <Collapsible
          key={group.title}
          open={openGroup === group.title}
          onOpenChange={() => toggleGroup(group.title)}
          className="space-y-1"
        >
          <CollapsibleTrigger className="w-full">
            <div
              className={cn(
                'flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer',
                isGroupActive(group)
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <div className="flex items-center gap-3">
                <group.icon className={cn("w-5 h-5", isGroupActive(group) && "text-primary")} />
                {group.title}
              </div>
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform duration-200",
                openGroup === group.title ? "rotate-0" : "-rotate-90"
              )} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 pl-4 animate-accordion-down">
            {group.items.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.title}
                </Link>
              );
            })}
          </CollapsibleContent>
        </Collapsible>
      ))}

      {/* Remaining standalone items */}
      {filteredStandaloneItems.filter(item => item.href !== '/dashboard').map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
              isActive
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen flex bg-background relative">
      {/* Animated Background for Dark Mode */}
      <div className="dark:block hidden animated-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="wave-container">
          <div className="wave" />
          <div className="wave" />
          <div className="wave" />
        </div>
      </div>
      
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-border bg-card/95 backdrop-blur-sm hidden lg:flex flex-col relative z-10">
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-3">
            {config.logoUrl ? (
              <img src={config.logoUrl} alt={config.siteName} className="w-10 h-10 rounded-xl object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="font-bold text-foreground truncate">Hyper Softs</h1>
              <p className="text-[10px] text-muted-foreground truncate">Same Trend API by Hyper Developer</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <NavigationContent />
        </ScrollArea>

        {/* User Info at Bottom */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-bold text-sm">
                {user?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">{user?.username}</p>
              <p className="text-[10px] text-muted-foreground capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Top Header Bar */}
        <header className="h-14 lg:h-16 border-b border-border bg-card/95 backdrop-blur-sm px-4 lg:px-6 flex items-center justify-between sticky top-0 z-20">
          {/* Mobile Menu Button + Logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <div className="flex flex-col h-full">
                  {/* Mobile Logo */}
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {config.logoUrl ? (
                        <img src={config.logoUrl} alt={config.siteName} className="w-9 h-9 rounded-xl object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                          <Zap className="w-5 h-5 text-primary-foreground" />
                        </div>
                      )}
                      <span className="font-bold text-foreground">Hyper Softs</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                  
                  {/* Mobile Navigation */}
                  <ScrollArea className="flex-1 py-4">
                    <NavigationContent />
                  </ScrollArea>

                  {/* Mobile User Info */}
                  <div className="p-4 border-t border-border">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-bold">
                          {user?.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{user?.username}</p>
                        <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}
                      >
                        <User className="w-4 h-4 mr-1" />
                        Profile
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={toggleTheme}
                      >
                        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                      >
                        <LogOut className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            {/* Mobile Title */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-semibold text-foreground text-sm truncate max-w-[150px]">
                {getAllNavItems().find(item => item.href === location.pathname)?.title || 'Dashboard'}
              </span>
            </div>
          </div>
          
          {/* Desktop Page Title */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <h2 className="text-lg font-semibold text-foreground">
              {getAllNavItems().find(item => item.href === location.pathname)?.title || 'Dashboard'}
            </h2>
          </div>

          {/* Right Side - Profile Dropdown, Theme Toggle */}
          <div className="flex items-center gap-2">
            {/* Profile Dropdown - Desktop */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hidden sm:flex items-center gap-2 h-10 px-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-semibold text-sm">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-foreground leading-none">{user?.username}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover border z-50">
                <DropdownMenuLabel>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary font-semibold">
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
            <div className="hidden sm:block h-8 w-px bg-border" />

            {/* Theme Toggle - Desktop */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className="hidden sm:flex h-9 w-9"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto relative pb-20 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border px-2 py-1.5 flex justify-around z-50 safe-area-bottom">
        {(isAdmin ? [
          { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
          { title: 'Monitor', href: '/admin/live-monitor', icon: Activity },
          { title: 'Keys', href: '/admin/keys', icon: Key },
          { title: 'Tools', href: '/admin/dns-checker', icon: Wrench },
          { title: 'Docs', href: '/docs', icon: BookOpen },
        ] : [
          { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
          { title: 'My Keys', href: '/user/keys', icon: Key },
          { title: 'Logs', href: '/user/logs', icon: History },
          { title: 'Analytics', href: '/user/analytics', icon: BarChart3 },
          { title: 'Docs', href: '/docs', icon: BookOpen },
        ]).map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all min-w-[56px]',
                isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "drop-shadow-[0_0_6px_hsl(262,83%,58%)]")} />
              <span className="text-[10px] font-medium">{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default DashboardLayout;
