import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, LogOut, FlaskConical, Settings, Menu, X, Wallet } from 'lucide-react';
import { useState } from 'react';
import { shortenAddress } from '@/lib/wallet';
import type { AppRole } from '@/types';

const roleNavItems: Record<AppRole, { label: string; path: string }[]> = {
  manufacturer: [
    { label: 'Register', path: '/register' },
    { label: 'Batches', path: '/batches' },
  ],
  pharmacy: [
    { label: 'Verify', path: '/verify' },
  ],
  regulator: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Batches', path: '/batches' },
    { label: 'Scan Logs', path: '/logs' },
  ],
};

const roleLabels: Record<AppRole, string> = {
  manufacturer: 'Manufacturer',
  pharmacy: 'Pharmacy',
  regulator: 'Regulator',
};

export function Navbar() {
  const { activeRole, demoMode, demoRole, setDemoMode, setDemoRole, user, walletAddress, signOut } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = activeRole ? roleNavItems[activeRole] : [];

  return (
    <header className="sticky top-0 z-50 glass border-b border-border">
      <div className="container flex h-14 items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary glow-primary transition-all duration-300 group-hover:scale-105">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-[15px] tracking-tight text-foreground">PharmaShield</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-0.5 ml-6">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <button
                  className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-accent text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  {item.label}
                </button>
              </Link>
            );
          })}
        </nav>

        {/* Right section */}
        <div className="ml-auto flex items-center gap-2">
          {/* Demo Mode Pill */}
          {demoMode && (
            <div className="hidden md:flex items-center gap-2 rounded-full border border-warning/20 bg-warning/5 px-3 py-1">
              <FlaskConical className="h-3.5 w-3.5 text-warning" />
              <Select value={demoRole} onValueChange={(v) => setDemoRole(v as AppRole)}>
                <SelectTrigger className="h-6 w-[110px] text-xs border-0 bg-transparent p-0 shadow-none focus:ring-0 text-warning">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manufacturer">Manufacturer</SelectItem>
                  <SelectItem value="pharmacy">Pharmacy</SelectItem>
                  <SelectItem value="regulator">Regulator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Wallet Address */}
          {walletAddress && (
            <Badge
              variant="secondary"
              className="hidden md:inline-flex text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-accent text-muted-foreground border-border"
            >
              <Wallet className="h-3 w-3 mr-1" />
              {shortenAddress(walletAddress)}
            </Badge>
          )}

          {/* Role Badge */}
          {activeRole && (
            <Badge
              variant="secondary"
              className="hidden md:inline-flex text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-accent text-muted-foreground border-border"
            >
              {roleLabels[activeRole]}
            </Badge>
          )}

          {/* Demo Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDemoMode(!demoMode)}
            className="hidden md:inline-flex h-8 px-3 text-xs rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <FlaskConical className="h-3.5 w-3.5 mr-1.5" />
            {demoMode ? 'Exit Demo' : 'Demo'}
          </Button>

          {/* Settings */}
          <Link to="/settings" className="hidden md:inline-flex">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>

          {/* Auth */}
          {user ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              className="hidden md:inline-flex h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          ) : (
            <Link to="/login" className="hidden md:inline-flex">
              <Button size="sm" className="h-8 px-4 text-xs rounded-full font-medium">
                Connect Wallet
              </Button>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8 rounded-lg text-muted-foreground hover:bg-accent"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border glass animate-fade-in">
          <div className="container py-3 flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}>
                  <div className={`px-3 py-2.5 rounded-xl text-[14px] font-medium transition-colors ${
                    isActive ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-accent'
                  }`}>
                    {item.label}
                  </div>
                </Link>
              );
            })}
            <div className="h-px bg-border my-1" />
            <button
              onClick={() => { setDemoMode(!demoMode); setMobileOpen(false); }}
              className="px-3 py-2.5 rounded-xl text-[14px] font-medium text-muted-foreground text-left hover:bg-accent"
            >
              {demoMode ? 'Exit Demo Mode' : 'Enable Demo Mode'}
            </button>
            <Link to="/settings" onClick={() => setMobileOpen(false)}>
              <div className="px-3 py-2.5 rounded-xl text-[14px] font-medium text-muted-foreground hover:bg-accent">
                Settings
              </div>
            </Link>
            {user ? (
              <button onClick={() => { signOut(); setMobileOpen(false); }} className="px-3 py-2.5 rounded-xl text-[14px] font-medium text-destructive text-left">
                Disconnect Wallet
              </button>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <div className="px-3 py-2.5 rounded-xl text-[14px] font-medium text-primary">
                  Connect Wallet
                </div>
              </Link>
            )}
            {demoMode && (
              <div className="px-3 py-2 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Role:</span>
                <Select value={demoRole} onValueChange={(v) => setDemoRole(v as AppRole)}>
                  <SelectTrigger className="h-8 flex-1 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manufacturer">Manufacturer</SelectItem>
                    <SelectItem value="pharmacy">Pharmacy</SelectItem>
                    <SelectItem value="regulator">Regulator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
