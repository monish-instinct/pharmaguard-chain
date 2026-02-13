# PharmaShield Integration Guide

Complete guide for integrating blockchain, Supabase, and QR scanning into the PharmaShield application.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   PharmaShield App                       │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │           React Frontend (Vite)                  │   │
│  │  - Batch Registration & Verification Pages      │   │
│  │  - QR Code Scanning (Camera)                    │   │
│  │  - Dashboard & Analytics                        │   │
│  └──────────────────────────────────────────────────┘   │
│                      │                 │                 │
│         ┌────────────┘                 └─────────┐      │
│         ▼                                         ▼      │
│  ┌─────────────────┐                    ┌──────────────┐ │
│  │ Blockchain Layer│                    │ Database Layer│ │
│  ├─────────────────┤                    ├──────────────┤ │
│  │ Polygon (Mumbai)│◄──────────────────►│  Supabase    │ │
│  │ - Contract Data │     Sync Point     │ - Metadata   │ │
│  │ - Immutable Log │                    │ - Audit Log  │ │
│  │ - Transactions  │                    │ - Users      │ │
│  └─────────────────┘                    └──────────────┘ │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 1. Blockchain Integration

### Setup

**Install Dependencies:**
```bash
npm install ethers web3
```

**Configure in App:**
```typescript
// src/lib/blockchain.ts
import { ethers } from 'ethers';

const CONTRACT_ABI = [...]; // Full ABI
const CONTRACT_ADDRESS = localStorage.getItem('pharma_contract_address');

// Initialize provider and contract
const getProvider = () => {
  if (window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return null;
};

const getContract = async () => {
  const provider = getProvider();
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};
```

### Batch Registration on Blockchain

**Register a batch on Polygon:**
```typescript
export const registerBatchOnChain = async (
  batchId: string,
  manufacturerName: string,
  batchHash: string
): Promise<string | null> => {
  const contract = await getContract();
  
  try {
    const tx = await contract.registerBatch(
      batchId,
      manufacturerName,
      batchHash
    );
    
    // Wait for confirmation
    const receipt = await tx.wait();
    return tx.hash; // Transaction hash
  } catch (error) {
    console.error('Blockchain registration failed:', error);
    return null;
  }
};
```

### Batch Verification on Blockchain

**Verify a batch exists on-chain:**
```typescript
export const verifyBatchOnChain = async (
  batchId: string
): Promise<{ exists: boolean; manufacturerName?: string } | null> => {
  const contract = await getContract();
  
  try {
    const result = await contract.verifyBatch(batchId);
    return {
      exists: result[3], // 4th return value
      manufacturerName: result[0],
    };
  } catch (error) {
    console.error('Blockchain verification failed:', error);
    return null;
  }
};
```

### Hash Generation

**Generate SHA-256 batch hash:**
```typescript
export const generateBatchHash = async (
  batchId: string,
  manufacturer: string
): Promise<string> => {
  const data = `${batchId}:${manufacturer}:${Date.now()}`;
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};
```

---

## 2. Supabase Integration

### Database Schema

**Tables:**
- `profiles` - User information and roles
- `batches` - Batch registrations and metadata
- `scan_logs` - Verification scan history
- `user_roles` - User role assignments

**Key Relationships:**
```
profiles
  ├─ user_id (FK → auth.users)
  └─ user_roles[] → user_roles

batches
  ├─ batch_id (unique)
  ├─ registered_by (FK → profiles.user_id)
  └─ scan_logs[] → scan_logs

scan_logs
  ├─ batch_id (FK → batches.batch_id)
  ├─ scanner_user_id (FK → profiles.user_id)
  └─ verification_status ∈ [authentic, suspicious, not_found]
```

### Setup

**Install Supabase Client:**
```bash
npm install @supabase/supabase-js
```

