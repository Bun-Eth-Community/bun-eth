"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { DeployedContracts } from "./types";

interface ContractsContextValue {
  contracts: DeployedContracts | null;
}

const ContractsContext = createContext<ContractsContextValue>({ contracts: null });

export interface ContractsProviderProps {
  /** Deployed contracts by chain ID */
  contracts: DeployedContracts;
  children: ReactNode;
}

/**
 * Provider for deployed contracts configuration.
 * Wrap your app with this provider and pass your deployed contracts.
 *
 * @example
 * ```tsx
 * import { ContractsProvider } from "@bun-eth/hooks";
 * import deployedContracts from "./contracts/deployedContracts";
 *
 * function App({ children }) {
 *   return (
 *     <ContractsProvider contracts={deployedContracts}>
 *       {children}
 *     </ContractsProvider>
 *   );
 * }
 * ```
 */
export function ContractsProvider({ contracts, children }: ContractsProviderProps) {
  return (
    <ContractsContext.Provider value={{ contracts }}>
      {children}
    </ContractsContext.Provider>
  );
}

/**
 * Hook to access deployed contracts from context.
 * Must be used within a ContractsProvider.
 */
export function useContracts(): DeployedContracts | null {
  const context = useContext(ContractsContext);
  return context.contracts;
}
