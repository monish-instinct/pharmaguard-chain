# PharmaShield MVP

A blockchain-based pharmaceutical supply chain verification system built with React, Polygon, and Supabase. PharmaShield combines on-chain batch registration with off-chain database storage to create an immutable, tamper-proof system for drug authentication and anti-counterfeiting.

![PharmaShield](https://img.shields.io/badge/Blockchain-Polygon-purple)
![Database](https://img.shields.io/badge/Database-Supabase-green)
![React](https://img.shields.io/badge/Frontend-React%2BVite-blue)

---

## Features

### Core Features
- **Blockchain Integration**: Register and verify drug batches on Polygon Mumbai testnet
- **QR Code Scanning**: Camera-based QR code scanning with fallback manual entry
- **Batch Registration**: Create unique, cryptographically-secured batch records
- **Anti-Counterfeiting**: Detect anomalies like rapid scanning or impossible geographic movement
- **Multi-Role Support**: Manufacturer, Pharmacy, and Regulator roles with specific permissions
- **Real-time Analytics**: Dashboard with scan activity and verification statistics
- **Audit Logs**: Complete immutable history of all verifications

### Technical Features
- **Dual Storage**: Blockchain for immutability, Supabase for metadata and performance
- **SHA-256 Hashing**: Cryptographic batch validation
- **Geolocation Tracking**: GPS-based anomaly detection
- **RLS Policies**: Row-level security for data access control
- **Demo Mode**: Test the app without blockchain or authentication
- **Responsive Design**: Mobile-first UI with Tailwind CSS

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite + TypeScript |
| **Styling** | Tailwind CSS + shadcn/ui |
| **State** | React Context + SWR |
| **Blockchain** | Ethers.js + Polygon Mumbai |
| **Database** | Supabase PostgreSQL + Auth |
| **QR Code** | qrcode + html5-qrcode |
| **Charts** | Recharts + shadcn/charts |

---

## Quick Start

### Prerequisites
- Node.js 16+ and npm/pnpm
- MetaMask wallet (for blockchain features)
- Supabase account (for database)
- Polygon Mumbai testnet MATIC (free faucet)

### Installation

1. **Clone Repository**
```bash
git clone https://github.com/monish-instinct/pharmaguard-chain.git
cd pharmaguard-chain
```

2. **Install Dependencies**
```bash
npm install
# or
pnpm install
```

3. **Setup Environment**
Create `.env.local`:
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJh...
VITE_POLYGON_RPC=https://rpc.ankr.com/polygon_mumbai
```

4. **Start Dev Server**
```bash
npm run dev
```

5. **Open Browser**
```
http://localhost:5173
```

---

## Usage

### For Manufacturers

**Register a Batch:**
1. Navigate to `/register`
2. Enter Batch ID (e.g., "BATCH-2026-001")
3. Enter Manufacturer Name
4. Click "Register Batch"
5. Download QR code or view on blockchain

**View Your Batches:**
1. Go to `/batches`
2. See all your registered batches
3. View blockchain confirmation status
4. Check registration timestamp

### For Pharmacies

**Verify Authenticity:**
1. Go to `/verify`
2. Click "Open Camera Scanner"
3. Scan batch QR code
4. View verification result (Authentic/Suspicious/Not Found)
5. See any anomaly flags

**Manual Entry:**
1. Instead of scanning, paste Batch ID
2. Click "Verify"
3. System checks blockchain and database

### For Regulators

**View Dashboard:**
1. Navigate to `/dashboard`
2. See total batches and scans
3. View authentication rate
4. Monitor scan activity trends
5. Review recent verification logs

**Review Scan Logs:**
1. Go to `/logs`
2. Filter by verification status
3. See geographic location of scans
4. Check anomaly flags
5. Export data if needed

---

## Architecture

### User Roles

```
├── Manufacturer
│   ├── Register batches
│   ├── View own batches
│   └── Monitor on-chain status
│
├── Pharmacy
│   ├── Verify batch authenticity
│   ├── Scan QR codes
│   ├── View verification history
│   └── Report suspicious batches
│
└── Regulator
    ├── View all batches
    ├── Monitor all scans
    ├── Access analytics
    ├── Review audit logs
    └── Identify patterns
```

### Data Flow

```
Register Batch:
User Input → Batch Hash → Blockchain Register → Supabase Insert → QR Code

Verify Batch:
Scan QR → Get Location → Blockchain Check → Supabase Check → Anomaly Detection → Record Log
```

### Database Schema

```
profiles (Users)
  ├─ user_id (PK)
  ├─ display_name
  └─ organization

user_roles (User Permissions)
  ├─ user_id (FK)
  └─ role (manufacturer | pharmacy | regulator)

batches (Batch Registry)
  ├─ id (PK)
  ├─ batch_id (Unique)
  ├─ batch_hash
  ├─ manufacturer_name
  ├─ blockchain_tx_hash
  ├─ registered_by (FK)
  └─ created_at

scan_logs (Verification History)
  ├─ id (PK)
  ├─ batch_id (FK)
  ├─ scanner_user_id (FK)
  ├─ verification_status
  ├─ latitude / longitude
  ├─ anomaly_flags
  └─ scanned_at
```

---

## Blockchain Integration

### Smart Contract

**Network**: Polygon Mumbai Testnet (Chain ID: 80002)
**Language**: Solidity 0.8.19

**Key Functions:**
- `registerBatch()` - Register new batch on-chain
- `verifyBatch()` - Check if batch exists
- `recordScan()` - Log scan events
- `getScanHistory()` - Get all scans for batch

**Contract Address**: Set in Settings page after deployment

### Deployment

See [BLOCKCHAIN_DEPLOYMENT.md](./BLOCKCHAIN_DEPLOYMENT.md) for:
- Step-by-step deployment guide
- Hardhat configuration
- Remix IDE instructions
- Cost estimation
- Testing procedures

### Testnet Faucets

Get free testnet MATIC:
- [Polygon Faucet](https://faucet.polygon.technology/)
- [Alchemy Faucet](https://www.alchemy.com/faucets)

---

## Configuration

### Smart Contract Address

1. Deploy contract to Mumbai testnet (see [BLOCKCHAIN_DEPLOYMENT.md](./BLOCKCHAIN_DEPLOYMENT.md))
2. Go to Settings page (`/settings`)
3. Enter deployed contract address
4. Click "Save"

App will now register all batches on-chain!

### Database Setup

Supabase is automatically configured via migration:
- Run: `supabase db push`
- Creates all tables with RLS policies
- Sets up triggers and functions

---

## API Reference

### Batch Registration
```typescript
import { registerBatchInSupabase } from '@/integrations/supabase/services';

const batch = await registerBatchInSupabase(
  'BATCH-2026-001',
  'PharmaCorp',
  userId
);
```

### Batch Verification
```typescript
import { verifyBatchOnChain } from '@/lib/blockchain';

const result = await verifyBatchOnChain('BATCH-2026-001');
if (result?.exists) {
  console.log('Batch is authentic');
}
```

### Scan Logging
```typescript
import { recordScanLog } from '@/integrations/supabase/services';

await recordScanLog(
  'BATCH-2026-001',
  'authentic',
  userId,
  latitude,
  longitude,
  anomalyFlags
);
```

See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for complete API documentation.

---

## Anomaly Detection

The system detects suspicious patterns:

### 1. Rapid Scanning
- **Threshold**: 5+ scans in 10 minutes
- **Flag**: "Rapid scanning: X scans in 10 minutes"

### 2. Geographic Anomalies
- **Threshold**: 100+ km movement in 30 minutes
- **Flag**: "Geographic anomaly: Xkm apart in 30 minutes"

### 3. Pattern Analysis
- **Detection**: ML-based duplicate checking
- **Prevention**: Counterfeiting patterns identified

---

## Demo Mode

Test the app without authentication:

1. Go to Settings page (`/settings`)
2. Toggle "Enable Demo Mode"
3. Select a role to impersonate
4. Explore all features

**Benefits:**
- No login required
- No blockchain required
- Database fallback works
- All pages accessible

---

## Deployment

### Deploy to Vercel

1. Push to GitHub
2. Connect repo to Vercel
3. Set environment variables
4. Deploy!

```bash
vercel deploy
```

### Deploy to Docker

```bash
docker build -t pharmashield .
docker run -p 5173:5173 pharmashield
```

---

## Development

### Project Structure

```
src/
├── pages/           # Route pages
├── components/      # Reusable components
├── contexts/        # React contexts (Auth)
├── lib/             # Utilities (blockchain, anomaly)
├── integrations/    # External services (Supabase)
├── types/           # TypeScript types
└── App.tsx          # Main app component

contracts/
├── PharmaShield.sol # Smart contract

supabase/
└── migrations/      # Database migrations

public/
└── assets/          # Static files
```

### Running Tests

```bash
# Unit tests
npm run test

# Contract tests
npx hardhat test

# Integration tests
npm run test:integration
```

### Linting & Formatting

```bash
# Lint
npm run lint

# Format
npm run format
```

---

## Troubleshooting

### Blockchain Connection Issues

**Problem**: "Blockchain verification failed"
**Solution**:
1. Check contract address in Settings
2. Verify on [Mumbai Polygonscan](https://mumbai.polygonscan.com)
3. Ensure wallet is on Mumbai testnet
4. Check MATIC balance

### QR Scanner Not Working

**Problem**: "Camera access denied"
**Solution**:
1. Check browser permissions
2. Allow camera access in settings
3. Use HTTPS (required for camera API)
4. Use fallback manual entry

### Database Connection Error

**Problem**: "Failed to fetch batches"
**Solution**:
1. Verify Supabase keys in `.env.local`
2. Check project is running
3. Verify RLS policies enabled
4. Check internet connection

### Demo Mode Issues

**Problem**: "Demo mode not switching roles"
**Solution**:
1. Refresh page
2. Clear browser cache
3. Check localStorage disabled?
4. Try different browser

---

## Security

### Smart Contract
- ✅ No owner privileges on batches
- ✅ Immutable batch records
- ✅ Event-based audit trail
- ✅ No hidden functions

### Database
- ✅ Row-level security enabled
- ✅ Password hashing with bcrypt
- ✅ Encrypted connections
- ✅ Regular backups

### Frontend
- ✅ No private keys stored
- ✅ Uses MetaMask for signing
- ✅ HTTPS only
- ✅ Input validation

### Best Practices
- Never share private keys
- Always use testnet first
- Verify contracts before mainnet
- Enable 2FA on accounts
- Keep dependencies updated

---

## Contributing

Contributions welcome! Please follow:

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## Roadmap

### Phase 1 (Current)
- ✅ Basic blockchain integration
- ✅ Supabase database
- ✅ QR code scanning
- ✅ Multi-role system
- ✅ Dashboard & analytics

### Phase 2 (Planned)
- Advanced anomaly detection (ML)
- Real-time notifications
- Mobile app (React Native)
- Multi-chain support
- API marketplace

### Phase 3 (Future)
- Decentralized ID system
- Supply chain tracking
- Insurance integration
- Regulatory compliance
- Global expansion

---

## License

MIT License - see [LICENSE](./LICENSE) file for details

---

## Support

### Documentation
- [Blockchain Deployment](./BLOCKCHAIN_DEPLOYMENT.md)
- [Integration Guide](./INTEGRATION_GUIDE.md)
- [API Reference](./INTEGRATION_GUIDE.md#7-error-handling)

### Resources
- [Polygon Docs](https://polygon.technology/developers)
- [Supabase Docs](https://supabase.com/docs)
- [Solidity Docs](https://solidity.readthedocs.io)
- [Ethers.js Docs](https://docs.ethers.org)

### Contact
- **GitHub Issues**: Report bugs and feature requests
- **Discussions**: Ask questions and share ideas
- **Email**: support@pharmashield.app

---

## Acknowledgments

Built with:
- [React](https://react.dev) - Frontend framework
- [Polygon](https://polygon.technology) - Blockchain
- [Supabase](https://supabase.com) - Backend
- [shadcn/ui](https://ui.shadcn.com) - UI components
- [Vite](https://vitejs.dev) - Build tool

---

## Changelog

### v1.0.0 (2026-02-13)
- Initial MVP release
- Blockchain integration with Polygon Mumbai
- Supabase database integration
- QR code scanning
- Multi-role dashboard
- Anomaly detection
- Admin settings

---

**Made with ❤️ for pharmaceutical authenticity**
