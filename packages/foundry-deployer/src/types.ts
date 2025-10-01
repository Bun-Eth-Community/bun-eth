import type { Abi, Address } from "viem";

export type DeployedContract = {
  address: Address;
  abi: Abi;
};

export type FoundryDeployment = {
  [contractName: string]: {
    address: Address;
    abi: Abi;
    bytecode?: string;
    deployedBytecode?: string;
    transactionHash?: string;
    receipt?: {
      blockNumber: string;
      contractAddress: string;
      transactionHash: string;
    };
  };
};

export type GeneratorConfig = {
  foundryRoot: string;
  outputPath: string;
  networks?: {
    [chainId: number]: {
      name: string;
      deploymentDir: string;
    };
  };
};
