import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Search, Wifi, Wallet, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { shortenAddress } from '@/lib/wallet';
import { isOnSepolia, switchToSepolia, isBlockchainConfigured } from '@/lib/blockchain';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { AppRole } from '@/types';

const roleLabels: Record<AppRole, string> = {
  manufacturer: 'Manufacturer',
  distributor: 'Distributor',
  pharmacy: 'Pharmacy',
  consumer: 'Consumer',
  regulator: 'Regulator',
  auditor: 'Auditor',
};

export function Navbar() {
  const { activeRole, user, walletAddress } = useAuth();
  const location = useLocation();
  const [alertCount, setAlertCount] = useState(0);
  const [onSepolia, setOnSepolia] = useState<boolean | null>(null);
  const isLanding = location.pathname === '/' && !activeRole;
  const isConsumerPage = location.pathname === '/consumer' || location.pathname === '/report';

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
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="flex h-12 items-center gap-2 px-3">
        {/* Sidebar trigger - always visible */}
        {!isLanding && (
          <SidebarTrigger className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground" />
        )}

        {/* Landing: show logo + nav */}
        {isLanding && (
          <>
            <Link to="/" className="flex items-center gap-2 mr-4">
              <span className="font-bold text-[15px] tracking-tight text-foreground">PharmaShield</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {[
                { label: 'About', href: '#technology' },
                { label: 'Technology', href: '#technology' },
                { label: 'Consumer', to: '/consumer' },
                { label: 'Dashboard', to: '/login' },
              ].map((item) =>
                'to' in item ? (
                  <Link key={item.label} to={item.to!}>
                    <Button variant="ghost" size="sm" className="h-8 px-3 text-[13px] rounded-lg text-muted-foreground hover:text-foreground">
                      {item.label}
                    </Button>
                  </Link>
                ) : (
                  <a key={item.label} href={item.href}>
                    <Button variant="ghost" size="sm" className="h-8 px-3 text-[13px] rounded-lg text-muted-foreground hover:text-foreground">
                      {item.label}
                    </Button>
                  </a>
                )
              )}
            </nav>
          </>
        )}

        {/* Right section */}
        <div className="ml-auto flex items-center gap-1.5">
          {user && (
            <Link to="/search">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground">
                <Search className="h-3.5 w-3.5" />
              </Button>
            </Link>
          )}

          {walletAddress && onSepolia !== null && isBlockchainConfigured() && (
            onSepolia ? (
              <Badge variant="secondary" className="hidden sm:inline-flex text-[10px] font-semibold px-2.5 py-1 rounded-full bg-success/10 text-success border-success/20 gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success" />
                </span>
                Sepolia
              </Badge>
            ) : (
              <Button variant="outline" size="sm" onClick={handleSwitchNetwork}
                className="hidden sm:inline-flex h-7 px-2.5 text-[10px] rounded-full border-warning/30 text-warning hover:bg-warning/10">
                <Wifi className="h-2.5 w-2.5 mr-1" /> Switch Network
              </Button>
            )
          )}

          {walletAddress && (
            <Badge variant="secondary" className="hidden sm:inline-flex text-[10px] font-mono font-medium px-2.5 py-1 rounded-full bg-muted/60 text-muted-foreground border-border/40 gap-1.5">
              <Wallet className="h-2.5 w-2.5" />
              {shortenAddress(walletAddress)}
            </Badge>
          )}

          {activeRole && (
            <Badge variant="secondary" className="hidden sm:inline-flex text-[10px] font-semibold px-2.5 py-1 rounded-full bg-primary/8 text-primary border-primary/15 gap-1.5">
              <Sparkles className="h-2.5 w-2.5" />
              {roleLabels[activeRole]}
            </Badge>
          )}

          {alertCount > 0 && (
            <Link to="/alerts">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground relative">
                <Bell className="h-3.5 w-3.5" />
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[8px] font-bold text-destructive-foreground shadow-[0_2px_8px_hsla(4,74%,49%,0.4)]"
                >
                  {alertCount > 9 ? '9+' : alertCount}
                </motion.span>
              </Button>
            </Link>
          )}

          {isLanding && !user && (
            <Link to="/login">
              <Button size="sm" className="h-8 px-5 text-[12px] rounded-full font-bold shadow-[0_2px_12px_hsla(211,100%,50%,0.3)]">
                Connect Wallet
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
