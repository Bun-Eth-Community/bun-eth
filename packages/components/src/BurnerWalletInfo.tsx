import { useState } from "react";
import { useAccount } from "wagmi";
import { generateBurnerWallet, clearBurnerWallet, getBurnerPrivateKey } from "@bun-eth/burner-connector";

/**
 * Shows info and controls for burner wallet
 * Only displays when connected to burner wallet
 */
export const BurnerWalletInfo = () => {
  const { address, connector, chain } = useAccount();
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const isBurner = connector?.id === "burner-wallet";
  const isLocalhost = chain?.id === 31337;

  if (!isBurner || !isLocalhost) {
    return null;
  }

  const handleCopyPrivateKey = async () => {
    try {
      const privateKey = getBurnerPrivateKey();
      await navigator.clipboard.writeText(privateKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleGenerateNew = () => {
    if (window.confirm("Generate a new burner wallet? This will replace your current one.")) {
      generateBurnerWallet();
      window.location.reload();
    }
  };

  const handleClear = () => {
    if (window.confirm("Clear burner wallet? You'll need to reconnect.")) {
      clearBurnerWallet();
      window.location.reload();
    }
  };

  return (
    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
      <div className="flex items-start gap-3">
        <span className="text-2xl">🔥</span>
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
              Burner Wallet Active
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              This is a temporary wallet for testing. Don't send real funds here!
            </p>
          </div>

          {showPrivateKey && (
            <div className="space-y-2">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/40 rounded font-mono text-xs break-all">
                {getBurnerPrivateKey()}
              </div>
              <button
                onClick={handleCopyPrivateKey}
                className="text-sm text-yellow-700 dark:text-yellow-300 hover:underline"
              >
                {copied ? "✓ Copied!" : "Copy private key"}
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-2 text-sm">
            <button
              onClick={() => setShowPrivateKey(!showPrivateKey)}
              className="px-3 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 rounded hover:bg-yellow-300 dark:hover:bg-yellow-700 transition-colors"
            >
              {showPrivateKey ? "Hide" : "Show"} Private Key
            </button>
            <button
              onClick={handleGenerateNew}
              className="px-3 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 rounded hover:bg-yellow-300 dark:hover:bg-yellow-700 transition-colors"
            >
              Generate New
            </button>
            <button
              onClick={handleClear}
              className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
            >
              Clear Wallet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
