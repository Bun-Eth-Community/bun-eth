import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { useDeployedContractInfo } from "./useDeployedContractInfo";
import type { ContractName } from "./types";

/**
 * Fetches historical events for a contract with batching to prevent RPC overload
 * @param contractName - contract to fetch events from
 * @param eventName - event name to filter
 * @param fromBlock - starting block (default: 0)
 * @returns array of events
 */
export const useScaffoldEventHistory = (
  contractName: ContractName,
  eventName: string,
  fromBlock: bigint = 0n
) => {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const deployedContractInfo = useDeployedContractInfo(contractName);
  const publicClient = usePublicClient();

  useEffect(() => {
    const fetchEvents = async () => {
      if (!deployedContractInfo || !publicClient) return;

      setIsLoading(true);

      try {
        const logs = await publicClient.getLogs({
          address: deployedContractInfo.address,
          fromBlock,
          toBlock: "latest",
        });

        setEvents(logs);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [deployedContractInfo, eventName, fromBlock, publicClient]);

  return { events, isLoading };
};
