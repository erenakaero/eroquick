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

// .env.local dosyasından API anahtarlarımızı okuyalım
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "Bf441d777066dc9791e83ae9aad077d83";
const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_SEPOLIA_API_KEY || "YsM4uRzKoUIioa0IcLw_7";

if (!projectId) {
  throw new Error("HATA: NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID .env.local dosyasında bulunamadı");
}

// Zincirleri tanımla
const chains = [mainnet, sepolia] as const;

// Cüzdan listesini ayarla
const { connectors } = getDefaultWallets({
  appName: "ERO QuickProfile",
  projectId: projectId,
});

// Wagmi config'i oluştur - Alchemy RPC kullan
const wagmiConfig = createConfig({
  chains,
  connectors,
  transports: {
    [mainnet.id]: http(`https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`),
    [sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`),
  },
  ssr: true,
  multiInjectedProviderDiscovery: false,
});

// React Query için client
const queryClient = new QueryClient();

// 4. Provider bileşenimiz
export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <WagmiConfig config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {mounted && children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}
