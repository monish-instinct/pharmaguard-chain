import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClipboardList, Download, MapPin, Clock, AlertTriangle } from 'lucide-react';
import { downloadCSV } from '@/lib/export';
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

  const handleExport = () => {
    downloadCSV(logs.map(l => ({
      batch_id: l.batch_id,
      status: l.verification_status,
      latitude: l.latitude,
      longitude: l.longitude,
      anomaly_flags: (l.anomaly_flags as string[])?.join('; ') || '',
      scanned_at: l.scanned_at,
    })), 'scan-logs');
  };

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <main className="container max-w-4xl py-10 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 glow-primary">
            <ClipboardList className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Scan Logs</h1>
            <p className="text-[13px] text-muted-foreground">Verification scan history and anomaly flags</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[130px] h-9 rounded-lg text-[13px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="authentic">Authentic</SelectItem>
              <SelectItem value="suspicious">Suspicious</SelectItem>
              <SelectItem value="not_found">Not Found</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExport} className="h-9 rounded-lg text-[12px] gap-1.5">
            <Download className="h-3.5 w-3.5" /> CSV
          </Button>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="apple-card flex flex-col items-center justify-center py-16 text-center">
          <ClipboardList className="h-8 w-8 text-muted-foreground/30 mb-3" />
          <p className="text-[15px] font-medium text-muted-foreground">No scan logs found</p>
          <p className="text-[13px] text-muted-foreground/60 mt-1">Logs will appear after batch verifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => {
            const anomalies = (log.anomaly_flags as string[]) || [];
            return (
              <div
                key={log.id}
                className={`apple-card p-4 flex flex-col sm:flex-row sm:items-center gap-3 ${
                  log.verification_status === 'suspicious' ? 'border-warning/20' : ''
                }`}
              >
                {/* Batch ID + Status */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Badge variant="outline" className={`text-[11px] font-medium capitalize rounded-full px-2.5 py-0.5 shrink-0 ${statusBadgeClass[log.verification_status]}`}>
                    {log.verification_status.replace('_', ' ')}
                  </Badge>
                  <span className="text-[13px] font-mono font-medium text-foreground truncate">{log.batch_id}</span>
                </div>

                {/* Meta info */}
                <div className="flex items-center gap-4 text-[12px] text-muted-foreground shrink-0">
                  {log.latitude && log.longitude && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {log.latitude.toFixed(1)}, {log.longitude.toFixed(1)}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTime(log.scanned_at)}
                  </span>
                </div>

                {/* Anomalies */}
                {anomalies.length > 0 && (
                  <div className="flex items-center gap-1.5 text-[11px] text-warning shrink-0">
                    <AlertTriangle className="h-3 w-3" />
                    <span className="truncate max-w-[200px]">{anomalies[0]}</span>
                    {anomalies.length > 1 && <span>+{anomalies.length - 1}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
