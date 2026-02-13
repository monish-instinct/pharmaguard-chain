import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { supabase } from '@/integrations/supabase/client';
import type { AppRole, WalletUser } from '@/types';

interface AuthContextType {
  walletAddress: string | null;
  user: WalletUser | null;
  activeRole: AppRole | null;
  loading: boolean;
  connecting: boolean;
  demoMode: boolean;
  demoRole: AppRole;
  setDemoMode: (v: boolean) => void;
  setDemoRole: (r: AppRole) => void;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  setUserRole: (role: AppRole) => Promise<void>;
  isMetaMaskInstalled: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const WALLET_KEY = 'pharmashield_wallet';
const ROLE_KEY = 'pharmashield_role';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [user, setUser] = useState<WalletUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [demoRole, setDemoRole] = useState<AppRole>('manufacturer');

  const isMetaMaskInstalled = typeof window !== 'undefined' && !!(window as any).ethereum?.isMetaMask;

  const fetchOrCreateUser = useCallback(async (address: string): Promise<WalletUser | null> => {
    try {
      const normalizedAddress = address.toLowerCase();

      // Check if user exists in Supabase
      const { data: existing } = await supabase
        .from('wallet_users')
        .select('*')
        .eq('wallet_address', normalizedAddress)
        .maybeSingle();

      if (existing) {
        const walletUser: WalletUser = {
          walletAddress: existing.wallet_address,
          role: existing.role as AppRole,
          displayName: existing.display_name,
          organization: existing.organization,
          createdAt: existing.created_at,
        };
        return walletUser;
      }

      // Auto-create new user record
      const savedRole = localStorage.getItem(ROLE_KEY) as AppRole | null;
      const role = savedRole || 'manufacturer';

      const { data: newUser, error } = await supabase
        .from('wallet_users')
        .insert({
          wallet_address: normalizedAddress,
          role,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating wallet user:', error);
        // Fallback: return local user if DB fails
        return {
          walletAddress: normalizedAddress,
          role,
          displayName: null,
          organization: null,
          createdAt: new Date().toISOString(),
        };
      }

      return {
        walletAddress: newUser.wallet_address,
        role: newUser.role as AppRole,
        displayName: newUser.display_name,
        organization: newUser.organization,
        createdAt: newUser.created_at,
      };
    } catch {
      // Fallback for when Supabase tables don't exist yet
      const savedRole = localStorage.getItem(ROLE_KEY) as AppRole | null;
      return {
        walletAddress: address.toLowerCase(),
        role: savedRole || 'manufacturer',
        displayName: null,
        organization: null,
        createdAt: new Date().toISOString(),
      };
    }
  }, []);

  // Restore wallet on load
  useEffect(() => {
    const restore = async () => {
      const saved = localStorage.getItem(WALLET_KEY);
      if (saved && isMetaMaskInstalled) {
        try {
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          const accounts = await provider.listAccounts();
          const match = accounts.find(
            (acc) => acc.address.toLowerCase() === saved.toLowerCase()
          );
          if (match) {
            setWalletAddress(match.address.toLowerCase());
            const userData = await fetchOrCreateUser(match.address);
            setUser(userData);
          } else {
            localStorage.removeItem(WALLET_KEY);
          }
        } catch {
          localStorage.removeItem(WALLET_KEY);
        }
      }
      setLoading(false);
    };
    restore();
  }, [isMetaMaskInstalled, fetchOrCreateUser]);

  // Listen for account changes
  useEffect(() => {
    if (!isMetaMaskInstalled) return;
    const eth = (window as any).ethereum;

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        const addr = accounts[0].toLowerCase();
        setWalletAddress(addr);
        localStorage.setItem(WALLET_KEY, addr);
        const userData = await fetchOrCreateUser(addr);
        setUser(userData);
      }
    };

    eth.on('accountsChanged', handleAccountsChanged);
    return () => eth.removeListener('accountsChanged', handleAccountsChanged);
  }, [isMetaMaskInstalled, fetchOrCreateUser]);

  const connectWallet = async () => {
    if (!isMetaMaskInstalled) {
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setConnecting(true);
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const address = accounts[0].toLowerCase();

      // Sign a message for verification (non-transaction)
      const signer = await provider.getSigner();
      const message = `Sign in to PharmaShield\nWallet: ${address}\nTimestamp: ${Date.now()}`;
      await signer.signMessage(message);

      setWalletAddress(address);
      localStorage.setItem(WALLET_KEY, address);

      const userData = await fetchOrCreateUser(address);
      setUser(userData);
    } catch (err: any) {
      console.error('Wallet connection failed:', err);
      throw err;
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setUser(null);
    setDemoMode(false);
    localStorage.removeItem(WALLET_KEY);
    localStorage.removeItem(ROLE_KEY);
  };

  const setUserRole = async (role: AppRole) => {
    if (!walletAddress) return;
    localStorage.setItem(ROLE_KEY, role);

    try {
      await supabase
        .from('wallet_users')
        .update({ role })
        .eq('wallet_address', walletAddress);
    } catch {
      // Silently fail if table doesn't exist
    }

    setUser((prev) => prev ? { ...prev, role } : null);
  };

  const activeRole: AppRole | null = demoMode
    ? demoRole
    : (user?.role ?? null);

  return (
    <AuthContext.Provider
      value={{
        walletAddress,
        user,
        activeRole,
        loading,
        connecting,
        demoMode,
        demoRole,
        setDemoMode,
        setDemoRole,
        connectWallet,
        disconnectWallet,
        setUserRole,
        isMetaMaskInstalled,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
