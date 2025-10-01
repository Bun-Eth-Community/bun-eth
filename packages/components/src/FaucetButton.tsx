import { useState } from "react";
import { Faucet } from "./Faucet";

/**
 * Button component that opens the Faucet modal
 */
export const FaucetButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        title="Get test ETH"
      >
        💰 Faucet
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Faucet onClose={() => setIsOpen(false)} />
    </div>
  );
};
