# Bun-Eth Architecture

Clean architecture overview for the Bun-Eth monorepo.

## 🏗️ System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend Layer                       │
│  ┌────────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │   Next.js App  │──│  RainbowKit  │──│  Wallet Connect │ │
│  │   (apps/web)   │  │   Provider   │  │                 │ │
│  └────────┬───────┘  └──────────────┘  └─────────────────┘ │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         @bun-eth/components (UI Layer)              │   │
│  │  • Address • Balance • Faucet • Inputs              │   │
│  └─────────────────────┬───────────────────────────────┘   │
│                        │                                    │
│                        ▼                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         @bun-eth/hooks (Business Logic)             │   │
│  │  • useScaffoldContract • useScaffoldRead/Write      │   │
│  │  • useTransactor • useWatchBalance                  │   │
│  └─────────────────────┬───────────────────────────────┘   │
│                        │                                    │
└────────────────────────┼────────────────────────────────────┘
                         │
                         ▼
          ┌──────────────────────────────────┐
          │        wagmi + viem               │
          │    (Ethereum Interaction)         │
          └──────────────┬───────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   ┌────────┐      ┌─────────┐     ┌──────────┐
   │ Anvil  │      │   API   │     │ Mainnet/ │
   │ (Dev)  │      │ (Elysia)│     │ Sepolia  │
   └────────┘      └─────────┘     └──────────┘
