import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Package, ScanLine, AlertTriangle, ShieldCheck } from 'lucide-react';
import type { ScanLog } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  authentic: 'hsl(142, 71%, 45%)',
  suspicious: 'hsl(38, 92%, 50%)',
  not_found: 'hsl(0, 72%, 51%)',
};

const statusBadgeClass: Record<string, string> = {
  authentic: 'bg-success/10 text-success border-success/20',
  suspicious: 'bg-warning/10 text-warning border-warning/20',
  not_found: 'bg-destructive/10 text-destructive border-destructive/20',
};

function StatCard({ label, value, icon: Icon, accent, glow }: { label: string; value: string | number; icon: React.ElementType; accent: string; glow: string }) {
  return (
    <div className="apple-card p-5 flex items-center gap-4 group hover:border-primary/10 transition-all duration-300">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent} ${glow} transition-all duration-300`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[13px] text-muted-foreground font-medium">{label}</p>
        <p className="text-2xl font-bold tracking-tight text-foreground mt-0.5">{value}</p>
      </div>
    </div>
  );
}

const chartTooltipStyle = {
  borderRadius: '12px',
  border: '1px solid hsl(220, 13%, 91%)',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
  fontSize: '13px',
  backgroundColor: 'hsl(0, 0%, 100%)',
  color: 'hsl(220, 20%, 10%)',
};

export default function Dashboard() {
  const [totalBatches, setTotalBatches] = useState(0);
  const [totalScans, setTotalScans] = useState(0);
  const [suspiciousCount, setSuspiciousCount] = useState(0);
  const [recentScans, setRecentScans] = useState<ScanLog[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<{ name: string; value: number }[]>([]);
  const [dailyScans, setDailyScans] = useState<{ date: string; count: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [{ count: batchCount }, { data: scans }] = await Promise.all([
        supabase.from('batches').select('*', { count: 'exact', head: true }),
        supabase.from('scan_logs').select('*').order('scanned_at', { ascending: false }).limit(100),
      ]);

      setTotalBatches(batchCount || 0);

      if (scans) {
        const scanData = scans as ScanLog[];
        setTotalScans(scanData.length);
        setSuspiciousCount(scanData.filter((s) => s.verification_status === 'suspicious').length);
        setRecentScans(scanData.slice(0, 20));

        const breakdown: Record<string, number> = { authentic: 0, suspicious: 0, not_found: 0 };
        const daily: Record<string, number> = {};
        scanData.forEach((s) => {
          breakdown[s.verification_status] = (breakdown[s.verification_status] || 0) + 1;
          const day = new Date(s.scanned_at).toLocaleDateString();
          daily[day] = (daily[day] || 0) + 1;
        });

        setStatusBreakdown(Object.entries(breakdown).map(([name, value]) => ({ name, value })));
        setDailyScans(Object.entries(daily).map(([date, count]) => ({ date, count })).reverse().slice(-14));
      }
    };
    fetchData();
  }, []);

  const authenticRate = totalScans > 0
    ? Math.round(((totalScans - suspiciousCount) / totalScans) * 100)
    : 100;

  return (
    <main className="container py-10 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-[15px] text-muted-foreground mt-1">Real-time analytics and supply chain overview</p>
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Total Batches" value={totalBatches} icon={Package} accent="bg-primary/10 text-primary" glow="glow-primary" />
        <StatCard label="Total Scans" value={totalScans} icon={ScanLine} accent="bg-primary/10 text-primary" glow="glow-primary" />
        <StatCard label="Suspicious" value={suspiciousCount} icon={AlertTriangle} accent="bg-warning/10 text-warning" glow="glow-warning" />
        <StatCard label="Authentic Rate" value={`${authenticRate}%`} icon={ShieldCheck} accent="bg-success/10 text-success" glow="glow-success" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <div className="apple-card p-6">
          <h2 className="text-[15px] font-semibold text-foreground mb-5">Scan Activity</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={dailyScans}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} stroke="hsl(220, 10%, 60%)" />
              <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="hsl(220, 10%, 60%)" />
              <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'hsla(220, 14%, 96%, 0.5)' }} />
              <Bar dataKey="count" fill="hsl(211, 100%, 50%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="apple-card p-6">
          <h2 className="text-[15px] font-semibold text-foreground mb-5">Verification Breakdown</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={statusBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={48} strokeWidth={2} stroke="hsl(0, 0%, 100%)">
                {statusBreakdown.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip contentStyle={chartTooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-5 mt-4">
            {statusBreakdown.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLORS[entry.name] }} />
                <span className="text-[12px] text-muted-foreground capitalize">{entry.name.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="apple-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-[15px] font-semibold text-foreground">Recent Scan Activity</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Batch ID</th>
                <th className="px-6 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentScans.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[14px] text-muted-foreground">
                    No scans recorded yet
                  </td>
                </tr>
              ) : (
                recentScans.map((scan) => (
                  <tr key={scan.id} className="border-b border-border/50 last:border-0 hover:bg-accent/50 transition-colors">
                    <td className="px-6 py-3.5 text-[13px] font-mono font-medium text-foreground">{scan.batch_id}</td>
                    <td className="px-6 py-3.5">
                      <Badge variant="outline" className={`text-[11px] font-medium capitalize rounded-full px-2.5 py-0.5 ${statusBadgeClass[scan.verification_status]}`}>
                        {scan.verification_status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-3.5 text-[13px] text-muted-foreground">
                      {scan.latitude && scan.longitude
                        ? `${scan.latitude.toFixed(2)}, ${scan.longitude.toFixed(2)}`
                        : 'Unknown'}
                    </td>
                    <td className="px-6 py-3.5 text-[13px] text-muted-foreground">
                      {new Date(scan.scanned_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
