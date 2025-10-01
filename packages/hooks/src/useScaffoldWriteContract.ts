import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useDeployedContractInfo } from "./useDeployedContractInfo";
import { useTransactor } from "./useTransactor";
import type { ContractName } from "./types";

/**
 * Wrapper around wagmi's useWriteContract with integrated transaction notifications
 * @param contractName - name of the contract to interact with
 * @returns write contract functions with mining state tracking
 */
export const useScaffoldWriteContract = (contractName: ContractName) => {
  const [isMining, setIsMining] = useState(false);
  const deployedContractInfo = useDeployedContractInfo(contractName);
  const { writeContractAsync, data: txHash, ...writeContractProps } = useWriteContract();
  const transactor = useTransactor();

  const { data: txReceipt } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const writeContractAsyncWithNotifications = async (
    functionName: string,
    args?: any[],
    value?: bigint
  ) => {
    if (!deployedContractInfo) {
      throw new Error("Contract not deployed");
    }

    setIsMining(true);

    try {
      const tx = await transactor(() =>
        writeContractAsync({
          address: deployedContractInfo.address,
          abi: deployedContractInfo.abi,
          functionName,
          args,
          value,
        } as any)
      );

      return tx;
    } finally {
      setIsMining(false);
    }
  };

  return {
    writeContractAsync: writeContractAsyncWithNotifications,
    isMining,
    txReceipt,
    txHash,
    ...writeContractProps,
  };
};
