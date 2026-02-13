import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { getContractAddress, setContractAddress, isBlockchainConfigured } from '@/lib/blockchain';
import { shortenAddress } from '@/lib/wallet';
import { generateDemoData } from '@/lib/demo';
import { Settings2, Link as LinkIcon, FlaskConical, CheckCircle, AlertCircle, Wallet, Copy, Loader2, Database } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const { demoMode, setDemoMode, walletAddress, user } = useAuth();
  const [address, setAddress] = useState(getContractAddress() || '');
  const [generatingDemo, setGeneratingDemo] = useState(false);

  const saveContract = () => {
    setContractAddress(address);
    toast.success(address ? 'Contract address saved' : 'Contract address cleared');
  };

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast.success('Address copied to clipboard');
    }
  };

  const handleGenerateDemo = async () => {
    if (!user) return;
    setGeneratingDemo(true);
    try {
      await generateDemoData(user.id);
      toast.success('Demo data generated! Check Dashboard and other pages.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate demo data');
    } finally {
      setGeneratingDemo(false);
    }
  };

  const blockchainReady = isBlockchainConfigured();

  return (
    <main className="container max-w-xl py-10 animate-fade-in">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 glow-primary">
          <Settings2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="text-[13px] text-muted-foreground">Configure app behavior and integrations</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Wallet Info */}
        {walletAddress && (
          <div className="apple-card p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 glow-primary">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-[15px] font-semibold text-foreground">Connected Wallet</h2>
                <p className="text-[13px] font-mono text-muted-foreground mt-1 break-all">{walletAddress}</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">{shortenAddress(walletAddress)}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={copyAddress} className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Demo Mode */}
        <div className="apple-card p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/10 glow-warning">
              <FlaskConical className="h-5 w-5 text-warning" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-[15px] font-semibold text-foreground">Demo Mode</h2>
              <p className="text-[13px] text-muted-foreground mt-0.5 leading-relaxed">
                Switch between roles without wallet authentication. Perfect for presentations.
              </p>
            </div>
            <Switch id="demo-toggle" checked={demoMode} onCheckedChange={setDemoMode} className="shrink-0 mt-0.5" />
          </div>
        </div>

        {/* Generate Demo Data */}
        {user && (
          <div className="apple-card p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 glow-primary">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-[15px] font-semibold text-foreground">Generate Demo Data</h2>
                <p className="text-[13px] text-muted-foreground mt-0.5 leading-relaxed">
                  Populate the system with sample batches, scans, alerts, and supply chain events for demonstration.
                </p>
                <Button
                  onClick={handleGenerateDemo}
                  disabled={generatingDemo}
                  variant="outline"
                  className="mt-3 h-9 rounded-lg text-[13px] font-medium"
                >
                  {generatingDemo ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
                  Generate Sample Data
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Smart Contract */}
        <div className="apple-card p-6">
          <div className="flex items-start gap-4 mb-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 glow-primary">
              <LinkIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-[15px] font-semibold text-foreground">Smart Contract</h2>
              <p className="text-[13px] text-muted-foreground mt-0.5 leading-relaxed">
                Configure the deployed PharmaShield contract address on Ethereum Sepolia testnet.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="contract" className="text-[13px] font-medium text-foreground">Contract Address</Label>
              <Input id="contract" placeholder="0x..." value={address} onChange={(e) => setAddress(e.target.value)} className="h-11 rounded-xl font-mono text-[13px]" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {blockchainReady ? (
                  <>
                    <CheckCircle className="h-3.5 w-3.5 text-success" />
                    <span className="text-[12px] text-success font-medium">Connected</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[12px] text-muted-foreground">Not configured (Supabase fallback)</span>
                  </>
                )}
              </div>
              <Button onClick={saveContract} className="h-9 px-5 rounded-lg text-[13px] font-medium">Save</Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
