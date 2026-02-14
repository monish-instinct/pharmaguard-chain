import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogOut, FlaskConical, Settings, Menu, X, Wallet, Bell, Wifi, Search, Sparkles, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { shortenAddress } from '@/lib/wallet';
import { isOnSepolia, switchToSepolia, isBlockchainConfigured } from '@/lib/blockchain';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AnimatedLogo } from '@/components/AnimatedLogo';
import type { AppRole } from '@/types';

const roleNavItems: Record<AppRole, { label: string; path: string }[]> = {
  manufacturer: [
    { label: 'Home', path: '/home' },
    { label: 'Register', path: '/register' },
    { label: 'Batches', path: '/batches' },
    { label: 'Transfer', path: '/transfer' },
    { label: 'Supply Chain', path: '/supply-chain' },
    { label: 'Recall', path: '/recall' },
  ],
  distributor: [
    { label: 'Home', path: '/home' },
    { label: 'Verify', path: '/verify' },
    { label: 'Transfer', path: '/transfer' },
    { label: 'Supply Chain', path: '/supply-chain' },
    { label: 'Scan Logs', path: '/logs' },
  ],
  pharmacy: [
    { label: 'Home', path: '/home' },
    { label: 'Verify', path: '/verify' },
    { label: 'Scan Logs', path: '/logs' },
    { label: 'Supply Chain', path: '/supply-chain' },
  ],
  consumer: [
    { label: 'Home', path: '/home' },
    { label: 'Verify', path: '/consumer' },
    { label: 'My Safety', path: '/my-safety' },
    { label: 'Cabinet', path: '/cabinet' },
    { label: 'Feed', path: '/safety-feed' },
    { label: 'Reviews', path: '/reviews' },
    { label: 'Tips', path: '/health-tips' },
    { label: 'Report', path: '/report' },
  ],
  regulator: [
    { label: 'Home', path: '/home' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Batches', path: '/batches' },
    { label: 'Scan Logs', path: '/logs' },
    { label: 'Alerts', path: '/alerts' },
    { label: 'Audit', path: '/audit' },
    { label: 'Trust', path: '/trust' },
    { label: 'Recall', path: '/recall' },
    { label: 'Feed', path: '/feed' },
  ],
  auditor: [
    { label: 'Home', path: '/home' },
    { label: 'Audit', path: '/audit' },
    { label: 'Scan Logs', path: '/logs' },
    { label: 'Supply Chain', path: '/supply-chain' },
    { label: 'Trust', path: '/trust' },
    { label: 'Feed', path: '/feed' },
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

export function Navbar() {
  const { activeRole, demoMode, demoRole, setDemoMode, setDemoRole, user, walletAddress, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const [onSepolia, setOnSepolia] = useState<boolean | null>(null);
  const isLanding = location.pathname === '/' && !activeRole;
  const isConsumerPage = location.pathname === '/consumer' || location.pathname === '/report';

  const navItems = activeRole ? roleNavItems[activeRole] : [];

  useEffect(() => {
    if (!user) return;
    supabase.from('alerts').select('*', { count: 'exact', head: true }).eq('resolved', false)
      .then(({ count }) => setAlertCount(count || 0));
  }, [user, location.pathname]);

  useEffect(() => {
    if (!walletAddress || !isBlockchainConfigured()) return;
    isOnSepolia().then(setOnSepolia);
    const handleChainChanged = () => { isOnSepolia().then(setOnSepolia); };
    (window as any).ethereum?.on?.('chainChanged', handleChainChanged);
    return () => { (window as any).ethereum?.removeListener?.('chainChanged', handleChainChanged); };
  }, [walletAddress]);

  const handleSwitchNetwork = async () => {
    const ok = await switchToSepolia();
    if (ok) { toast.success('Switched to Ethereum Sepolia'); setOnSepolia(true); }
    else { toast.error('Failed to switch network'); }
  };

  if (isConsumerPage && !activeRole) return null;

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Premium floating navbar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="px-3 pt-2"
      >
        <div className={`mx-auto max-w-[1280px] rounded-2xl transition-all duration-500 ${
          isLanding
            ? 'bg-card/60 backdrop-blur-2xl border border-border/30 shadow-[0_4px_24px_rgba(0,0,0,0.06)]'
            : 'bg-card/80 backdrop-blur-2xl border border-border/40 shadow-[0_4px_24px_rgba(0,0,0,0.08),0_0_0_1px_rgba(255,255,255,0.06)_inset]'
        }`}>
          <div className="flex h-14 items-center gap-3 px-4">
            {/* Animated Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <AnimatedLogo />
              <motion.span
                className="font-bold text-[15px] tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent hidden sm:inline"
                whileHover={{ scale: 1.02 }}
              >
                PharmaShield
              </motion.span>
            </Link>

            {/* Divider with glow */}
            {!isLanding && navItems.length > 0 && (
              <div className="hidden md:block h-5 w-px bg-gradient-to-b from-transparent via-border to-transparent mx-1" />
            )}

            {/* Landing nav */}
            {isLanding && (
              <nav className="hidden md:flex items-center gap-1 ml-4">
                {[
                  { label: 'About', href: '#technology' },
                  { label: 'Technology', href: '#technology' },
                  { label: 'Consumer', to: '/consumer' },
                  { label: 'Dashboard', to: '/login' },
                ].map((item, i) => {
                  const inner = (
                    <motion.button
                      className="px-3.5 py-1.5 rounded-xl text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors duration-200 relative"
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      key={item.label}
                    >
                      {item.label}
                    </motion.button>
                  );
                  return 'to' in item ? (
                    <Link key={item.label} to={item.to!}>{inner}</Link>
                  ) : (
                    <a key={item.label} href={item.href}>{inner}</a>
                  );
                })}
              </nav>
            )}

            {/* App nav - premium pill tabs */}
            {!isLanding && navItems.length > 0 && (
              <nav className="hidden md:flex items-center gap-0.5 rounded-xl bg-muted/40 p-1 border border-border/20">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link key={item.path} to={item.path}>
                      <motion.button
                        className={`relative px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors duration-200 ${
                          isActive
                            ? 'text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeNavTab"
                            className="absolute inset-0 rounded-lg bg-card shadow-[0_1px_3px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.04)] border border-border/30"
                            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                          />
                        )}
                        <span className="relative z-10">{item.label}</span>
                        {item.label === 'Alerts' && alertCount > 0 && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground px-1 shadow-[0_2px_8px_hsla(4,74%,49%,0.4)]"
                          >
                            {alertCount > 9 ? '9+' : alertCount}
                          </motion.span>
                        )}
                      </motion.button>
                    </Link>
                  );
                })}
              </nav>
            )}

            {/* Right section */}
            <div className="ml-auto flex items-center gap-1.5">
              {user && (
                <Link to="/search" className="hidden md:inline-flex">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/60">
                      <Search className="h-3.5 w-3.5" />
                    </Button>
                  </motion.div>
                </Link>
              )}

              {walletAddress && onSepolia !== null && isBlockchainConfigured() && (
                onSepolia ? (
                  <Badge variant="secondary" className="hidden md:inline-flex text-[10px] font-semibold px-2.5 py-1 rounded-full bg-success/10 text-success border-success/20 gap-1.5 shadow-[0_0_8px_hsla(142,71%,45%,0.15)]">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success" />
                    </span>
                    Sepolia
                  </Badge>
                ) : (
                  <Button variant="outline" size="sm" onClick={handleSwitchNetwork}
                    className="hidden md:inline-flex h-7 px-2.5 text-[10px] rounded-full border-warning/30 text-warning hover:bg-warning/10">
                    <Wifi className="h-2.5 w-2.5 mr-1" /> Switch Network
                  </Button>
                )
              )}

              {demoMode && (
                <div className="hidden md:flex items-center gap-1.5 rounded-full border border-warning/20 bg-warning/5 px-2.5 py-1">
                  <FlaskConical className="h-3 w-3 text-warning" />
                  <Select value={demoRole} onValueChange={(v) => setDemoRole(v as AppRole)}>
                    <SelectTrigger className="h-5 w-[100px] text-[10px] border-0 bg-transparent p-0 shadow-none focus:ring-0 text-warning">
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
              )}

              {walletAddress && (
                <Badge variant="secondary" className="hidden md:inline-flex text-[10px] font-mono font-medium px-2.5 py-1 rounded-full bg-muted/60 text-muted-foreground border-border/40 gap-1.5">
                  <Wallet className="h-2.5 w-2.5" />
                  {shortenAddress(walletAddress)}
                </Badge>
              )}

              {activeRole && (
                <Badge variant="secondary" className="hidden md:inline-flex text-[10px] font-semibold px-2.5 py-1 rounded-full bg-primary/8 text-primary border-primary/15 gap-1.5">
                  <Sparkles className="h-2.5 w-2.5" />
                  {roleLabels[activeRole]}
                </Badge>
              )}

              {alertCount > 0 && (
                <Link to="/alerts" className="hidden md:inline-flex">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground relative">
                      <Bell className="h-3.5 w-3.5" />
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[8px] font-bold text-destructive-foreground shadow-[0_2px_8px_hsla(4,74%,49%,0.4)]"
                      >
                        {alertCount > 9 ? '9+' : alertCount}
                      </motion.span>
                    </Button>
                  </motion.div>
                </Link>
              )}

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" size="sm" onClick={() => setDemoMode(!demoMode)}
                  className="hidden md:inline-flex h-8 px-3 text-[11px] rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/60 gap-1.5 font-semibold">
                  <FlaskConical className="h-3 w-3" />
                  {demoMode ? 'Exit' : 'Demo'}
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="hidden md:inline-flex h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/60 overflow-hidden"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {theme === 'dark' ? (
                      <motion.div
                        key="sun"
                        initial={{ y: -20, opacity: 0, rotate: -90 }}
                        animate={{ y: 0, opacity: 1, rotate: 0 }}
                        exit={{ y: 20, opacity: 0, rotate: 90 }}
                        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                      >
                        <Sun className="h-3.5 w-3.5" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="moon"
                        initial={{ y: -20, opacity: 0, rotate: 90 }}
                        animate={{ y: 0, opacity: 1, rotate: 0 }}
                        exit={{ y: 20, opacity: 0, rotate: -90 }}
                        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                      >
                        <Moon className="h-3.5 w-3.5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>

              <Link to="/settings" className="hidden md:inline-flex">
                <motion.div whileHover={{ scale: 1.1, rotate: 45 }} whileTap={{ scale: 0.9 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/60">
                    <Settings className="h-3.5 w-3.5" />
                  </Button>
                </motion.div>
              </Link>

              {user ? (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" size="icon" onClick={signOut} className="hidden md:inline-flex h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/60">
                    <LogOut className="h-3.5 w-3.5" />
                  </Button>
                </motion.div>
              ) : (
                <Link to="/login" className="hidden md:inline-flex">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="sm" className="h-8 px-5 text-[12px] rounded-full font-bold shadow-[0_2px_12px_hsla(211,100%,50%,0.3)] hover:shadow-[0_4px_20px_hsla(211,100%,50%,0.4)] transition-shadow">
                      Connect Wallet
                    </Button>
                  </motion.div>
                </Link>
              )}

              <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 rounded-xl text-muted-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
                <AnimatePresence mode="wait">
                  {mobileOpen ? (
                    <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <X className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <Menu className="h-4 w-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile menu - slide down */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="md:hidden mx-3 mt-1 overflow-hidden rounded-2xl bg-card/95 backdrop-blur-2xl border border-border/40 shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
          >
            <div className="p-3 flex flex-col gap-0.5">
              {isLanding && (
                <>
                  <a href="#technology" onClick={() => setMobileOpen(false)}>
                    <div className="px-3 py-2.5 rounded-xl text-[14px] font-medium text-foreground hover:bg-accent/60 transition-colors">Technology</div>
                  </a>
                  <Link to="/consumer" onClick={() => setMobileOpen(false)}>
                    <div className="px-3 py-2.5 rounded-xl text-[14px] font-medium text-foreground hover:bg-accent/60 transition-colors">Consumer Verify</div>
                  </Link>
                  <div className="h-px bg-border/30 my-1.5 mx-3" />
                </>
              )}
              {navItems.map((item, i) => {
                const isActive = location.pathname === item.path;
                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link to={item.path} onClick={() => setMobileOpen(false)}>
                      <div className={`px-3 py-2.5 rounded-xl text-[14px] font-medium transition-colors ${
                        isActive ? 'bg-primary/8 text-primary' : 'text-foreground hover:bg-accent/60'
                      }`}>{item.label}</div>
                    </Link>
                  </motion.div>
                );
              })}
              <div className="h-px bg-border/30 my-1.5 mx-3" />
              <Link to="/search" onClick={() => setMobileOpen(false)}>
                <div className="px-3 py-2.5 rounded-xl text-[14px] font-medium text-muted-foreground hover:bg-accent/60 flex items-center gap-2">
                  <Search className="h-3.5 w-3.5" /> Search
                </div>
              </Link>
              <button onClick={() => { setDemoMode(!demoMode); setMobileOpen(false); }} className="px-3 py-2.5 rounded-xl text-[14px] font-medium text-muted-foreground text-left hover:bg-accent/60 flex items-center gap-2">
                <FlaskConical className="h-3.5 w-3.5" /> {demoMode ? 'Exit Demo Mode' : 'Enable Demo Mode'}
              </button>
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="px-3 py-2.5 rounded-xl text-[14px] font-medium text-muted-foreground text-left hover:bg-accent/60 flex items-center gap-2">
                {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
              <Link to="/settings" onClick={() => setMobileOpen(false)}>
                <div className="px-3 py-2.5 rounded-xl text-[14px] font-medium text-muted-foreground hover:bg-accent/60 flex items-center gap-2">
                  <Settings className="h-3.5 w-3.5" /> Settings
                </div>
              </Link>
              {user ? (
                <button onClick={() => { signOut(); setMobileOpen(false); }} className="px-3 py-2.5 rounded-xl text-[14px] font-medium text-destructive text-left flex items-center gap-2">
                  <LogOut className="h-3.5 w-3.5" /> Disconnect Wallet
                </button>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <div className="px-3 py-2.5 rounded-xl text-[14px] font-semibold text-primary flex items-center gap-2">Connect Wallet</div>
                </Link>
              )}
              {demoMode && (
                <div className="px-3 py-2 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Role:</span>
                  <Select value={demoRole} onValueChange={(v) => setDemoRole(v as AppRole)}>
                    <SelectTrigger className="h-8 flex-1 text-xs"><SelectValue /></SelectTrigger>
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
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
