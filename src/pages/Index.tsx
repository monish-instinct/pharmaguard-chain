import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Shield, Package, ScanLine, LayoutDashboard, ArrowRight,
  Lock, CheckCircle, Globe, Zap, BarChart3,
  Cpu, ChevronRight, Fingerprint, ArrowUpRight,
  Truck, FileText, Star, Users, Flag, Activity
} from 'lucide-react';

/* ───── Sub-components ───── */

function FeatureCard({ icon: Icon, title, description, delay }: { icon: React.ElementType; title: string; description: string; delay?: string }) {
  return (
    <div
      className="group relative rounded-2xl bg-card/80 border border-border/60 p-8 transition-all duration-500 ease-out hover:shadow-lg hover:shadow-primary/[0.04] hover:-translate-y-1 hover:border-primary/20"
      style={{ animationDelay: delay }}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/[0.07] transition-colors duration-300 group-hover:bg-primary/[0.12]">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="mt-5 text-[17px] font-semibold tracking-tight text-foreground">{title}</h3>
      <p className="mt-2 text-[14px] leading-[1.6] text-muted-foreground">{description}</p>
    </div>
  );
}

function TechStep({ step, title, description, icon: Icon, isLast }: { step: number; title: string; description: string; icon: React.ElementType; isLast?: boolean }) {
  return (
    <div className="flex flex-col items-center text-center relative">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/[0.07] mb-4">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-[11px] font-bold mb-3">
        {step}
      </div>
      <h3 className="text-[15px] font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-[13px] leading-relaxed text-muted-foreground max-w-[220px]">{description}</p>
      {!isLast && (
        <div className="hidden md:block absolute top-7 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px bg-border" />
      )}
    </div>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">{value}</p>
      <p className="text-[13px] text-muted-foreground mt-1.5">{label}</p>
    </div>
  );
}

