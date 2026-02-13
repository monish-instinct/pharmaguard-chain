import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { getContractAddress, setContractAddress, isBlockchainConfigured } from '@/lib/blockchain';
import { Settings2, Link as LinkIcon, FlaskConical, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const { demoMode, setDemoMode } = useAuth();
  const [address, setAddress] = useState(getContractAddress() || '');

  const saveContract = () => {
    setContractAddress(address);
    toast.success(address ? 'Contract address saved' : 'Contract address cleared');
  };

  const blockchainReady = isBlockchainConfigured();

  return (
    <main className="container max-w-xl py-10 animate-fade-in">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Settings2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="text-[13px] text-muted-foreground">Configure app behavior and integrations</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Demo Mode */}
        <div className="apple-card p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/10">
              <FlaskConical className="h-5 w-5 text-warning" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-[15px] font-semibold text-foreground">Demo Mode</h2>
              <p className="text-[13px] text-muted-foreground mt-0.5 leading-relaxed">
                Quickly switch between roles without authentication. Perfect for testing all features.
              </p>
            </div>
            <Switch
              id="demo-toggle"
              checked={demoMode}
              onCheckedChange={setDemoMode}
              className="shrink-0 mt-0.5"
            />
          </div>
        </div>

        {/* Smart Contract */}
        <div className="apple-card p-6">
          <div className="flex items-start gap-4 mb-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <LinkIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-[15px] font-semibold text-foreground">Smart Contract</h2>
              <p className="text-[13px] text-muted-foreground mt-0.5 leading-relaxed">
                Configure the deployed PharmaShield contract address on Polygon testnet.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="contract" className="text-[13px] font-medium">Contract Address</Label>
              <Input
                id="contract"
                placeholder="0x..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="h-11 rounded-xl bg-secondary/50 border-border/50 font-mono text-[13px]"
              />
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
              <Button onClick={saveContract} className="h-9 px-5 rounded-lg text-[13px] font-medium">
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
