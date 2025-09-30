# Bun-Eth

> A Bun-first scaffold for Ethereum projects

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Bun-1.1+-black)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-blue)](https://www.typescriptlang.org/)

A **pure Bun-native monorepo template** for building Ethereum-based applications. Replace scaffold-eth-2's Node/React stack with a modern, TypeScript-first approach using Bun, Elysia, and Hardhat.

## ✨ Features

- 🚀 **Bun-Native** - 100% Bun, no Node.js tooling required
- ⚡ **Elysia Backend** - Fast, TypeScript-first web framework
- 📜 **Hardhat Contracts** - Battle-tested smart contract framework
- 🐳 **Docker Compose** - Complete local development environment
- 📦 **Monorepo** - Clean separation of concerns with workspaces
- 🧪 **Bun Tests** - Native testing with `bun test`
- 🔧 **Taskfile** - Powerful command orchestration
- 🎨 **TypeScript** - Full type safety across the stack

## 🚀 Quick Start

### Using the CLI (Recommended)

```bash
bunx create-bun-eth@latest my-dapp
cd my-dapp
task install
task dev:up
```

### Manual Clone

```bash
git clone https://github.com/yourusername/bun-eth.git my-dapp
cd my-dapp
task install
task dev:up
```

## 📋 Prerequisites

- [Bun](https://bun.sh) >= 1.1.0
- [Docker](https://www.docker.com/) (for local Ethereum node)
- [Task](https://taskfile.dev/) (optional, for orchestration)

### Install Task

```bash
# macOS
brew install go-task

# Linux
sh -c "$(curl --location https://taskfile.dev/install.sh)" -- -d -b ~/.local/bin

# Or use bunx
bunx @go-task/cli
```

## 🏗️ Project Structure

```
bun-eth/
├── apps/
│   └── api/                    # Elysia backend API
│       ├── src/
│       │   ├── index.ts       # API entry point
│       │   ├── config.ts      # Configuration
│       │   ├── provider.ts    # Ethereum provider setup
│       │   └── routes/        # API routes
│       └── Dockerfile
├── packages/
│   ├── contracts/             # Smart contracts
│   │   ├── contracts/         # Solidity files
│   │   ├── scripts/          # Deploy scripts
│   │   ├── test/             # Contract tests
│   │   └── hardhat.config.ts
│   ├── core/                  # Shared utilities
│   │   └── src/
│   │       ├── types.ts      # Common types
│   │       ├── utils.ts      # Utility functions
│   │       └── logger.ts     # Logging
│   ├── sdk/                   # TypeScript SDK
│   │   └── src/
│   │       └── client.ts     # API client
│   └── create-bun-eth/        # Scaffolding CLI
├── tooling/
│   └── task/
│       └── Taskfile.yml      # Task definitions
└── docker/
    └── docker-compose.yml    # Local stack
```

## 🛠️ Development

### Start Development Stack

```bash
task dev:up
```

This starts:
- Hardhat local Ethereum node on `http://localhost:8545`
- Bun-Eth API on `http://localhost:3001`

### Stop Development Stack

```bash
task dev:down
```

### View Logs

```bash
# All services
task dev:logs

# API only
task dev:logs:api

# Hardhat node only
task dev:logs:hardhat
```

## 📜 Smart Contracts

### Compile Contracts

```bash
task contracts:compile
```

### Deploy Contracts

```bash
# Deploy to local network
task contracts:deploy

# Deploy to Sepolia
task contracts:deploy:sepolia
```

### Test Contracts

```bash
task contracts:test
```

## 🌐 API Endpoints

Base URL: `http://localhost:3001`

### Health Check

```bash
GET /health
```

Response:
```json
{
  "status": "ok",
  "timestamp": 1234567890,
  "version": "0.1.0",
  "network": {
    "chainId": 31337,
    "blockNumber": 42
  }
}
```

### Get Wallet Info

```bash
GET /wallet/:address
```

Response:
```json
{
  "address": "0x...",
  "balance": "10.5",
  "nonce": 5
}
```

### Send Transaction

```bash
POST /wallet/send
Content-Type: application/json

{
  "to": "0x...",
  "value": "1.0",
  "data": "0x..."
}
```

### Call Contract (Read)

```bash
POST /contract/call
Content-Type: application/json

{
  "contractAddress": "0x...",
  "method": "retrieve",
  "args": []
}
```

### Send Contract Transaction (Write)

```bash
POST /contract/send
Content-Type: application/json

{
  "contractAddress": "0x...",
  "method": "store",
  "args": [42],
  "value": "0"
}
```

## 🧪 Testing

### Run All Tests

```bash
task test
```

### Run Tests by Package

```bash
# Contract tests
task test:contracts

# API tests
task test:api

# SDK tests
task test:sdk

# Core tests
task test:core
```

### Watch Mode

```bash
task test:watch
```

### Coverage

```bash
task test:coverage
```

## 📦 Using the SDK

Install in your project:

```bash
bun add @bun-eth/sdk
```

Usage:

```typescript
import { createClient } from "@bun-eth/sdk";

const client = createClient({
  baseUrl: "http://localhost:3001",
  timeout: 30000,
});

// Check health
const health = await client.health();

// Get wallet info
const wallet = await client.getWallet("0x...");

// Send transaction
const tx = await client.sendTransaction({
  to: "0x...",
  value: "1.0",
});

// Call contract
const result = await client.contractCall({
  contractAddress: "0x...",
  method: "retrieve",
  args: [],
});
```

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# API Configuration
PORT=3001
NODE_ENV=development

# Ethereum Node
HARDHAT_NODE=http://localhost:8545
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Network Configuration
CHAIN_ID=31337
```

### Hardhat Networks

Edit `packages/contracts/hardhat.config.ts`:

```typescript
networks: {
  hardhat: {
    chainId: 31337,
  },
  localhost: {
    url: "http://127.0.0.1:8545",
  },
  sepolia: {
    url: process.env.SEPOLIA_RPC_URL,
    accounts: [process.env.PRIVATE_KEY],
  },
}
```

## 📚 Available Tasks

Run `task --list` to see all available commands:

```bash
task: Available tasks for this project:
* build:                 Build all packages
* check:health:          Check API health
* clean:                 Clean build artifacts and dependencies
* contracts:compile:     Compile smart contracts
* contracts:deploy:      Deploy contracts to local network
* contracts:test:        Run contract tests
* dev:down:              Stop local development stack
* dev:logs:              View logs from development stack
* dev:restart:           Restart development stack
* dev:up:                Start local development stack (API + Hardhat node)
* install:               Install all dependencies
* start:                 Quick start - install, compile, and run dev stack
* status:                Show status of development stack
* test:                  Run all tests
* test:coverage:         Run tests with coverage
* test:watch:            Run tests in watch mode
```

## 🚢 Deployment

### Deploy to Production

1. Set environment variables:
```bash
export NODE_ENV=production
export PRIVATE_KEY=your_private_key
export SEPOLIA_RPC_URL=your_rpc_url
```

2. Deploy contracts:
```bash
task contracts:deploy:sepolia
```

3. Build and deploy API:
```bash
docker build -f apps/api/Dockerfile -t bun-eth-api .
docker run -p 3001:3001 --env-file .env bun-eth-api
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- [Bun](https://bun.sh) - The blazingly fast JavaScript runtime
- [Elysia](https://elysiajs.com) - Fast and ergonomic TypeScript web framework
- [Hardhat](https://hardhat.org) - Ethereum development environment
- [scaffold-eth-2](https://github.com/scaffold-eth/scaffold-eth-2) - Inspiration

## 📞 Support

- 📖 [Documentation](https://github.com/yourusername/bun-eth/wiki)
- 🐛 [Issue Tracker](https://github.com/yourusername/bun-eth/issues)
- 💬 [Discussions](https://github.com/yourusername/bun-eth/discussions)

---

Built with ⚡ by the Bun-Eth community
