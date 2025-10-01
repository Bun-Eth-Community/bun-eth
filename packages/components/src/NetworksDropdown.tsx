import { useState } from "react";
import { useSwitchChain, useAccount } from "wagmi";
import { mainnet, sepolia, localhost } from "wagmi/chains";

const networks = [mainnet, sepolia, localhost];

/**
 * Dropdown to switch between configured networks
 */
export const NetworksDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();

  const handleSwitch = (chainId: number) => {
    switchChain({ chainId });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2"
      >
        <span className="w-2 h-2 rounded-full bg-green-500" />
        <span className="font-medium">{chain?.name || "Select Network"}</span>
        <span className="text-xs">▼</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 right-0 bg-white rounded-md shadow-lg border border-gray-200 min-w-[200px] z-20">
            {networks.map((network) => (
              <button
                key={network.id}
                onClick={() => handleSwitch(network.id)}
                className={`w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-md last:rounded-b-md transition-colors ${
                  chain?.id === network.id ? "bg-blue-50 text-blue-700 font-medium" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      chain?.id === network.id ? "bg-blue-500" : "bg-gray-300"
                    }`}
                  />
                  {network.name}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
