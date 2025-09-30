import { Elysia, t } from "elysia";
import { ethers } from "ethers";
import { getProvider, getWallet } from "../provider";
import { isValidAddress } from "@bun-eth/core";
import type { ContractCallRequest, ContractSendRequest, TransactionResponse } from "@bun-eth/core";

// Simple ABI cache (in production, load from files or database)
const contractABIs = new Map<string, any[]>();

export const contractRoutes = new Elysia({ prefix: "/contract" })
  .post("/call", async ({ body, error }) => {
    const { contractAddress, method, args = [] } = body as ContractCallRequest;

    if (!isValidAddress(contractAddress)) {
      return error(400, { code: "INVALID_ADDRESS", message: "Invalid contract address" });
    }

    try {
      const provider = getProvider();
      const abi = contractABIs.get(contractAddress);

      if (!abi) {
        return error(400, {
          code: "ABI_NOT_FOUND",
          message: "Contract ABI not registered. Register the ABI first."
        });
      }

      const contract = new ethers.Contract(contractAddress, abi, provider);
      const result = await contract[method](...args);

      return { result: result.toString() };
    } catch (err) {
      return error(500, {
        code: "CONTRACT_CALL_FAILED",
        message: "Failed to call contract method",
        details: err instanceof Error ? err.message : String(err)
      });
    }
  }, {
    body: t.Object({
      contractAddress: t.String(),
      method: t.String(),
      args: t.Optional(t.Array(t.Any())),
    })
  })

  .post("/send", async ({ body, error }): Promise<TransactionResponse> => {
    const { contractAddress, method, args = [], value } = body as ContractSendRequest;

    if (!isValidAddress(contractAddress)) {
      return error(400, { code: "INVALID_ADDRESS", message: "Invalid contract address" });
    }

    try {
      const wallet = getWallet();
      const abi = contractABIs.get(contractAddress);

      if (!abi) {
        return error(400, {
          code: "ABI_NOT_FOUND",
          message: "Contract ABI not registered"
        });
      }

      const contract = new ethers.Contract(contractAddress, abi, wallet);

      const options = value ? { value: ethers.parseEther(value) } : {};
      const tx = await contract[method](...args, options);
      await tx.wait();

      return {
        hash: tx.hash,
        from: wallet.address,
        to: contractAddress,
        value: value || "0",
        blockNumber: tx.blockNumber || undefined,
        status: "confirmed",
      };
    } catch (err) {
      return error(500, {
        code: "CONTRACT_SEND_FAILED",
        message: "Failed to send contract transaction",
        details: err instanceof Error ? err.message : String(err)
      });
    }
  }, {
    body: t.Object({
      contractAddress: t.String(),
      method: t.String(),
      args: t.Optional(t.Array(t.Any())),
      value: t.Optional(t.String()),
    })
  })

  .post("/register-abi", async ({ body, error }) => {
    const { contractAddress, abi } = body as { contractAddress: string; abi: any[] };

    if (!isValidAddress(contractAddress)) {
      return error(400, { code: "INVALID_ADDRESS", message: "Invalid contract address" });
    }

    contractABIs.set(contractAddress, abi);

    return {
      message: "ABI registered successfully",
      address: contractAddress
    };
  }, {
    body: t.Object({
      contractAddress: t.String(),
      abi: t.Array(t.Any()),
    })
  });
