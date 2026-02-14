import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { verifyBatchOnChain, isBlockchainConfigured } from '@/lib/blockchain';
import { fetchFromIPFS, type BatchMetadata } from '@/lib/ipfs';
import { detectAnomalies, type RiskAssessment } from '@/lib/anomaly';
import { SupplyChainTimeline } from '@/components/SupplyChainTimeline';
import {
  CheckCircle, AlertTriangle, XCircle, Camera, Loader2, Search,
  Shield, Pill, Calendar, Globe, Package,
  AlertOctagon, Clock, Flag, Star, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import type { Batch, VerificationResult } from '@/types';

/* ── Safety status config (consumer-friendly language) ── */
const safetyConfig: Record<VerificationResult, { icon: React.ElementType; label: string; sublabel: string; color: string; bg: string; glow: string; emoji: string }> = {
  authentic: {
    icon: CheckCircle, label: 'Safe & Authentic', sublabel: 'This medicine has been verified as genuine.',
    color: 'text-success', bg: 'bg-success/[0.04] border-success/20', glow: 'glow-success', emoji: '✅',
  },
  suspicious: {
    icon: AlertTriangle, label: 'Check Before Use', sublabel: 'Unusual activity detected. Please verify with your pharmacist.',
    color: 'text-warning', bg: 'bg-warning/[0.04] border-warning/20', glow: 'glow-warning', emoji: '⚠️',
  },
  not_found: {
    icon: XCircle, label: 'Not Found', sublabel: 'This medicine could not be verified. Do not use.',
    color: 'text-destructive', bg: 'bg-destructive/[0.04] border-destructive/20', glow: 'glow-destructive', emoji: '❌',
  },
};

interface ChainEvent {
  id: string;
  event_type: string;
  from_wallet: string | null;
  to_wallet: string | null;
  location: string | null;
  notes: string | null;
  created_at: string;
}

function expiryCountdown(expiryDate: string): { label: string; urgent: boolean } {
  const diff = new Date(expiryDate).getTime() - Date.now();
  if (diff < 0) return { label: 'Expired', urgent: true };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days <= 30) return { label: `Expires in ${days} day${days !== 1 ? 's' : ''}`, urgent: true };
  if (days <= 90) return { label: `Expires in ${Math.floor(days / 7)} weeks`, urgent: false };
  return { label: `Expires in ${Math.floor(days / 30)} months`, urgent: false };
}

function safetyScoreLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Very Safe', color: 'text-success' };
  if (score >= 60) return { label: 'Safe', color: 'text-success' };
  if (score >= 40) return { label: 'Moderate', color: 'text-warning' };
  return { label: 'Caution', color: 'text-destructive' };
}

function trustLevelFromScore(score: number): { label: string; stars: number } {
  if (score >= 80) return { label: 'High', stars: 3 };
  if (score >= 50) return { label: 'Medium', stars: 2 };
  return { label: 'Low', stars: 1 };
}

