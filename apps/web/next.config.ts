import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile internal packages that export TypeScript
  transpilePackages: ["@bun-eth/contracts"],
};

export default nextConfig;
