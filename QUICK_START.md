# PharmaShield Quick Start

**5-minute setup guide**

---

## Installation

```bash
# 1. Clone repo
git clone https://github.com/monish-instinct/pharmaguard-chain.git
cd pharmaguard-chain

# 2. Install dependencies
npm install

# 3. Create environment file
echo 'VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJh...' > .env.local

# 4. Start dev server
npm run dev

# 5. Open browser
# http://localhost:5173
```

---

## Testing (Demo Mode)

**No setup needed - test immediately!**

1. Open http://localhost:5173
2. Click **"Demo"** button in top-right
3. Select role: **Manufacturer**
4. Start registering batches!

**Available Roles:**
- **Manufacturer**: Register batches
- **Pharmacy**: Verify authenticity
- **Regulator**: Monitor all activity

---

## Key Pages

| Route | Purpose | Role |
|-------|---------|------|
| `/` | Home | All |
| `/login` | Sign up / Sign in | All |
| `/register` | Register batch | Manufacturer |
| `/batches` | View batches | All |
| `/verify` | Verify authenticity | Pharmacy |
| `/dashboard` | Analytics | Regulator |
| `/logs` | Scan logs | Regulator |
| `/settings` | Configure | All |

---

## Register a Batch

1. Go to `/register`
2. Enter: `BATCH-2026-001`
3. Manufacturer: `PharmaCorp`
4. Click **Register**
5. QR code appears → Download or share

---

## Verify Batch

1. Go to `/verify`
2. **Option A**: Scan QR with camera
3. **Option B**: Manually enter Batch ID
4. See result: ✓ Authentic or ⚠️ Suspicious

---

## View Scan Activity

1. Go to `/dashboard` (Regulator role)
2. See all metrics and charts
3. Or go to `/logs` to filter by status

---

## Setup Blockchain (Optional)

1. Deploy contract to Mumbai testnet (see [BLOCKCHAIN_DEPLOYMENT.md](./BLOCKCHAIN_DEPLOYMENT.md))
2. Go to `/settings`
3. Paste contract address
4. Click Save
5. All batches now register on-chain!

---

## Deploy to Production

### Option 1: Vercel (Recommended)
```bash
vercel deploy
```

### Option 2: Docker
```bash
docker build -t pharmashield .
docker run -p 5173:5173 pharmashield
```

### Option 3: Traditional Hosting
```bash
npm run build
# Deploy dist/ folder
```

---

## Troubleshooting

**Issue**: Demo mode not working
**Fix**: Clear cache (Ctrl+Shift+Delete) and refresh

**Issue**: QR scanner not working
**Fix**: Allow camera permissions or use manual entry

**Issue**: Database connection error
**Fix**: Check Supabase keys in `.env.local`

---

## Documentation

- **[README.md](./README.md)** - Full project overview
- **[BLOCKCHAIN_DEPLOYMENT.md](./BLOCKCHAIN_DEPLOYMENT.md)** - Deploy smart contract
- **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - Technical details
- **[DEMO_FLOW.md](./DEMO_FLOW.md)** - Test scenarios
- **[MVP_SUMMARY.md](./MVP_SUMMARY.md)** - Project summary

---

## Commands

```bash
# Start development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Format code
npm run format

# Lint code
npm run lint
```

---

## Environment Variables

Required for database:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

Optional for blockchain:
```env
VITE_POLYGON_RPC=https://rpc.ankr.com/polygon_mumbai
VITE_CONTRACT_ADDRESS=0x...
```

---

## Tech Stack

- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Blockchain**: Polygon Mumbai (Solidity)
- **Web3**: Ethers.js + MetaMask
- **QR**: qrcode + html5-qrcode

---

## Key Features

✓ Blockchain batch registration
✓ QR code generation & scanning
✓ Multi-role user system
✓ Real-time anomaly detection
✓ Geographic tracking
✓ Audit logs & analytics
✓ Demo mode (no auth needed)
✓ Responsive design
✓ Security with RLS policies

---

## Next Steps

1. [Test the app](./DEMO_FLOW.md) - 5-minute walkthrough
2. [Deploy contract](./BLOCKCHAIN_DEPLOYMENT.md) - Get on-chain
3. [Read full docs](./README.md) - Deep dive
4. [Customize](./INTEGRATION_GUIDE.md) - Adapt for your needs

---

**Need help?** Check the [troubleshooting guide](./DEMO_FLOW.md#troubleshooting-demo) or open a GitHub issue.