export default function ConsumerVerify() {
  const { user } = useAuth();
  const [manualId, setManualId] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [scannedId, setScannedId] = useState('');
  const [risk, setRisk] = useState<RiskAssessment | null>(null);
  const [batchInfo, setBatchInfo] = useState<Batch | null>(null);
  const [ipfsMetadata, setIpfsMetadata] = useState<BatchMetadata | null>(null);
  const [, setChainIpfsHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState('');
  const [supplyEvents, setSupplyEvents] = useState<ChainEvent[]>([]);
  const [trustScore, setTrustScore] = useState<{ score: number; name: string } | null>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrRef = useRef<any>(null);

  const startScanner = async () => {
    setScanning(true);
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('consumer-qr-reader');
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

  const verifyBatch = async (batchId: string) => {
    setLoading(true);
    setScannedId(batchId);
    setResult(null);
    setRisk(null);
    setBatchInfo(null);
    setIpfsMetadata(null);
    setChainIpfsHash(null);
    setSupplyEvents([]);
    setTrustScore(null);
    setVerifyStatus('');

    try {
      // Blockchain verification
      if (isBlockchainConfigured()) {
        setVerifyStatus('Checking authenticity...');
        const chainResult = await verifyBatchOnChain(batchId);
        if (chainResult) {
          if (!chainResult.exists) {
            setResult('not_found');
            setVerifyStatus('');
            // Log scan
            if (user) {
              await supabase.from('scan_logs').insert({
                batch_id: batchId, scanner_user_id: user.id, verification_status: 'not_found',
              });
            }
            return;
          }
          setChainIpfsHash(chainResult.ipfsHash || null);
          if (chainResult.ipfsHash) {
            setVerifyStatus('Loading medicine details...');
            const ipfsData = await fetchFromIPFS(chainResult.ipfsHash);
            if (ipfsData) setIpfsMetadata(ipfsData);
          }
        }
      }

      // Database check
      setVerifyStatus('Verifying safety...');
      const { data: batch } = await supabase.from('batches').select('*').eq('batch_id', batchId).maybeSingle();
      if (!batch) {
        setResult('not_found');
        setVerifyStatus('');
        return;
      }
      setBatchInfo(batch as unknown as Batch);

      // Fetch trust score for manufacturer
      const { data: trust } = await supabase
        .from('trust_scores')
        .select('score, manufacturer_name')
        .eq('manufacturer_name', batch.manufacturer_name)
        .maybeSingle();
      if (trust) setTrustScore({ score: trust.score, name: trust.manufacturer_name });

      // Supply chain events
      setVerifyStatus('Tracing medicine journey...');
      const { data: events } = await supabase
        .from('supply_chain_events')
        .select('*')
        .eq('batch_id', batchId)
        .order('created_at', { ascending: true });
      if (events) setSupplyEvents(events as ChainEvent[]);

      // Anomaly detection
      setVerifyStatus('Running safety checks...');
      const assessment = await detectAnomalies(batchId, null, null);
      const status: VerificationResult = assessment.isSuspicious ? 'suspicious' : 'authentic';
      setResult(status);
      setRisk(assessment);

      // Log scan
      if (user) {
        await supabase.from('scan_logs').insert({
          batch_id: batchId, scanner_user_id: user.id, verification_status: status,
          anomaly_flags: assessment.flags as any,
        });
      }

      setVerifyStatus('');
    } catch (err: any) {
      toast.error(err.message || 'Verification failed');
      setVerifyStatus('');
    } finally {
      setLoading(false);
    }
  };

  const handleManualVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualId.trim()) verifyBatch(manualId.trim());
  };

  const isRecalled = batchInfo?.status === 'recalled';
  const isExpired = batchInfo?.expiry_date && new Date(batchInfo.expiry_date) < new Date();
  const safetyScore = risk ? Math.max(0, 100 - risk.riskScore) : null;
  const medicineName = ipfsMetadata?.medicineName || batchInfo?.medicine_name || 'Unknown Medicine';
  const manufacturer = ipfsMetadata?.manufacturer || batchInfo?.manufacturer_name || 'Unknown';
  const expiry = ipfsMetadata?.expiryDate || (batchInfo?.expiry_date ? new Date(batchInfo.expiry_date).toLocaleDateString() : null);

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-b from-primary/[0.03] to-background border-b border-border">
        <div className="container max-w-lg py-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/[0.07]">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-[28px] font-bold tracking-tight text-foreground">
            Medicine Safety Check
          </h1>
          <p className="mt-2 text-[15px] text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Scan or enter the code on your medicine to check if it's safe to use
          </p>
        </div>
      </div>

      <div className="container max-w-lg py-8">
        <div className="flex flex-col gap-5">
          {/* Scanner Card */}
          <div className="apple-card p-6">
            <div
              id="consumer-qr-reader"
              ref={scannerRef}
              className={scanning ? 'rounded-2xl overflow-hidden mb-4 apple-shadow' : 'hidden'}
            />
            {!scanning ? (
              <Button onClick={startScanner} className="w-full h-14 rounded-2xl text-[15px] font-semibold glow-primary gap-3">
                <Camera className="h-5 w-5" /> Scan Medicine QR Code
              </Button>
            ) : (
              <Button variant="outline" onClick={stopScanner} className="w-full h-12 rounded-xl text-[14px] font-medium border-destructive/20 text-destructive hover:bg-destructive/5">
                Stop Camera
              </Button>
            )}

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-[0.08em]">
                <span className="bg-card px-3 text-muted-foreground font-medium">or type the batch code</span>
              </div>
            </div>

            <form onSubmit={handleManualVerify} className="flex gap-2">
              <Input
                placeholder="e.g. BATCH-2026-001"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                className="h-11 rounded-xl text-[14px] flex-1 bg-muted/50 border-border"
              />
              <Button type="submit" disabled={loading} className="h-11 rounded-xl px-5">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </form>
          </div>

          {/* Progress indicator */}
          {verifyStatus && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 p-4 rounded-2xl bg-primary/[0.03] border border-primary/10"
            >
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-[14px] text-foreground font-medium">{verifyStatus}</span>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {/* ═══ RECALLED ALERT ═══ */}
            {isRecalled && (
              <motion.div
                key="recalled"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="apple-card border-2 border-destructive p-8 flex flex-col items-center gap-4 bg-destructive/[0.03]"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-destructive/10">
                  <AlertOctagon className="h-10 w-10 text-destructive" />
                </div>
                <h2 className="text-[22px] font-bold text-destructive text-center">
                  🚨 THIS MEDICINE HAS BEEN RECALLED
                </h2>
                <p className="text-[15px] text-destructive/80 text-center font-medium">
                  DO NOT USE this medicine. Return it to your pharmacy immediately.
                </p>
                {batchInfo?.recalled_at && (
                  <p className="text-[12px] text-muted-foreground">
                    Recalled on {new Date(batchInfo.recalled_at).toLocaleDateString()}
                  </p>
                )}
                <Link to="/report">
                  <Button variant="destructive" className="rounded-xl gap-2 mt-2">
                    <Flag className="h-4 w-4" /> Report This Medicine
                  </Button>
                </Link>
              </motion.div>
            )}

            {/* ═══ MAIN SAFETY RESULT ═══ */}
            {result && !isRecalled && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col gap-5"
              >
                {/* Large Safety Badge */}
                <div className={`apple-card border p-8 flex flex-col items-center gap-5 ${safetyConfig[result].bg} ${safetyConfig[result].glow}`}>
                  <div className={`flex h-24 w-24 items-center justify-center rounded-[28px] ${
                    result === 'authentic' ? 'bg-success/10' : result === 'suspicious' ? 'bg-warning/10' : 'bg-destructive/10'
                  }`}>
                    {React.createElement(safetyConfig[result].icon, { className: `h-12 w-12 ${safetyConfig[result].color}` })}
                  </div>
                  <div className="text-center">
                    <h2 className={`text-[24px] font-bold ${safetyConfig[result].color}`}>
                      {safetyConfig[result].emoji} {safetyConfig[result].label}
                    </h2>
                    <p className="text-[14px] text-muted-foreground mt-1.5 max-w-xs">
                      {safetyConfig[result].sublabel}
                    </p>
                  </div>

                  {/* Safety Score */}
                  {safetyScore !== null && (
                    <div className="w-full max-w-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[13px] font-medium text-foreground">Safety Score</span>
                        <span className={`text-[13px] font-bold ${safetyScoreLabel(safetyScore).color}`}>
                          {safetyScore}/100 — {safetyScoreLabel(safetyScore).label}
                        </span>
                      </div>
                      <div className="h-3 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }} animate={{ width: `${safetyScore}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className={`h-full rounded-full ${
                            safetyScore >= 60 ? 'bg-success' : safetyScore >= 40 ? 'bg-warning' : 'bg-destructive'
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Expired warning */}
                  {isExpired && (
                    <div className="w-full flex items-center gap-3 p-4 rounded-2xl bg-warning/[0.06] border border-warning/20">
                      <Clock className="h-5 w-5 text-warning shrink-0" />
                      <div>
                        <p className="text-[14px] font-semibold text-warning">Medicine Expired</p>
                        <p className="text-[12px] text-muted-foreground">
                          Do not use expired medicine. Return to your pharmacy.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Last verified */}
                  <p className="text-[12px] text-muted-foreground">
                    Checked at {new Date().toLocaleString()}
                  </p>
                </div>

                {/* ═══ MEDICINE DETAILS CARD ═══ */}
                {result !== 'not_found' && (ipfsMetadata || batchInfo) && (
                  <div className="apple-card p-6">
                    <h3 className="text-[15px] font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Pill className="h-4 w-4 text-primary" /> Medicine Details
                    </h3>
                    <div className="flex flex-col gap-3">
                      <DetailRow label="Medicine Name" value={medicineName} icon={Pill} />
                      <DetailRow label="Manufacturer" value={manufacturer} icon={Package} />
                      {(ipfsMetadata?.dosage || batchInfo?.dosage) && (
                        <DetailRow label="Dosage" value={ipfsMetadata?.dosage || batchInfo?.dosage || ''} icon={Package} />
                      )}
                      {expiry && (
                        <DetailRow
                          label="Expiry Date"
                          value={`${expiry} — ${expiryCountdown(batchInfo?.expiry_date || ipfsMetadata?.expiryDate || '').label}`}
                          icon={Calendar}
                          highlight={expiryCountdown(batchInfo?.expiry_date || ipfsMetadata?.expiryDate || '').urgent}
                        />
                      )}
                      {(ipfsMetadata?.countryOrigin || batchInfo?.country_of_origin) && (
                        <DetailRow label="Country of Origin" value={ipfsMetadata?.countryOrigin || batchInfo?.country_of_origin || ''} icon={Globe} />
                      )}
                    </div>
                  </div>
                )}

                {/* ═══ MANUFACTURER TRUST SCORE ═══ */}
                {trustScore && (
                  <div className="apple-card p-6">
                    <h3 className="text-[15px] font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Star className="h-4 w-4 text-primary" /> Manufacturer Trust
                    </h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[14px] font-medium text-foreground">{trustScore.name}</p>
                        <p className="text-[12px] text-muted-foreground mt-0.5">Based on verification history & reports</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${i < trustLevelFromScore(trustScore.score).stars ? 'text-warning fill-warning' : 'text-muted-foreground/20'}`}
                            />
                          ))}
                        </div>
                        <p className={`text-[13px] font-semibold mt-1 ${
                          trustScore.score >= 80 ? 'text-success' : trustScore.score >= 50 ? 'text-warning' : 'text-destructive'
                        }`}>
                          Trust Level: {trustLevelFromScore(trustScore.score).label}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ═══ ANOMALY FLAGS (friendly language) ═══ */}
                {risk && risk.flags.length > 0 && (
                  <div className="apple-card p-6">
                    <h3 className="text-[15px] font-semibold text-foreground mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning" /> Safety Notices
                    </h3>
                    <div className="flex flex-col gap-2">
                      {risk.flags.map((flag, i) => (
                        <div key={i} className="text-[13px] text-foreground bg-warning/[0.04] border border-warning/15 rounded-xl px-4 py-3 flex items-start gap-2.5">
                          <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                          <span>{flag}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ═══ MEDICINE JOURNEY ═══ */}
                {supplyEvents.length > 0 && (
                  <div className="apple-card p-6">
                    <h3 className="text-[15px] font-semibold text-foreground mb-5 flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-primary" /> Medicine Journey
                    </h3>
                    {/* Simple visual journey bar */}
                    <div className="flex items-center justify-between mb-6 px-2">
                      {['Manufacturer', 'Distributor', 'Pharmacy', 'You'].map((step, i) => {
                        const reached = i <= Math.min(supplyEvents.length, 3);
                        return (
                          <div key={step} className="flex flex-col items-center gap-1.5 flex-1">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-bold ${
                              reached ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            }`}>
                              {i + 1}
                            </div>
                            <span className={`text-[10px] font-medium ${reached ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {step}
                            </span>
                            {i < 3 && (
                              <div className={`absolute h-0.5 w-full ${reached ? 'bg-primary' : 'bg-muted'}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <SupplyChainTimeline events={supplyEvents} />
                  </div>
                )}

                {/* ═══ REPORT BUTTON ═══ */}
                {result === 'suspicious' && (
                  <Link to={`/report?batch=${scannedId}`}>
                    <Button variant="outline" className="w-full h-12 rounded-2xl gap-2 border-warning/30 text-warning hover:bg-warning/5 text-[14px] font-medium">
                      <Flag className="h-4 w-4" /> Report This Medicine
                    </Button>
                  </Link>
                )}

                {result === 'authentic' && (
                  <div className="apple-card p-5 text-center">
                    <p className="text-[13px] text-muted-foreground">
                      ✅ This medicine is safe to use. If anything seems wrong, you can{' '}
                      <Link to={`/report?batch=${scannedId}`} className="text-primary font-medium underline underline-offset-2">
                        report an issue
                      </Link>.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}

function DetailRow({ label, value, icon: Icon, highlight }: {
  label: string; value: string; icon: React.ElementType; highlight?: boolean;
}) {
  if (!value || value === 'N/A') return null;
  return (
    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/50">
      <Icon className={`h-4 w-4 shrink-0 ${highlight ? 'text-warning' : 'text-muted-foreground'}`} />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className={`text-[13px] font-medium ${highlight ? 'text-warning' : 'text-foreground'}`}>{value}</p>
      </div>
    </div>
  );
}
