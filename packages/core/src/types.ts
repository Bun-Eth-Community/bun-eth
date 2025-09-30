// Common types across the monorepo

export interface WalletInfo {
  address: string;
  balance: string;
  nonce: number;
}

export interface TransactionRequest {
  to: string;
  value: string;
  data?: string;
}

export interface TransactionResponse {
  hash: string;
  from: string;
  to: string;
  value: string;
  blockNumber?: number;
  status?: "pending" | "confirmed" | "failed";
}

export interface ContractCallRequest {
  contractAddress: string;
  method: string;
  args?: any[];
}

export interface ContractSendRequest extends ContractCallRequest {
  value?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface HealthResponse {
  status: "ok" | "error";
  timestamp: number;
  version: string;
  network?: {
    chainId: number;
    blockNumber: number;
  };
}
