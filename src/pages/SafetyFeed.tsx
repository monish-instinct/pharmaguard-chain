import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Shield, CheckCircle, AlertTriangle, XCircle, Flag,
  ScanLine, Globe, Clock, TrendingUp, Activity
} from 'lucide-react';
import { motion } from 'framer-motion';

interface FeedItem {
  type: 'scan' | 'report' | 'recall';
  id: string;
  batch_id: string;
  status?: string;
  report_type?: string;
  time: string;
  medicine_name?: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(dateStr).toLocaleDateString();
}

const statusIcon: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  authentic: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
  suspicious: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10' },
  not_found: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
  report: { icon: Flag, color: 'text-warning', bg: 'bg-warning/10' },
  recall: { icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10' },
};

export default function SafetyFeed() {
  const { user } = useAuth();
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalScans: 0, safeRate: 0, reports: 0, recalls: 0 });

  useEffect(() => {
    const fetchFeed = async () => {
      const [{ data: scans }, { data: reports }, { data: recalls }] = await Promise.all([
        supabase.from('scan_logs').select('id, batch_id, verification_status, scanned_at').order('scanned_at', { ascending: false }).limit(30),
        supabase.from('consumer_reports').select('id, batch_id, report_type, created_at').order('created_at', { ascending: false }).limit(10),
        supabase.from('batches').select('id, batch_id, medicine_name, recalled_at').eq('status', 'recalled').order('recalled_at', { ascending: false }).limit(5),
      ]);

      const feedItems: FeedItem[] = [];
      (scans || []).forEach((s: any) => feedItems.push({ type: 'scan', id: s.id, batch_id: s.batch_id, status: s.verification_status, time: s.scanned_at }));
      (reports || []).forEach((r: any) => feedItems.push({ type: 'report', id: r.id, batch_id: r.batch_id, report_type: r.report_type, time: r.created_at }));
      (recalls || []).forEach((b: any) => feedItems.push({ type: 'recall', id: b.id, batch_id: b.batch_id, medicine_name: b.medicine_name, time: b.recalled_at }));

      feedItems.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setFeed(feedItems.slice(0, 50));

      const scanData = scans || [];
      const safeCount = scanData.filter((s: any) => s.verification_status === 'authentic').length;
      setStats({
        totalScans: scanData.length,
        safeRate: scanData.length > 0 ? Math.round((safeCount / scanData.length) * 100) : 100,
        reports: (reports || []).length,
        recalls: (recalls || []).length,
      });
      setLoading(false);
    };
    fetchFeed();
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-primary/[0.03] to-background border-b border-border">
        <div className="container max-w-2xl py-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/[0.07]">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-[22px] font-bold tracking-tight text-foreground">Community Safety Feed</h1>
              <p className="text-[13px] text-muted-foreground">Real-time verification & safety activity</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-2xl py-8">
        <div className="flex flex-col gap-5">
          {/* Community Stats */}
          <div className="grid grid-cols-4 gap-3">
            <div className="apple-card p-4 text-center">
              <p className="text-[20px] font-bold text-foreground">{stats.totalScans}</p>
              <p className="text-[10px] text-muted-foreground font-medium">Scans</p>
            </div>
            <div className="apple-card p-4 text-center">
              <p className="text-[20px] font-bold text-success">{stats.safeRate}%</p>
              <p className="text-[10px] text-muted-foreground font-medium">Safe Rate</p>
            </div>
            <div className="apple-card p-4 text-center">
              <p className="text-[20px] font-bold text-warning">{stats.reports}</p>
              <p className="text-[10px] text-muted-foreground font-medium">Reports</p>
            </div>
            <div className="apple-card p-4 text-center">
              <p className="text-[20px] font-bold text-destructive">{stats.recalls}</p>
              <p className="text-[10px] text-muted-foreground font-medium">Recalls</p>
            </div>
          </div>

          {/* Live Feed */}
          <div className="apple-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold text-foreground flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" /> Live Activity
              </h3>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="text-[11px] text-muted-foreground">Live</span>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col gap-2">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
            ) : feed.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-[14px] text-muted-foreground">No activity yet</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {feed.map((item, idx) => {
                  const config = item.type === 'scan'
                    ? statusIcon[item.status || 'not_found']
                    : item.type === 'report'
                    ? statusIcon.report
                    : statusIcon.recall;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                    >
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${config.bg}`}>
                        <config.icon className={`h-4 w-4 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-foreground truncate">
                          {item.type === 'scan' && `Batch ${item.batch_id} verified`}
                          {item.type === 'report' && `Report filed: ${(item.report_type || 'suspicious').replace(/_/g, ' ')}`}
                          {item.type === 'recall' && `⚠️ ${item.medicine_name || item.batch_id} recalled`}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {item.type === 'scan' && (item.status === 'authentic' ? '✅ Safe' : item.status === 'suspicious' ? '⚠️ Suspicious' : '❌ Not found')}
                          {item.type === 'report' && 'Consumer safety report'}
                          {item.type === 'recall' && 'Product recall alert'}
                        </p>
                      </div>
                      <span className="text-[11px] text-muted-foreground whitespace-nowrap">{timeAgo(item.time)}</span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Link to="/consumer">
              <div className="apple-card-interactive p-4 flex items-center gap-3 h-full">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/[0.06] text-primary">
                  <ScanLine className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[13px] font-semibold text-foreground">Verify Now</h4>
                  <p className="text-[11px] text-muted-foreground">Check a medicine</p>
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
        </div>
      </div>
    </main>
  );
}
