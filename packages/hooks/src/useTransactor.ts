import { useCallback } from "react";
import { usePublicClient } from "wagmi";
import type { TransactorFuncOptions } from "./types";

/**
 * Wraps transaction execution with notifications and confirmation tracking
 * @param options - callback and confirmation options
 * @returns transactor function
 */
export const useTransactor = (options?: TransactorFuncOptions) => {
  const publicClient = usePublicClient();

  const transactor = useCallback(
    async <T extends (...args: any[]) => Promise<`0x${string}`>>(
      transaction: T,
      transactionOptions?: TransactorFuncOptions
    ): Promise<`0x${string}` | undefined> => {
      try {
        const txHash = await transaction();

        console.log("📝 Transaction sent:", txHash);

        // Wait for confirmation
        const receipt = await publicClient?.waitForTransactionReceipt({
          hash: txHash,
          confirmations: transactionOptions?.blockConfirmations || options?.blockConfirmations || 1,
        });

        console.log("✅ Transaction confirmed:", receipt);

        // Call callback if provided
        if (transactionOptions?.onBlockConfirmation || options?.onBlockConfirmation) {
          (transactionOptions?.onBlockConfirmation || options?.onBlockConfirmation)?.(receipt);
        }

        return txHash;
      } catch (error) {
        console.error("❌ Transaction failed:", error);
        throw error;
      }
    },
    [publicClient, options]
  );

  return transactor;
};
