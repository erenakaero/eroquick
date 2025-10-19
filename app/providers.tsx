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

// Wagmi config'i component içinde oluştur (her render'da yeniden oluşturulmasını önlemek için)
function createWagmiConfig() {
  const { connectors } = getDefaultWallets({
    appName: "ERO QuickProfile",
    projectId: projectId,
    chains,
  });

  return createConfig({
    chains,
    connectors,
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
    },
  });
}

// React Query için client
const queryClient = new QueryClient();

// Provider bileşenimizi oluştur
export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  const [wagmiConfig] = React.useState(() => createWagmiConfig());

  React.useEffect(() => setMounted(true), []);

  return (
    <WagmiConfig config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider chains={chains}>
          {mounted && children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}
