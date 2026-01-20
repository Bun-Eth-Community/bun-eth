import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: true,
  treeshake: true,
  external: ["react", "viem", "wagmi", "@tanstack/react-query", "@bun-eth/core"],
  // Preserve 'use client' directives for Next.js
  banner: {
    js: '"use client";',
  },
});
