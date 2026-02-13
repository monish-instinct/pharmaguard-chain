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
    <div className="container max-w-2xl py-8">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
        <Settings2 className="h-6 w-6 text-primary" />
        Settings
      </h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FlaskConical className="h-5 w-5" />
              Demo Mode
            </CardTitle>
            <CardDescription>
              Toggle demo mode to quickly switch between roles without authentication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="demo-toggle">Enable Demo Mode</Label>
              <Switch id="demo-toggle" checked={demoMode} onCheckedChange={setDemoMode} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Smart Contract
            </CardTitle>
            <CardDescription>
              Configure the deployed PharmaShield contract address on Polygon testnet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contract">Contract Address</Label>
              <Input
                id="contract"
                placeholder="0x..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Status: {isBlockchainConfigured() ? '✅ Connected' : '⚠️ Not configured (using Supabase fallback)'}
              </span>
              <Button onClick={saveContract}>Save</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
