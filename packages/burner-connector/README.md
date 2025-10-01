# @bun-eth/burner-connector

Ephemeral burner wallet connector for wagmi - perfect for quick local testing without MetaMask.

## Features

- 🔥 **Instant Testing** - No wallet setup required
- 💾 **Persistent** - Stored in localStorage (survives page refresh)
- 🔒 **Local Only** - Restricted to localhost by default (Chain ID: 31337)
- 🎯 **Type-Safe** - Full TypeScript support
- ⚡ **Bun-Optimized** - Works seamlessly with Bun-Eth stack

## Installation

```bash
bun add @bun-eth/burner-connector
```

## Usage

### Basic Setup with wagmi

```typescript
import { createConfig } from "wagmi";
import { localhost } from "wagmi/chains";
import { burnerWalletConnector } from "@bun-eth/burner-connector";

const config = createConfig({
  chains: [localhost],
  connectors: [
    burnerWalletConnector({
      storageKey: "my-burner-wallet",
      allowedChainIds: [31337], // Only localhost
    }),
  ],
});
```

### With RainbowKit

```typescript
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { burnerWalletConnector } from "@bun-eth/burner-connector";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Development",
      wallets: [burnerWalletConnector()],
    },
  ],
  {
    appName: "My dApp",
    projectId: "YOUR_PROJECT_ID",
  }
);
```

### Utility Functions

#### Generate a New Burner Wallet

```typescript
import { generateBurnerWallet, clearBurnerWallet } from "@bun-eth/burner-connector";

// Generate new burner wallet (replaces existing)
const account = generateBurnerWallet();
console.log("New burner address:", account.address);

// Clear burner wallet
clearBurnerWallet();
```

#### Get Current Burner Private Key

```typescript
import { getBurnerPrivateKey } from "@bun-eth/burner-connector";

// Get or create burner private key
const privateKey = getBurnerPrivateKey();
```

## Configuration Options

```typescript
type BurnerWalletOptions = {
  // Storage key for localStorage (default: "bun-eth-burner-wallet")
  storageKey?: string;

  // Only enable on specific chain IDs (default: [31337])
  allowedChainIds?: number[];
};
```

## Security Considerations

⚠️ **Important Security Notes:**

1. **Development Only** - Burner wallets are for testing, NOT production
2. **Private Keys in LocalStorage** - Keys are stored unencrypted in browser
3. **Localhost Only** - Default configuration restricts to Chain ID 31337
4. **No Real Funds** - Never send real ETH to a burner wallet
5. **Clear After Use** - Consider clearing burner wallets after testing

## Use Cases

### 1. Quick dApp Testing

Test your dApp without constantly switching MetaMask networks:

```typescript
// Connect to burner wallet
await connect({ connector: burnerConnector });

// Burner wallet is ready with test ETH (from local faucet)
```

### 2. Automated Testing

Use in E2E tests for consistent wallet state:

```typescript
import { getBurnerAccount } from "@bun-eth/burner-connector";

const testAccount = getBurnerAccount("test-wallet-1");
// Use in Playwright/Cypress tests
```

### 3. Demo Applications

Let users try your dApp without wallet installation:

```typescript
// Show "Try Demo" button
// Connects to burner wallet automatically
// Pre-fund with test tokens
```

## Storage Format

The burner wallet stores the private key in localStorage:

```javascript
// Key: "bun-eth-burner-wallet" (or custom key)
// Value: "0x..." (private key hex string)
localStorage.getItem("bun-eth-burner-wallet");
// => "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
```

## Integration with Bun-Eth Stack

### With Faucet Component

```typescript
import { FaucetButton } from "@bun-eth/components";
import { useAccount } from "wagmi";
import { burnerWalletConnector } from "@bun-eth/burner-connector";

function DevTools() {
  const { address, connector } = useAccount();
  const isBurner = connector?.id === "burner-wallet";

  return (
    <div>
      {isBurner && <p>🔥 Using Burner Wallet</p>}
      {address && <FaucetButton />}
    </div>
  );
}
```

### Conditional Rendering

Only show burner wallet on localhost:

```typescript
import { useAccount } from "wagmi";

const { chain } = useAccount();
const isLocalhost = chain?.id === 31337;

// Only show burner option on localhost
{isLocalhost && <BurnerWalletButton />}
```

## API Reference

### `burnerWalletConnector(options?)`

Creates a wagmi connector for burner wallet.

**Parameters:**
- `options.storageKey` - localStorage key (default: "bun-eth-burner-wallet")
- `options.allowedChainIds` - Allowed chain IDs (default: [31337])

**Returns:** Wagmi connector

### `getBurnerPrivateKey(storageKey?)`

Gets or generates a burner private key.

**Parameters:**
- `storageKey` - localStorage key (optional)

**Returns:** Private key as `0x${string}`

### `generateBurnerWallet(storageKey?)`

Generates a new burner wallet (replaces existing).

**Parameters:**
- `storageKey` - localStorage key (optional)

**Returns:** `PrivateKeyAccount` from viem

### `clearBurnerWallet(storageKey?)`

Clears the burner wallet from localStorage.

**Parameters:**
- `storageKey` - localStorage key (optional)

**Returns:** void

### `getBurnerAccount(storageKey?)`

Gets the current burner wallet account.

**Parameters:**
- `storageKey` - localStorage key (optional)

**Returns:** `PrivateKeyAccount` from viem

## Comparison with MetaMask

| Feature | Burner Wallet | MetaMask |
|---------|--------------|----------|
| Setup Time | Instant | Requires extension |
| Test Network | Localhost only | Any network |
| Private Key | localStorage | Encrypted vault |
| Security | ⚠️ Low | ✅ High |
| Use Case | Testing | Production |
| Persistence | Session | Permanent |

## Troubleshooting

### Burner wallet not connecting

Check that you're on localhost (Chain ID 31337):

```typescript
const { chain } = useAccount();
console.log("Current chain:", chain?.id);
// Should be 31337 for burner wallet
```

### Private key not persisting

Ensure localStorage is available:

```typescript
if (typeof window !== "undefined") {
  console.log("LocalStorage available");
}
```

### Cannot use on mainnet

This is by design! Burner wallets are restricted to test networks:

```typescript
burnerWalletConnector({
  allowedChainIds: [31337], // Only localhost
});
```

## Examples

See the [Bun-Eth example app](../../apps/web) for a complete implementation with:
- RainbowKit integration
- Burner wallet UI
- Faucet integration
- Network detection

## License

MIT

---

⚠️ **Remember:** Burner wallets are for development only. Never use in production or with real funds!
