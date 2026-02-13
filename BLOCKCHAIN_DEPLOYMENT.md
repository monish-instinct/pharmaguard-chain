# PharmaShield Smart Contract Deployment Guide

## Overview

PharmaShield is a decentralized pharmaceutical supply chain verification system built on **Polygon Mumbai Testnet**. This guide provides step-by-step instructions for deploying the contract and integrating it with the web application.

---

## Network Information

**Network**: Polygon Mumbai Testnet
**Chain ID**: 80002
**RPC Endpoint**: https://rpc.ankr.com/polygon_mumbai
**Block Explorer**: https://mumbai.polygonscan.com
**Currency**: MATIC (testnet)

### Get Testnet MATIC

1. Visit [Polygon Faucet](https://faucet.polygon.technology/)
2. Select "Mumbai" network
3. Enter your wallet address
4. Verify and claim testnet MATIC

---

## Deployment Methods

### Method 1: Using Hardhat (Recommended for Development)

#### Prerequisites
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox dotenv
npx hardhat
```

#### 1. Create Hardhat Project Structure

```bash
mkdir blockchain
cd blockchain
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

#### 2. Configure hardhat.config.js

Create `hardhat.config.js`:
```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.19",
  networks: {
    mumbai: {
      url: process.env.MUMBAI_RPC_URL || "https://rpc.ankr.com/polygon_mumbai",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 80002,
    },
  },
};
```

#### 3. Set Environment Variables

Create `.env`:
```
PRIVATE_KEY=your_wallet_private_key_here
MUMBAI_RPC_URL=https://rpc.ankr.com/polygon_mumbai
```

#### 4. Deploy Contract

Create `scripts/deploy.js`:
```javascript
const hre = require("hardhat");

async function main() {
  console.log("Deploying PharmaShield...");
  
  const PharmaShield = await hre.ethers.getContractFactory("PharmaShield");
  const contract = await PharmaShield.deploy();
  
  await contract.deployed();
  
  console.log("PharmaShield deployed to:", contract.address);
  console.log(`Verify at: https://mumbai.polygonscan.com/address/${contract.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

Deploy:
```bash
npx hardhat run scripts/deploy.js --network mumbai
```

---

### Method 2: Using Remix IDE (No Setup Required)

1. Go to [Remix IDE](https://remix.ethereum.org)
2. Create new file: `PharmaShield.sol`
3. Copy contract code from `contracts/PharmaShield.sol`
4. Compile: Select compiler version `0.8.19`
5. Deploy:
   - Connect wallet (MetaMask)
   - Select "Injected Provider"
   - Click "Deploy"
6. Copy deployed contract address

---

### Method 3: Using Thirdweb Deploy (Simple One-Click)

```bash
npx thirdweb deploy contracts/PharmaShield.sol
```

Follow the interactive prompts to deploy to Mumbai testnet.

---

## Contract Interaction

### Via Web3.js (Browser)

```javascript
const contractAddress = "0x..."; // Your deployed address
const contractABI = [...]; // Full ABI from compilation

const web3 = new Web3(window.ethereum);
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Register batch
await contract.methods
  .registerBatch("BATCH-2026-001", "PharmaCorp", "abc123...")
  .send({ from: userAddress, gas: 300000 });

// Verify batch
const result = await contract.methods.verifyBatch("BATCH-2026-001").call();
console.log(result);
```

### Via Ethers.js (Recommended)

```javascript
import { ethers } from 'ethers';

const contractAddress = "0x...";
const contractABI = [...];

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const contract = new ethers.Contract(contractAddress, contractABI, signer);

// Register batch
const tx = await contract.registerBatch(
  "BATCH-2026-001",
  "PharmaCorp",
  "abc123..."
);
await tx.wait();

// Verify batch
const batch = await contract.verifyBatch("BATCH-2026-001");
console.log("Manufacturer:", batch.manufacturerName);
console.log("Hash:", batch.batchHash);
console.log("Timestamp:", batch.timestamp);
```

---

## Integration with PharmaShield Web App

### 1. Update Contract Address

In **Settings Page** (`/settings`):
1. Navigate to "Smart Contract" section
2. Enter your deployed contract address (0x...)
3. Click "Save"

Or programmatically:
```javascript
import { setContractAddress } from '@/lib/blockchain';
setContractAddress("0x...");
```

### 2. Blockchain Registration Flow

When registering a batch:
1. **Register on Blockchain** (if configured)
   - Calls `PharmaShield.registerBatch()`
   - Returns transaction hash
   - Stores hash in Supabase

2. **Fallback to Supabase**
   - If blockchain unavailable, stores in database
   - No on-chain data loss

### 3. Batch Verification Flow

When verifying a batch:
1. **Check Blockchain First** (if configured)
   - Calls `PharmaShield.verifyBatch()`
   - Confirms existence on-chain

2. **Check Database** (Supabase)
   - Retrieves batch details
   - Confirms registered batches

3. **Anomaly Detection**
   - Checks scan patterns
   - Flags suspicious activity

4. **Log Result**
   - Records to `scan_logs` table
   - Stores verification status

---

## Contract Functions Reference

### registerBatch()
```solidity
function registerBatch(
    string calldata batchId,
    string calldata manufacturerName,
    string calldata batchHash
) external
```
**Registers a new batch on-chain**

### verifyBatch()
```solidity
function verifyBatch(string calldata batchId)
    external
    view
    returns (string, string, uint256, bool)
```
**Returns batch details or false if not found**

### recordScan()
```solidity
function recordScan(
    string calldata batchId,
    string calldata status,
    string calldata location
) external
```
**Records a scan/verification event**

### getScanHistory()
```solidity
function getScanHistory(string calldata batchId)
    external
    view
    returns (ScanRecord[] memory)
```
**Returns all scans for a batch**

---

## Cost Estimation

**Polygon Mumbai Testnet** (Testnet - Free)
- Gas cost: ~0.001 MATIC per transaction
- Real cost: Free (testnet)

**Polygon Mainnet** (Production - Real Cost)
- Gas cost: ~0.5-2 MATIC per transaction
- Current cost: ~$0.20-0.80 USD per transaction

---

## Testing

### Using Hardhat Tests

Create `test/PharmaShield.test.js`:
```javascript
const { expect } = require("chai");

describe("PharmaShield", function () {
  let pharmaShield;
  let owner;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();
    const PharmaShield = await ethers.getContractFactory("PharmaShield");
    pharmaShield = await PharmaShield.deploy();
  });

  it("Should register a batch", async function () {
    await pharmaShield.registerBatch("BATCH-001", "PharmaCorp", "abc123");
    const batch = await pharmaShield.verifyBatch("BATCH-001");
    expect(batch.exists).to.be.true;
  });

  it("Should prevent duplicate registrations", async function () {
    await pharmaShield.registerBatch("BATCH-001", "PharmaCorp", "abc123");
    await expect(
      pharmaShield.registerBatch("BATCH-001", "PharmaCorp", "abc123")
    ).to.be.revertedWith("Batch already registered");
  });
});
```

Run tests:
```bash
npx hardhat test
```

---

## Troubleshooting

### "Batch already registered"
- Batch ID already exists on-chain
- Use unique batch IDs

### "Hash must be 256-bit hex"
- Batch hash must be 64-character hex string
- Verify hash generation in `lib/blockchain.ts`

### Transaction fails silently
- Check gas amount
- Verify network is Mumbai (Chain ID: 80002)
- Ensure wallet has testnet MATIC

### Contract not found
- Verify contract address is correct
- Check on [Mumbai Polygonscan](https://mumbai.polygonscan.com)
- Ensure address is on correct network

---

## Production Deployment

For mainnet deployment:
1. Change network to `polygon` in config
2. Use mainnet RPC endpoint
3. Deploy with real MATIC
4. Update app contract address
5. Test thoroughly before going live

---

## Security Considerations

- **Private Keys**: Never commit `.env` files
- **Contract Verification**: Verify source on Polygonscan
- **Gas Limits**: Set appropriate gas limits
- **Rate Limiting**: Implement rate limiting in web app
- **Input Validation**: Always validate batch data

---

## Additional Resources

- [Polygon Documentation](https://polygon.technology/developers)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js Documentation](https://docs.ethers.org)
- [Solidity Documentation](https://solidity.readthedocs.io)
- [Mumbai Faucet](https://faucet.polygon.technology)
- [Mumbai Polygonscan](https://mumbai.polygonscan.com)

---

## Support

For issues or questions:
1. Check contract on [Mumbai Polygonscan](https://mumbai.polygonscan.com)
2. Review contract events and logs
3. Verify app configuration in Settings
4. Check browser console for errors

