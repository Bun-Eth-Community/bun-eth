import { useWatchContractEvent } from "wagmi";
import { useDeployedContractInfo } from "./useDeployedContractInfo";
import type { ContractName } from "./types";

type UseScaffoldWatchContractEventConfig = {
  contractName: ContractName;
  eventName: string;
  onLogs: (logs: any[]) => void;
  enabled?: boolean;
};

/**
 * Wrapper around wagmi's useWatchContractEvent with automatic contract info loading
 * @param config - contract name, event name, and callback
 */
export const useScaffoldWatchContractEvent = (config: UseScaffoldWatchContractEventConfig) => {
  const { contractName, eventName, onLogs, enabled = true } = config;
  const deployedContractInfo = useDeployedContractInfo(contractName);

  useWatchContractEvent({
    address: deployedContractInfo?.address,
    abi: deployedContractInfo?.abi,
    eventName,
    onLogs,
    enabled: enabled && !!deployedContractInfo,
  } as any);
};
