import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { generateBatchHash, registerBatchOnChain, isBlockchainConfigured } from '@/lib/blockchain';
import { registerBatchInSupabase, updateBatchBlockchainHash } from '@/integrations/supabase/services';
import QRCode from 'qrcode';
import { Package, Download, CheckCircle, AlertCircle } from 'lucide-react';

export default function RegisterBatch() {
  const { user, demoMode } = useAuth();
  const [batchId, setBatchId] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [lastBatchId, setLastBatchId] = useState('');
  const [registrationDetails, setRegistrationDetails] = useState<{
    blockchainTx?: string;
    supabaseId?: string;
    timestamp?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setRegistrationDetails(null);

    try {
      const batchHash = await generateBatchHash(batchId, manufacturer);
      let txHash: string | null = null;
      let blockchainSuccess = false;

      // Step 1: Try blockchain registration if configured
      if (isBlockchainConfigured()) {
        try {
          txHash = await registerBatchOnChain(batchId, manufacturer, batchHash);
          if (txHash) {
            blockchainSuccess = true;
            toast.success('Batch registered on Polygon blockchain!');
          } else {
            toast.info('Blockchain registration unavailable, using Supabase fallback');
          }
        } catch (err) {
          console.error('[v0] Blockchain registration failed:', err);
          toast.info('Blockchain unavailable, using Supabase fallback');
        }
      }

      // Step 2: Register in Supabase
      if (!demoMode && user) {
        const batch = await registerBatchInSupabase(batchId, manufacturer, user.id);
        if (!batch) throw new Error('Failed to register batch in Supabase');

        // Step 3: Update blockchain hash if registration succeeded
        if (txHash && blockchainSuccess) {
          await updateBatchBlockchainHash(batchId, txHash);
        }

        setRegistrationDetails({
          supabaseId: batch.id,
          blockchainTx: txHash || undefined,
          timestamp: new Date().toISOString(),
        });
      }

      // Step 4: Generate QR code
      const qr = await QRCode.toDataURL(batchId, { width: 300, margin: 2 });
      setQrDataUrl(qr);
      setLastBatchId(batchId);
      toast.success(`Batch ${batchId} registered successfully!`);
      setBatchId('');
      setManufacturer('');
    } catch (err: any) {
      console.error('[v0] Registration error:', err);
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
              
              {registrationDetails && (
                <div className="w-full mt-4 pt-4 border-t space-y-2">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Registration Details
                  </h3>
                  {registrationDetails.blockchainTx && (
                    <div className="text-xs p-2 bg-blue-50 rounded border border-blue-200 font-mono">
                      <p className="font-semibold text-blue-900 mb-1">Blockchain TX:</p>
                      <p className="break-all text-blue-800">{registrationDetails.blockchainTx}</p>
                    </div>
                  )}
                  {!registrationDetails.blockchainTx && (
                    <div className="text-xs p-2 bg-amber-50 rounded border border-amber-200 flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-700 flex-shrink-0 mt-0.5" />
                      <p className="text-amber-800">Registered in Supabase only (blockchain not configured)</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
