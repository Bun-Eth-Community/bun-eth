# @bun-eth/components

Reusable Web3 UI components for building Ethereum dApps, inspired by Scaffold-ETH 2.

## Features

- 🎨 **Ready-to-use components** - Address display, balance, inputs, and more
- 🔌 **Plug and play** - Works with `@bun-eth/hooks` out of the box
- 💅 **Tailwind CSS** - Styled with Tailwind, customizable
- ♿ **Accessible** - Built with accessibility in mind
- 📱 **Responsive** - Mobile-friendly designs

## Installation

```bash
bun add @bun-eth/components @bun-eth/hooks
```

## Components

### Address Display

```typescript
import { Address } from "@bun-eth/components";

<Address
  address="0x..."
  format="short" // or "long"
  size="base" // xs | sm | base | lg | xl
/>
```

Features:
- ENS name resolution
- Copy to clipboard
- Link to block explorer
- Blockie avatar

### Balance

```typescript
import { Balance } from "@bun-eth/components";

<Balance
  address="0x..."
  usdMode={false} // Toggle USD display
/>
```

Features:
- Auto-refresh on new blocks
- USD conversion toggle
- Loading and error states

### BlockieAvatar

```typescript
import { BlockieAvatar } from "@bun-eth/components";

<BlockieAvatar
  address="0x..."
  size={24}
/>
```

Generates a unique, deterministic avatar for any Ethereum address.

### Faucet

```typescript
import { Faucet, FaucetButton } from "@bun-eth/components";

// As a button
<FaucetButton />

// As a modal
<Faucet onClose={() => {}} />
```

Local faucet for Anvil development network. Sends test ETH to any address.

### Input Components

#### AddressInput
```typescript
import { AddressInput } from "@bun-eth/components";

<AddressInput
  value={address}
  onChange={setAddress}
  placeholder="0x..."
/>
```

With built-in validation for Ethereum addresses.

#### EtherInput
```typescript
import { EtherInput } from "@bun-eth/components";

<EtherInput
  value={amount}
  onChange={setAmount}
  usdMode={false}
/>
```

Amount input with USD conversion toggle.

#### IntegerInput
```typescript
import { IntegerInput } from "@bun-eth/components";

<IntegerInput
  value={value}
  onChange={setValue}
  variant="uint256" // uint8 | uint16 | uint32 | uint64 | uint128 | uint256 | int256
/>
```

Integer input with variant-specific validation and wei conversion button.

### NetworksDropdown

```typescript
import { NetworksDropdown } from "@bun-eth/components";

<NetworksDropdown />
```

Dropdown to switch between configured networks.

## Styling

All components use Tailwind CSS classes. You can customize by:

1. **Overriding with className prop** (where supported)
2. **Extending Tailwind config** with your theme
3. **Using CSS modules** for complete custom styling

## Example Usage

```typescript
import {
  Address,
  Balance,
  FaucetButton,
  NetworksDropdown
} from "@bun-eth/components";
import { useAccount } from "wagmi";

function Header() {
  const { address } = useAccount();

  return (
    <div className="flex items-center justify-between p-4">
      <h1>My dApp</h1>

      <div className="flex items-center gap-4">
        <NetworksDropdown />
        {address && (
          <>
            <Balance address={address} />
            <Address address={address} format="short" />
          </>
        )}
        <FaucetButton />
      </div>
    </div>
  );
}
```

## Requirements

- React 18.2+ or React 19+
- Tailwind CSS 3.4+
- wagmi ^2.16.4
- viem ^2.7.8
- @bun-eth/hooks (workspace)

## License

MIT
