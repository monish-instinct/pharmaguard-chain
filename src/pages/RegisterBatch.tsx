import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { generateBatchHash, registerBatchOnChain, isBlockchainConfigured } from '@/lib/blockchain';
import QRCode from 'qrcode';
import { Package, Download } from 'lucide-react';

export default function RegisterBatch() {
  const { user, demoMode } = useAuth();
  const [batchId, setBatchId] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [lastBatchId, setLastBatchId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const batchHash = await generateBatchHash(batchId, manufacturer);
      let txHash: string | null = null;

      if (isBlockchainConfigured()) {
        txHash = await registerBatchOnChain(batchId, manufacturer, batchHash);
        if (!txHash) toast.info('Blockchain unavailable, using Supabase fallback');
      }

      if (!demoMode && user) {
        const { error } = await supabase.from('batches').insert({
          batch_id: batchId,
          manufacturer_name: manufacturer,
          batch_hash: batchHash,
          blockchain_tx_hash: txHash,
          registered_by: user.id,
        });
        if (error) throw error;
      }

      const qr = await QRCode.toDataURL(batchId, { width: 300, margin: 2 });
      setQrDataUrl(qr);
      setLastBatchId(batchId);
      toast.success(`Batch ${batchId} registered successfully!`);
      setBatchId('');
      setManufacturer('');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `batch-${lastBatchId}.png`;
    a.click();
  };

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          Register New Batch
        </h1>
        <p className="text-muted-foreground mt-1">Register a drug batch and generate its QR code</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Batch Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="batchId">Batch ID</Label>
                <Input id="batchId" placeholder="e.g. BATCH-2026-001" value={batchId} onChange={(e) => setBatchId(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manufacturer">Manufacturer Name</Label>
                <Input id="manufacturer" placeholder="e.g. PharmaCorp" value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Registering...' : 'Register Batch'}
              </Button>
              {!isBlockchainConfigured() && (
                <p className="text-xs text-muted-foreground text-center">
                  No blockchain configured — using Supabase storage only
                </p>
              )}
            </form>
          </CardContent>
        </Card>

        {qrDataUrl && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">QR Code Generated</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <img src={qrDataUrl} alt={`QR for ${lastBatchId}`} className="rounded-lg border" />
              <p className="text-sm font-medium">{lastBatchId}</p>
              <Button variant="outline" onClick={downloadQR}>
                <Download className="h-4 w-4 mr-2" />
                Download PNG
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
