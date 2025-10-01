#!/usr/bin/env node

import { join } from "path";
import { generateDeployedContracts } from "./generator";

/**
 * CLI for generating deployed contracts TypeScript file
 * Usage: bun run foundry-deployer
 */
async function main() {
  const cwd = process.cwd();

  // Detect if we're in the monorepo root or a package
  const foundryRoot = join(cwd, "packages", "contracts");
  const outputPath = join(cwd, "packages", "contracts", "deployedContracts.ts");

  console.log("🚀 Bun-Eth Foundry Deployer");
  console.log(`📁 Foundry root: ${foundryRoot}`);
  console.log(`📝 Output: ${outputPath}\n`);

  try {
    await generateDeployedContracts({
      foundryRoot,
      outputPath,
      networks: {
        31337: { name: "localhost", deploymentDir: "31337" },
        1: { name: "mainnet", deploymentDir: "1" },
        11155111: { name: "sepolia", deploymentDir: "11155111" },
      },
    });

    console.log("\n✅ Contract generation complete!");
    console.log("💡 Next.js will automatically hot reload with the new contract data");
  } catch (error) {
    console.error("❌ Error generating contracts:", error);
    process.exit(1);
  }
}

main();
