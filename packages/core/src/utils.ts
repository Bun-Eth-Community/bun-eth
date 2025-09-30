/**
 * Validates an Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Formats wei to ether string
 */
export function formatEther(wei: bigint): string {
  return (Number(wei) / 1e18).toFixed(18);
}

/**
 * Parses ether string to wei
 */
export function parseEther(ether: string): bigint {
  return BigInt(Math.floor(parseFloat(ether) * 1e18));
}

/**
 * Validates a transaction hash
 */
export function isValidTxHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Shortens an address for display (0x1234...5678)
 */
export function shortenAddress(address: string, chars = 4): string {
  if (!isValidAddress(address)) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Delays execution for a specified time
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
