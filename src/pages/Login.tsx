import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Wallet, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import type { AppRole } from '@/types';

export default function Login() {
  const navigate = useNavigate();
  const { connectWallet, connecting, isMetaMaskInstalled, setDemoMode, setDemoRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState<AppRole>('manufacturer');
  const [step, setStep] = useState<'role' | 'connect'>('role');

  const handleWalletConnect = async () => {
    try {
      await connectWallet();
      toast.success('Wallet connected successfully');
      navigate('/');
    } catch (err: any) {
      if (err?.code === 4001) {
        toast.error('Connection rejected. Please approve the signature request.');
      } else {
        toast.error('Failed to connect wallet. Please try again.');
      }
    }
  };

  const handleDemoMode = () => {
    setDemoMode(true);
    setDemoRole(selectedRole);
    toast.success(`Demo mode enabled as ${selectedRole}`);
    navigate('/');
  };

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4 relative">
      {/* Ambient glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[rgba(59,130,246,0.06)] rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-[rgba(168,85,247,0.04)] rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-sm animate-scale-in relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgba(59,130,246,0.15)] border border-[rgba(59,130,246,0.2)]" style={{ boxShadow: '0 0 30px rgba(59,130,246,0.15)' }}>
            <Shield className="h-8 w-8 text-[#3b82f6]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            PharmaShield
          </h1>
          <p className="mt-2 text-[13px] text-muted-foreground leading-relaxed">
            Blockchain-powered drug verification
          </p>
        </div>

        {step === 'role' ? (
          <div className="apple-card p-6 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-medium text-foreground">Select Your Role</label>
              <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppRole)}>
                <SelectTrigger className="h-12 rounded-xl bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] text-[14px] text-foreground focus:border-[rgba(59,130,246,0.4)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manufacturer">Manufacturer</SelectItem>
                  <SelectItem value="pharmacy">Pharmacy / Distributor</SelectItem>
                  <SelectItem value="regulator">Regulator</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground mt-1">
                {selectedRole === 'manufacturer' && 'Register and manage drug batches on-chain'}
                {selectedRole === 'pharmacy' && 'Verify and scan drug authenticity'}
                {selectedRole === 'regulator' && 'Monitor supply chain and audit activity'}
              </p>
            </div>

            <Button
              onClick={() => setStep('connect')}
              className="w-full h-12 rounded-xl text-[14px] font-medium bg-[#3b82f6] hover:bg-[#2563eb] text-white"
              style={{ boxShadow: '0 0 20px rgba(59,130,246,0.25)' }}
            >
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
            </div>

            <Button
              variant="outline"
              onClick={handleDemoMode}
              className="w-full h-11 rounded-xl text-[13px] border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.05)] text-muted-foreground hover:text-foreground"
            >
              Try Demo Mode
            </Button>
          </div>
        ) : (
          <div className="apple-card p-6 flex flex-col gap-5">
            {/* Back button */}
            <button
              onClick={() => setStep('role')}
              className="text-[13px] text-muted-foreground hover:text-foreground flex items-center gap-1 self-start transition-colors"
            >
              <ArrowRight className="h-3 w-3 rotate-180" />
              Back
            </button>

            <div className="text-center py-2">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)]">
                <Wallet className="h-6 w-6 text-muted-foreground" />
              </div>
              <h2 className="text-[15px] font-semibold text-foreground">Connect Wallet</h2>
              <p className="text-[12px] text-muted-foreground mt-1">
                Sign a message to verify ownership
              </p>
            </div>

            {!isMetaMaskInstalled ? (
              <div className="rounded-xl bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.15)] p-4 flex gap-3">
                <AlertCircle className="h-4 w-4 text-[#ef4444] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[13px] font-medium text-foreground">MetaMask Required</p>
                  <p className="text-[12px] text-muted-foreground mt-0.5">Install the MetaMask browser extension to continue.</p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-[rgba(34,197,94,0.06)] border border-[rgba(34,197,94,0.12)] p-3 flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#22c55e] shrink-0" />
                <span className="text-[12px] text-muted-foreground">MetaMask detected</span>
              </div>
            )}

            <Button
              onClick={handleWalletConnect}
              disabled={connecting || !isMetaMaskInstalled}
              className="w-full h-12 rounded-xl text-[14px] font-medium bg-[#f6851b] hover:bg-[#e2761b] text-white disabled:opacity-40"
              style={{ boxShadow: isMetaMaskInstalled ? '0 0 20px rgba(246,133,27,0.2)' : 'none' }}
            >
              {connecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Connecting...
                </>
              ) : !isMetaMaskInstalled ? (
                'Install MetaMask'
              ) : (
                <>
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect MetaMask
                </>
              )}
            </Button>

            <p className="text-[11px] text-center text-muted-foreground/60 leading-relaxed">
              No gas fees. You will only sign a verification message.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
