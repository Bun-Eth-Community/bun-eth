import { Elysia } from "elysia";
import { config, validateConfig } from "./config";
import { checkConnection } from "./provider";
import { healthRoutes } from "./routes/health";
import { walletRoutes } from "./routes/wallet";
import { contractRoutes } from "./routes/contract";
import { Logger } from "@bun-eth/core";

const logger = new Logger({ prefix: "api" });

// Validate configuration
try {
  validateConfig();
} catch (error) {
  logger.error("Configuration validation failed:", error);
  process.exit(1);
}

// Check provider connection with retries
let connected = false;
const maxRetries = 10;
for (let i = 0; i < maxRetries; i++) {
  connected = await checkConnection();
  if (connected) {
    break;
  }
  logger.warn(`Failed to connect to Ethereum node (attempt ${i + 1}/${maxRetries}), retrying in 2s...`);
  await new Promise(resolve => setTimeout(resolve, 2000));
}

if (!connected) {
  logger.error("Failed to connect to Ethereum node after all retries");
  process.exit(1);
}

// Create Elysia app
const app = new Elysia()
  .onError(({ code, error, set }) => {
    logger.error(`Error ${code}:`, error);

    if (code === "VALIDATION") {
      set.status = 400;
      return { code: "VALIDATION_ERROR", message: error.message };
    }

    if (code === "NOT_FOUND") {
      set.status = 404;
      return { code: "NOT_FOUND", message: "Route not found" };
    }

    set.status = 500;
    return { code: "INTERNAL_ERROR", message: "Internal server error" };
  })
  .use(healthRoutes)
  .use(walletRoutes)
  .use(contractRoutes)
  .listen(config.port);

logger.info(`🚀 Bun-Eth API running at http://localhost:${config.port}`);
logger.info(`📡 Connected to Ethereum node at ${config.ethNode}`);
logger.info(`🌍 Environment: ${config.nodeEnv}`);

export type App = typeof app;
