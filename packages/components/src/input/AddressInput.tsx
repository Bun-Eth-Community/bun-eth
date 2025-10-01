import { useState } from "react";
import { isAddress, type Address } from "viem";

export type AddressInputProps = {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

/**
 * Input component for Ethereum addresses with validation
 */
export const AddressInput = ({
  value = "",
  onChange,
  placeholder = "0x...",
  disabled = false,
}: AddressInputProps) => {
  const [error, setError] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    if (newValue && !isAddress(newValue)) {
      setError("Invalid Ethereum address");
    } else {
      setError("");
    }
  };

  return (
    <div className="w-full">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-md font-mono text-sm ${
          error ? "border-red-500" : "border-gray-300"
        } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};
