import { Elysia, t } from "elysia";
import { ethers } from "ethers";
import { getProvider, getWallet } from "../provider";
import { isValidAddress } from "@bun-eth/core";
import type { WalletInfo, TransactionRequest, TransactionResponse } from "@bun-eth/core";

export const walletRoutes = new Elysia({ prefix: "/wallet" })
  .get("/:address", async ({ params: { address }, error }): Promise<WalletInfo> => {
    if (!isValidAddress(address)) {
      return error(400, { code: "INVALID_ADDRESS", message: "Invalid Ethereum address" });
    }

    try {
      const provider = getProvider();
      const balance = await provider.getBalance(address);
      const nonce = await provider.getTransactionCount(address);

      return {
        address,
        balance: ethers.formatEther(balance),
        nonce,
      };
    } catch (err) {
      return error(500, {
        code: "PROVIDER_ERROR",
        message: "Failed to fetch wallet info",
        details: err instanceof Error ? err.message : String(err)
      });
    }
  })

  .post("/send", async ({ body, error }): Promise<TransactionResponse> => {
    const { to, value, data } = body as TransactionRequest;

    if (!isValidAddress(to)) {
      return error(400, { code: "INVALID_ADDRESS", message: "Invalid recipient address" });
    }

    try {
      const wallet = getWallet();

      const tx = await wallet.sendTransaction({
        to,
        value: ethers.parseEther(value),
        data: data || "0x",
      });

      await tx.wait();

      return {
        hash: tx.hash,
        from: wallet.address,
        to: tx.to || "",
        value,
        blockNumber: tx.blockNumber || undefined,
        status: "confirmed",
      };
    } catch (err) {
      return error(500, {
        code: "TRANSACTION_FAILED",
        message: "Failed to send transaction",
        details: err instanceof Error ? err.message : String(err)
      });
    }
  }, {
    body: t.Object({
      to: t.String(),
      value: t.String(),
      data: t.Optional(t.String()),
    })
  });
