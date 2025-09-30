import { expect, test, describe, beforeAll, afterAll } from "bun:test";
import { createClient } from "./client";

describe("BunEthClient", () => {
  const client = createClient({
    baseUrl: "http://localhost:3001",
    timeout: 5000,
  });

  test("creates client instance", () => {
    expect(client).toBeDefined();
    expect(typeof client.health).toBe("function");
    expect(typeof client.getWallet).toBe("function");
  });

  // Note: Integration tests require running API server
  test.skip("health check", async () => {
    const health = await client.health();
    expect(health.status).toBe("ok");
  });
});
