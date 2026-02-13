import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, ExternalLink } from 'lucide-react';
import QRCode from 'qrcode';
import type { Batch } from '@/types';

export default function MyBatches() {
  const { user, activeRole } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [qrUrls, setQrUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchBatches = async () => {
      let query = supabase.from('batches').select('*').order('created_at', { ascending: false });
      if (activeRole !== 'regulator' && user) {
        query = query.eq('registered_by', user.id);
      }
      const { data } = await query;
      if (data) {
        setBatches(data as Batch[]);
        const urls: Record<string, string> = {};
        for (const b of data) {
          urls[b.batch_id] = await QRCode.toDataURL(b.batch_id, { width: 80, margin: 1 });
        }
        setQrUrls(urls);
      }
    };
    fetchBatches();
  }, [user, activeRole]);

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
        <Package className="h-6 w-6 text-primary" />
        {activeRole === 'regulator' ? 'All Batches' : 'My Batches'}
      </h1>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>QR</TableHead>
                <TableHead>Batch ID</TableHead>
                <TableHead>Manufacturer</TableHead>
                <TableHead>Blockchain</TableHead>
                <TableHead>Registered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No batches registered yet
                  </TableCell>
                </TableRow>
              ) : (
                batches.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell>
                      {qrUrls[batch.batch_id] && (
                        <img src={qrUrls[batch.batch_id]} alt="QR" className="h-10 w-10 rounded" />
                      )}
                    </TableCell>
                    <TableCell className="font-mono font-medium">{batch.batch_id}</TableCell>
                    <TableCell>{batch.manufacturer_name}</TableCell>
                    <TableCell>
                      {batch.blockchain_tx_hash ? (
                        <Badge variant="outline" className="gap-1">
                          <ExternalLink className="h-3 w-3" />
                          On-chain
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Off-chain</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(batch.created_at).toLocaleDateString()}
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
