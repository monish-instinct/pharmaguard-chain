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
  if (!addr) return null;

  const provider = getProvider();
  if (!provider) return null;

  try {
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(addr, CONTRACT_ABI, signer);
    const tx = await contract.registerBatch(batchId, manufacturerName, batchHash);
    await tx.wait();
    return tx.hash;
  } catch (e) {
    console.error('Blockchain registration failed:', e);
    return null;
  }
};

export const verifyBatchOnChain = async (
  batchId: string
): Promise<{ exists: boolean; manufacturerName?: string; batchHash?: string } | null> => {
  const addr = getContractAddress();
  if (!addr) return null;

  const provider = getProvider();
  if (!provider) return null;

  try {
    const contract = new ethers.Contract(addr, CONTRACT_ABI, provider);
    const result = await contract.verifyBatch(batchId);
    return {
      exists: result[3],
      manufacturerName: result[0],
      batchHash: result[1],
    };
  } catch (e) {
    console.error('Blockchain verification failed:', e);
    return null;
  }
};

export const generateBatchHash = async (batchId: string, manufacturer: string): Promise<string> => {
  const data = `${batchId}:${manufacturer}:${Date.now()}`;
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
};
