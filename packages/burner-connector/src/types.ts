export type BurnerWalletOptions = {
  // Storage key for localStorage
  storageKey?: string;
  // Only enable on specific chain IDs (default: [31337])
  allowedChainIds?: number[];
};
