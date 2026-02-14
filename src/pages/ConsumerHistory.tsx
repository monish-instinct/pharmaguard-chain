import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Shield, ScanLine, CheckCircle, AlertTriangle, XCircle,
  Flag, Star, TrendingUp, Award
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { ScanLog } from '@/types';

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(dateStr).toLocaleDateString();
}

const statusConfig: Record<string, { icon: React.ElementType; label: string; color: string; bg: string }> = {
  authentic: { icon: CheckCircle, label: 'Safe', color: 'text-success', bg: 'bg-success/10' },
  suspicious: { icon: AlertTriangle, label: 'Caution', color: 'text-warning', bg: 'bg-warning/10' },
  not_found: { icon: XCircle, label: 'Not Found', color: 'text-destructive', bg: 'bg-destructive/10' },
};

/* ── Trust Contributor Levels ── */
function getContributorLevel(safeScans: number): { level: string; icon: React.ElementType; next: number; color: string } {
  if (safeScans >= 50) return { level: 'Guardian', icon: Shield, next: 0, color: 'text-primary' };
  if (safeScans >= 25) return { level: 'Protector', icon: Award, next: 50, color: 'text-success' };
  if (safeScans >= 10) return { level: 'Watchdog', icon: Star, next: 25, color: 'text-warning' };
  return { level: 'Newcomer', icon: TrendingUp, next: 10, color: 'text-muted-foreground' };
}

