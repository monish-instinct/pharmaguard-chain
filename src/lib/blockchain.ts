import { ethers } from 'ethers';

const CONTRACT_ABI = [
  "function registerBatch(string batchId, string manufacturerName, string batchHash) external",
  "function verifyBatch(string batchId) external view returns (string manufacturerName, string batchHash, uint256 timestamp, bool exists)"
];

export const getContractAddress = (): string | null => {
  return localStorage.getItem('pharma_contract_address');
};

export const setContractAddress = (address: string) => {
  localStorage.setItem('pharma_contract_address', address);
};

export const isBlockchainConfigured = (): boolean => {
  const addr = getContractAddress();
  return !!addr && ethers.isAddress(addr);
};

const getProvider = () => {
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    return new ethers.BrowserProvider((window as any).ethereum);
  }
  return null;
};

export const registerBatchOnChain = async (
  batchId: string,
  manufacturerName: string,
  batchHash: string
): Promise<string | null> => {
  const addr = getContractAddress();
  if (!addr) {
    console.warn('[v0] No contract address configured');
    return null;
  }

  const provider = getProvider();
  if (!provider) {
    console.warn('[v0] MetaMask not available');
    return null;
  }

  try {
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(addr, CONTRACT_ABI, signer);
    
    console.log('[v0] Registering batch on blockchain:', { batchId, manufacturerName });
    
    const tx = await contract.registerBatch(batchId, manufacturerName, batchHash);
    console.log('[v0] Transaction sent:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('[v0] Transaction confirmed:', receipt?.hash);
    
    return tx.hash;
  } catch (error: any) {
    if (error.code === 'ACTION_REJECTED') {
      console.warn('[v0] User rejected transaction');
    } else if (error.code === 'INSUFFICIENT_FUNDS') {
      console.error('[v0] Insufficient gas/MATIC balance');
    } else if (error.reason) {
      console.error('[v0] Blockchain error:', error.reason);
    } else {
      console.error('[v0] Blockchain registration failed:', error);
    }
    return null;
  }
};

export const verifyBatchOnChain = async (
  batchId: string
): Promise<{ exists: boolean; manufacturerName?: string; batchHash?: string } | null> => {
  const addr = getContractAddress();
  if (!addr) {
    console.warn('[v0] No contract address configured for verification');
    return null;
  }

  const provider = getProvider();
  if (!provider) {
    console.warn('[v0] Web3 provider not available for verification');
    return null;
  }

  try {
    console.log('[v0] Verifying batch on blockchain:', batchId);
    
    const contract = new ethers.Contract(addr, CONTRACT_ABI, provider);
    const result = await contract.verifyBatch(batchId);
    
    console.log('[v0] Blockchain verification result:', { exists: result[3] });
    
    return {
      exists: result[3],
      manufacturerName: result[0],
      batchHash: result[1],
    };
  } catch (error: any) {
    if (error.code === 'CALL_EXCEPTION') {
      console.warn('[v0] Batch not found on blockchain');
      return { exists: false };
    } else if (error.code === 'NETWORK_ERROR') {
      console.error('[v0] Network error during blockchain verification');
    } else {
      console.error('[v0] Blockchain verification error:', error.message);
    }
    return null;
  }
};

export const generateBatchHash = async (batchId: string, manufacturer: string): Promise<string> => {
  const data = `${batchId}:${manufacturer}:${Date.now()}`;
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
};
