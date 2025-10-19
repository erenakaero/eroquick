// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

// RainbowKit'in stillerini import edelim
import "@rainbow-me/rainbowkit/styles.css";

// Oluşturduğumuz Providers bileşenini import edelim
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ENS QuickProfile",
  description: "ENS profilini kolayca düzenle",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Tüm sayfalarımızı Providers ile sarmalıyoruz */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
