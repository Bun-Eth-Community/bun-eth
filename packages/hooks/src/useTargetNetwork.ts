import { useAccount } from "wagmi";
import { localhost } from "viem/chains";

/**
 * Returns the current target network from wagmi config
 * Defaults to localhost for development
 */
export const useTargetNetwork = () => {
  const { chain } = useAccount();

  return {
    targetNetwork: chain || localhost,
  };
};
