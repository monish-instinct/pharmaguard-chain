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
    <div className="container py-8">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
        <LayoutDashboard className="h-6 w-6 text-primary" />
        Regulator Dashboard
      </h1>

      <div className="grid gap-4 md:grid-cols-4 mb-8">
        {[
          { label: 'Total Batches', value: totalBatches, icon: Package, color: 'text-primary' },
          { label: 'Total Scans', value: totalScans, icon: ScanLine, color: 'text-primary' },
          { label: 'Suspicious', value: suspiciousCount, icon: AlertTriangle, color: 'text-warning' },
          { label: 'Authentic Rate', value: `${authenticRate}%`, icon: ShieldCheck, color: 'text-success' },
        ].map((card) => (
          <Card key={card.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="text-3xl font-bold">{card.value}</p>
                </div>
                <card.icon className={`h-8 w-8 ${card.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader><CardTitle className="text-lg">Scan Activity</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailyScans}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Verification Breakdown</CardTitle></CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Recent Scan Activity</CardTitle></CardHeader>
        <CardContent className="p-0">
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
        </CardContent>
      </Card>
    </div>
  );
}
