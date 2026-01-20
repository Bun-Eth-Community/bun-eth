'use client';

import { useMemo } from 'react';
import { config } from '@/lib/wagmi';
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { WagmiProvider } from 'wagmi';
import '@rainbow-me/rainbowkit/styles.css';

// Create theme objects once at module level to avoid recreation
const rainbowKitTheme = {
  lightMode: lightTheme(),
  darkMode: darkTheme(),
} as const;

// Create QueryClient once - stable across renders
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000, // 5 seconds
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={rainbowKitTheme}>
          {children}
          <Toaster position="top-right" />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
