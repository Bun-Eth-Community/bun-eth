import { useCallback } from "react";
import { usePublicClient } from "wagmi";
import { logger } from "@bun-eth/core";
import type { TransactorFuncOptions } from "./types";

type TransactionFn = () => Promise<`0x${string}`>;

const txLogger = logger.child("transactor");

/**
 * Wraps transaction execution with notifications and confirmation tracking
 * @param options - callback and confirmation options
 * @returns transactor function
 */
export const useTransactor = (options?: TransactorFuncOptions) => {
  const publicClient = usePublicClient();

  const transactor = useCallback(
    async (
      transaction: TransactionFn,
      transactionOptions?: TransactorFuncOptions
    ): Promise<`0x${string}` | undefined> => {
      try {
        const txHash = await transaction();

        txLogger.debug("Transaction sent", { hash: txHash });

        // Wait for confirmation
        const receipt = await publicClient?.waitForTransactionReceipt({
          hash: txHash,
          confirmations: transactionOptions?.blockConfirmations || options?.blockConfirmations || 1,
        });

        txLogger.debug("Transaction confirmed", { hash: txHash, blockNumber: receipt?.blockNumber });

        // Call callback if provided
        const onConfirmation = transactionOptions?.onBlockConfirmation || options?.onBlockConfirmation;
        onConfirmation?.(receipt);

        return txHash;
      } catch (error) {
        txLogger.error("Transaction failed", error);
        throw error;
      }
    },
    [publicClient, options]
  );

  return transactor;
};
