import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { verifyBatchOnChain, isBlockchainConfigured } from '@/lib/blockchain';
import { detectAnomalies } from '@/lib/anomaly';
import { getBatchByBatchId, recordScanLog } from '@/integrations/supabase/services';
import { ScanLine, CheckCircle, AlertTriangle, XCircle, Camera } from 'lucide-react';
import { toast } from 'sonner';
import type { VerificationResult } from '@/types';

const statusConfig: Record<VerificationResult, { icon: React.ElementType; label: string; className: string }> = {
  authentic: { icon: CheckCircle, label: 'Authentic', className: 'bg-success text-success-foreground' },
  suspicious: { icon: AlertTriangle, label: 'Suspicious', className: 'bg-warning text-warning-foreground' },
  not_found: { icon: XCircle, label: 'Not Found', className: 'bg-destructive text-destructive-foreground' },
};

export default function VerifyBatch() {
  const { user, demoMode } = useAuth();
  const [manualId, setManualId] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [scannedId, setScannedId] = useState('');
  const [anomalyFlags, setAnomalyFlags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrRef = useRef<any>(null);

  const startScanner = async () => {
    setScanning(true);
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('qr-reader');
      html5QrRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (text) => {
          scanner.stop().catch(() => {});
          setScanning(false);
          verifyBatch(text);
        },
        () => {}
      );
    } catch (err) {
      toast.error('Camera access denied or unavailable');
      setScanning(false);
    }
  };

  const stopScanner = () => {
    html5QrRef.current?.stop().catch(() => {});
    setScanning(false);
  };

  useEffect(() => {
    return () => { html5QrRef.current?.stop().catch(() => {}); };
  }, []);

  const getLocation = (): Promise<{ lat: number; lng: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { timeout: 5000 }
      );
    });
  };

  const verifyBatch = async (batchId: string) => {
    setLoading(true);
    setScannedId(batchId);
    setResult(null);
    setAnomalyFlags([]);

    try {
      const loc = await getLocation();

      // Step 1: Check blockchain first if configured
      let blockchainVerified = false;
      if (isBlockchainConfigured()) {
        try {
          const chainResult = await verifyBatchOnChain(batchId);
          if (chainResult && !chainResult.exists) {
            setResult('not_found');
            await logScan(batchId, 'not_found', loc, ['Batch not found on blockchain']);
            return;
          }
          blockchainVerified = true;
        } catch (err) {
          console.error('[v0] Blockchain verification failed:', err);
          // Continue with Supabase fallback
        }
      }

      // Step 2: Check Supabase
      const batch = await getBatchByBatchId(batchId);
      if (!batch) {
        setResult('not_found');
        await logScan(batchId, 'not_found', loc, ['Batch not found in database']);
        return;
      }

      // Step 3: Run anomaly detection
      const { isSuspicious, flags } = await detectAnomalies(batchId, loc?.lat ?? null, loc?.lng ?? null);
      const status: VerificationResult = isSuspicious ? 'suspicious' : 'authentic';
      
      // Add blockchain status to flags if available
      if (blockchainVerified) {
        flags.unshift('✓ Verified on Polygon blockchain');
      } else if (isBlockchainConfigured()) {
        flags.push('⚠ Blockchain verification unavailable, verified in database only');
      }

      setResult(status);
      setAnomalyFlags(flags);
      await logScan(batchId, status, loc, flags);
    } catch (err: any) {
      console.error('[v0] Verification error:', err);
      toast.error(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const logScan = async (
    batchId: string,
    status: VerificationResult,
    loc: { lat: number; lng: number } | null,
    flags: string[]
  ) => {
    if (demoMode) return;
    await recordScanLog(
      batchId,
      status,
      user?.id ?? null,
      loc?.lat ?? null,
      loc?.lng ?? null,
      flags
    );
  };

  const handleManualVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualId.trim()) verifyBatch(manualId.trim());
  };

  const StatusIcon = result ? statusConfig[result].icon : null;

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
        <ScanLine className="h-6 w-6 text-primary" />
        Verify Batch
      </h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Scan QR Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div id="qr-reader" ref={scannerRef} className={scanning ? 'rounded-lg overflow-hidden' : 'hidden'} />
            <div className="flex gap-2">
              {!scanning ? (
                <Button onClick={startScanner} className="w-full">
                  <Camera className="h-4 w-4 mr-2" />
                  Open Camera Scanner
                </Button>
              ) : (
                <Button variant="destructive" onClick={stopScanner} className="w-full">
                  Stop Scanner
                </Button>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or enter manually</span>
              </div>
            </div>

            <form onSubmit={handleManualVerify} className="flex gap-2">
              <Input placeholder="Enter Batch ID" value={manualId} onChange={(e) => setManualId(e.target.value)} />
              <Button type="submit" disabled={loading}>Verify</Button>
            </form>
          </CardContent>
        </Card>

        {result && StatusIcon && (
          <Card className="border-2" style={{ borderColor: result === 'authentic' ? 'hsl(var(--success))' : result === 'suspicious' ? 'hsl(var(--warning))' : 'hsl(var(--destructive))' }}>
            <CardContent className="flex flex-col items-center py-8 gap-4">
              <StatusIcon className="h-16 w-16" style={{ color: result === 'authentic' ? 'hsl(var(--success))' : result === 'suspicious' ? 'hsl(var(--warning))' : 'hsl(var(--destructive))' }} />
              <Badge className={`text-lg px-4 py-2 ${statusConfig[result].className}`}>
                {statusConfig[result].label}
              </Badge>
              <p className="font-mono text-sm text-muted-foreground">{scannedId}</p>
              {anomalyFlags.length > 0 && (
                <div className="w-full mt-2 space-y-1">
                  {anomalyFlags.map((flag, i) => (
                    <div key={i} className="text-sm text-warning bg-warning/10 rounded px-3 py-1.5">
                      ⚠️ {flag}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
