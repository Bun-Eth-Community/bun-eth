import type { Abi, Address } from "viem";

export type GenericContract = {
  address: Address;
  abi: Abi;
};

export type GenericContractsDeclaration = {
  [chainId: number]: {
    [contractName: string]: GenericContract;
  };
};

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
  onBlockConfirmation?: (txnReceipt: any) => void;
  blockConfirmations?: number;
};