**Initialize Client:**
```typescript
// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

### Service Functions

**Create Batch in Database:**
```typescript
export async function registerBatchInSupabase(
  batchId: string,
  manufacturerName: string,
  userId: string | null
): Promise<Batch | null> {
  const batchHash = await generateBatchHash(batchId, manufacturerName);
  
  const { data, error } = await supabase
    .from('batches')
    .insert([{
      batch_id: batchId,
      manufacturer_name: manufacturerName,
      batch_hash: batchHash,
      registered_by: userId,
      blockchain_tx_hash: null,
    }])
    .select()
    .single();

  return error ? null : (data as Batch);
}
```

**Update Blockchain Hash:**
```typescript
export async function updateBatchBlockchainHash(
  batchId: string,
  txHash: string
): Promise<boolean> {
  const { error } = await supabase
    .from('batches')
    .update({ blockchain_tx_hash: txHash })
    .eq('batch_id', batchId);

  return !error;
}
```

**Record Scan Log:**
```typescript
export async function recordScanLog(
  batchId: string,
  verificationStatus: 'authentic' | 'suspicious' | 'not_found',
  userId: string | null,
  latitude: number | null,
  longitude: number | null,
  anomalyFlags: string[]
): Promise<ScanLog | null> {
  const { data, error } = await supabase
    .from('scan_logs')
    .insert([{
      batch_id: batchId,
      scanner_user_id: userId,
      verification_status: verificationStatus,
      latitude,
      longitude,
      anomaly_flags: anomalyFlags,
    }])
    .select()
    .single();

  return error ? null : (data as ScanLog);
}
```

---

## 3. QR Code Integration

### QR Code Generation

**Generate QR for Batch:**
```typescript
import QRCode from 'qrcode';

const generateQRCode = async (batchId: string): Promise<string> => {
  return QRCode.toDataURL(batchId, {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });
};

// Usage
const qrDataUrl = await generateQRCode('BATCH-2026-001');
```

**Render QR Code:**
```tsx
<img 
  src={qrDataUrl} 
  alt={`QR Code for ${batchId}`}
  className="rounded-lg border-2"
/>
```

### QR Code Scanning

**Camera-Based Scanning:**
```typescript
import { Html5Qrcode } from 'html5-qrcode';

const startScanner = async (elementId: string) => {
  const scanner = new Html5Qrcode(elementId);
  
  await scanner.start(
    { facingMode: 'environment' }, // Rear camera
    { fps: 10, qrbox: { width: 250, height: 250 } },
    (text) => {
      // `text` is the scanned batch ID
      console.log('Scanned:', text);
      scanner.stop(); // Stop after successful scan
      verifyBatch(text);
    },
    (error) => {
      // Handle errors silently during scanning
    }
  );
};

const stopScanner = async (scanner: Html5Qrcode) => {
  await scanner.stop();
};
```

**React Component Integration:**
```tsx
import { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export function QRScanner() {
  const scannerRef = useRef<HTML5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);

  const startScanning = async () => {
    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;
    
    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (text) => {
          handleScan(text);
          scanner.stop();
          setScanning(false);
        },
        () => {}
      );
      setScanning(true);
    } catch (error) {
      console.error('Failed to start scanner:', error);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop();
      setScanning(false);
    }
  };

  useEffect(() => {
    return () => {
      scannerRef.current?.stop().catch(() => {});
    };
  }, []);

  return (
    <div>
      <div id="qr-reader" style={{ width: '100%' }} />
      <button onClick={startScanning} disabled={scanning}>
        Start Scanner
      </button>
      <button onClick={stopScanning} disabled={!scanning}>
        Stop Scanner
      </button>
    </div>
  );
}
```

---

## 4. Complete Registration Flow

```
User Action: Register Batch
        ↓
┌───────────────────────────────────────┐
│ 1. Generate Batch Hash (SHA-256)      │
└───────────────────────────────────────┘
        ↓
┌───────────────────────────────────────┐
│ 2. Register on Blockchain (if config) │
│    - Call: contract.registerBatch()   │
│    - Return: txHash                   │
│    - Fallback if failed               │
└───────────────────────────────────────┘
        ↓
┌───────────────────────────────────────┐
│ 3. Store in Supabase                  │
│    - Insert batch record              │
│    - Link blockchain txHash           │
│    - Store in 'batches' table         │
└───────────────────────────────────────┘
        ↓
┌───────────────────────────────────────┐
│ 4. Generate QR Code                   │
│    - Encode: batchId                  │
│    - Format: PNG data URL             │
└───────────────────────────────────────┘
        ↓
Success: Display QR Code + Details
```

---

## 5. Complete Verification Flow

```
User Action: Scan/Verify Batch
        ↓
┌───────────────────────────────────────┐
│ 1. Get User Location (GPS)            │
│    - Request: navigator.geolocation   │
│    - Fallback: null                   │
└───────────────────────────────────────┘
        ↓
