import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { generateBatchHash, registerBatchOnChain, isBlockchainConfigured } from '@/lib/blockchain';
import QRCode from 'qrcode';
import { Package, Download, Loader2, CheckCircle } from 'lucide-react';

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
    <main className="container max-w-2xl py-10 animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Register Batch</h1>
            <p className="text-[13px] text-muted-foreground">Register a new drug batch and generate its QR code</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Form */}
        <div className="apple-card p-6">
          <h2 className="text-[15px] font-semibold text-foreground mb-5">Batch Details</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="batchId" className="text-[13px] font-medium">Batch ID</Label>
              <Input
                id="batchId"
                placeholder="e.g. BATCH-2026-001"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                required
                className="h-11 rounded-xl bg-secondary/50 border-border/50 text-[14px]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="manufacturer" className="text-[13px] font-medium">Manufacturer Name</Label>
              <Input
                id="manufacturer"
                placeholder="e.g. PharmaCorp"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                required
                className="h-11 rounded-xl bg-secondary/50 border-border/50 text-[14px]"
              />
            </div>
            <Button type="submit" className="w-full h-11 rounded-xl text-[14px] font-medium mt-1" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Register Batch'}
            </Button>
            {!isBlockchainConfigured() && (
              <p className="text-[11px] text-muted-foreground text-center">
                No blockchain configured - data stored in Supabase
              </p>
            )}
          </form>
        </div>

        {/* QR Result */}
        {qrDataUrl ? (
          <div className="apple-card p-6 flex flex-col items-center gap-4 animate-scale-in">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <h2 className="text-[15px] font-semibold text-foreground">QR Code Ready</h2>
            <div className="rounded-2xl border border-border/50 overflow-hidden bg-card p-3">
              <img src={qrDataUrl} alt={`QR code for batch ${lastBatchId}`} className="rounded-lg" />
            </div>
            <p className="text-[13px] font-mono font-medium text-muted-foreground">{lastBatchId}</p>
            <Button variant="outline" onClick={downloadQR} className="rounded-xl h-10 px-5 text-[13px]">
              <Download className="h-4 w-4 mr-2" />
              Download PNG
            </Button>
          </div>
        ) : (
          <div className="apple-card p-6 flex flex-col items-center justify-center text-center min-h-[280px]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted mb-3">
              <Package className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <p className="text-[14px] text-muted-foreground font-medium">No QR code yet</p>
            <p className="text-[12px] text-muted-foreground/70 mt-1">Register a batch to generate its QR code</p>
          </div>
        )}
      </div>
    </main>
  );
}
