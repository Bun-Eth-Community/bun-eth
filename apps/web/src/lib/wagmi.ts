import { http, createConfig } from "wagmi";
import { mainnet, sepolia, localhost } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import { burnerWalletConnector } from "@bun-eth/burner-connector";

// Configure chains for wagmi
export const chains = [mainnet, sepolia, localhost] as const;

// Connectors for wallet connection
const connectors = [
  injected(),
  walletConnect({
    projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || "",
  }),
];

// Add burner wallet only in development
if (process.env.NODE_ENV === "development") {
  connectors.push(
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
    [localhost.id]: http("http://localhost:8545"),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
