# create-bun-eth

Scaffold a Bun-first Ethereum project with Foundry and Elysia.

## Usage

```bash
bunx create-bun-eth@latest my-dapp
cd my-dapp
task setup
```

## What You Get

- 🚀 **Bun-Native** - 100% Bun, no Node.js required
- ⚡ **Elysia Backend** - Fast, TypeScript-first web framework
- 📜 **Foundry Contracts** - Blazing fast Rust-based smart contract framework
- 🐳 **Docker Compose** - Complete local development environment with Anvil
- 📦 **Monorepo** - Clean separation of concerns with workspaces
- 🧪 **Native Tests** - Bun tests for SDK/API, Solidity tests for contracts
- 🔧 **Taskfile** - Powerful command orchestration
- 🎨 **TypeScript** - Full type safety across the stack

## Prerequisites

- [Bun](https://bun.sh) >= 1.1.0
- [Foundry](https://getfoundry.sh/)
- [Docker](https://www.docker.com/)
- [Task](https://taskfile.dev/) (optional)

## Quick Start

1. Create a new project:
   ```bash
   bunx create-bun-eth@latest my-dapp
   ```

2. Navigate to project:
   ```bash
   cd my-dapp
   ```

3. Complete setup (installs deps, compiles contracts, runs tests):
   ```bash
   task setup
   ```

4. Start development stack:
   ```bash
   task dev:up
   ```

5. Deploy contracts:
   ```bash
   task contracts:deploy
   ```

## Available Commands

```bash
task setup              # Complete setup with tests
task dev:up             # Start Anvil + API
task dev:down           # Stop services
task check:health       # Verify API is healthy
task test               # Run Bun tests
task contracts:test     # Run Foundry tests
task --list             # See all commands
```

## Project Structure

```
my-dapp/
├── apps/api/           # Elysia backend API
├── packages/
│   ├── contracts/      # Foundry smart contracts
│   ├── core/          # Shared utilities & types
│   └── sdk/           # TypeScript SDK
├── docker/            # Docker Compose setup
└── tooling/task/      # Taskfile orchestration
```

## Services

- **API**: `http://localhost:3001`
- **Anvil**: `http://localhost:8545`

## Documentation

For full documentation, visit the [main repository](https://github.com/Bun-Eth-Community/bun-eth).

## License

MIT
