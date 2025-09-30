import { ethers } from "ethers";
import { config } from "./config";
import { Logger } from "@bun-eth/core";

const logger = new Logger({ prefix: "provider" });

let provider: ethers.JsonRpcProvider | null = null;
let wallet: ethers.Wallet | null = null;

/**
 * Get or create the JSON-RPC provider
 */
export function getProvider(): ethers.JsonRpcProvider {
  if (!provider) {
    logger.info(`Connecting to Ethereum node at ${config.ethNode}`);
    provider = new ethers.JsonRpcProvider(config.ethNode);
  }
  return provider;
}

/**
 * Get or create the wallet signer
 */
export function getWallet(): ethers.Wallet {
  if (!wallet) {
    const provider = getProvider();

    if (config.privateKey) {
      wallet = new ethers.Wallet(config.privateKey, provider);
      logger.info(`Wallet initialized: ${wallet.address}`);
    } else {
      // For development, use a default test private key
      const defaultKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
      wallet = new ethers.Wallet(defaultKey, provider);
      logger.warn(`Using default development wallet: ${wallet.address}`);
    }
  }
  return wallet;
}

/**
 * Check if provider is connected
 */
export async function checkConnection(): Promise<boolean> {
  try {
    const provider = getProvider();
    await provider.getBlockNumber();
    return true;
  } catch (error) {
    logger.error("Provider connection failed", error);
    return false;
  }
}
