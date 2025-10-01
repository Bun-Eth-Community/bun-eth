/**
 * @bun-eth/burner-connector
 * Ephemeral wallet connector for quick local testing
 */

export { burnerWalletConnector } from "./burnerConnector";
export { getBurnerPrivateKey, generateBurnerWallet, clearBurnerWallet } from "./storage";
export type { BurnerWalletOptions } from "./types";
