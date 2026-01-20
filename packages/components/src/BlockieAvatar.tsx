import { memo, useMemo } from "react";
import type { Address } from "viem";

export type BlockieAvatarProps = {
  address: Address;
  size?: number;
  className?: string;
};

/**
 * Generates a simple blockie-style avatar for an Ethereum address
 * Uses a deterministic algorithm based on address hash
 */
export const BlockieAvatar = memo(function BlockieAvatar({
  address,
  size = 24,
  className = ""
}: BlockieAvatarProps) {
  const colors = useMemo(() => {
    // Simple hash function to generate colors from address
    const hash = address.slice(2, 10);
    const hue = Number.parseInt(hash.slice(0, 2), 16);
    const saturation = (Number.parseInt(hash.slice(2, 4), 16) % 50) + 50;
    const lightness = (Number.parseInt(hash.slice(4, 6), 16) % 30) + 40;

    return {
      primary: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
      secondary: `hsl(${(hue + 60) % 360}, ${saturation}%, ${lightness}%)`,
      spot: `hsl(${(hue + 180) % 360}, ${saturation}%, ${lightness}%)`,
    };
  }, [address]);

  // Generate simple 8x8 grid pattern and memoize the SVG rects
  const rects = useMemo(() => {
    const grid: boolean[] = [];
    const hash = address.slice(2);
    const pixelSize = size / 8;

    for (let i = 0; i < 32; i++) {
      grid.push(Number.parseInt(hash[i], 16) % 2 === 0);
    }

    return grid.map((filled, i) => {
      if (!filled) return null;
      const x = (i % 4) * pixelSize * 2;
      const y = Math.floor(i / 4) * pixelSize;

      return (
        <rect
          key={i}
          x={x}
          y={y}
          width={pixelSize}
          height={pixelSize}
          fill={i % 3 === 0 ? colors.spot : colors.secondary}
        />
      );
    });
  }, [address, size, colors.spot, colors.secondary]);

  return (
    <svg
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      style={{ background: colors.primary }}
      aria-label={`Avatar for ${address.slice(0, 6)}...${address.slice(-4)}`}
    >
      {rects}
    </svg>
  );
});
