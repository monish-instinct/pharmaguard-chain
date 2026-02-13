import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClipboardList } from 'lucide-react';
import type { ScanLog } from '@/types';

const statusBadge: Record<string, string> = {
  authentic: 'bg-success text-success-foreground',
  suspicious: 'bg-warning text-warning-foreground',
  not_found: 'bg-destructive text-destructive-foreground',
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
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-primary" />
          Scan Logs
        </h1>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="authentic">Authentic</SelectItem>
            <SelectItem value="suspicious">Suspicious</SelectItem>
            <SelectItem value="not_found">Not Found</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Anomaly Flags</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">No scan logs</TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className={log.verification_status === 'suspicious' ? 'bg-warning/5' : ''}>
                    <TableCell className="font-mono">{log.batch_id}</TableCell>
                    <TableCell>
                      <Badge className={statusBadge[log.verification_status]}>
                        {log.verification_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.latitude && log.longitude
                        ? `${log.latitude.toFixed(2)}, ${log.longitude.toFixed(2)}`
                        : 'Unknown'}
                    </TableCell>
                    <TableCell className="text-xs max-w-[200px]">
                      {log.anomaly_flags && (log.anomaly_flags as string[]).length > 0
                        ? (log.anomaly_flags as string[]).join('; ')
                        : '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(log.scanned_at).toLocaleString()}
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
