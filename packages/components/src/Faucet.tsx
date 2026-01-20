import { memo, useCallback, useState } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { parseEther, type Address } from "viem";
import { localhost } from "viem/chains";

export type FaucetProps = {
  onClose: () => void;
};

// Local development chain IDs (Anvil, Hardhat, Ganache)
const LOCAL_CHAIN_IDS = [localhost.id, 1337];

type FaucetStatus = "idle" | "loading" | "success" | "error";

/**
 * Local faucet component for Anvil development network
 * Sends test ETH to any address
 */
export const Faucet = memo(function Faucet({ onClose }: FaucetProps) {
  const [address, setAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("1");
  const [status, setStatus] = useState<FaucetStatus>("idle");
  const [error, setError] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");

  const { chain } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  // Only enable on local network
  const isLocalNetwork = chain?.id ? LOCAL_CHAIN_IDS.includes(chain.id) : false;

  const handleSend = useCallback(async () => {
    if (!walletClient || !isLocalNetwork || !address || !amount) {
      setError("Invalid input or not on local network");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setError("");
    setTxHash("");

    try {
      const hash = await walletClient.sendTransaction({
        to: address as Address,
        value: parseEther(amount),
      });

      setTxHash(hash);
      await publicClient?.waitForTransactionReceipt({ hash });
      setStatus("success");

      // Auto-close after showing success for 2 seconds
      setTimeout(() => {
        setAddress("");
        setAmount("1");
        setStatus("idle");
        setTxHash("");
        onClose();
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Transaction failed";
      setError(errorMessage);
      setStatus("error");
    }
  }, [walletClient, isLocalNetwork, address, amount, publicClient, onClose]);

  if (!isLocalNetwork) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Local Faucet</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Faucet is only available on local networks (Anvil/Hardhat)
        </p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 dark:text-white"
        >
          Close
        </button>
      </div>
    );
  }

  // Success state
  if (status === "success") {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md">
        <div className="text-center space-y-4">
          <div className="text-5xl">✅</div>
          <h2 className="text-xl font-bold text-green-600 dark:text-green-400">
            Transaction Sent!
          </h2>
          {txHash && (
            <p className="text-xs font-mono text-gray-500 dark:text-gray-400 break-all">
              {txHash}
            </p>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Closing automatically...
          </p>
        </div>
      </div>
    );
  }

  const isLoading = status === "loading";

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md">
      <h2 className="text-xl font-bold mb-4 dark:text-white">Local Faucet 💰</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Recipient Address
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x..."
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md font-mono text-sm bg-white dark:bg-gray-700 dark:text-white disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Amount (ETH)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.1"
            min="0.1"
            max="100"
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white disabled:opacity-50"
          />
        </div>

        {status === "error" && error && (
          <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleSend}
            disabled={isLoading || !address || !amount}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Sending..." : "Send ETH"}
          </button>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 dark:text-white disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
});
