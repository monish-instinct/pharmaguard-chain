import { supabase } from './client';
import type { Batch, ScanLog } from '@/types';

/**
 * Batch Management Services
 */

export async function registerBatchInSupabase(
  batchId: string,
  manufacturerName: string,
  userId: string | null
): Promise<Batch | null> {
  try {
    const batchHash = await generateBatchHash(batchId, manufacturerName);
    
    const { data, error } = await supabase
      .from('batches')
      .insert([
        {
          batch_id: batchId,
          manufacturer_name: manufacturerName,
          batch_hash: batchHash,
          registered_by: userId,
          blockchain_tx_hash: null,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error registering batch:', error);
      return null;
    }
    return data as Batch;
  } catch (e) {
    console.error('Exception registering batch:', e);
    return null;
  }
}

export async function updateBatchBlockchainHash(
  batchId: string,
  txHash: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('batches')
      .update({ blockchain_tx_hash: txHash })
      .eq('batch_id', batchId);

    if (error) {
      console.error('Error updating blockchain hash:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Exception updating blockchain hash:', e);
    return false;
  }
}

export async function getBatchByBatchId(batchId: string): Promise<Batch | null> {
  try {
    const { data, error } = await supabase
      .from('batches')
      .select('*')
      .eq('batch_id', batchId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      console.error('Error fetching batch:', error);
      return null;
    }
    return data as Batch;
  } catch (e) {
    console.error('Exception fetching batch:', e);
    return null;
  }
}

/**
 * Scan Log Services
 */

export async function recordScanLog(
  batchId: string,
  verificationStatus: 'authentic' | 'suspicious' | 'not_found',
  userId: string | null,
  latitude: number | null,
  longitude: number | null,
  anomalyFlags: string[]
): Promise<ScanLog | null> {
  try {
    const { data, error } = await supabase
      .from('scan_logs')
      .insert([
        {
          batch_id: batchId,
          scanner_user_id: userId,
          verification_status: verificationStatus,
          latitude,
          longitude,
          anomaly_flags: anomalyFlags,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error recording scan log:', error);
      return null;
    }
    return data as ScanLog;
  } catch (e) {
    console.error('Exception recording scan log:', e);
    return null;
  }
}

export async function getScanLogsForBatch(batchId: string, limit = 50): Promise<ScanLog[]> {
  try {
    const { data, error } = await supabase
      .from('scan_logs')
      .select('*')
      .eq('batch_id', batchId)
      .order('scanned_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching scan logs:', error);
      return [];
    }
    return (data as ScanLog[]) || [];
  } catch (e) {
    console.error('Exception fetching scan logs:', e);
    return [];
  }
}

export async function getRecentScans(
  batchId: string,
  windowMinutes: number
): Promise<ScanLog[]> {
  try {
    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('scan_logs')
      .select('*')
      .eq('batch_id', batchId)
      .gte('scanned_at', windowStart)
      .order('scanned_at', { ascending: false });

    if (error) {
      console.error('Error fetching recent scans:', error);
      return [];
    }
    return (data as ScanLog[]) || [];
  } catch (e) {
    console.error('Exception fetching recent scans:', e);
    return [];
  }
}

/**
 * Utility Functions
 */

export async function generateBatchHash(batchId: string, manufacturer: string): Promise<string> {
  const data = `${batchId}:${manufacturer}:${Date.now()}`;
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyBatchHashIntegrity(
  batchId: string,
  expectedHash: string
): Promise<boolean> {
  try {
    const batch = await getBatchByBatchId(batchId);
    if (!batch) return false;
    return batch.batch_hash === expectedHash;
  } catch (e) {
    console.error('Exception verifying batch hash:', e);
    return false;
  }
}

/**
 * Profile Services
 */

export async function createUserProfile(
  userId: string,
  displayName: string,
  organization: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .insert([
        {
          user_id: userId,
          display_name: displayName,
          organization,
        }
      ]);

    if (error) {
      console.error('Error creating profile:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Exception creating profile:', e);
    return false;
  }
}

export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  } catch (e) {
    console.error('Exception fetching profile:', e);
    return null;
  }
}

export async function updateUserProfile(
  userId: string,
  displayName: string,
  organization: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName, organization })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating profile:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Exception updating profile:', e);
    return false;
  }
}
