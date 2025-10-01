import { useEffect, useState } from "react";
import { useEnsName } from "wagmi";
import type { Address as AddressType } from "viem";
import { BlockieAvatar } from "./BlockieAvatar";

export type AddressProps = {
  address?: AddressType;
  disableAddressLink?: boolean;
  format?: "short" | "long";
  size?: "xs" | "sm" | "base" | "lg" | "xl";
  onCopy?: () => void;
};

/**
 * Displays an Ethereum address with ENS name resolution, copy functionality, and blockie avatar
 */
export const Address = ({
  address,
  disableAddressLink,
  format = "short",
  size = "base",
  onCopy,
}: AddressProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const { data: ensName } = useEnsName({ address, chainId: 1 });

  const handleCopy = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setIsCopied(true);
      onCopy?.();
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (!address) {
    return <span className="text-gray-400">No address</span>;
  }

  const formattedAddress =
    format === "short" ? `${address.slice(0, 6)}...${address.slice(-4)}` : address;

  const blockExplorerUrl = `https://etherscan.io/address/${address}`;

  return (
    <div className={`flex items-center gap-2 font-mono text-${size}`}>
      <BlockieAvatar address={address} size={size === "xs" ? 16 : size === "sm" ? 20 : 24} />
      <span className="font-medium">
        {ensName || formattedAddress}
      </span>
      <button
        onClick={handleCopy}
        className="text-blue-500 hover:text-blue-600"
        title="Copy address"
      >
        {isCopied ? "✓" : "⎘"}
      </button>
      {!disableAddressLink && (
        <a
          href={blockExplorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600"
          title="View on Etherscan"
        >
          ↗
        </a>
      )}
    </div>
  );
};
