import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { verifyBatchOnChain, isBlockchainConfigured } from '@/lib/blockchain';
import { detectAnomalies } from '@/lib/anomaly';
import { ScanLine, CheckCircle, AlertTriangle, XCircle, Camera, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import type { VerificationResult } from '@/types';

const statusConfig: Record<VerificationResult, { icon: React.ElementType; label: string; color: string; bg: string; glow: string }> = {
  authentic: { icon: CheckCircle, label: 'Authentic', color: 'text-success', bg: 'bg-success/5 border-success/20', glow: 'glow-success' },
  suspicious: { icon: AlertTriangle, label: 'Suspicious', color: 'text-warning', bg: 'bg-warning/5 border-warning/20', glow: 'glow-warning' },
  not_found: { icon: XCircle, label: 'Not Found', color: 'text-destructive', bg: 'bg-destructive/5 border-destructive/20', glow: 'glow-destructive' },
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
    } catch {
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

      if (isBlockchainConfigured()) {
        const chainResult = await verifyBatchOnChain(batchId);
        if (chainResult && !chainResult.exists) {
          setResult('not_found');
          await logScan(batchId, 'not_found', loc, []);
          return;
        }
      }

      const { data: batch } = await supabase.from('batches').select('*').eq('batch_id', batchId).maybeSingle();
      if (!batch) {
        setResult('not_found');
        await logScan(batchId, 'not_found', loc, []);
        return;
      }

      const { isSuspicious, flags } = await detectAnomalies(batchId, loc?.lat ?? null, loc?.lng ?? null);
      const status: VerificationResult = isSuspicious ? 'suspicious' : 'authentic';
      setResult(status);
      setAnomalyFlags(flags);
      await logScan(batchId, status, loc, flags);
    } catch (err: any) {
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
    await supabase.from('scan_logs').insert({
      batch_id: batchId,
      scanner_user_id: user?.id ?? null,
      verification_status: status,
      latitude: loc?.lat ?? null,
      longitude: loc?.lng ?? null,
      anomaly_flags: flags,
    });
  };

  const handleManualVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualId.trim()) verifyBatch(manualId.trim());
  };

  const StatusIcon = result ? statusConfig[result].icon : null;

  return (
    <main className="container max-w-lg py-10 animate-fade-in">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 glow-primary">
          <ScanLine className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Verify Batch</h1>
          <p className="text-[13px] text-muted-foreground">Scan or enter a batch ID to verify authenticity</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Scanner Card */}
        <div className="apple-card p-6">
          <div id="qr-reader" ref={scannerRef} className={scanning ? 'rounded-xl overflow-hidden mb-4' : 'hidden'} />
          
          {!scanning ? (
            <Button onClick={startScanner} className="w-full h-12 rounded-xl text-[14px] font-medium glow-primary">
              <Camera className="h-4 w-4 mr-2" />
              Open Camera Scanner
            </Button>
          ) : (
            <Button variant="outline" onClick={stopScanner} className="w-full h-12 rounded-xl text-[14px] font-medium border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive">
              Stop Scanner
            </Button>
          )}

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[rgba(255,255,255,0.06)]" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
              <span className="bg-card px-3 text-muted-foreground font-medium">or enter manually</span>
            </div>
          </div>

          <form onSubmit={handleManualVerify} className="flex gap-2">
            <Input
              placeholder="Enter Batch ID"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              className="h-11 rounded-xl bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] text-[14px] text-foreground placeholder:text-muted-foreground/60 flex-1 focus:border-primary/40"
            />
            <Button type="submit" disabled={loading} className="h-11 rounded-xl px-5">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="sr-only">Verify</span>
            </Button>
          </form>
        </div>

        {/* Result Card */}
        {result && StatusIcon && (
          <div className={`apple-card border-2 p-8 flex flex-col items-center gap-4 animate-scale-in ${statusConfig[result].bg} ${statusConfig[result].glow}`}>
            <StatusIcon className={`h-14 w-14 ${statusConfig[result].color}`} />
            <Badge className={`text-[14px] px-4 py-1.5 rounded-full font-semibold ${
              result === 'authentic' ? 'bg-success text-success-foreground' :
              result === 'suspicious' ? 'bg-warning text-warning-foreground' :
              'bg-destructive text-destructive-foreground'
            }`}>
              {statusConfig[result].label}
            </Badge>
            <p className="font-mono text-[13px] text-muted-foreground">{scannedId}</p>
            {anomalyFlags.length > 0 && (
              <div className="w-full mt-1 flex flex-col gap-1.5">
                {anomalyFlags.map((flag, i) => (
                  <div key={i} className="text-[13px] text-warning bg-warning/8 border border-warning/15 rounded-xl px-4 py-2.5 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{flag}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
