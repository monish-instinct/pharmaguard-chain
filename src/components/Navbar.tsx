import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, LogOut, FlaskConical } from 'lucide-react';
import type { AppRole } from '@/types';

const roleNavItems: Record<AppRole, { label: string; path: string }[]> = {
  manufacturer: [
    { label: 'Register Batch', path: '/register' },
    { label: 'My Batches', path: '/batches' },
  ],
  pharmacy: [
    { label: 'Verify Batch', path: '/verify' },
  ],
  regulator: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'All Batches', path: '/batches' },
    { label: 'Scan Logs', path: '/logs' },
  ],
};

const roleColors: Record<AppRole, string> = {
  manufacturer: 'bg-primary text-primary-foreground',
  pharmacy: 'bg-success text-success-foreground',
  regulator: 'bg-warning text-warning-foreground',
};

export function Navbar() {
  const { activeRole, demoMode, demoRole, setDemoMode, setDemoRole, user, signOut } = useAuth();
  const location = useLocation();

  const navItems = activeRole ? roleNavItems[activeRole] : [];

  return (
    <header className="border-b bg-card">
      <div className="container flex h-14 items-center gap-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <Shield className="h-5 w-5 text-primary" />
          <span>PharmaShield</span>
        </Link>

        <nav className="flex items-center gap-1 ml-4">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button
                variant={location.pathname === item.path ? 'secondary' : 'ghost'}
                size="sm"
              >
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {demoMode && (
            <div className="flex items-center gap-2 rounded-md border border-warning/50 bg-warning/10 px-3 py-1">
              <FlaskConical className="h-4 w-4 text-warning" />
              <span className="text-xs font-medium">Demo</span>
              <Select value={demoRole} onValueChange={(v) => setDemoRole(v as AppRole)}>
                <SelectTrigger className="h-7 w-[130px] text-xs">
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

          {activeRole && (
            <Badge className={roleColors[activeRole]}>
              {activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDemoMode(!demoMode)}
          >
            <FlaskConical className="h-4 w-4 mr-1" />
            {demoMode ? 'Exit Demo' : 'Demo'}
          </Button>

          {user ? (
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          ) : (
            <Link to="/login">
              <Button size="sm">Sign In</Button>
            </Link>
          )}

          <Link to="/settings">
            <Button variant="ghost" size="sm">Settings</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
