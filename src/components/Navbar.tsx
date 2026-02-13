import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Shield, LogOut, Settings, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { user, activeRole, logout, demoMode } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = activeRole && user ? [
    { label: 'Dashboard', href: '/' },
    ...(activeRole === 'manufacturer' ? [{ label: 'Register', href: '/register' }, { label: 'My Batches', href: '/batches' }] : []),
    ...(activeRole === 'pharmacy' ? [{ label: 'Verify', href: '/verify' }] : []),
    ...(activeRole === 'regulator' ? [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Logs', href: '/logs' }] : []),
  ] : [];

  return (
    <nav className="glass border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-lg hidden sm:inline bg-clip-text text-transparent bg-gradient-to-r from-foreground to-primary">
              PharmaShield
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href}>
                <Button variant="ghost" className="text-foreground/70 hover:text-foreground">
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {user && (
              <div className="hidden sm:flex items-center gap-3">
                <div className="glass px-3 py-1.5 rounded-lg text-xs font-medium">
                  <span className="text-primary capitalize">{activeRole}</span>
                  {demoMode && <span className="text-muted-foreground ml-2">(Demo)</span>}
                </div>
              </div>
            )}
            
            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/settings">
                  <Button size="icon" variant="ghost">
                    <Settings className="w-5 h-5" />
                  </Button>
                </Link>
                <Button size="sm" variant="outline" onClick={logout} className="gap-2">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button size="sm" className="gap-2">
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-white/10 pt-4">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                to={link.href}
                onClick={() => setMobileOpen(false)}
              >
                <Button variant="ghost" className="w-full justify-start">
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
