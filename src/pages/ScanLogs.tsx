import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClipboardList } from 'lucide-react';
import type { ScanLog } from '@/types';

const statusBadgeClass: Record<string, string> = {
  authentic: 'bg-success/10 text-success border-success/20',
  suspicious: 'bg-warning/10 text-warning border-warning/20',
  not_found: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function ScanLogs() {
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchLogs = async () => {
      let query = supabase.from('scan_logs').select('*').order('scanned_at', { ascending: false }).limit(200);
      if (filter !== 'all') query = query.eq('verification_status', filter);
      const { data } = await query;
      if (data) setLogs(data as ScanLog[]);
    };
    fetchLogs();
  }, [filter]);

  return (
    <main className="container py-10 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 glow-primary">
            <ClipboardList className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Scan Logs</h1>
            <p className="text-[13px] text-muted-foreground">Verification scan history and anomaly flags</p>
          </div>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[140px] h-9 rounded-lg text-[13px] bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] text-foreground">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="authentic">Authentic</SelectItem>
            <SelectItem value="suspicious">Suspicious</SelectItem>
            <SelectItem value="not_found">Not Found</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="apple-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.06)]">
                <th className="px-6 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Batch ID</th>
                <th className="px-6 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Anomalies</th>
                <th className="px-6 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(255,255,255,0.04)]">
                        <ClipboardList className="h-6 w-6 text-muted-foreground/40" />
                      </div>
                      <p className="text-[14px] text-muted-foreground font-medium">No scan logs found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className={`border-b border-[rgba(255,255,255,0.04)] last:border-0 transition-colors hover:bg-[rgba(255,255,255,0.02)] ${
                      log.verification_status === 'suspicious' ? 'bg-warning/[0.02]' : ''
                    }`}
                  >
                    <td className="px-6 py-3.5 text-[13px] font-mono font-medium text-foreground">{log.batch_id}</td>
                    <td className="px-6 py-3.5">
                      <Badge variant="outline" className={`text-[11px] font-medium capitalize rounded-full px-2.5 py-0.5 ${statusBadgeClass[log.verification_status]}`}>
                        {log.verification_status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-3.5 text-[13px] text-muted-foreground">
                      {log.latitude && log.longitude
                        ? `${log.latitude.toFixed(2)}, ${log.longitude.toFixed(2)}`
                        : 'Unknown'}
                    </td>
                    <td className="px-6 py-3.5 text-[12px] text-muted-foreground max-w-[200px] truncate">
                      {log.anomaly_flags && (log.anomaly_flags as string[]).length > 0
                        ? (log.anomaly_flags as string[]).join('; ')
                        : '--'}
                    </td>
                    <td className="px-6 py-3.5 text-[13px] text-muted-foreground">
                      {new Date(log.scanned_at).toLocaleString()}
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
