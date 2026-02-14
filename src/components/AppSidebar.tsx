import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AnimatedLogo } from '@/components/AnimatedLogo';
import { NavLink } from '@/components/NavLink';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Home, ClipboardList, Package, ArrowLeftRight, Link2, AlertTriangle,
  CheckCircle, ScanLine, BarChart3, ShieldCheck, Activity, FileText,
  Star, Heart, Users, Lightbulb, MessageSquare, Flag, Pill,
  FlaskConical, LogOut, Settings, Sparkles, Wallet, Sun, Moon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { shortenAddress } from '@/lib/wallet';
import type { AppRole } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

const roleNavItems: Record<AppRole, { label: string; path: string; icon: React.ElementType }[]> = {
  manufacturer: [
    { label: 'Home', path: '/home', icon: Home },
    { label: 'Register Batch', path: '/register', icon: ClipboardList },
    { label: 'My Batches', path: '/batches', icon: Package },
    { label: 'Transfer', path: '/transfer', icon: ArrowLeftRight },
    { label: 'Supply Chain', path: '/supply-chain', icon: Link2 },
    { label: 'Recall', path: '/recall', icon: AlertTriangle },
  ],
  distributor: [
    { label: 'Home', path: '/home', icon: Home },
    { label: 'Verify', path: '/verify', icon: CheckCircle },
    { label: 'Transfer', path: '/transfer', icon: ArrowLeftRight },
    { label: 'Supply Chain', path: '/supply-chain', icon: Link2 },
    { label: 'Scan Logs', path: '/logs', icon: ScanLine },
  ],
  pharmacy: [
    { label: 'Home', path: '/home', icon: Home },
    { label: 'Verify', path: '/verify', icon: CheckCircle },
    { label: 'Scan Logs', path: '/logs', icon: ScanLine },
    { label: 'Supply Chain', path: '/supply-chain', icon: Link2 },
  ],
  consumer: [
    { label: 'Home', path: '/home', icon: Home },
    { label: 'Verify', path: '/consumer', icon: CheckCircle },
    { label: 'My Safety', path: '/my-safety', icon: ShieldCheck },
    { label: 'Cabinet', path: '/cabinet', icon: Pill },
    { label: 'Family', path: '/family', icon: Users },
    { label: 'Safety Feed', path: '/safety-feed', icon: Activity },
    { label: 'Reviews', path: '/reviews', icon: Star },
    { label: 'Health Tips', path: '/health-tips', icon: Lightbulb },
    { label: 'Report Issue', path: '/report', icon: Flag },
  ],
  regulator: [
    { label: 'Home', path: '/home', icon: Home },
    { label: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    { label: 'Batches', path: '/batches', icon: Package },
    { label: 'Scan Logs', path: '/logs', icon: ScanLine },
    { label: 'Alerts', path: '/alerts', icon: AlertTriangle },
    { label: 'Audit Logs', path: '/audit', icon: FileText },
    { label: 'Trust Scores', path: '/trust', icon: ShieldCheck },
    { label: 'Recall', path: '/recall', icon: AlertTriangle },
    { label: 'Feed', path: '/feed', icon: Activity },
  ],
  auditor: [
    { label: 'Home', path: '/home', icon: Home },
    { label: 'Audit Logs', path: '/audit', icon: FileText },
    { label: 'Scan Logs', path: '/logs', icon: ScanLine },
    { label: 'Supply Chain', path: '/supply-chain', icon: Link2 },
    { label: 'Trust Scores', path: '/trust', icon: ShieldCheck },
    { label: 'Feed', path: '/feed', icon: Activity },
  ],
};

const roleLabels: Record<AppRole, string> = {
  manufacturer: 'Manufacturer',
  distributor: 'Distributor',
  pharmacy: 'Pharmacy',
  consumer: 'Consumer',
  regulator: 'Regulator',
  auditor: 'Auditor',
};

export function AppSidebar() {
  const { activeRole, demoMode, demoRole, setDemoMode, setDemoRole, user, walletAddress, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const collapsed = state === 'collapsed';

  const navItems = activeRole ? roleNavItems[activeRole] : [];

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      {/* Header with logo */}
      <SidebarHeader className="p-3">
        <Link to="/" className="flex items-center gap-2.5 px-1">
          <AnimatedLogo />
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-bold text-[15px] tracking-tight text-sidebar-foreground"
            >
              PharmaShield
            </motion.span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      {/* Role badge */}
      {activeRole && !collapsed && (
        <div className="px-4 py-2">
          <Badge variant="secondary" className="w-full justify-center text-[11px] font-semibold py-1.5 rounded-lg bg-primary/8 text-primary border-primary/15 gap-1.5">
            <Sparkles className="h-3 w-3" />
            {roleLabels[activeRole]}
          </Badge>
        </div>
      )}

      {/* Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                    >
                      <NavLink
                        to={item.path}
                        className="hover:bg-sidebar-accent/60"
                        activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick actions group */}
        <SidebarGroup>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Settings">
                  <NavLink
                    to="/settings"
                    className="hover:bg-sidebar-accent/60"
                    activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {theme === 'dark' ? (
                      <motion.div
                        key="sun"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Sun className="h-4 w-4" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="moon"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Moon className="h-4 w-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={demoMode ? 'Exit Demo' : 'Demo Mode'}
                  onClick={() => setDemoMode(!demoMode)}
                >
                  <FlaskConical className="h-4 w-4" />
                  <span>{demoMode ? 'Exit Demo' : 'Demo Mode'}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Demo role selector */}
        {demoMode && !collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel>Demo Role</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-2">
                <Select value={demoRole} onValueChange={(v) => { setDemoRole(v as AppRole); navigate('/home'); }}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manufacturer">Manufacturer</SelectItem>
                    <SelectItem value="distributor">Distributor</SelectItem>
                    <SelectItem value="pharmacy">Pharmacy</SelectItem>
                    <SelectItem value="consumer">Consumer</SelectItem>
                    <SelectItem value="regulator">Regulator</SelectItem>
                    <SelectItem value="auditor">Auditor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarSeparator />

      {/* Footer */}
      <SidebarFooter className="p-3">
        {walletAddress && !collapsed && (
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-sidebar-accent/40 text-[11px] font-mono text-sidebar-foreground/70 mb-1">
            <Wallet className="h-3 w-3 shrink-0" />
            {shortenAddress(walletAddress)}
          </div>
        )}
        {user ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 text-[13px]"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Disconnect</span>}
          </Button>
        ) : (
          <Link to="/login">
            <Button size="sm" className="w-full text-[12px] rounded-lg font-bold shadow-[0_2px_12px_hsla(211,100%,50%,0.3)]">
              {collapsed ? <Wallet className="h-4 w-4" /> : 'Connect Wallet'}
            </Button>
          </Link>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
