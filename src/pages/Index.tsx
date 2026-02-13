import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Shield, Package, ScanLine, LayoutDashboard, ArrowRight,
  Blocks, Lock, Eye, CheckCircle, Globe, Zap, BarChart3,
  QrCode, Cpu, Users, TrendingUp, ChevronRight, Fingerprint
} from 'lucide-react';

/* ───── Sub-components ───── */

function FeatureCard({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="apple-card p-7 flex flex-col gap-4 group hover:border-primary/20 transition-all duration-300">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 transition-all duration-300 group-hover:bg-primary/15">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-[16px] font-semibold text-foreground">{title}</h3>
      <p className="text-[14px] leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

function StepCard({ step, title, description, icon: Icon }: { step: number; title: string; description: string; icon: React.ElementType }) {
  return (
    <div className="flex flex-col items-center text-center gap-4 relative">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 glow-primary">
        <Icon className="h-7 w-7 text-primary" />
      </div>
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-[12px] font-bold">
        {step}
      </div>
      <h3 className="text-[16px] font-semibold text-foreground">{title}</h3>
      <p className="text-[14px] leading-relaxed text-muted-foreground max-w-[260px]">{description}</p>
    </div>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">{value}</p>
      <p className="text-[14px] text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function TestimonialCard({ quote, author, role }: { quote: string; author: string; role: string }) {
  return (
    <div className="apple-card p-7 flex flex-col gap-4">
      <p className="text-[14px] leading-relaxed text-muted-foreground italic">&ldquo;{quote}&rdquo;</p>
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
          <Users className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-foreground">{author}</p>
          <p className="text-[12px] text-muted-foreground">{role}</p>
        </div>
      </div>
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

/* ───── Landing Page (no role) ───── */

function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden">
      {/* ═══ HERO ═══ */}
      <section className="relative flex flex-col items-center justify-center px-4 pt-28 pb-24 text-center">
        {/* Background orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/[0.04] rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-20 right-[10%] w-[300px] h-[300px] bg-primary/[0.06] rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-32 left-[5%] w-[200px] h-[200px] bg-success/[0.04] rounded-full blur-[80px] pointer-events-none" />

        <div className="animate-fade-in relative z-10 max-w-3xl mx-auto">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 mb-8">
            <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-[12px] font-medium text-primary">Blockchain-Powered Verification</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground text-balance leading-[1.08]">
            Protect Every
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Medicine</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed text-balance">
            PharmaShield uses blockchain technology and AI anomaly detection to ensure every drug in the supply chain is authentic and safe.
          </p>

          <div className="flex gap-3 justify-center mt-10">
            <Link to="/login">
              <Button size="lg" className="rounded-full px-8 h-13 text-[15px] font-semibold glow-primary gap-2">
                Connect Wallet
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/verify">
              <Button size="lg" variant="outline" className="rounded-full px-8 h-13 text-[15px] font-semibold border-border bg-card hover:bg-accent text-foreground gap-2">
                <ScanLine className="h-4 w-4" />
                Verify Now
              </Button>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-12 text-muted-foreground/60">
            <div className="flex items-center gap-1.5 text-[12px]">
              <Lock className="h-3.5 w-3.5" />
              <span>End-to-End Encrypted</span>
            </div>
            <div className="h-3 w-px bg-border" />
            <div className="flex items-center gap-1.5 text-[12px]">
              <Blocks className="h-3.5 w-3.5" />
              <span>Sepolia Network</span>
            </div>
            <div className="h-3 w-px bg-border" />
            <div className="flex items-center gap-1.5 text-[12px]">
              <Shield className="h-3.5 w-3.5" />
              <span>Tamper Proof</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATS BAR ═══ */}
      <section className="border-y border-border bg-card/50">
        <div className="container py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem value="100%" label="On-Chain Verification" />
            <StatItem value="<2s" label="Scan Response Time" />
            <StatItem value="24/7" label="Real-Time Monitoring" />
            <StatItem value="0" label="Tolerance for Counterfeits" />
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="container py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Everything You Need
          </h2>
          <p className="mt-4 text-[16px] text-muted-foreground max-w-md mx-auto">
            A comprehensive platform designed for every stakeholder in the pharmaceutical supply chain.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard icon={Blocks} title="Blockchain Registry" description="Every drug batch is cryptographically registered on the Ethereum Sepolia network with an immutable on-chain record." />
          <FeatureCard icon={QrCode} title="QR Verification" description="Auto-generated QR codes link directly to blockchain records. Scan with any camera to verify authenticity instantly." />
          <FeatureCard icon={Eye} title="AI Anomaly Detection" description="Intelligent rule-based detection flags suspicious patterns like rapid scans from distant locations." />
          <FeatureCard icon={Fingerprint} title="Wallet Authentication" description="Passwordless login via MetaMask or Phantom. Your wallet address is your identity — no emails required." />
          <FeatureCard icon={BarChart3} title="Live Analytics Dashboard" description="Real-time charts, scan trends, verification breakdowns, and risk alerts for regulators and manufacturers." />
          <FeatureCard icon={Globe} title="Supply Chain Transparency" description="Complete audit trail from manufacturer to pharmacy. Every scan event is geotagged and timestamped." />
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="bg-card/50 border-y border-border py-24">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              How It Works
            </h2>
            <p className="mt-4 text-[16px] text-muted-foreground max-w-md mx-auto">
              Three simple steps to secure the entire pharmaceutical supply chain.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 md:gap-8">
            <StepCard step={1} icon={Package} title="Register Batch" description="Manufacturer registers drug batch details. A smart contract stores the data on Sepolia and a unique QR code is generated." />
            <StepCard step={2} icon={ScanLine} title="Scan & Verify" description="Pharmacy scans the QR code. The system queries the blockchain and returns an instant Authentic, Suspicious, or Not Found result." />
            <StepCard step={3} icon={Cpu} title="Detect Anomalies" description="AI rules analyze scan patterns in real-time. Geographic velocity checks and frequency thresholds flag suspicious activity automatically." />
          </div>
        </div>
      </section>

      {/* ═══ FOR EVERY ROLE ═══ */}
      <section className="container py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Built for Every Role
          </h2>
          <p className="mt-4 text-[16px] text-muted-foreground max-w-md mx-auto">
            Whether you manufacture, distribute, or regulate — PharmaShield has your view.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          <div className="apple-card p-8 flex flex-col gap-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-[18px] font-bold text-foreground">Manufacturers</h3>
            <ul className="flex flex-col gap-3 text-[14px] text-muted-foreground">
              <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" /> Register batches on blockchain</li>
              <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" /> Auto-generate downloadable QR codes</li>
              <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" /> Track batch status and scan history</li>
              <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" /> On-chain transaction proof</li>
            </ul>
            <Link to="/login" className="mt-auto">
              <Button variant="outline" className="rounded-full w-full text-[13px] font-medium gap-2">
                Get Started <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <div className="apple-card p-8 flex flex-col gap-5 border-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[11px] font-bold px-3 py-1 rounded-bl-xl">Popular</div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <ScanLine className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-[18px] font-bold text-foreground">Pharmacies</h3>
            <ul className="flex flex-col gap-3 text-[14px] text-muted-foreground">
              <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" /> Scan QR to verify in seconds</li>
              <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" /> Color-coded authenticity results</li>
              <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" /> Geolocation tracking for scans</li>
              <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" /> Automatic anomaly flagging</li>
            </ul>
            <Link to="/login" className="mt-auto">
              <Button className="rounded-full w-full text-[13px] font-medium gap-2 glow-primary">
                Get Started <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <div className="apple-card p-8 flex flex-col gap-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <LayoutDashboard className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-[18px] font-bold text-foreground">Regulators</h3>
            <ul className="flex flex-col gap-3 text-[14px] text-muted-foreground">
              <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" /> Full analytics dashboard</li>
              <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" /> Real-time scan monitoring</li>
              <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" /> View all batches system-wide</li>
              <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" /> Risk alerts and anomaly reports</li>
            </ul>
            <Link to="/login" className="mt-auto">
              <Button variant="outline" className="rounded-full w-full text-[13px] font-medium gap-2">
                Get Started <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="bg-card/50 border-y border-border py-24">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Trusted by the Industry
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            <TestimonialCard quote="PharmaShield gives us confidence that every batch leaving our facility is fully traceable and tamper-proof." author="Sarah Chen" role="Head of Quality, PharmaCorp" />
            <TestimonialCard quote="We caught a suspicious batch within minutes of scanning. The anomaly detection system is incredibly effective." author="Dr. James Okafor" role="Chief Pharmacist, MedPlus" />
            <TestimonialCard quote="The real-time dashboard is a game-changer for monitoring supply chain integrity across our entire region." author="Maria Santos" role="Drug Safety Regulator" />
          </div>
        </div>
      </section>

      {/* ═══ TECH STACK ═══ */}
      <section className="container py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Powered by Modern Technology
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { icon: Blocks, label: 'Sepolia', desc: 'Ethereum Testnet' },
            { icon: Zap, label: 'Supabase', desc: 'Realtime Backend' },
            { icon: Shield, label: 'Ethers.js', desc: 'Web3 Integration' },
            { icon: TrendingUp, label: 'Recharts', desc: 'Data Visualization' },
          ].map((tech) => (
            <div key={tech.label} className="apple-card p-6 flex flex-col items-center text-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <tech.icon className="h-5 w-5 text-primary" />
              </div>
              <p className="text-[14px] font-semibold text-foreground">{tech.label}</p>
              <p className="text-[12px] text-muted-foreground">{tech.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="container pb-24">
        <div className="apple-card p-12 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] to-transparent pointer-events-none" />
          <div className="relative z-10">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary glow-primary">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
              Ready to Secure Your Supply Chain?
            </h2>
            <p className="text-[16px] text-muted-foreground max-w-md mx-auto mb-8">
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
      <footer className="border-t border-border py-10">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold text-[14px] text-foreground">PharmaShield</span>
          </div>
          <div className="flex gap-6 text-[13px] text-muted-foreground">
            <Link to="/verify" className="hover:text-foreground transition-colors">Verify</Link>
            <Link to="/login" className="hover:text-foreground transition-colors">Connect</Link>
            <Link to="/settings" className="hover:text-foreground transition-colors">Settings</Link>
          </div>
          <p className="text-[12px] text-muted-foreground">
            &copy; {new Date().getFullYear()} PharmaShield. Blockchain-verified.
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
      { title: 'Verify Batch', desc: 'Scan a QR to check authenticity', icon: ScanLine, path: '/verify' },
    ],
    pharmacy: [
      { title: 'Verify Batch', desc: 'Scan a QR code to verify drug authenticity in real-time', icon: ScanLine, path: '/verify' },
      { title: 'Scan History', desc: 'Review your past verification scans', icon: BarChart3, path: '/logs' },
    ],
    regulator: [
      { title: 'Dashboard', desc: 'View analytics, charts, and scan activity overview', icon: LayoutDashboard, path: '/dashboard' },
      { title: 'All Batches', desc: 'Browse every registered batch in the system', icon: Package, path: '/batches' },
      { title: 'Scan Logs', desc: 'Review all verification scan logs and anomalies', icon: ScanLine, path: '/logs' },
      { title: 'Settings', desc: 'Configure smart contract and demo mode', icon: Zap, path: '/settings' },
    ],
  };

  const pages = activeRole ? rolePages[activeRole] || [] : [];

  return (
    <main className="container py-10 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
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