import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const webEnv = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  },
  client: {
    NEXT_PUBLIC_WC_PROJECT_ID: z.string().optional(),
    NEXT_PUBLIC_ANVIL_PORT: z.coerce.number().default(3002),
    NEXT_PUBLIC_CONTRACT_SIMPLE_STORAGE: z.string().optional(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_WC_PROJECT_ID: process.env.NEXT_PUBLIC_WC_PROJECT_ID,
    NEXT_PUBLIC_ANVIL_PORT: process.env.NEXT_PUBLIC_ANVIL_PORT,
    NEXT_PUBLIC_CONTRACT_SIMPLE_STORAGE: process.env.NEXT_PUBLIC_CONTRACT_SIMPLE_STORAGE,
  },
  emptyStringAsUndefined: true,
  skipValidation: process.env.npm_lifecycle_event === 'lint',
});
