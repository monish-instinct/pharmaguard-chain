import { ethers } from 'ethers';

export type WalletType = 'metamask' | 'phantom';

export const isMetaMaskAvailable = (): boolean => {
  return typeof window !== 'undefined' && !!(window as any).ethereum?.isMetaMask;
};

export const isPhantomAvailable = (): boolean => {
  return typeof window !== 'undefined' && !!(window as any).phantom?.ethereum;
};

export const getProvider = (wallet: WalletType): any | null => {
  if (wallet === 'phantom') {
    return (window as any).phantom?.ethereum ?? null;
  }
  return (window as any).ethereum ?? null;
};

export const connectWallet = async (wallet: WalletType): Promise<string | null> => {
  const provider = getProvider(wallet);
  if (!provider) return null;

  try {
    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    return accounts[0] ?? null;
  } catch {
    return null;
  }
};

export const signMessage = async (wallet: WalletType, message: string): Promise<string | null> => {
  const provider = getProvider(wallet);
  if (!provider) return null;

  try {
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    return await signer.signMessage(message);
  } catch {
    return null;
  }
};

export const shortenAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const getNonce = (): string => {
  return `Sign in to PharmaShield\n\nNonce: ${crypto.randomUUID()}\nTimestamp: ${new Date().toISOString()}`;
};
