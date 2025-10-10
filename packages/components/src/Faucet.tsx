import { useState } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { parseEther, type Address } from "viem";

export type FaucetProps = {
  onClose: () => void;
};

/**
 * Local faucet component for Anvil development network
 * Sends test ETH to any address
 */
export const Faucet = ({ onClose }: FaucetProps) => {
  const [address, setAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("1");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const { chain } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  // Only enable on local network
  const isLocalNetwork = chain?.id === (31337 as any);

  const handleSend = async () => {
    if (!walletClient || !isLocalNetwork || !address || !amount) {
      setError("Invalid input or not on local network");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const hash = await walletClient.sendTransaction({
        to: address as Address,
        value: parseEther(amount),
      });

      await publicClient?.waitForTransactionReceipt({ hash });

      setAddress("");
      setAmount("1");
      onClose();
    } catch (err: any) {
      setError(err.message || "Transaction failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLocalNetwork) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg max-w-md">
        <h2 className="text-xl font-bold mb-4">Local Faucet</h2>
        <p className="text-gray-600">
          Faucet is only available on local Anvil network (Chain ID: 31337)
        </p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-md">
      <h2 className="text-xl font-bold mb-4">Local Faucet 💰</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recipient Address
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount (ETH)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.1"
            min="0.1"
            max="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}

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
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
