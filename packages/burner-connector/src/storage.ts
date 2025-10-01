import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import type { Address, PrivateKeyAccount } from "viem";

const DEFAULT_STORAGE_KEY = "bun-eth-burner-wallet";

/**
 * Get or generate a burner wallet private key from localStorage
 */
export function getBurnerPrivateKey(storageKey: string = DEFAULT_STORAGE_KEY): `0x${string}` {
  if (typeof window === "undefined") {
    throw new Error("Burner wallet can only be used in browser environment");
  }

  // Try to get existing key from localStorage
  const existingKey = window.localStorage.getItem(storageKey);

  if (existingKey && existingKey.startsWith("0x")) {
    return existingKey as `0x${string}`;
  }

  // Generate new private key
  const privateKey = generatePrivateKey();
  window.localStorage.setItem(storageKey, privateKey);

  return privateKey;
}

/**
 * Generate a new burner wallet (replaces existing one)
 */
export function generateBurnerWallet(storageKey: string = DEFAULT_STORAGE_KEY): PrivateKeyAccount {
  if (typeof window === "undefined") {
    throw new Error("Burner wallet can only be used in browser environment");
  }

  const privateKey = generatePrivateKey();
  window.localStorage.setItem(storageKey, privateKey);

  return privateKeyToAccount(privateKey);
}

/**
 * Clear the burner wallet from storage
 */
export function clearBurnerWallet(storageKey: string = DEFAULT_STORAGE_KEY): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(storageKey);
}

/**
 * Get the burner wallet account
 */
export function getBurnerAccount(storageKey: string = DEFAULT_STORAGE_KEY): PrivateKeyAccount {
  const privateKey = getBurnerPrivateKey(storageKey);
  return privateKeyToAccount(privateKey);
}