┌───────────────────────────────────────┐
│ 2. Verify on Blockchain (if config)   │
│    - Call: contract.verifyBatch()     │
│    - Check: exists flag               │
│    - Return: batch details            │
└───────────────────────────────────────┘
        ↓
┌───────────────────────────────────────┐
│ 3. Verify in Supabase                 │
│    - Query: batches table             │
│    - Check: batch_id match            │
│    - Return: batch record             │
└───────────────────────────────────────┘
        ↓
┌───────────────────────────────────────┐
│ 4. Anomaly Detection                  │
│    - Rapid scanning check             │
│    - Geographic anomalies             │
│    - Pattern analysis                 │
│    - Return: flags []                 │
└───────────────────────────────────────┘
        ↓
┌───────────────────────────────────────┐
│ 5. Determine Status                   │
│    - authentic / suspicious / not_found│
└───────────────────────────────────────┘
        ↓
┌───────────────────────────────────────┐
│ 6. Record Scan Log                    │
│    - Insert: scan_logs record         │
│    - Include: status, location, flags │
└───────────────────────────────────────┘
        ↓
Success: Display Verification Result
```

---

## 6. Environment Variables

**Required for Blockchain:**
```env
REACT_APP_CONTRACT_ADDRESS=0x...
REACT_APP_POLYGON_RPC=https://rpc.ankr.com/polygon_mumbai
```

**Required for Supabase:**
```env
REACT_APP_SUPABASE_URL=https://xxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJh...
```

**Optional:**
```env
REACT_APP_ENABLE_BLOCKCHAIN=true
REACT_APP_DEMO_MODE=false
```

---

## 7. Error Handling

**Blockchain Errors:**
```typescript
try {
  const tx = await contract.registerBatch(...);
  await tx.wait();
} catch (error) {
  if (error.code === 'ACTION_REJECTED') {
    console.error('User rejected transaction');
  } else if (error.code === 'INSUFFICIENT_FUNDS') {
    console.error('Insufficient gas/MATIC');
  } else {
    console.error('Unknown error:', error);
  }
  // Fallback to Supabase
}
```

**Supabase Errors:**
```typescript
const { data, error } = await supabase
  .from('batches')
  .select('*')
  .eq('batch_id', batchId)
  .single();

if (error) {
  if (error.code === 'PGRST116') {
    console.error('Batch not found');
  } else {
    console.error('Database error:', error);
  }
}
```

---

## 8. Testing Integration

**Test Blockchain Registration:**
```bash
# 1. Set contract address in Settings
# 2. Register test batch
# 3. Verify on Mumbai Polygonscan
https://mumbai.polygonscan.com/address/0x...
```

**Test Supabase Connection:**
```bash
# 1. Check API keys in env
# 2. Verify Supabase project exists
# 3. Check RLS policies enabled
# 4. Test auth session
```

**Test QR Scanning:**
```bash
# 1. Generate QR code
# 2. Test with multiple devices
# 3. Verify camera permissions
# 4. Test fallback manual entry
```

---

## 9. Performance Optimization

**Caching:**
```typescript
const batchCache = new Map<string, Batch>();

const getBatchCached = async (batchId: string): Promise<Batch | null> => {
  if (batchCache.has(batchId)) {
    return batchCache.get(batchId)!;
  }
  
  const batch = await getBatchByBatchId(batchId);
  if (batch) {
    batchCache.set(batchId, batch);
  }
  
  return batch;
};
```

**Debouncing:**
```typescript
import { debounce } from 'lodash';

const debouncedVerify = debounce((batchId: string) => {
  verifyBatch(batchId);
}, 500);
```

---

## 10. Security Best Practices

- **Never expose private keys** in client code
- **Use MetaMask/Web3 provider** for transactions
- **Enable CORS** on API endpoints
- **Validate all user input** before blockchain calls
- **Implement rate limiting** on API calls
- **Use HTTPS** for all production APIs
- **Rotate API keys** regularly
- **Audit smart contract** before mainnet deployment

---

## Support & Resources

- **Blockchain**: https://polygon.technology/developers
- **Supabase**: https://supabase.com/docs
- **QR Codes**: https://github.com/mebjas/html5-qrcode
- **Ethers.js**: https://docs.ethers.org
- **Solidity**: https://solidity.readthedocs.io

