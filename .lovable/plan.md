

# PharmaShield MVP — Implementation Plan

**Tagline:** *A Predictive Blockchain Network for Counterfeit Drug Prevention*

---

## 1. Database Setup (Supabase)

### Tables
- **batches** — stores registered drug batches (batch_id, manufacturer, blockchain_tx_hash, batch_hash, created_at, registered_by)
- **scan_logs** — logs every verification scan (batch_id, location, timestamp, verification_status, scanner_user_id)
- **user_roles** — role-based access (manufacturer, pharmacy, regulator) following security best practices with a separate roles table
- **profiles** — basic user profile info (name, organization, role display)

### Security
- Row-Level Security on all tables
- Manufacturers can only register/view their own batches
- Regulators can view all data
- Pharmacies can scan and view scan logs
- Role checks via `has_role()` security definer function

---

## 2. Authentication & Roles

- **Real auth**: Email/password signup and login via Supabase Auth
- **Demo mode toggle**: A switch in the UI that lets you quickly assume any role (Manufacturer, Pharmacy, Regulator) without logging in — perfect for presentations
- **Three roles**: Manufacturer, Pharmacy/Distributor, Regulator
- Role is assigned during signup (role selection screen)

---

## 3. Smart Contract (Solidity + Integration)

- **Solidity contract** provided in the project (`contracts/` folder) with:
  - `registerBatch(batchId, manufacturerName, batchHash)` 
  - `verifyBatch(batchId)` → returns batch data + existence boolean
- **ABI included** for frontend integration
- **ethers.js integration** to interact with the deployed contract on Polygon testnet (Mumbai/Amoy)
- **Configuration page** where you paste your deployed contract address
- **Fallback**: If no contract address is configured, the app uses Supabase-based verification so the demo still works

---

## 4. Batch Registration Flow (Manufacturer View)

- Form to register a new batch: Batch ID, Manufacturer Name
- On submit:
  1. Generate a hash of the batch data
  2. Call the smart contract's `registerBatch()` (if connected)
  3. Store batch + tx hash in Supabase
  4. Generate a QR code containing the batch ID
  5. Display QR code with download button (PNG)
- View list of all registered batches with their QR codes

---

## 5. QR Verification Flow (Pharmacy/Public View)

- **Camera-based QR scanner** using a QR scanning library
- On scan:
  1. Extract batch ID from QR
  2. Call smart contract's `verifyBatch()` to check existence
  3. Run anomaly detection rules (see below)
  4. Display result with clear color coding:
     - ✅ **Authentic** (green) — batch verified on blockchain
     - ⚠️ **Suspicious** (yellow) — anomaly detected
     - ❌ **Not Found** (red) — batch doesn't exist
  5. Log scan event to `scan_logs` table with location and status

---

## 6. AI Anomaly Detection (Rule-Based)

Simple but effective rules checked on every scan:
- **Rapid scan frequency**: Same batch scanned more than N times within X minutes → Suspicious
- **Geographic anomaly**: Same batch scanned from significantly different locations in a short time window → Suspicious
- Location captured via browser Geolocation API (approximate coordinates)
- Anomaly flags stored in scan_logs for dashboard review

---

## 7. Regulator Dashboard

A clean, professional admin dashboard showing:
- **Summary cards**: Total batches, Total scans, Suspicious scans count, Authentic rate
- **Recent scan activity table**: batch ID, location, time, status (color-coded)
- **Charts**: Scan activity over time (line chart), Verification status breakdown (pie/bar chart) using Recharts
- **Suspicious activity highlight section**: Flagged scans with details
- Filters by date range and status

---

## 8. Navigation & UI Structure

- **Clean, professional design** — no unnecessary animations
- **Top navigation bar** with role-based menu items:
  - Manufacturer: Register Batch, My Batches
  - Pharmacy: Verify Batch (scanner)
  - Regulator: Dashboard, All Batches, Scan Logs
- **Demo mode banner** when in demo mode showing current role with switcher
- Color scheme: Professional blue/dark theme with green/yellow/red for verification states

---

## 9. Pages Summary

| Page | Access | Purpose |
|------|--------|---------|
| Login/Signup | Public | Auth with role selection |
| Register Batch | Manufacturer | Create batch + generate QR |
| My Batches | Manufacturer | View registered batches & QR codes |
| Verify Batch | Pharmacy/Public | QR scanner + verification result |
| Dashboard | Regulator | Analytics, charts, scan logs |
| Settings | All | Contract address config, demo mode toggle |

---

## 10. Demo Flow (End-to-End)

1. Login as Manufacturer → Register a new batch → QR code generated
2. Switch to Pharmacy role → Scan QR → See "Authentic" ✅
3. Scan same QR rapidly from different simulated locations → See "Suspicious" ⚠️
4. Switch to Regulator → Dashboard shows the suspicious activity flagged
5. Scan a random/fake batch ID → See "Not Found" ❌

