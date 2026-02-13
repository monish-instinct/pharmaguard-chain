import { supabase } from '@/integrations/supabase/client';

const RAPID_SCAN_THRESHOLD = 5;
const RAPID_SCAN_WINDOW_MINUTES = 10;
const GEO_DISTANCE_THRESHOLD_KM = 100;
const GEO_TIME_WINDOW_MINUTES = 30;

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function detectAnomalies(
  batchId: string,
  latitude: number | null,
  longitude: number | null
): Promise<{ isSuspicious: boolean; flags: string[] }> {
  const flags: string[] = [];
  const now = new Date();
  const windowStart = new Date(now.getTime() - RAPID_SCAN_WINDOW_MINUTES * 60 * 1000).toISOString();

  const { data: recentScans } = await supabase
    .from('scan_logs')
    .select('*')
    .eq('batch_id', batchId)
    .gte('scanned_at', windowStart)
    .order('scanned_at', { ascending: false });

  if (recentScans && recentScans.length >= RAPID_SCAN_THRESHOLD) {
    flags.push(`Rapid scanning: ${recentScans.length} scans in ${RAPID_SCAN_WINDOW_MINUTES} minutes`);
  }

  if (latitude !== null && longitude !== null && recentScans) {
    const geoWindowStart = new Date(now.getTime() - GEO_TIME_WINDOW_MINUTES * 60 * 1000);
    for (const scan of recentScans) {
      if (scan.latitude && scan.longitude && new Date(scan.scanned_at) >= geoWindowStart) {
        const dist = haversineDistance(latitude, longitude, scan.latitude, scan.longitude);
        if (dist > GEO_DISTANCE_THRESHOLD_KM) {
          flags.push(`Geographic anomaly: ${Math.round(dist)}km apart in ${GEO_TIME_WINDOW_MINUTES} min`);
          break;
        }
      }
    }
  }

  return { isSuspicious: flags.length > 0, flags };
}