function RoleCard({ icon: Icon, title, description, path }: { icon: React.ElementType; title: string; description: string; path: string }) {
  return (
    <Link to={path}>
      <div className="apple-card-interactive p-5 flex items-center gap-4 h-full">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/[0.07]">
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

/* ───── Landing Page ───── */

function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden">
      {/* ═══ HERO ═══ */}
      <section className="relative flex flex-col items-center justify-center px-4 pt-32 pb-28 text-center">
        {/* Soft ambient gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/30 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-primary/[0.03] rounded-full blur-[160px] pointer-events-none" />

        <div className="animate-fade-in relative z-10 max-w-2xl mx-auto">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted border border-border mb-8">
            <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-[12px] font-medium text-muted-foreground">Blockchain-Powered Verification</span>
          </div>

          <h1 className="text-[44px] md:text-[64px] font-bold tracking-[-0.03em] text-foreground leading-[1.05]">
            Building Trust in
            <br />
            Every Medicine.
          </h1>

          <p className="mt-6 text-[17px] md:text-[19px] text-muted-foreground max-w-lg mx-auto leading-[1.6] font-light">
            A blockchain-powered pharmaceutical verification network with AI-driven counterfeit intelligence.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
            <Link to="/login">
              <Button size="lg" className="rounded-full px-8 h-12 text-[15px] font-semibold glow-primary gap-2 w-full sm:w-auto">
                Connect Wallet
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#technology">
              <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-[15px] font-medium border-border bg-card hover:bg-accent text-foreground gap-2 w-full sm:w-auto">
                Explore Technology
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-14 text-muted-foreground/50">
            <div className="flex items-center gap-1.5 text-[12px]">
              <Lock className="h-3.5 w-3.5" />
              <span>End-to-End Secure</span>
            </div>
            <div className="h-3 w-px bg-border" />
            <div className="flex items-center gap-1.5 text-[12px]">
              <Shield className="h-3.5 w-3.5" />
              <span>Tamper Proof</span>
            </div>
            <div className="h-3 w-px bg-border" />
            <div className="flex items-center gap-1.5 text-[12px]">
              <Globe className="h-3.5 w-3.5" />
              <span>Sepolia Network</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURE SHOWCASE ═══ */}
      <section className="container py-24">
        <div className="text-center mb-16">
          <p className="text-[13px] font-semibold text-primary uppercase tracking-[0.1em] mb-3">Core Features</p>
          <h2 className="text-[32px] md:text-[40px] font-bold tracking-[-0.02em] text-foreground">
            Everything You Need
          </h2>
          <p className="mt-3 text-[16px] text-muted-foreground max-w-md mx-auto">
            A comprehensive platform for every stakeholder in the pharmaceutical supply chain.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <FeatureCard
            icon={Lock}
            title="Blockchain Authenticity"
            description="Each medicine batch is immutably registered on-chain. Every record is cryptographically verified and tamper-proof."
          />
          <FeatureCard
            icon={Package}
            title="Supply Chain Transparency"
            description="Track ownership across the entire pharmaceutical lifecycle. Every transfer is timestamped and traceable."
          />
          <FeatureCard
            icon={Cpu}
            title="Predictive Risk Intelligence"
            description="AI-driven anomaly detection flags suspicious scan patterns — geographic velocity checks and frequency thresholds in real time."
          />
        </div>
      </section>

      {/* ═══ STATS BAR ═══ */}
      <section className="border-y border-border bg-muted/30">
        <div className="container py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem value="100%" label="On-Chain Verification" />
            <StatItem value="<2s" label="Scan Response Time" />
            <StatItem value="24/7" label="Real-Time Monitoring" />
            <StatItem value="0" label="Tolerance for Counterfeits" />
          </div>
        </div>
      </section>

      {/* ═══ TECHNOLOGY SECTION ═══ */}
      <section id="technology" className="container py-24">
        <div className="text-center mb-16">
          <p className="text-[13px] font-semibold text-primary uppercase tracking-[0.1em] mb-3">How It Works</p>
          <h2 className="text-[32px] md:text-[40px] font-bold tracking-[-0.02em] text-foreground">
            Four Simple Steps
          </h2>
          <p className="mt-3 text-[16px] text-muted-foreground max-w-md mx-auto">
            From wallet authentication to AI analytics — a seamless pipeline.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-10 md:gap-6">
          <TechStep step={1} icon={Fingerprint} title="Wallet Auth" description="Sign in securely with your MetaMask wallet. No passwords needed." />
          <TechStep step={2} icon={Globe} title="IPFS Metadata" description="Batch details are pinned to IPFS via Pinata for decentralized storage." />
          <TechStep step={3} icon={Shield} title="Smart Contract" description="On-chain registration creates an immutable record on Ethereum Sepolia." />
          <TechStep step={4} icon={BarChart3} title="AI Analytics" description="Real-time anomaly detection monitors scan patterns and flags risks." isLast />
        </div>
      </section>

      {/* ═══ ROLES SECTION ═══ */}
      <section className="bg-muted/30 border-y border-border py-24">
        <div className="container">
          <div className="text-center mb-16">
            <p className="text-[13px] font-semibold text-primary uppercase tracking-[0.1em] mb-3">Built For Everyone</p>
            <h2 className="text-[32px] md:text-[40px] font-bold tracking-[-0.02em] text-foreground">
              Designed for Every Role
            </h2>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-3 gap-4">
            {[
              {
                icon: Package, title: 'Manufacturers', items: [
                  'Register batches on blockchain',
                  'Auto-generate downloadable QR codes',
                  'Track batch status and scan history',
                  'Recall batches when needed',
                ]
              },
              {
                icon: Truck, title: 'Distributors', items: [
                  'Receive and verify incoming batches',
                  'Transfer ownership on-chain',
                  'Track supply chain journey',
                  'Full audit trail',
                ]
              },
              {
                icon: ScanLine, title: 'Pharmacies', popular: true, items: [
                  'Scan QR to verify in seconds',
                  'Color-coded authenticity results',
                  'Geolocation tracking for scans',
                  'Automatic anomaly flagging',
                ]
              },
              {
                icon: Users, title: 'Consumers', items: [
                  'Scan QR to check authenticity',
                  'View medicine details instantly',
                  'See ownership history',
                  'Report suspicious products',
                ]
              },
              {
                icon: LayoutDashboard, title: 'Regulators', items: [
                  'Full analytics dashboard',
                  'Real-time scan monitoring',
                  'Recall authority',
                  'Risk alerts and anomaly reports',
                ]
              },
              {
                icon: FileText, title: 'Auditors', items: [
                  'Immutable audit logs',
                  'Export compliance reports',
                  'Inspect ownership history',
                  'Trust score monitoring',
                ]
              },
            ].map((role) => (
              <div key={role.title} className={`apple-card p-8 flex flex-col gap-5 ${role.popular ? 'border-primary/20 relative' : ''}`}>
                {role.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[11px] font-bold px-3 py-1 rounded-bl-2xl rounded-tr-2xl">
                    Popular
                  </div>
                )}
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/[0.07]">
                  <role.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-[18px] font-bold text-foreground">{role.title}</h3>
                <ul className="flex flex-col gap-3 text-[14px] text-muted-foreground flex-1">
                  {role.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link to={role.title === 'Consumers' ? '/consumer' : '/login'} className="mt-auto">
                  <Button
                    variant={role.popular ? 'default' : 'outline'}
                    className={`rounded-full w-full text-[13px] font-medium gap-2 ${role.popular ? 'glow-primary' : ''}`}
                  >
                    Get Started <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="container py-24">
        <div className="rounded-3xl bg-card border border-border p-12 md:p-20 text-center relative overflow-hidden apple-shadow">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary glow-primary">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="text-[28px] md:text-[36px] font-bold tracking-[-0.02em] text-foreground mb-4">
              Ready to Secure Your Supply Chain?
            </h2>
            <p className="text-[16px] text-muted-foreground max-w-md mx-auto mb-10">
              Connect your wallet and start registering or verifying batches in under a minute.
            </p>
            <Link to="/login">
              <Button size="lg" className="rounded-full px-10 h-13 text-[15px] font-semibold glow-primary gap-2">
                Get Started Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-border bg-muted/20 py-10">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-[14px] text-foreground tracking-tight">PharmaShield</span>
          </div>
          <div className="flex gap-6 text-[13px] text-muted-foreground">
            <a href="#technology" className="hover:text-foreground transition-colors duration-200">Technology</a>
            <Link to="/verify" className="hover:text-foreground transition-colors duration-200">Verify</Link>
            <Link to="/login" className="hover:text-foreground transition-colors duration-200">Connect</Link>
            <Link to="/settings" className="hover:text-foreground transition-colors duration-200">Settings</Link>
          </div>
          <p className="text-[12px] text-muted-foreground">
            &copy; {new Date().getFullYear()} PharmaShield. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}

/* ───── Authenticated Home ───── */

function AuthenticatedHome() {
  const { activeRole, demoMode, walletAddress } = useAuth();

  const rolePages: Record<string, { title: string; desc: string; icon: React.ElementType; path: string }[]> = {
    manufacturer: [
      { title: 'Register Batch', desc: 'Register a new drug batch and generate its QR code', icon: Package, path: '/register' },
      { title: 'My Batches', desc: 'View and manage all your registered batches', icon: Package, path: '/batches' },
      { title: 'Transfer', desc: 'Transfer batch ownership to another party', icon: ArrowRight, path: '/transfer' },
      { title: 'Recall Batch', desc: 'Issue a recall for a medicine batch', icon: Shield, path: '/recall' },
      { title: 'Supply Chain', desc: 'Track batch journey across the supply chain', icon: Truck, path: '/supply-chain' },
    ],
    distributor: [
      { title: 'Verify Batch', desc: 'Scan incoming batches to verify authenticity', icon: ScanLine, path: '/verify' },
      { title: 'Transfer', desc: 'Transfer ownership to the next party', icon: ArrowRight, path: '/transfer' },
      { title: 'Supply Chain', desc: 'Track ownership history of batches', icon: Truck, path: '/supply-chain' },
      { title: 'Scan Logs', desc: 'Review past verification scans', icon: BarChart3, path: '/logs' },
    ],
    pharmacy: [
      { title: 'Verify Batch', desc: 'Scan a QR code to verify drug authenticity', icon: ScanLine, path: '/verify' },
      { title: 'Scan History', desc: 'Review your past verification scans', icon: BarChart3, path: '/logs' },
      { title: 'Supply Chain', desc: 'View batch journey and ownership', icon: Truck, path: '/supply-chain' },
    ],
    consumer: [
      { title: 'Verify Medicine', desc: 'Scan QR to check authenticity instantly', icon: ScanLine, path: '/consumer' },
      { title: 'Report Issue', desc: 'Report suspicious medicine you found', icon: Flag, path: '/report' },
    ],
    regulator: [
      { title: 'Dashboard', desc: 'View analytics, charts, and scan activity', icon: LayoutDashboard, path: '/dashboard' },
      { title: 'All Batches', desc: 'Browse every registered batch in the system', icon: Package, path: '/batches' },
      { title: 'Trust Scores', desc: 'View manufacturer reputation scores', icon: Star, path: '/trust' },
      { title: 'Alerts', desc: 'Review and resolve active risk alerts', icon: Shield, path: '/alerts' },
      { title: 'Recall Batch', desc: 'Issue recalls for unsafe medicine batches', icon: Shield, path: '/recall' },
      { title: 'Event Feed', desc: 'Live blockchain event stream', icon: Activity, path: '/feed' },
    ],
    auditor: [
      { title: 'Audit Logs', desc: 'View immutable compliance records', icon: FileText, path: '/audit' },
      { title: 'Trust Scores', desc: 'Manufacturer reputation monitoring', icon: Star, path: '/trust' },
      { title: 'Supply Chain', desc: 'Inspect ownership history of any batch', icon: Truck, path: '/supply-chain' },
      { title: 'Event Feed', desc: 'Live blockchain event stream', icon: Activity, path: '/feed' },
    ],
  };

  const pages = activeRole ? rolePages[activeRole] || [] : [];

  return (
    <main className="container py-10 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-[24px] font-bold tracking-tight text-foreground">
          Welcome back{demoMode ? ' (Demo)' : ''}
        </h1>
        <p className="text-[15px] text-muted-foreground mt-1">
          Signed in as <span className="font-medium capitalize text-foreground">{activeRole}</span>
          {walletAddress && <span className="font-mono text-[13px] ml-1 text-muted-foreground">· {walletAddress.slice(0, 8)}…</span>}
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {pages.map((page) => (
          <RoleCard key={page.path} icon={page.icon} title={page.title} description={page.desc} path={page.path} />
        ))}
      </div>
    </main>
  );
}

/* ───── Main Export ───── */

export default function Index() {
  const { activeRole } = useAuth();

  if (!activeRole) {
    return <LandingPage />;
  }

  return <AuthenticatedHome />;
}
