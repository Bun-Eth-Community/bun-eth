import { Elysia } from "elysia";
import { getProvider } from "../provider";
import type { HealthResponse } from "@bun-eth/core";

export const healthRoutes = new Elysia({ prefix: "/health" })
  .get("/", async (): Promise<HealthResponse> => {
    try {
      const provider = getProvider();
      const blockNumber = await provider.getBlockNumber();
      const network = await provider.getNetwork();

      return {
        status: "ok",
        timestamp: Date.now(),
        version: "0.1.0",
        network: {
          chainId: Number(network.chainId),
          blockNumber,
        },
      };
    } catch (error) {
      return {
        status: "error",
        timestamp: Date.now(),
        version: "0.1.0",
      };
    }
  });
