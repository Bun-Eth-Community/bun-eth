# Bun-Eth Features

Complete feature list inspired by Scaffold-ETH 2, optimized for Bun.

## ✅ Core Features

### 🔥 Contract Hot Reload
Your frontend auto-adapts to your smart contract as you edit and deploy it.

**How it works:**
1. Deploy contracts with `task contracts:deploy`
2. `@bun-eth/foundry-deployer` automatically generates TypeScript types
3. Next.js Fast Refresh detects the change
4. Your UI updates instantly with new contract data

**Implementation:**
- `packages/foundry-deployer` - Reads Foundry broadcast artifacts
- Generates `packages/contracts/deployedContracts.ts`
- All hooks automatically load from this file
- Zero manual configuration needed

### 🎣 Custom Hooks
Collection of React hooks wrapper around wagmi to simplify interactions with smart contracts with TypeScript autocompletion.

**Available Hooks:**
- `useDeployedContractInfo` - Get contract address and ABI
- `useScaffoldContract` - Get viem contract instance
- `useScaffoldReadContract` - Read contract state with auto-refresh
- `useScaffoldWriteContract` - Write to contracts with notifications
- `useScaffoldEventHistory` - Fetch historical events
- `useScaffoldWatchContractEvent` - Real-time event monitoring
- `useWatchBalance` - Watch address balance
- `useTargetNetwork` - Get current network
- `useTransactor` - Transaction wrapper with confirmations

**Example:**
```typescript
import { useScaffoldReadContract } from "@bun-eth/hooks";

const { data: value } = useScaffoldReadContract({
  contractName: "SimpleStorage",
  functionName: "retrieve",
  watch: true, // Auto-refresh on new blocks
});
```

### 🧱 Components
Collection of common web3 components to quickly build your frontend.

**Available Components:**
- `<Address>` - Display Ethereum addresses with ENS, copy, and explorer link
- `<Balance>` - Show wallet balance with USD toggle
- `<BlockieAvatar>` - Unique avatar for any address
- `<Faucet>` - Local faucet for test ETH (Anvil only)
- `<FaucetButton>` - Trigger faucet modal
- `<NetworksDropdown>` - Switch between networks
- **Input Components:**
  - `<AddressInput>` - Validated address input
  - `<EtherInput>` - Amount input with USD conversion
  - `<IntegerInput>` - Integer input with wei conversion

**Example:**
```typescript
import { Address, Balance, FaucetButton } from "@bun-eth/components";

<Address address={userAddress} format="short" />
<Balance address={userAddress} usdMode />
<FaucetButton />
```

### 💰 Burner Wallet & Local Faucet
Quickly test your application with a burner wallet and local faucet.

**Burner Wallet:**
- ✅ Instant wallet generation - no MetaMask required
- ✅ Stored in localStorage (survives page refresh)
- ✅ Custom wagmi connector
- ✅ Show/hide private key
- ✅ Generate new or clear existing wallet
- ✅ Only works on localhost (Chain ID: 31337)
- ✅ Visual indicator when active

**Local Faucet:**
- ✅ Built-in component for Anvil network
- ✅ Send test ETH to any address
- ✅ Simple modal UI
- ✅ Works with burner wallet or MetaMask
- ✅ Only enabled on localhost (Chain ID: 31337)

### 🔐 Integration with Wallet Providers
Connect to different wallet providers and interact with the Ethereum network.

**Powered by:**
- **RainbowKit** - Beautiful wallet connection UI
- **wagmi** - React hooks for Ethereum
- **viem** - TypeScript Ethereum library

**Supported Wallets:**
- MetaMask
- Coinbase Wallet
- WalletConnect (mobile wallets)
- Injected wallets
- Any wallet that supports EIP-1193

**Features:**
- Multi-wallet support
- Network switching
- Account switching
- Transaction signing
- Contract interactions
- ENS resolution

---

## 🎨 Additional Features

### ⚡ Bun-Native
- 100% Bun runtime
- No Node.js required
- Fast package installs
- Quick script execution
- Hot reload optimized

### 🔨 Foundry Integration
- Forge for contract compilation
- Anvil for local Ethereum node
- Cast for blockchain interactions
- Fast Solidity testing
- Gas-efficient contracts

### 🌈 Modern UI
- Next.js 14 with App Router
- Tailwind CSS for styling
- shadcn/ui components
- Dark mode support
- Responsive design
- Beautiful gradients and animations

### 📦 Monorepo Structure
Clean separation of concerns:
- `apps/web` - Next.js frontend
- `apps/api` - Elysia backend
- `packages/contracts` - Foundry contracts
- `packages/core` - Shared utilities
- `packages/sdk` - TypeScript SDK
- `packages/hooks` - React hooks
- `packages/components` - UI components
- `packages/foundry-deployer` - Hot reload system

### 🔄 Auto-Refresh
- Balance updates on new blocks
- Contract reads auto-refresh
- Event listeners in real-time
- Network state synchronization

### 📝 TypeScript Throughout
- Full type safety
- Auto-completion
- Type inference from ABIs
- Generated contract types
- Strict mode enabled

### 🐳 Docker Development
- Anvil node in container
- API in container
- Web UI in container
- One command to start: `task dev:up`
- Volume mounts for hot reload

### 🧪 Testing
- Bun test runner for TypeScript
- Foundry tests for Solidity
- Fast execution
- Coverage reports
- Integration tests

---

## 📊 Feature Comparison

| Feature | Scaffold-ETH 2 | Bun-Eth |
|---------|---------------|---------|
| Contract Hot Reload | ✅ Hardhat | ✅ Foundry |
| Custom Hooks | ✅ 10+ hooks | ✅ 10+ hooks |
| Web3 Components | ✅ Multiple | ✅ Multiple |
| Burner Wallet | ✅ | ⚠️  Coming soon |
| Local Faucet | ✅ | ✅ |
| Wallet Providers | ✅ RainbowKit | ✅ RainbowKit |
| Runtime | Node.js | ⚡ **Bun** |
| Contract Framework | Hardhat | ⚡ **Foundry** |
| Frontend | Next.js 14 | Next.js 14 |
| UI Library | DaisyUI | ⚡ **shadcn/ui** |
| Type Safety | ✅ | ✅ |
| Docker | ❌ | ⚡ **Built-in** |
| Monorepo | Yarn | ⚡ **Bun** |

---

## 🚀 Coming Soon

- [ ] Price feed integration for USD values
- [ ] Contract verification helper
- [ ] Multi-sig wallet support
- [ ] Subgraph integration
- [ ] IPFS file upload component
- [ ] Transaction history component
- [ ] Gas price estimator
- [ ] Token approval manager
- [ ] NFT gallery component

---

## 📚 Documentation

- [README.md](./README.md) - Getting started
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [packages/hooks/README.md](./packages/hooks/README.md) - Hooks documentation
- [packages/components/README.md](./packages/components/README.md) - Components documentation
- [packages/foundry-deployer/README.md](./packages/foundry-deployer/README.md) - Hot reload system

---

Built with ⚡ by the Bun-Eth community
