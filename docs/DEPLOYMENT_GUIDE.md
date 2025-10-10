# Deployment Guide

This guide walks you through deploying your Bun-Eth contracts to various networks, including testnets and mainnet.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Deployment (Anvil)](#local-deployment-anvil)
- [Testnet Deployment (Sepolia)](#testnet-deployment-sepolia)
- [Multi-Chain Deployment](#multi-chain-deployment)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

1. **Bun-Eth project set up**
   ```bash
   task install
   task contracts:compile
   ```

2. **Foundry installed**
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

3. **Environment variables configured** (copy `.env.example` to `.env`)

---

## Local Deployment (Anvil)

Anvil is a local Ethereum node that comes with Foundry, perfect for development and testing.

### 1. Start the development stack

```bash
task dev:up
```

This starts:
- Anvil local node on port `3002` (configurable via `ANVIL_PORT`)
- API server on port `3001`
- Web UI on port `3000` (if full-stack)

### 2. Deploy contracts

```bash
task contracts:deploy
```

This will:
- Deploy your contracts to the local Anvil network
- Generate TypeScript types for your contracts
- Enable contract hot reload in the frontend

### 3. Verify deployment

Check the API health endpoint:
```bash
task check:health
```

Or visit:
- Web UI: http://localhost:3000
- API: http://localhost:3001
- Anvil RPC: http://localhost:3002

---

## Testnet Deployment (Sepolia)

Sepolia is an Ethereum testnet recommended for testing your dApp before mainnet deployment.

### 1. Get Testnet ETH

You'll need Sepolia ETH to pay for gas. Get it from:
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)
- [QuickNode Sepolia Faucet](https://faucet.quicknode.com/ethereum/sepolia)

### 2. Get an RPC URL

Sign up for a free account on one of these providers:

**Alchemy** (Recommended)
1. Go to [alchemy.com](https://www.alchemy.com/)
2. Create a free account
3. Create a new app for Sepolia
4. Copy the HTTPS RPC URL

**Infura**
1. Go to [infura.io](https://infura.io/)
2. Create a free account
3. Create a new project
4. Select Sepolia network
5. Copy the HTTPS endpoint

### 3. Get an Etherscan API Key (for verification)

1. Go to [Etherscan](https://etherscan.io/myapikey)
2. Sign up or log in
3. Create a new API key
4. Copy the API key

### 4. Configure your `.env` file

```bash
# Copy the example if you haven't already
cp .env.example .env
```

Edit `.env` and add:

```bash
# Your wallet private key (⚠️ NEVER commit this!)
# Create a new wallet for testnet deployments
PRIVATE_KEY=0xyour_private_key_here

# Sepolia RPC URL from Alchemy or Infura
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_api_key

# Etherscan API key for contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key
```

⚠️ **Security Warning**: Never commit your `.env` file or share your private key!

### 5. Fund your deployer wallet

Send Sepolia ETH to the address associated with your `PRIVATE_KEY`:

```bash
# Get your address from private key using cast
cast wallet address --private-key $PRIVATE_KEY
```

### 6. Deploy to Sepolia

```bash
task contracts:deploy:sepolia
```

This will:
1. Validate your environment variables
2. Deploy contracts to Sepolia
3. Automatically verify contracts on Etherscan

### 7. Verify deployment

Check your contracts on [Sepolia Etherscan](https://sepolia.etherscan.io/):
1. Search for your contract address
2. Verify the contract is deployed
3. Check that source code is verified

---

## Multi-Chain Deployment

To deploy to multiple chains (Base, Arbitrum, etc.), add the respective configurations.

### 1. Configure additional networks

Add to your `.env`:

```bash
# Base Sepolia (testnet)
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASESCAN_API_KEY=your_basescan_api_key

# Arbitrum Sepolia (testnet)
ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
ARBISCAN_API_KEY=your_arbiscan_api_key
```

### 2. Create deployment tasks

Add to `tooling/task/Taskfile.yml`:

```yaml
contracts:deploy:base-sepolia:
  desc: Deploy contracts to Base Sepolia testnet
  dir: packages/contracts
  cmds:
    - |
      if [ -z "$BASE_SEPOLIA_RPC_URL" ]; then
        echo "❌ Error: BASE_SEPOLIA_RPC_URL not set"
        exit 1
      fi
    - FOUNDRY_DISABLE_NIGHTLY_WARNING=true forge script script/Deploy.s.sol:DeployScript --rpc-url $BASE_SEPOLIA_RPC_URL --private-key $PRIVATE_KEY --broadcast --verify --etherscan-api-key ${BASESCAN_API_KEY:-}

contracts:deploy:arbitrum-sepolia:
  desc: Deploy contracts to Arbitrum Sepolia testnet
  dir: packages/contracts
  cmds:
    - |
      if [ -z "$ARBITRUM_SEPOLIA_RPC_URL" ]; then
        echo "❌ Error: ARBITRUM_SEPOLIA_RPC_URL not set"
        exit 1
      fi
    - FOUNDRY_DISABLE_NIGHTLY_WARNING=true forge script script/Deploy.s.sol:DeployScript --rpc-url $ARBITRUM_SEPOLIA_RPC_URL --private-key $PRIVATE_KEY --broadcast --verify --etherscan-api-key ${ARBISCAN_API_KEY:-}
```

### 3. Deploy to each chain

```bash
task contracts:deploy:base-sepolia
task contracts:deploy:arbitrum-sepolia
```

---

## Verification

### Manual Verification

If automatic verification fails, verify manually:

```bash
cd packages/contracts
forge verify-contract \
  --chain sepolia \
  --compiler-version v0.8.20 \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  CONTRACT_ADDRESS \
  src/YourContract.sol:YourContract
```

### Check Verification Status

```bash
forge verify-check --chain sepolia CHECK_GUID --etherscan-api-key $ETHERSCAN_API_KEY
```

---

## Troubleshooting

### "SEPOLIA_RPC_URL not set"

**Solution**: Make sure you've:
1. Created a `.env` file from `.env.example`
2. Added your `SEPOLIA_RPC_URL` to the `.env` file
3. Run `task contracts:deploy:sepolia` from the project root (not from `packages/contracts`)

### "PRIVATE_KEY not set"

**Solution**: Add your private key to `.env`:
```bash
PRIVATE_KEY=0xyour_private_key_here
```

### "Insufficient funds for gas"

**Solution**:
1. Get testnet ETH from a faucet (see links above)
2. Send it to your deployer address:
   ```bash
   cast wallet address --private-key $PRIVATE_KEY
   ```

### "Failed to verify contract"

**Possible causes**:
1. **Etherscan API key not set**: Add `ETHERSCAN_API_KEY` to `.env`
2. **Rate limiting**: Wait a few minutes and try manual verification
3. **Wrong compiler version**: Check your `foundry.toml` matches the deployed contract

**Manual verification**:
```bash
forge verify-contract \
  --chain sepolia \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  CONTRACT_ADDRESS \
  src/YourContract.sol:YourContract
```

### "Invalid RPC URL"

**Solution**: Check your RPC URL format:
- Should start with `https://`
- Should not have trailing spaces
- Should include your API key

Example:
```bash
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY_HERE
```

### "Nonce too high"

**Solution**: This happens when transactions get out of sync. Reset your account nonce:
```bash
cast send --private-key $PRIVATE_KEY --nonce $(cast nonce $YOUR_ADDRESS) --value 0 $YOUR_ADDRESS
```

---

## Mainnet Deployment

⚠️ **Warning**: Deploying to mainnet costs real ETH and is permanent. Test thoroughly on testnets first!

### Checklist before mainnet:

- [ ] All contracts thoroughly tested on testnets
- [ ] Security audit completed (for production apps)
- [ ] All environment variables verified
- [ ] Sufficient ETH for deployment (check gas prices)
- [ ] Deploy script tested multiple times on testnet
- [ ] Backup of all deployment keys and addresses

### Mainnet deployment:

1. Add mainnet configuration to `.env`:
```bash
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=0xyour_mainnet_deployer_key
```

2. Create mainnet deployment task in `Taskfile.yml`
3. Deploy with extreme caution:
```bash
task contracts:deploy:mainnet
```

---

## Best Practices

1. **Use separate wallets**: Never use the same wallet for development, testnet, and mainnet
2. **Environment variables**: Keep sensitive data in `.env`, never commit
3. **Test thoroughly**: Deploy to testnet multiple times before mainnet
4. **Gas estimation**: Check gas prices before deploying on mainnet
5. **Verification**: Always verify contracts after deployment
6. **Documentation**: Document all deployed contract addresses
7. **Backups**: Keep backups of deployment artifacts and addresses

---

## Additional Resources

- [Foundry Book - Deploying](https://book.getfoundry.sh/forge/deploying)
- [Ethereum Gas Tracker](https://etherscan.io/gastracker)
- [Chainlist - RPC URLs](https://chainlist.org/)
- [Alchemy Documentation](https://docs.alchemy.com/)
- [Infura Documentation](https://docs.infura.io/)

---

Need help? Check the [Bun-Eth GitHub Discussions](https://github.com/Bun-Eth-Community/bun-eth/discussions) or open an issue.
