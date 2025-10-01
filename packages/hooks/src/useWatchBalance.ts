import { useEffect } from "react";
import { useBalance, useBlockNumber } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import type { Address } from "viem";

/**
 * Wrapper around useBalance that automatically refetches on new blocks
 * @param address - address to watch balance for
 * @returns balance data from wagmi
 */
export const useWatchBalance = (address?: Address) => {
  const queryClient = useQueryClient();
  const { data: blockNumber } = useBlockNumber({ watch: true });

  const balance = useBalance({
    address,
  });

  useEffect(() => {
    if (blockNumber && address) {
      queryClient.invalidateQueries({
        queryKey: ["balance", { address }],
      });
    }
  }, [blockNumber, address, queryClient]);

  return balance;
};
