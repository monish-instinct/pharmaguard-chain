import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Wallet, Loader2, CheckCircle } from 'lucide-react';
import { isMetaMaskAvailable, shortenAddress } from '@/lib/wallet';
import { toast } from 'sonner';
import type { AppRole } from '@/types';

const roleRedirectMap: Record<AppRole, string> = {
  manufacturer: '/register',
  distributor: '/verify',
  pharmacy: '/verify',
  consumer: '/consumer',
  regulator: '/dashboard',
  auditor: '/audit',
};

export default function Login() {
  const navigate = useNavigate();
  const { connectWithWallet, walletConnecting, walletAddress, user, roles, loading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<AppRole>('manufacturer');
  const [savingRole, setSavingRole] = useState(false);

  const isConnected = !!walletAddress && !!user;
  const hasRole = roles.length > 0;

  useEffect(() => {
    if (!loading && isConnected && hasRole) {
      const targetPath = roleRedirectMap[roles[0]] || '/';
      navigate(targetPath, { replace: true });
    }
  }, [loading, isConnected, hasRole, roles, navigate]);

  const handleConnect = async () => {
    await connectWithWallet();
  };

  const handleSaveRole = async () => {
    if (!user) return;
    setSavingRole(true);
    try {
      const { error } = await supabase.from('user_roles').insert({
        user_id: user.id,
        role: selectedRole,
      });
      if (error) {
        if (error.code === '23505') {
          // Duplicate — user already has this role
        } else {
          throw error;
        }
      }
      toast.success('Role assigned! Redirecting...');
      const targetPath = roleRedirectMap[selectedRole] || '/';
      setTimeout(() => navigate(targetPath, { replace: true }), 400);
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign role');
    } finally {
      setSavingRole(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background to-muted/20 pointer-events-none" />

      <div className="w-full max-w-sm animate-scale-in relative z-10">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary glow-primary">
            <Shield className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-[20px] font-bold tracking-tight text-foreground">
            {isConnected ? 'Select Your Role' : 'Connect Wallet'}
          </h1>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            {isConnected
              ? "Choose how you'll use PharmaShield"
              : 'Sign in with your MetaMask wallet'}
          </p>
        </div>

        <div className="apple-card p-6">
          {!isConnected ? (
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleConnect}
                disabled={walletConnecting || !isMetaMaskAvailable()}
                className="w-full h-12 rounded-xl text-[14px] font-medium glow-primary justify-start gap-3 px-5"
              >
                {walletConnecting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Wallet className="h-5 w-5" />
                )}
                {isMetaMaskAvailable() ? 'Connect MetaMask' : 'MetaMask Not Detected'}
              </Button>

              {!isMetaMaskAvailable() && (
                <p className="text-[12px] text-muted-foreground text-center mt-2">
                  MetaMask not detected. Please install the MetaMask extension to continue.
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-success/[0.04] border border-success/20">
                <CheckCircle className="h-5 w-5 text-success shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-foreground">Wallet Connected</p>
                  <p className="text-[12px] font-mono text-muted-foreground">{shortenAddress(walletAddress)}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-foreground">Your Role</label>
                <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppRole)}>
                  <SelectTrigger className="h-11 rounded-xl text-[14px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manufacturer">Manufacturer</SelectItem>
                    <SelectItem value="distributor">Distributor</SelectItem>
                    <SelectItem value="pharmacy">Pharmacy</SelectItem>
                    <SelectItem value="consumer">Consumer</SelectItem>
                    <SelectItem value="regulator">Regulator</SelectItem>
                    <SelectItem value="auditor">Auditor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleSaveRole}
                disabled={savingRole}
                className="w-full h-11 rounded-xl text-[14px] font-medium glow-primary"
              >
                {savingRole ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Continue'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
