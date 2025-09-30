import type {
  WalletInfo,
  TransactionRequest,
  TransactionResponse,
  ContractCallRequest,
  ContractSendRequest,
  HealthResponse,
  ApiError,
} from "@bun-eth/core";

export interface BunEthClientConfig {
  baseUrl: string;
  timeout?: number;
}

export class BunEthClient {
  private baseUrl: string;
  private timeout: number;

  constructor(config: BunEthClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.timeout = config.timeout || 30000;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(`API Error: ${error.message}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timeout");
      }
      throw error;
    }
  }

  /**
   * Check API health
   */
  async health(): Promise<HealthResponse> {
    return this.request<HealthResponse>("GET", "/health");
  }

  /**
   * Get wallet information
   */
  async getWallet(address: string): Promise<WalletInfo> {
    return this.request<WalletInfo>("GET", `/wallet/${address}`);
  }

  /**
   * Send a transaction
   */
  async sendTransaction(tx: TransactionRequest): Promise<TransactionResponse> {
    return this.request<TransactionResponse>("POST", "/wallet/send", tx);
  }

  /**
   * Call a contract method (read-only)
   */
  async contractCall(request: ContractCallRequest): Promise<any> {
    return this.request("POST", "/contract/call", request);
  }

  /**
   * Send a contract transaction (write)
   */
  async contractSend(request: ContractSendRequest): Promise<TransactionResponse> {
    return this.request<TransactionResponse>("POST", "/contract/send", request);
  }
}

/**
 * Create a new BunEth client instance
 */
export function createClient(config: BunEthClientConfig): BunEthClient {
  return new BunEthClient(config);
}
