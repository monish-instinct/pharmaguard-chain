import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, LogOut, FlaskConical, Settings, Menu, X, Wallet } from 'lucide-react';
import { useState } from 'react';
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

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function Navbar() {
  const { activeRole, demoMode, demoRole, setDemoMode, setDemoRole, walletAddress, disconnectWallet } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLoggedIn = !!walletAddress || demoMode;
  const navItems = activeRole ? roleNavItems[activeRole] : [];

  return (
    <header className="sticky top-0 z-50 glass border-b border-[rgba(255,255,255,0.06)]">
      <div className="container flex h-14 items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(59,130,246,0.15)] border border-[rgba(59,130,246,0.2)] transition-all duration-300 group-hover:scale-105" style={{ boxShadow: '0 0 12px rgba(59,130,246,0.15)' }}>
            <Shield className="h-4 w-4 text-[#3b82f6]" />
          </div>
          <span className="font-semibold text-[15px] tracking-tight text-foreground">PharmaShield</span>
        </Link>

        {/* Desktop Nav */}
        {isLoggedIn && (
          <nav className="hidden md:flex items-center gap-0.5 ml-6" role="navigation" aria-label="Main navigation">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <button
                    className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-[rgba(255,255,255,0.08)] text-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-[rgba(255,255,255,0.04)]'
                    }`}
                  >
                    {item.label}
                  </button>
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right section */}
        <div className="ml-auto flex items-center gap-2">
          {/* Demo Mode Pill */}
          {demoMode && (
            <div className="hidden md:flex items-center gap-2 rounded-full border border-[rgba(245,158,11,0.2)] bg-[rgba(245,158,11,0.08)] px-3 py-1">
              <FlaskConical className="h-3.5 w-3.5 text-[#f59e0b]" />
              <Select value={demoRole} onValueChange={(v) => setDemoRole(v as AppRole)}>
                <SelectTrigger className="h-6 w-[110px] text-xs border-0 bg-transparent p-0 shadow-none focus:ring-0 text-[#f59e0b]">
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
            <div className="hidden md:flex items-center gap-1.5 rounded-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] px-3 py-1">
              <Wallet className="h-3 w-3 text-[#22c55e]" />
              <span className="text-[11px] font-mono text-muted-foreground">{truncateAddress(walletAddress)}</span>
            </div>
          )}

          {/* Role Badge */}
          {activeRole && (
            <Badge
              variant="secondary"
              className="hidden md:inline-flex text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[rgba(255,255,255,0.06)] text-muted-foreground border-[rgba(255,255,255,0.08)]"
            >
              {roleLabels[activeRole]}
            </Badge>
          )}

          {/* Demo Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDemoMode(!demoMode)}
            className="hidden md:inline-flex h-8 px-3 text-xs rounded-lg text-muted-foreground hover:text-foreground hover:bg-[rgba(255,255,255,0.06)]"
          >
            <FlaskConical className="h-3.5 w-3.5 mr-1.5" />
            {demoMode ? 'Exit Demo' : 'Demo'}
          </Button>

          {/* Settings */}
          {isLoggedIn && (
            <Link to="/settings" className="hidden md:inline-flex">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-[rgba(255,255,255,0.06)]">
                <Settings className="h-4 w-4" />
                <span className="sr-only">Settings</span>
              </Button>
            </Link>
          )}

          {/* Auth */}
          {walletAddress ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={disconnectWallet}
              className="hidden md:inline-flex h-8 w-8 rounded-lg text-muted-foreground hover:text-[#ef4444] hover:bg-[rgba(239,68,68,0.08)]"
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Disconnect wallet</span>
            </Button>
          ) : !demoMode ? (
            <Link to="/login" className="hidden md:inline-flex">
              <Button size="sm" className="h-8 px-4 text-xs rounded-full font-medium bg-[#3b82f6] hover:bg-[#2563eb] text-white">
                Connect
              </Button>
            </Link>
          ) : null}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8 rounded-lg text-muted-foreground hover:bg-[rgba(255,255,255,0.06)]"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[rgba(255,255,255,0.06)] glass animate-fade-in">
          <div className="container py-3 flex flex-col gap-1">
            {walletAddress && (
              <div className="px-3 py-2 flex items-center gap-2 text-[12px] text-muted-foreground font-mono">
                <Wallet className="h-3.5 w-3.5 text-[#22c55e]" />
                {truncateAddress(walletAddress)}
              </div>
            )}
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}>
                  <div className={`px-3 py-2.5 rounded-xl text-[14px] font-medium transition-colors ${
                    isActive ? 'bg-[rgba(59,130,246,0.1)] text-[#3b82f6]' : 'text-foreground hover:bg-[rgba(255,255,255,0.04)]'
                  }`}>
                    {item.label}
                  </div>
                </Link>
              );
            })}
            <div className="h-px bg-[rgba(255,255,255,0.06)] my-1" />
            <button
              onClick={() => { setDemoMode(!demoMode); setMobileOpen(false); }}
              className="px-3 py-2.5 rounded-xl text-[14px] font-medium text-muted-foreground text-left hover:bg-[rgba(255,255,255,0.04)]"
            >
              {demoMode ? 'Exit Demo Mode' : 'Enable Demo Mode'}
            </button>
            {isLoggedIn && (
              <Link to="/settings" onClick={() => setMobileOpen(false)}>
                <div className="px-3 py-2.5 rounded-xl text-[14px] font-medium text-muted-foreground hover:bg-[rgba(255,255,255,0.04)]">
                  Settings
                </div>
              </Link>
            )}
            {walletAddress ? (
              <button onClick={() => { disconnectWallet(); setMobileOpen(false); }} className="px-3 py-2.5 rounded-xl text-[14px] font-medium text-[#ef4444] text-left">
                Disconnect Wallet
              </button>
            ) : !demoMode ? (
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <div className="px-3 py-2.5 rounded-xl text-[14px] font-medium text-[#3b82f6]">
                  Connect Wallet
                </div>
              </Link>
            ) : null}
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
