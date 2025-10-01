/**
 * @bun-eth/hooks - Custom React hooks for Web3 interactions
 * Inspired by Scaffold-ETH 2's hook architecture
 */

// Contract interaction hooks
export { useDeployedContractInfo } from "./useDeployedContractInfo";
export { useScaffoldContract } from "./useScaffoldContract";
export { useScaffoldReadContract } from "./useScaffoldReadContract";
export { useScaffoldWriteContract } from "./useScaffoldWriteContract";

// Event monitoring hooks
export { useScaffoldEventHistory } from "./useScaffoldEventHistory";
export { useScaffoldWatchContractEvent } from "./useScaffoldWatchContractEvent";

// Blockchain data hooks
export { useWatchBalance } from "./useWatchBalance";
export { useTargetNetwork } from "./useTargetNetwork";

// Transaction hooks
export { useTransactor } from "./useTransactor";

// Utility hooks
export { useAnimationConfig } from "./useAnimationConfig";

// Types
export type * from "./types";
