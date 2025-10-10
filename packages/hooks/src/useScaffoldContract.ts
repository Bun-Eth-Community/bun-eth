import { usePublicClient, useWalletClient } from "wagmi";
import { getContract } from "viem";
import { useDeployedContractInfo } from "./useDeployedContractInfo";
import type { ContractName, UseScaffoldContractConfig } from "./types";

/**
 * Gets a viem contract instance with automatic ABI and address loading
 * @param config - contract name and whether to use wallet client
 * @returns viem contract instance
 */
export const useScaffoldContract = <
  TContractName extends ContractName,
  TWalletClient extends boolean = false
>(
  config: UseScaffoldContractConfig<TContractName, TWalletClient>
) => {
  const { contractName, walletClient: shouldUseWalletClient = false } = config;
  const deployedContractInfo = useDeployedContractInfo(contractName);
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  if (!deployedContractInfo) {
    return null;
  }

  const client = shouldUseWalletClient && walletClient ? walletClient : publicClient;

  if (!client) {
    return null;
  }

  return getContract({
    address: deployedContractInfo.address,
    abi: deployedContractInfo.abi,
    client: {
      public: publicClient!,
      wallet: shouldUseWalletClient ? walletClient : undefined,
    },
  });
};
