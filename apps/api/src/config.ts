import { apiEnv } from '@bun-eth/env/api';

export const config = {
  port: apiEnv.PORT || apiEnv.API_PORT,
  nodeEnv: apiEnv.NODE_ENV,
  ethNode: apiEnv.ANVIL_NODE || `http://localhost:${apiEnv.ANVIL_PORT}`,
  privateKey: apiEnv.PRIVATE_KEY || '',
  chainId: apiEnv.CHAIN_ID,
};

export function validateConfig() {
  if (!config.privateKey && config.nodeEnv !== 'development') {
    throw new Error('PRIVATE_KEY is required in production');
  }
}
