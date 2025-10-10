import { createConnector } from "wagmi";
import { privateKeyToAccount } from "viem/accounts";
import type { Address, Chain, Client, Transport } from "viem";
import { getBurnerPrivateKey } from "./storage";
import type { BurnerWalletOptions } from "./types";

const DEFAULT_OPTIONS: Required<BurnerWalletOptions> = {
  storageKey: "bun-eth-burner-wallet",
  allowedChainIds: [31337], // Only localhost by default
};

/**
 * Burner wallet connector for wagmi
 * Creates an ephemeral wallet stored in localStorage for quick testing
 */
export function burnerWalletConnector(options: BurnerWalletOptions = {}) {
  const walletConfig = { ...DEFAULT_OPTIONS, ...options };

  return createConnector((config) => ({
    id: "burner-wallet",
    name: "Burner Wallet",
    type: "injected" as const,

    async setup() {
      // Ensure we have a burner key on setup
      if (typeof window !== "undefined") {
        getBurnerPrivateKey(walletConfig.storageKey);
      }
    },

    async connect({ chainId, withCapabilities }: { chainId?: number; isReconnecting?: boolean; withCapabilities?: boolean } = {}) {
      const provider = await this.getProvider();
      const addresses = await this.getAccounts();
      let currentChainId = await this.getChainId();

      if (chainId && chainId !== currentChainId) {
        const chain = await this.switchChain!({ chainId });
        currentChainId = chain.id;
      }

      // Handle capabilities if requested
      const accounts = withCapabilities
        ? addresses.map(address => ({ address, capabilities: {} }))
        : addresses;

      return {
        accounts,
        chainId: currentChainId,
      } as any;
    },

    async disconnect() {
      // Don't clear the wallet on disconnect, just disconnect
      // User can manually clear if needed
    },

    async getAccounts() {
      const privateKey = getBurnerPrivateKey(walletConfig.storageKey);
      const account = privateKeyToAccount(privateKey);
      return [account.address];
    },

    async getChainId() {
      const provider = await this.getProvider();
      if (!provider) return 31337; // Default to localhost

      // For burner wallet, we'll use the first allowed chain
      return walletConfig.allowedChainIds[0];
    },

    async isAuthorized() {
      // Burner wallet is always "authorized" if we have a key
      if (typeof window === "undefined") return false;

      const key = window.localStorage.getItem(walletConfig.storageKey);
      return !!key;
    },

    async switchChain({ chainId }) {
      // Check if chain is allowed
      if (!walletConfig.allowedChainIds.includes(chainId)) {
        throw new Error(
          `Burner wallet only works on localhost (${walletConfig.allowedChainIds.join(", ")})`
        );
      }

      const chains = config.chains;
      const chain = chains.find((c) => c.id === chainId);

      if (!chain) {
        throw new Error(`Chain ${chainId} not configured`);
      }

      return chain;
    },

    async getProvider() {
      // Return a minimal provider for the burner wallet
      return {
        request: async ({ method, params }: any) => {
          if (method === "eth_accounts") {
            return this.getAccounts();
          }
          if (method === "eth_chainId") {
            const chainId = await this.getChainId();
            return `0x${chainId.toString(16)}`;
          }
          throw new Error(`Method ${method} not supported by burner wallet`);
        },
      };
    },

    onAccountsChanged(accounts: string[]) {
      if (accounts.length === 0) {
        this.onDisconnect();
      } else {
        config.emitter.emit("change", { accounts: accounts as readonly Address[] });
      }
    },

    onChainChanged(chainId) {
      const id = Number(chainId);
      config.emitter.emit("change", { chainId: id });
    },

    onDisconnect() {
      config.emitter.emit("disconnect");
    },
  }));
}
