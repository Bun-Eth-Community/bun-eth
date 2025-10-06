import { http, createConfig } from "wagmi";
import { mainnet, sepolia, localhost } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import { burnerWalletConnector } from "@bun-eth/burner-connector";

// Configure chains for wagmi
export const chains = [mainnet, sepolia, localhost] as const;

// Connectors for wallet connection
const connectors = [injected()];

// Add WalletConnect only if project ID is configured
const wcProjectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID;
if (wcProjectId && wcProjectId.trim()) {
  connectors.push(
    // @ts-expect-error - wagmi connector type incompatibility with React 19
    walletConnect({
      projectId: wcProjectId,
    })
  );
}

// Add burner wallet only in development
if (process.env.NODE_ENV === "development") {
  connectors.push(
    // @ts-expect-error - wagmi connector type incompatibility with React 19
    burnerWalletConnector({
      storageKey: "bun-eth-burner-wallet",
      allowedChainIds: [31337], // Only localhost
    })
  );
}

export const config = createConfig({
  chains,
  connectors,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [localhost.id]: http(`http://localhost:${process.env.NEXT_PUBLIC_ANVIL_PORT || "3002"}`),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
