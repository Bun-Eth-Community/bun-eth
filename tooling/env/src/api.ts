import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const apiEnv = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().default(3001),
    API_PORT: z.coerce.number().default(3001),
    ANVIL_NODE: z.string().url().optional(),
    ANVIL_PORT: z.coerce.number().default(3002),
    PRIVATE_KEY: z.string().optional(),
    CHAIN_ID: z.coerce.number().default(31337),
    SEPOLIA_RPC_URL: z.string().url().optional(),
    ETHERSCAN_API_KEY: z.string().optional(),
    BASESCAN_API_KEY: z.string().optional(),
    ARBISCAN_API_KEY: z.string().optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation: process.env.npm_lifecycle_event === 'lint',
});
