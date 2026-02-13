import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { LayoutDashboard, Package, ScanLine, AlertTriangle, ShieldCheck } from 'lucide-react';
import type { ScanLog } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  authentic: 'hsl(142, 71%, 45%)',
  suspicious: 'hsl(38, 92%, 50%)',
  not_found: 'hsl(0, 84%, 60%)',
};

const statusBadge: Record<string, string> = {
  authentic: 'bg-success text-success-foreground',
  suspicious: 'bg-warning text-warning-foreground',
  not_found: 'bg-destructive text-destructive-foreground',
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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            Regulator Dashboard
          </h1>
          <p className="text-lg text-foreground/60">Real-time pharmaceutical supply chain analytics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          {[
            { label: 'Total Batches', value: totalBatches, icon: Package, color: 'from-primary to-primary/70' },
            { label: 'Total Scans', value: totalScans, icon: ScanLine, color: 'from-accent to-accent/70' },
            { label: 'Suspicious', value: suspiciousCount, icon: AlertTriangle, color: 'from-warning to-warning/70' },
            { label: 'Authentic Rate', value: `${authenticRate}%`, icon: ShieldCheck, color: 'from-success to-success/70' },
          ].map((card) => (
            <div key={card.label} className="glass rounded-2xl p-6 shadow-sm-ios hover:shadow-md-ios transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground/60 mb-1">{card.label}</p>
                  <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">{card.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-md-ios`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <div className="glass rounded-2xl p-6 shadow-md-ios">
            <h3 className="text-lg font-semibold mb-4">Scan Activity (Last 14 Days)</h3>
          <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dailyScans}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" fontSize={12} stroke="currentColor" />
                  <YAxis stroke="currentColor" />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(162, 72%, 40%)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
          </div>

          <div className="glass rounded-2xl p-6 shadow-md-ios">
            <h3 className="text-lg font-semibold mb-4">Verification Breakdown</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {statusBreakdown.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="glass rounded-2xl overflow-hidden shadow-md-ios">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold">Recent Scan Activity</h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentScans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">No scans yet</TableCell>
                </TableRow>
              ) : (
                recentScans.map((scan) => (
                  <TableRow key={scan.id}>
                    <TableCell className="font-mono">{scan.batch_id}</TableCell>
                    <TableCell>
                      <Badge className={statusBadge[scan.verification_status]}>
                        {scan.verification_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {scan.latitude && scan.longitude
                        ? `${scan.latitude.toFixed(2)}, ${scan.longitude.toFixed(2)}`
                        : 'Unknown'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(scan.scanned_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
