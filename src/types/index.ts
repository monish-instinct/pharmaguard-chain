export type AppRole = 'manufacturer' | 'pharmacy' | 'regulator';

export interface WalletUser {
  walletAddress: string;
  role: AppRole;
  displayName: string | null;
  organization: string | null;
  createdAt: string;
}

export interface Batch {
  id: string;
  batch_id: string;
  manufacturer_name: string;
  batch_hash: string;
  blockchain_tx_hash: string | null;
  registered_by: string | null;
  created_at: string;
}

export interface ScanLog {
  id: string;
  batch_id: string;
  scanner_wallet: string | null;
  verification_status: 'authentic' | 'suspicious' | 'not_found';
  latitude: number | null;
  longitude: number | null;
  anomaly_flags: string[];
  scanned_at: string;
}

export type VerificationResult = 'authentic' | 'suspicious' | 'not_found';
