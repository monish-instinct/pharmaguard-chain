export type AppRole = 'manufacturer' | 'pharmacy' | 'regulator';

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  organization: string | null;
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
  scanner_user_id: string | null;
  verification_status: 'authentic' | 'suspicious' | 'not_found';
  latitude: number | null;
  longitude: number | null;
  anomaly_flags: string[];
  scanned_at: string;
}

export type VerificationResult = 'authentic' | 'suspicious' | 'not_found';
