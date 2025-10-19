// app/providers.tsx
"use client";

import * as React from "react";
import {
  RainbowKitProvider,
  getDefaultWallets,
} from "@rainbow-me/rainbowkit";
import { createConfig, WagmiConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// .env.local dosyasından API anahtarımızı okuyalım
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error("HATA: NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID .env.local dosyasında bulunamadı");
}

// Zincirleri tanımla
const chains = [mainnet, sepolia] as const;

// Global config instance (singleton pattern)
let wagmiConfig: any = null;
let queryClient: QueryClient | null = null;

function getWagmiConfig() {
  if (!wagmiConfig) {
    const { connectors } = getDefaultWallets({
      appName: "ERO QuickProfile",
      projectId: projectId,
      chains,
    });

    wagmiConfig = createConfig({
      chains,
      connectors,
      transports: {
        [mainnet.id]: http(),
        [sepolia.id]: http(),
      },
    });
  }
  return wagmiConfig;
}

function getQueryClient() {
  if (!queryClient) {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5, // 5 minutes
          retry: 1,
        },
      },
    });
  }
  return queryClient;
}

// Provider bileşenimizi oluştur
export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Config'leri lazy load et
  const config = React.useMemo(() => getWagmiConfig(), []);
  const client = React.useMemo(() => getQueryClient(), []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={client}>
        <RainbowKitProvider chains={chains}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}