export default function ConsumerHistory() {
  const { user } = useAuth();
  const [scans, setScans] = useState<ScanLog[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [{ data: scanData }, { data: reportData }] = await Promise.all([
        supabase.from('scan_logs').select('*').eq('scanner_user_id', user.id).order('scanned_at', { ascending: false }).limit(50),
        supabase.from('consumer_reports').select('*').eq('reporter_id', user.id).order('created_at', { ascending: false }).limit(20),
      ]);
      setScans((scanData as ScanLog[]) || []);
      setReports(reportData || []);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const safeScans = scans.filter(s => s.verification_status === 'authentic').length;
  const suspiciousScans = scans.filter(s => s.verification_status === 'suspicious').length;
  const contributor = getContributorLevel(safeScans);
  const progress = contributor.next > 0 ? Math.round((safeScans / contributor.next) * 100) : 100;

  if (!user) {
    return (
      <main className="container max-w-lg py-16 text-center animate-fade-in">
        <div className="apple-card p-10 flex flex-col items-center gap-4">
          <Shield className="h-12 w-12 text-primary" />
          <h1 className="text-[20px] font-bold text-foreground">Sign In Required</h1>
          <p className="text-[14px] text-muted-foreground">Connect your wallet to see your safety history.</p>
          <Link to="/login">
            <Button className="rounded-xl mt-2">Connect Wallet</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-primary/[0.03] to-background border-b border-border">
        <div className="container max-w-2xl py-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/[0.07]">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-[22px] font-bold tracking-tight text-foreground">My Safety History</h1>
              <p className="text-[13px] text-muted-foreground">Your medicine verification activity</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-2xl py-8">
        <div className="flex flex-col gap-5">
          {/* ═══ TRUST CONTRIBUTOR CARD ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="apple-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold text-foreground flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" /> Trust Contributor
              </h3>
              <Badge variant="outline" className={`rounded-full text-[11px] font-semibold ${contributor.color} border-current/20`}>
                {contributor.level}
              </Badge>
            </div>
            <div className="flex items-center gap-5">
              <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${
                contributor.level === 'Guardian' ? 'bg-primary/10' :
                contributor.level === 'Protector' ? 'bg-success/10' :
                contributor.level === 'Watchdog' ? 'bg-warning/10' : 'bg-muted'
              }`}>
                <contributor.icon className={`h-8 w-8 ${contributor.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-medium text-foreground">
                  {safeScans} safe medicine{safeScans !== 1 ? 's' : ''} verified
                </p>
                {contributor.next > 0 && (
                  <>
                    <p className="text-[12px] text-muted-foreground mt-0.5">
                      {contributor.next - safeScans} more to reach next level
                    </p>
                    <div className="h-2 rounded-full bg-muted overflow-hidden mt-2">
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${Math.min(progress, 100)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full rounded-full bg-primary"
                      />
                    </div>
                  </>
                )}
                {contributor.next === 0 && (
                  <p className="text-[12px] text-primary font-medium mt-0.5">
                    🏆 Maximum level reached!
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* ═══ STATS ═══ */}
          <div className="grid grid-cols-3 gap-3">
            <div className="apple-card p-4 text-center">
              <p className="text-[24px] font-bold text-foreground">{scans.length}</p>
              <p className="text-[11px] text-muted-foreground font-medium">Total Scans</p>
            </div>
            <div className="apple-card p-4 text-center">
              <p className="text-[24px] font-bold text-success">{safeScans}</p>
              <p className="text-[11px] text-muted-foreground font-medium">Safe</p>
            </div>
            <div className="apple-card p-4 text-center">
              <p className="text-[24px] font-bold text-warning">{suspiciousScans}</p>
              <p className="text-[11px] text-muted-foreground font-medium">Caution</p>
            </div>
          </div>

          {/* ═══ QUICK ACTIONS ═══ */}
          <div className="grid grid-cols-2 gap-3">
            <Link to="/consumer">
              <div className="apple-card-interactive p-4 flex items-center gap-3 h-full">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/[0.06] text-primary">
                  <ScanLine className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[13px] font-semibold text-foreground">Scan Medicine</h4>
                  <p className="text-[11px] text-muted-foreground">Check safety</p>
                </div>
              </div>
            </Link>
            <Link to="/report">
              <div className="apple-card-interactive p-4 flex items-center gap-3 h-full">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/[0.06] text-warning">
                  <Flag className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[13px] font-semibold text-foreground">Report Issue</h4>
                  <p className="text-[11px] text-muted-foreground">Flag suspicious</p>
                </div>
              </div>
            </Link>
          </div>

          {/* ═══ SCAN HISTORY ═══ */}
          <div className="apple-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold text-foreground">Scan History</h3>
              <span className="text-[11px] text-muted-foreground">{scans.length} records</span>
            </div>

            {loading ? (
              <div className="flex flex-col gap-2">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
              </div>
            ) : scans.length === 0 ? (
              <div className="text-center py-10">
                <ScanLine className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-[14px] text-muted-foreground">No medicines scanned yet</p>
                <Link to="/consumer">
                  <Button size="sm" className="mt-3 rounded-xl">Scan Your First Medicine</Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {scans.map((scan) => {
                  const config = statusConfig[scan.verification_status] || statusConfig.not_found;
                  return (
                    <div key={scan.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${config.bg}`}>
                        <config.icon className={`h-4 w-4 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-foreground truncate">{scan.batch_id}</p>
                        <p className="text-[11px] text-muted-foreground">{config.label}</p>
                      </div>
                      <span className="text-[11px] text-muted-foreground whitespace-nowrap">{timeAgo(scan.scanned_at)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ═══ MY REPORTS ═══ */}
          {reports.length > 0 && (
            <div className="apple-card p-6">
              <h3 className="text-[15px] font-semibold text-foreground mb-4 flex items-center gap-2">
                <Flag className="h-4 w-4 text-warning" /> My Reports
              </h3>
              <div className="flex flex-col gap-2">
                {reports.map((r: any) => (
                  <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warning/10">
                      <Flag className="h-4 w-4 text-warning" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-foreground truncate">{r.batch_id}</p>
                      <p className="text-[11px] text-muted-foreground capitalize">{r.report_type.replace(/_/g, ' ')}</p>
                    </div>
                    <Badge variant="outline" className={`text-[10px] rounded-full ${
                      r.status === 'resolved' ? 'bg-success/10 text-success border-success/20' :
                      r.status === 'investigating' ? 'bg-warning/10 text-warning border-warning/20' :
                      'bg-muted text-muted-foreground border-border'
                    }`}>
                      {r.status}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap">{timeAgo(r.created_at)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
