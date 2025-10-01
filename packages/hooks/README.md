# @bun-eth/hooks

Custom React hooks for Web3 interactions, inspired by Scaffold-ETH 2's hook architecture.

## Features

- 🎣 **Type-safe hooks** - Full TypeScript support with auto-completion
- ⚡ **Optimized for Bun** - Fast execution and hot reload
- 🔄 **Auto-refresh** - Real-time updates on new blocks
- 📝 **Transaction notifications** - Built-in feedback system
- 🎯 **Contract-first** - Works with auto-generated contract types

## Installation

```bash
bun add @bun-eth/hooks
```

## Core Hooks

### Contract Interaction

#### `useDeployedContractInfo`
Gets contract deployment information (address and ABI).

```typescript
const contractInfo = useDeployedContractInfo("YourContract");
// Returns: { address: "0x...", abi: [...] }
```

#### `useScaffoldContract`
Returns a viem contract instance with automatic ABI and address loading.

```typescript
const contract = useScaffoldContract({
  contractName: "YourContract",
  walletClient: true, // Enable for write operations
});
```

#### `useScaffoldReadContract`
Read from contracts with automatic type inference and caching.

```typescript
const { data, isLoading } = useScaffoldReadContract({
  contractName: "YourContract",
  functionName: "getValue",
  args: [],
  watch: true, // Auto-refresh on new blocks
});
```

#### `useScaffoldWriteContract`
Write to contracts with integrated transaction notifications.

```typescript
const { writeContractAsync, isMining } = useScaffoldWriteContract("YourContract");

await writeContractAsync("setValue", [42]);
```

### Event Monitoring

#### `useScaffoldEventHistory`
Fetch historical events with automatic batching.

```typescript
const { events, isLoading } = useScaffoldEventHistory(
  "YourContract",
  "ValueChanged",
  0n // From block
);
```

#### `useScaffoldWatchContractEvent`
Real-time event listener.

```typescript
useScaffoldWatchContractEvent({
  contractName: "YourContract",
  eventName: "ValueChanged",
  onLogs: (logs) => console.log("New events:", logs),
});
```

### Blockchain Data

#### `useWatchBalance`
Watch address balance with auto-refresh on new blocks.

```typescript
const { data: balance } = useWatchBalance(address);
```

#### `useTargetNetwork`
Get the current target network.

```typescript
const { targetNetwork } = useTargetNetwork();
```

### Transactions

#### `useTransactor`
Wrap transactions with notifications and confirmation tracking.

```typescript
const transactor = useTransactor({
  blockConfirmations: 1,
  onBlockConfirmation: (receipt) => console.log("Confirmed!", receipt),
});

const txHash = await transactor(() =>
  writeContractAsync(...)
);
```

## Usage Example

```typescript
import { useScaffoldReadContract, useScaffoldWriteContract } from "@bun-eth/hooks";

function MyComponent() {
  // Read contract state
  const { data: value } = useScaffoldReadContract({
    contractName: "SimpleStorage",
    functionName: "retrieve",
    watch: true,
  });

  // Write to contract
  const { writeContractAsync, isMining } = useScaffoldWriteContract("SimpleStorage");

  const handleStore = async () => {
    await writeContractAsync("store", [42]);
  };

  return (
    <div>
      <p>Current Value: {value?.toString()}</p>
      <button onClick={handleStore} disabled={isMining}>
        {isMining ? "Mining..." : "Store 42"}
      </button>
    </div>
  );
}
```

## Architecture

All hooks follow the Scaffold-ETH 2 pattern:

1. **Base Hook**: `useDeployedContractInfo` loads contract metadata
2. **Composition**: Higher-level hooks compose the base hook
3. **Type Safety**: Full TypeScript inference throughout
4. **Caching**: React Query integration for optimal performance

## Requirements

- React 18.2+ or React 19+
- wagmi ^2.16.4
- viem ^2.7.8
- @tanstack/react-query ^5.17.19

## License

MIT
