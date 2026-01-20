import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: true,
  treeshake: true,
  external: [
    "react",
    "react-dom",
    "viem",
    "wagmi",
    "@bun-eth/core",
    "@bun-eth/hooks",
    "@bun-eth/burner-connector",
  ],
  // Preserve 'use client' directives for Next.js
  banner: {
    js: '"use client";',
  },
});
