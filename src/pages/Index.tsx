import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Package, ScanLine, LayoutDashboard, ArrowRight } from 'lucide-react';

export default function Index() {
  const { activeRole, demoMode } = useAuth();

  if (!activeRole) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4">
        <div className="text-center max-w-lg">
          <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-3">PharmaShield</h1>
          <p className="text-lg text-muted-foreground mb-6">
            A Predictive Blockchain Network for Counterfeit Drug Prevention
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/login"><Button size="lg">Get Started</Button></Link>
            <Link to="/settings"><Button size="lg" variant="outline">Enable Demo</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  const rolePages: Record<string, { title: string; desc: string; icon: React.ElementType; path: string }[]> = {
    manufacturer: [
      { title: 'Register Batch', desc: 'Register a new drug batch and generate QR code', icon: Package, path: '/register' },
      { title: 'My Batches', desc: 'View all your registered batches', icon: Package, path: '/batches' },
    ],
    pharmacy: [
      { title: 'Verify Batch', desc: 'Scan a QR code to verify drug authenticity', icon: ScanLine, path: '/verify' },
    ],
    regulator: [
      { title: 'Dashboard', desc: 'View analytics and scan activity', icon: LayoutDashboard, path: '/dashboard' },
      { title: 'All Batches', desc: 'Browse all registered batches', icon: Package, path: '/batches' },
      { title: 'Scan Logs', desc: 'Review all verification scan logs', icon: ScanLine, path: '/logs' },
    ],
  };

  const pages = rolePages[activeRole] || [];

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-1">
        Welcome{demoMode ? ' (Demo Mode)' : ''}
      </h1>
      <p className="text-muted-foreground mb-6">
        You're signed in as <span className="font-medium capitalize">{activeRole}</span>
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {pages.map((page) => (
          <Link key={page.path} to={page.path}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardContent className="pt-6 flex flex-col gap-3">
                <page.icon className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">{page.title}</h3>
                  <p className="text-sm text-muted-foreground">{page.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground mt-auto" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
