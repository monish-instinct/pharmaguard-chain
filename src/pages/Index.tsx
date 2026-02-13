import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Package, ScanLine, LayoutDashboard, ArrowRight, Blocks, Lock, Eye } from 'lucide-react';

function FeatureCard({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="apple-card p-6 flex flex-col gap-3 group hover:border-[rgba(255,255,255,0.1)] transition-all duration-300">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 glow-primary transition-all duration-300 group-hover:bg-primary/15">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
      <p className="text-[13px] leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

function RoleCard({ icon: Icon, title, description, path }: { icon: React.ElementType; title: string; description: string; path: string }) {
  return (
    <Link to={path}>
      <div className="apple-card-interactive p-5 flex items-center gap-4 h-full">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
          <p className="text-[13px] text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </div>
    </Link>
  );
}

export default function Index() {
  const { activeRole, demoMode } = useAuth();

  if (!activeRole) {
    return (
      <main className="min-h-[calc(100vh-3.5rem)]">
        {/* Hero */}
        <section className="flex flex-col items-center justify-center px-4 pt-24 pb-20 text-center relative">
          {/* Ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="animate-fade-in relative z-10">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary glow-primary">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground text-balance">
              PharmaShield
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-md mx-auto leading-relaxed text-balance">
              Predictive blockchain network for counterfeit drug prevention
            </p>
            <div className="flex gap-3 justify-center mt-8">
              <Link to="/login">
                <Button size="lg" className="rounded-full px-7 h-12 text-[15px] font-medium glow-primary">
                  Get Started
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link to="/settings">
                <Button size="lg" variant="outline" className="rounded-full px-7 h-12 text-[15px] font-medium border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] text-foreground">
                  Try Demo
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="container pb-24">
          <div className="grid gap-4 md:grid-cols-3">
            <FeatureCard
              icon={Blocks}
              title="Blockchain Verified"
              description="Every drug batch is cryptographically registered on-chain for immutable proof of authenticity."
            />
            <FeatureCard
              icon={Eye}
              title="Anomaly Detection"
              description="AI-powered scanning detects suspicious patterns like rapid scans and geographic anomalies."
            />
            <FeatureCard
              icon={Lock}
              title="Secure Supply Chain"
              description="End-to-end verification from manufacturer to pharmacy with complete audit trails."
            />
          </div>
        </section>
      </main>
    );
  }

  const rolePages: Record<string, { title: string; desc: string; icon: React.ElementType; path: string }[]> = {
    manufacturer: [
      { title: 'Register Batch', desc: 'Register a new drug batch and generate its QR code', icon: Package, path: '/register' },
      { title: 'My Batches', desc: 'View and manage all your registered batches', icon: Package, path: '/batches' },
    ],
    pharmacy: [
      { title: 'Verify Batch', desc: 'Scan a QR code to verify drug authenticity in real-time', icon: ScanLine, path: '/verify' },
    ],
    regulator: [
      { title: 'Dashboard', desc: 'View analytics, charts, and scan activity overview', icon: LayoutDashboard, path: '/dashboard' },
      { title: 'All Batches', desc: 'Browse every registered batch in the system', icon: Package, path: '/batches' },
      { title: 'Scan Logs', desc: 'Review all verification scan logs and anomalies', icon: ScanLine, path: '/logs' },
    ],
  };

  const pages = rolePages[activeRole] || [];

  return (
    <main className="container py-10 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Welcome back{demoMode ? ' (Demo)' : ''}
        </h1>
        <p className="text-[15px] text-muted-foreground mt-1">
          Signed in as <span className="font-medium capitalize text-foreground">{activeRole}</span>
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {pages.map((page) => (
          <RoleCard
            key={page.path}
            icon={page.icon}
            title={page.title}
            description={page.desc}
            path={page.path}
          />
        ))}
      </div>
    </main>
  );
}
