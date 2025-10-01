import { useState } from "react";

export type IntegerVariant = "uint8" | "uint16" | "uint32" | "uint64" | "uint128" | "uint256" | "int256";

export type IntegerInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  variant?: IntegerVariant;
};

/**
 * Input component for integer values with variant-specific validation
 */
export const IntegerInput = ({
  value,
  onChange,
  placeholder = "0",
  disabled = false,
  variant = "uint256",
}: IntegerInputProps) => {
  const [error, setError] = useState<string>("");

  const getMaxValue = (variant: IntegerVariant): bigint => {
    switch (variant) {
      case "uint8":
        return BigInt(2 ** 8 - 1);
      case "uint16":
        return BigInt(2 ** 16 - 1);
      case "uint32":
        return BigInt(2 ** 32 - 1);
      case "uint64":
        return BigInt(2 ** 64) - 1n;
      case "uint128":
        return BigInt(2 ** 128) - 1n;
      case "uint256":
      case "int256":
      default:
        return BigInt(2 ** 256) - 1n;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Only allow digits
    if (newValue && !/^\d+$/.test(newValue)) {
      setError("Only numbers allowed");
      return;
    }

    // Validate range
    if (newValue) {
      try {
        const bigIntValue = BigInt(newValue);
        const maxValue = getMaxValue(variant);

        if (bigIntValue > maxValue) {
          setError(`Value exceeds ${variant} maximum`);
          return;
        }
      } catch {
        setError("Invalid number");
        return;
      }
    }

    setError("");
    onChange(newValue);
  };

  const multiplyBy1e18 = () => {
    try {
      const current = value ? BigInt(value) : 0n;
      const multiplied = current * BigInt(10 ** 18);
      onChange(multiplied.toString());
    } catch {
      setError("Cannot multiply");
    }
  };

  return (
    <div className="w-full">
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`flex-1 px-3 py-2 border rounded-md font-mono ${
            error ? "border-red-500" : "border-gray-300"
          } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
        />
        {variant === "uint256" && (
          <button
            onClick={multiplyBy1e18}
            disabled={disabled}
            className="px-3 py-2 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            title="Multiply by 1e18 (wei conversion)"
          >
            × 1e18
          </button>
        )}
      </div>
      <div className="mt-1 flex justify-between">
        {error && <p className="text-xs text-red-600">{error}</p>}
        <p className="text-xs text-gray-500 ml-auto">{variant}</p>
      </div>
    </div>
  );
};
