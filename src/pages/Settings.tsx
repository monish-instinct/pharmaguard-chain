import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { getContractAddress, setContractAddress, isBlockchainConfigured } from '@/lib/blockchain';
import { Settings2, Link as LinkIcon, FlaskConical } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const { demoMode, setDemoMode } = useAuth();
  const [address, setAddress] = useState(getContractAddress() || '');

  const saveContract = () => {
    setContractAddress(address);
    toast.success(address ? 'Contract address saved' : 'Contract address cleared');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Settings2 className="h-6 w-6 text-white" />
            </div>
            Settings
          </h1>
          <p className="text-lg text-foreground/60">Manage your PharmaShield configuration and preferences</p>
        </div>

        {/* Settings Grid */}
        <div className="space-y-6">
          {/* Demo Mode Card */}
          <div className="glass rounded-2xl p-6 shadow-md-ios hover:shadow-lg-ios transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                    <FlaskConical className="h-5 w-5 text-accent" />
                  </div>
                  Demo Mode
                </h2>
                <p className="text-sm text-foreground/60">
                  Test all features without signing in. Perfect for demos and testing.
                </p>
              </div>
              <Switch id="demo-toggle" checked={demoMode} onCheckedChange={setDemoMode} />
            </div>
            {demoMode && (
              <div className="mt-4 p-3 rounded-lg bg-accent/5 border border-accent/20 text-sm text-foreground/70">
                Demo mode is active. You can explore all features without authentication.
              </div>
            )}
          </div>

          {/* Blockchain Configuration Card */}
          <div className="glass rounded-2xl p-6 shadow-md-ios hover:shadow-lg-ios transition-all">
            <div className="mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <LinkIcon className="h-5 w-5 text-primary" />
                </div>
                Smart Contract
              </h2>
              <p className="text-sm text-foreground/60">
                Configure your deployed PharmaShield contract on Polygon Mumbai testnet
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contract" className="font-medium">Contract Address</Label>
                <Input
                  id="contract"
                  placeholder="0x..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="font-mono rounded-xl h-11"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border">
                <span className="text-sm">
                  <span className="text-foreground/60">Status: </span>
                  {isBlockchainConfigured() ? (
                    <span className="text-primary font-semibold">✓ Connected</span>
                  ) : (
                    <span className="text-foreground/60">Using Supabase fallback</span>
                  )}
                </span>
              </div>

              <Button 
                onClick={saveContract}
                className="w-full rounded-xl py-2.5 font-semibold shadow-md-ios hover:shadow-lg-ios transition-all"
              >
                Save Configuration
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="glass rounded-2xl p-6 shadow-sm-ios">
            <h2 className="text-lg font-semibold mb-4">Documentation</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <a
                href="#"
                className="p-3 rounded-lg bg-background/50 hover:bg-background transition-colors"
              >
                <p className="font-medium text-sm">Deployment Guide</p>
                <p className="text-xs text-foreground/60 mt-1">Learn how to deploy the contract</p>
              </a>
              <a
                href="#"
                className="p-3 rounded-lg bg-background/50 hover:bg-background transition-colors"
              >
                <p className="font-medium text-sm">Integration Guide</p>
                <p className="text-xs text-foreground/60 mt-1">Complete API reference</p>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
