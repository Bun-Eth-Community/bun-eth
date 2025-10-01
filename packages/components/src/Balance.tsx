import { useState } from "react";
import { useWatchBalance } from "@bun-eth/hooks";
import { formatEther } from "viem";
import type { Address } from "viem";

export type BalanceProps = {
  address?: Address;
  className?: string;
  usdMode?: boolean;
};

/**
 * Displays wallet balance with optional USD conversion
 */
export const Balance = ({ address, className = "", usdMode = false }: BalanceProps) => {
  const [showUsd, setShowUsd] = useState(usdMode);
  const { data: balance, isLoading, isError } = useWatchBalance(address);

  if (isLoading) {
    return <div className={`animate-pulse ${className}`}>Loading...</div>;
  }

  if (isError || !balance) {
    return <div className={`text-red-500 ${className}`}>Error loading balance</div>;
  }

  const formattedBalance = parseFloat(formatEther(balance.value)).toFixed(4);

  // TODO: Integrate with price feed for USD conversion
  const usdValue = showUsd ? (parseFloat(formattedBalance) * 2000).toFixed(2) : null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={() => setShowUsd(!showUsd)}
        className="font-mono font-medium hover:text-blue-500 transition-colors"
      >
        {showUsd && usdValue ? (
          <span>${usdValue}</span>
        ) : (
          <span>
            {formattedBalance} {balance.symbol}
          </span>
        )}
      </button>
    </div>
  );
};
