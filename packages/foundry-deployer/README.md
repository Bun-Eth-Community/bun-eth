# @bun-eth/foundry-deployer

Foundry deployment utilities with contract hot reload support for Bun-Eth.

## Features

- 🔥 **Contract Hot Reload** - Auto-generate TypeScript from Foundry deployments
- ⚡ **Bun-Native** - Fast execution with Bun runtime
- 🎯 **Type-Safe** - Generated contracts have full TypeScript support
- 🌐 **Multi-Chain** - Support for multiple networks
- 🔄 **Auto-Update** - Next.js Fast Refresh integration

## How It Works

1. **Deploy with Foundry**: Run `forge script` to deploy contracts
2. **Generate TypeScript**: This package reads Foundry's broadcast artifacts
3. **Hot Reload**: Next.js detects the file change and updates the UI automatically

## Installation

```bash
bun add @bun-eth/foundry-deployer
```

## Usage

### As a Script

Add to your `package.json`:

```json
{
  "scripts": {
    "generate:contracts": "foundry-deployer"
  }
}
```

Run after deploying:

```bash
forge script script/Deploy.s.sol:DeployScript --broadcast
bun run generate:contracts
```

### Programmatic

```typescript
import { generateDeployedContracts } from "@bun-eth/foundry-deployer";

await generateDeployedContracts({
  foundryRoot: "./packages/contracts",
  outputPath: "./packages/contracts/deployedContracts.ts",
  networks: {
    31337: { name: "localhost", deploymentDir: "31337" },
    1: { name: "mainnet", deploymentDir: "1" },
  },
});
```

### With Foundry Post-Deploy Hook

Add to `foundry.toml`:

```toml
[profile.default]
post_deploy = "bun run generate:contracts"
```

Now contracts auto-generate after every deployment!

## Generated File Structure

```typescript
// packages/contracts/deployedContracts.ts
const deployedContracts = {
  31337: {
    SimpleStorage: {
      address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      abi: [...]
    }
  }
} as const;

export default deployedContracts;
```

## Integration with Hooks

The generated file works seamlessly with `@bun-eth/hooks`:

```typescript
import { useScaffoldReadContract } from "@bun-eth/hooks";

// Contract name and ABI are auto-loaded from deployedContracts.ts
const { data } = useScaffoldReadContract({
  contractName: "SimpleStorage", // Type-safe!
  functionName: "retrieve",
});
```

## Configuration

### Custom Networks

```typescript
await generateDeployedContracts({
  foundryRoot: "./contracts",
  outputPath: "./src/contracts/deployedContracts.ts",
  networks: {
    31337: { name: "localhost", deploymentDir: "31337" },
    1: { name: "mainnet", deploymentDir: "1" },
    10: { name: "optimism", deploymentDir: "10" },
    8453: { name: "base", deploymentDir: "8453" },
  },
});
```

### Custom Output Location

You can place the generated file anywhere:

```typescript
{
  outputPath: "./apps/web/src/contracts/deployedContracts.ts"
}
```

## Foundry Broadcast Structure

This package expects Foundry's standard broadcast structure:

```
packages/contracts/
├── broadcast/
│   └── Deploy.s.sol/
│       ├── 31337/
│       │   └── run-latest.json
│       └── 1/
│           └── run-latest.json
└── out/
    └── SimpleStorage.sol/
        └── SimpleStorage.json
```

## Hot Reload Flow

```
┌─────────────────────────────────────────────────┐
│ 1. Deploy Contracts (forge script)             │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│ 2. Foundry writes to broadcast/               │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│ 3. foundry-deployer generates TypeScript       │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│ 4. deployedContracts.ts file updated           │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│ 5. Next.js Fast Refresh detects change         │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│ 6. React components re-render with new data 🎉 │
└─────────────────────────────────────────────────┘
```

## API

### `generateDeployedContracts(config)`

Generates the TypeScript contracts file.

**Parameters:**
- `config.foundryRoot` - Path to Foundry project root
- `config.outputPath` - Where to write the generated file
- `config.networks` - Networks to include (optional)

**Returns:** `Promise<void>`

### `loadFoundryDeployment(foundryRoot, chainId)`

Loads deployment data for a specific chain.

**Parameters:**
- `foundryRoot` - Path to Foundry project root
- `chainId` - Chain ID to load

**Returns:** `FoundryDeployment`

## Requirements

- Foundry installed and configured
- Bun runtime
- Valid Foundry deployment artifacts

## License

MIT
