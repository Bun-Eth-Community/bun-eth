import type { Abi, Address, TransactionReceipt } from "viem";

export type GenericContract = {
  address: Address;
  abi: Abi;
};

export type GenericContractsDeclaration = {
  [chainId: number]: {
    [contractName: string]: GenericContract;
  };
};

/** Alias for GenericContractsDeclaration - represents deployed contracts by chain */
export type DeployedContracts = GenericContractsDeclaration;

export type ContractName<TContracts extends GenericContractsDeclaration = GenericContractsDeclaration> = {
  [TChainId in keyof TContracts]: keyof TContracts[TChainId];
}[keyof TContracts];

export type UseScaffoldContractConfig<
  TContractName extends ContractName,
  TWalletClient extends boolean = false
> = {
  contractName: TContractName;
  walletClient?: TWalletClient;
};

export type DeployedContractInfo = {
  address: Address;
  abi: Abi;
};

export type TransactorFuncOptions = {
  /** Callback when transaction is confirmed */
  onBlockConfirmation?: (txnReceipt: TransactionReceipt | undefined) => void;
  /** Number of block confirmations to wait for */
  blockConfirmations?: number;
};
