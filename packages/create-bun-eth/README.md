# create-bun-eth

Scaffold a Bun-first Ethereum project - Full-Stack dApp or Backend-Only API.

## Usage

### Interactive Mode (Recommended)

```bash
bunx create-bun-eth@latest my-project
```

You'll be prompted to choose:
1. **Full-Stack dApp** - Next.js frontend + Backend + Contracts
2. **Backend-Only** - API + Contracts only

### Non-Interactive Mode

```bash
# Full-stack dApp
bunx create-bun-eth@latest my-dapp --full-stack

# Backend-only API
bunx create-bun-eth@latest my-api --backend-only
```

## Project Types

### Full-Stack dApp

Perfect for building complete decentralized applications with a modern web interface.

**Includes:**
- 🎨 **Next.js 14** - App Router with React 18
- 🌈 **RainbowKit** - Beautiful wallet connection UI
- 🔗 **wagmi v2** - React hooks for Ethereum
- 🎣 **Custom Hooks** - `@bun-eth/hooks` for contract interactions
- 🧱 **Web3 Components** - `@bun-eth/components` (Address, Balance, Faucet, etc.)
- 🔥 **Contract Hot Reload** - Frontend auto-updates when contracts change
- 💰 **Burner Wallet** - Ephemeral wallet for local testing
- 🚰 **Local Faucet** - Get test ETH instantly
- 🚀 **Elysia Backend** - Fast TypeScript API
- 📜 **Foundry Contracts** - Forge, Anvil, Cast
- 🐳 **Docker Compose** - Full dev stack (Web + API + Anvil)

**Services:**
- Web UI: `http://localhost:3000`
- API: `http://localhost:3001`
- Anvil: `http://localhost:3002`

### Backend-Only

Perfect for APIs, bots, scripts, or when you want to build your own custom frontend.

**Includes:**
- 🚀 **Elysia Backend** - Fast TypeScript API
- 📜 **Foundry Contracts** - Forge, Anvil, Cast
- 📦 **TypeScript SDK** - Type-safe contract interactions
- 🐳 **Docker Compose** - API + Anvil
- ⚡ **Taskfile** - Command orchestration
- 🧪 **Bun-Native Tests** - Testing for SDK/API

**Services:**
- API: `http://localhost:3001`
- Anvil: `http://localhost:3002`

## Prerequisites

- [Bun](https://bun.sh) >= 1.1.0
- [Foundry](https://getfoundry.sh/)
- [Docker](https://www.docker.com/)
- [Task](https://taskfile.dev/) (optional but recommended)

## Quick Start

1. **Create project:**
   ```bash
   bunx create-bun-eth@latest my-project
   ```

2. **Navigate to project:**
   ```bash
   cd my-project
   ```

3. **Complete setup** (installs deps, compiles contracts, runs tests):
   ```bash
   task setup
   ```

4. **Start development stack:**
   ```bash
   task dev:up
   ```

5. **Deploy contracts:**
   ```bash
   task contracts:deploy
   ```

6. **Open browser** (Full-Stack only):
   ```bash
   open http://localhost:3000
   ```

## Available Commands

```bash
# Setup & Development
task setup              # Complete setup with tests
task dev:up             # Start development stack
task dev:down           # Stop services
task dev:logs           # View all logs

# Contracts
task contracts:compile  # Compile smart contracts
task contracts:deploy   # Deploy to local Anvil
task contracts:test     # Run Foundry tests
task contracts:generate # Generate TypeScript types

# Testing
task test               # Run all tests
task test:contracts     # Foundry tests only
task test:api           # API tests only
task test:sdk           # SDK tests only

# Utilities
task check:health       # Check API health
task status             # View service status
task --list             # See all commands
```

## Project Structure

### Full-Stack
```
my-dapp/
├── apps/
│   ├── web/                    # Next.js frontend
│   └── api/                    # Elysia backend
├── packages/
│   ├── contracts/              # Foundry smart contracts
│   ├── hooks/                  # Custom React hooks (@bun-eth/hooks)
│   ├── components/             # Web3 UI components (@bun-eth/components)
│   ├── burner-connector/       # Burner wallet connector
│   ├── foundry-deployer/       # Hot reload system
│   ├── core/                   # Shared utilities & types
│   └── sdk/                    # TypeScript SDK
├── docker/                     # Docker Compose setup
└── tooling/task/               # Taskfile orchestration
```

### Backend-Only
```
my-api/
├── apps/api/           # Elysia backend
├── packages/
│   ├── contracts/      # Foundry smart contracts
│   ├── core/          # Shared utilities & types
│   └── sdk/           # TypeScript SDK
├── docker/            # Docker Compose setup
└── tooling/task/      # Taskfile orchestration
```

## Features

### Full-Stack Exclusive

- **Contract Hot Reload**: Edit your contracts and watch your frontend auto-update
- **Custom React Hooks**: Type-safe hooks with full TypeScript inference
  - `useScaffoldReadContract` - Read contract state with auto-refresh
  - `useScaffoldWriteContract` - Write to contracts with notifications
  - `useDeployedContractInfo` - Get contract addresses and ABIs
  - `useScaffoldEventHistory` - Subscribe to contract events
  - `useScaffoldEventSubscriber` - Real-time event streaming
- **Web3 Components**: Pre-built UI components
  - `<Address />` - Display addresses with ENS, Blockie, copy, explorer link
  - `<Balance />` - Show ETH/token balances
  - `<Faucet />` - Local faucet for test ETH
  - `<BurnerWalletInfo />` - Burner wallet management UI
- **Burner Wallet**: Ephemeral wallets for quick testing (localhost only)
- **RainbowKit Integration**: Beautiful wallet connection UX

### Both Project Types

- **Bun-Native**: 100% Bun, no Node.js required
- **Foundry**: Blazing fast Solidity development
- **TypeScript**: Full type safety across the stack
- **Docker Compose**: Complete local dev environment
- **Monorepo**: Clean package architecture
- **Native Tests**: Bun tests for TS, Forge tests for Solidity

## Port Configuration

By default, services use these ports:
- Web: `3000` (Full-Stack only)
- API: `3001`
- Anvil: `8545`

If ports are in use, update the port values in your `.env` file.

## Environment Variables

Copy `.env.example` to `.env` (done automatically by `task setup`):

```bash
# Ports (consecutive for easy management)
WEB_PORT=3000
API_PORT=3001
ANVIL_PORT=3002

# API
PORT=3001
NODE_ENV=development

# Ethereum
ANVIL_NODE=http://localhost:3002
CHAIN_ID=31337
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Frontend (Full-Stack only)
NEXT_PUBLIC_WC_PROJECT_ID=  # Get from https://cloud.walletconnect.com
NEXT_PUBLIC_ANVIL_PORT=3002
```

## Documentation

For full documentation, visit the [main repository](https://github.com/Bun-Eth-Community/bun-eth).

## License

MIT
