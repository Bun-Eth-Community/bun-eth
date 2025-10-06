export const config = {
  port: parseInt(process.env.PORT || process.env.API_PORT || "3001"),
  nodeEnv: process.env.NODE_ENV || "development",
  ethNode: process.env.ANVIL_NODE || process.env.HARDHAT_NODE || `http://localhost:${process.env.ANVIL_PORT || "3002"}`,
  privateKey: process.env.PRIVATE_KEY || "",
  chainId: parseInt(process.env.CHAIN_ID || "31337"),
};

export function validateConfig() {
  if (!config.privateKey && config.nodeEnv !== "development") {
    throw new Error("PRIVATE_KEY is required in production");
  }
}
