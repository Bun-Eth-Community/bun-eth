import { useState } from "react";
import { parseEther, formatEther } from "viem";

export type EtherInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  usdMode?: boolean;
};

/**
 * Input component for Ether amounts with USD conversion toggle
 */
export const EtherInput = ({
  value,
  onChange,
  placeholder = "0.0",
  disabled = false,
  usdMode = false,
}: EtherInputProps) => {
  const [showUsd, setShowUsd] = useState(usdMode);
  const [error, setError] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Validate number format
    if (newValue && !/^\d*\.?\d*$/.test(newValue)) {
      setError("Invalid number format");
      return;
    }

    setError("");
    onChange(newValue);
  };

  // TODO: Integrate with price feed
  const ethToUsd = (eth: string) => {
    try {
      return (parseFloat(eth) * 2000).toFixed(2);
    } catch {
      return "0.00";
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2 pr-20 border rounded-md ${
            error ? "border-red-500" : "border-gray-300"
          } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
        />
        <button
          onClick={() => setShowUsd(!showUsd)}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          {showUsd ? "USD" : "ETH"}
        </button>
      </div>
      {showUsd && value && !error && (
        <p className="mt-1 text-xs text-gray-600">≈ ${ethToUsd(value)} USD</p>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};
