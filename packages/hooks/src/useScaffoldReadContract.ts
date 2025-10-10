import { useReadContract } from "wagmi";
import { useDeployedContractInfo } from "./useDeployedContractInfo";
import { useTargetNetwork } from "./useTargetNetwork";
import type { ContractName } from "./types";
import type { Abi } from "viem";

type UseScaffoldReadConfig = {
  contractName: ContractName;
  functionName: string;
  args?: any[];
  watch?: boolean;
};

/**
 * Wrapper around wagmi's useReadContract with automatic contract info loading
 * @param config - contract name, function name, args, and watch options
 * @returns contract read result from wagmi
 */
export const useScaffoldReadContract = (
  config: UseScaffoldReadConfig
) => {
  const { contractName, functionName, args, watch = true } = config;
  const deployedContractInfo = useDeployedContractInfo(contractName);
  const { targetNetwork } = useTargetNetwork();

  return useReadContract({
    chainId: targetNetwork.id,
    address: deployedContractInfo?.address,
    abi: deployedContractInfo?.abi,
    functionName: functionName as string,
    args,
    query: {
      enabled: !!deployedContractInfo && args?.every((arg) => arg !== undefined),
      refetchInterval: watch ? 3000 : false,
    },
  } as any);
};
