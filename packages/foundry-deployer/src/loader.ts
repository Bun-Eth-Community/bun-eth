import { readFileSync, existsSync } from "fs";
import { join } from "path";
import type { FoundryDeployment } from "./types";

/**
 * Loads Foundry deployment artifacts from broadcast directory
 * @param foundryRoot - Path to Foundry project root
 * @param chainId - Chain ID to load deployments for
 * @returns Parsed deployment data
 */
export function loadFoundryDeployment(foundryRoot: string, chainId: number): FoundryDeployment {
  const broadcastPath = join(foundryRoot, "broadcast");

  // Look for deployment script outputs
  const deployScriptDir = join(broadcastPath, "Deploy.s.sol", chainId.toString());

  if (!existsSync(deployScriptDir)) {
    console.warn(`No deployments found for chain ${chainId} at ${deployScriptDir}`);
    return {};
  }

  // Read the latest run file
  const runLatestPath = join(deployScriptDir, "run-latest.json");

  if (!existsSync(runLatestPath)) {
    console.warn(`No run-latest.json found at ${runLatestPath}`);
    return {};
  }

  try {
    const runData = JSON.parse(readFileSync(runLatestPath, "utf-8"));
    const deployment: FoundryDeployment = {};

    // Extract contract deployments from transactions
    for (const tx of runData.transactions || []) {
      if (tx.transactionType === "CREATE") {
        const contractName = tx.contractName;
        const contractAddress = tx.contractAddress;

        // Load ABI from out directory
        const outPath = join(foundryRoot, "out", `${contractName}.sol`, `${contractName}.json`);

        if (existsSync(outPath)) {
          const artifact = JSON.parse(readFileSync(outPath, "utf-8"));

          deployment[contractName] = {
            address: contractAddress,
            abi: artifact.abi,
            bytecode: artifact.bytecode?.object,
            deployedBytecode: artifact.deployedBytecode?.object,
            transactionHash: tx.hash,
            receipt: {
              blockNumber: runData.receipts?.[0]?.blockNumber || "0",
              contractAddress,
              transactionHash: tx.hash,
            },
          };
        }
      }
    }

    return deployment;
  } catch (error) {
    console.error("Error loading Foundry deployment:", error);
    return {};
  }
}