```

## 📦 Package Structure

### Apps Layer

#### `apps/web` - Next.js Frontend
- **Purpose**: User-facing dApp interface
- **Tech Stack**: Next.js 14, React 18, Tailwind CSS
- **Dependencies**:
  - `@bun-eth/hooks` - Contract interactions
  - `@bun-eth/components` - UI components
  - `@rainbow-me/rainbowkit` - Wallet connection
  - `wagmi` - Ethereum hooks
  - `viem` - Ethereum library
- **Key Files**:
  - `src/app/` - Next.js pages (App Router)
  - `src/components/` - Local components
  - `src/lib/wagmi.ts` - Wagmi configuration

#### `apps/api` - Elysia Backend
- **Purpose**: REST API for blockchain operations
- **Tech Stack**: Elysia, Bun runtime
- **Dependencies**:
  - `@bun-eth/core` - Shared utilities
  - `@bun-eth/sdk` - API client
  - `viem` - Ethereum interactions
- **Key Files**:
  - `src/index.ts` - API entry point
  - `src/routes/` - API endpoints
  - `src/provider.ts` - Ethereum provider setup

### Packages Layer

#### `packages/contracts` - Smart Contracts
- **Purpose**: Solidity contracts and deployment
- **Tech Stack**: Foundry (Forge, Anvil, Cast)
- **Structure**:
  - `contracts/` - Solidity source files
  - `script/` - Deployment scripts
  - `test/` - Solidity tests
  - `broadcast/` - Deployment artifacts (gitignored)
  - `out/` - Compiled contracts (gitignored)
  - `deployedContracts.ts` - **Generated file for hot reload**

#### `packages/foundry-deployer` - Hot Reload System
- **Purpose**: Generate TypeScript from Foundry deployments
- **How it works**:
  1. Reads `broadcast/*/run-latest.json` from Foundry
  2. Extracts contract addresses and ABIs
  3. Generates typed `deployedContracts.ts`
  4. Next.js Fast Refresh triggers UI update
- **API**:
  ```typescript
  await generateDeployedContracts({
    foundryRoot: "./packages/contracts",
    outputPath: "./packages/contracts/deployedContracts.ts",
    networks: { 31337: { name: "localhost" } }
  });
  ```

#### `packages/hooks` - React Hooks
- **Purpose**: Type-safe React hooks for Web3 interactions
- **Architecture**: Composable hook pattern
  ```
  useDeployedContractInfo (base)
        │
        ├─→ useScaffoldContract
        │        │
        │        ├─→ useScaffoldReadContract
        │        └─→ useScaffoldWriteContract
        │
        └─→ useScaffoldEventHistory
            useScaffoldWatchContractEvent
  ```
- **Key Patterns**:
  - **Base Hook**: `useDeployedContractInfo` loads contract metadata
  - **Composition**: Higher hooks build on base hook
  - **Type Safety**: Full TypeScript inference
  - **Caching**: React Query integration

#### `packages/components` - UI Components
- **Purpose**: Reusable Web3 UI components
- **Design Principles**:
  - Composition over configuration
  - Tailwind CSS for styling
  - Accessible by default
  - Mobile-responsive
- **Categories**:
  - **Display**: Address, Balance, BlockieAvatar
  - **Input**: AddressInput, EtherInput, IntegerInput
  - **Tools**: Faucet, NetworksDropdown
- **Usage**:
  ```typescript
  import { Address, Balance } from "@bun-eth/components";

  <Address address={addr} format="short" />
  <Balance address={addr} usdMode />
  ```

#### `packages/core` - Shared Utilities
- **Purpose**: Common utilities across packages
- **Contents**:
  - Type definitions
  - Logger setup
  - Utility functions
  - Constants

#### `packages/sdk` - TypeScript SDK
- **Purpose**: Client library for the API
- **Usage**:
  ```typescript
  import { createClient } from "@bun-eth/sdk";

  const client = createClient({ baseUrl: "http://localhost:3001" });
  await client.getWallet("0x...");
  ```

### Tooling Layer

#### `tooling/task` - Task Orchestration
- **Purpose**: Command-line task runner
- **Key Tasks**:
  - `task setup` - Complete setup with tests
  - `task dev:up` - Start Docker stack
  - `task contracts:deploy` - Deploy and generate types
  - `task contracts:generate` - Generate TypeScript
  - `task web:dev` - Start Next.js dev server

---

## 🔄 Data Flow

### Contract Deployment Flow

```
Developer runs `task contracts:deploy`
          │
          ▼
┌─────────────────────────┐
│ 1. Forge deploys contract│
│    to Anvil (localhost)  │
└───────────┬──────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│ 2. Foundry writes broadcast JSON    │
│    broadcast/Deploy.s.sol/31337/    │
│    run-latest.json                  │
└───────────┬─────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│ 3. Post-deploy hook triggers        │
│    `task contracts:generate`        │
└───────────┬─────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│ 4. foundry-deployer reads artifacts │
│    and generates TypeScript         │
└───────────┬─────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│ 5. deployedContracts.ts updated     │
│    with new addresses and ABIs      │
└───────────┬─────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│ 6. Next.js detects file change      │
│    Fast Refresh triggers            │
└───────────┬─────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│ 7. React components re-render       │
│    with new contract data ✨        │
└─────────────────────────────────────┘
```

### Contract Read Flow

```
Component calls useScaffoldReadContract
          │
          ▼
┌───────────────────────────────────┐
│ 1. Hook loads contract info       │
│    from deployedContracts.ts      │
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│ 2. wagmi useReadContract called   │
│    with address and ABI           │
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│ 3. viem publicClient.readContract │
│    makes RPC call                 │
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│ 4. Anvil/Network returns value    │
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│ 5. React Query caches result      │
│    Auto-refetches on new blocks   │
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│ 6. Component receives data        │
│    TypeScript type-safe ✅        │
└───────────────────────────────────┘
```

### Contract Write Flow

```
User clicks button
          │
          ▼
┌───────────────────────────────────┐
│ 1. useScaffoldWriteContract       │
│    writeContractAsync called      │
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│ 2. useTransactor wraps call       │
│    Shows loading toast 🔄         │
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│ 3. User signs transaction         │
│    in wallet                      │
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│ 4. Transaction sent to network    │
│    Hash returned                  │
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│ 5. Wait for receipt                │
│    Block confirmations tracked    │
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│ 6. Success toast shown ✅         │
│    Contract state updated         │
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│ 7. useScaffoldReadContract        │
│    auto-refetches new state       │
└───────────────────────────────────┘
```

---

## 🔌 Integration Points

### Frontend ↔ Contracts
- **Via**: `deployedContracts.ts` (generated)
- **Type Safety**: Full TypeScript inference
- **Hot Reload**: Automatic on deployment

### Frontend ↔ Wallet
- **Via**: RainbowKit + wagmi + viem
- **Protocols**: EIP-1193, WalletConnect
- **Networks**: Mainnet, Sepolia, Localhost

### Frontend ↔ API (Optional)
- **Via**: `@bun-eth/sdk`
- **Protocol**: HTTP/REST
- **Use Cases**: Server-side operations

### Contracts ↔ Network
- **Dev**: Anvil (localhost:3002)
- **Test**: Sepolia
- **Prod**: Mainnet/L2s
- **Library**: viem (publicClient)

---

## 🎯 Design Patterns

### 1. Repository Pattern
Each package has clear responsibilities:
- **Presentation**: `apps/web`
- **Business Logic**: `packages/hooks`
- **UI**: `packages/components`
- **Data**: `packages/contracts`
- **Infrastructure**: `packages/foundry-deployer`

### 2. Dependency Inversion
High-level modules don't depend on low-level modules:
```
apps/web → packages/components → packages/hooks → wagmi
```

### 3. Composition over Inheritance
Hooks compose:
```typescript
useScaffoldReadContract() {
  const info = useDeployedContractInfo();
  return useReadContract({ ...info });
}
```

### 4. Single Responsibility
Each package has one reason to change:
- `hooks`: Change when interaction patterns change
- `components`: Change when UI requirements change
- `foundry-deployer`: Change when deployment format changes

### 5. Open/Closed Principle
Easy to extend without modifying:
- Add new hooks without changing existing ones
- Add new components without breaking others
- Add new networks in config

---

## 🚀 Performance Optimizations

### Frontend
- React Query caching
- Auto-refetch on blocks (configurable)
- Component lazy loading
- Bun's fast refresh

### Contracts
- Foundry's fast compilation
- Optimized Solidity
- Gas-efficient patterns

### Deployment
- Incremental TypeScript generation
- Selective network deployment
- Cached Docker layers

---

## 🔒 Security Considerations

### Private Keys
- Never commit private keys
- Use `.env` files (gitignored)
- Encrypted keystores for production

### Contract Verification
- Verify on Etherscan
- Publish source code
- Use reproducible builds

### Frontend Security
- No server-side key storage
- User signs all transactions
- Rate limiting on API

---

## 📈 Scalability

### Adding New Contracts
1. Write Solidity in `packages/contracts/contracts/`
2. Deploy with `task contracts:deploy`
3. TypeScript auto-generates
4. Use in frontend immediately

### Adding New Hooks
1. Create in `packages/hooks/src/`
2. Export from `index.ts`
3. Use in any app

### Adding New Networks
1. Update `wagmi.ts` config
2. Add to `foundry-deployer` networks
3. Deploy contracts
4. Done

---

## 🧪 Testing Strategy

### Unit Tests
- Hooks: React Testing Library
- Components: Jest + React Testing Library
- Utils: Bun test

### Integration Tests
- Contract interactions: Foundry tests
- API endpoints: Bun test
- E2E: Playwright (future)

### Contract Tests
- Solidity unit tests (Foundry)
- Fuzz testing
- Invariant testing
- Gas profiling

---

Built with clean architecture principles and ⚡ Bun speed.
