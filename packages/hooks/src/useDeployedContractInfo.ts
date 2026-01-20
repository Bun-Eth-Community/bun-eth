import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import type { Abi, Address } from "viem";
import { logger } from "@bun-eth/core";
import { useContracts } from "./ContractsProvider";
import type { DeployedContractInfo, ContractName } from "./types";

const contractLogger = logger.child("contracts");

/**
 * Gets the deployed contract info for the current chain.
 * Requires ContractsProvider to be set up with deployed contracts.
 *
 * @param contractName - name of the contract
 * @returns the deployed contract info (address and ABI)
 *
 * @example
 * ```tsx
 * const contractInfo = useDeployedContractInfo("MyContract");
 * if (contractInfo) {
 *   console.log(contractInfo.address, contractInfo.abi);
 * }
 * ```
 */
export const useDeployedContractInfo = <TContractName extends ContractName>(
  contractName: TContractName
): DeployedContractInfo | undefined => {
  const [deployedContractInfo, setDeployedContractInfo] = useState<DeployedContractInfo | undefined>();
  const publicClient = usePublicClient();
  const contracts = useContracts();

  useEffect(() => {
    const loadContract = async () => {
      try {
        const chainId = publicClient?.chain?.id;

        if (!chainId) {
          contractLogger.debug("Chain ID not available yet");
          return;
        }

        if (!contracts) {
          contractLogger.debug("No contracts provided via ContractsProvider");
          return;
        }

        const contract = contracts[chainId]?.[contractName as string];

        if (contract) {
          // Verify contract is deployed by checking bytecode
          const code = await publicClient?.getBytecode({ address: contract.address });

          if (code && code !== "0x") {
            setDeployedContractInfo({
              address: contract.address as Address,
              abi: contract.abi as Abi,
            });
          } else {
            contractLogger.warn(`Contract ${String(contractName)} not deployed at ${contract.address}`);
            setDeployedContractInfo(undefined);
          }
        } else {
          contractLogger.debug(`Contract ${String(contractName)} not found for chain ${chainId}`);
          setDeployedContractInfo(undefined);
        }
      } catch (error) {
        contractLogger.error("Error loading deployed contract info", error);
        setDeployedContractInfo(undefined);
      }
    };

    loadContract();
  }, [contractName, publicClient, contracts]);

  return deployedContractInfo;
};
