// app/providers.tsx
"use client"; // Bu satır çok önemli!

import * as React from "react";
import {
  RainbowKitProvider,
  getDefaultWallets,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import { createConfig, WagmiConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains"; // Ana ağ ve test ağı
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// .env.local dosyasından API anahtarımızı okuyalım
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error("HATA: NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID .env.local dosyasında bulunamadı");
}

// 1. Zincirleri ve provider'ı ayarla
const chains = [mainnet, sepolia] as const;

// 2. Cüzdan listesini ayarla
const { connectors } = getDefaultWallets({
  appName: "ENS QuickProfile",
  projectId: projectId,
  chains,
});

// 3. Wagmi config'i oluştur
const wagmiConfig = createConfig({
  chains,
  connectors,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

// React Query için client
const queryClient = new QueryClient();

// 4. Provider bileşenimizi oluştur
export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []); // Hydration hatalarını önlemek için

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
