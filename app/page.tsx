// app/page.tsx
"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useEnsName } from "wagmi";
import { sepolia } from "wagmi/chains";
import { ProfileForm } from "./ProfileForm";

export default function Home() {
  const { address, isConnected } = useAccount();

  const {
    data: ensName,
    isLoading: isEnsLoading,
    isError: isEnsError,
  } = useEnsName({
    address: address,
    chainId: sepolia.id,
  });

  const renderContent = () => {
    if (!isConnected) {
      return (
        <p className="text-gray-600">
          ENS profilini düzenlemek için lütfen cüzdanını bağla.
        </p>
      );
    }

    if (isEnsLoading) {
      return <p className="text-gray-600">ENS adın aranıyor...</p>;
    }

    if (!ensName || isEnsError) {
      return (
        <div className="p-4 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-lg">
          <p className="font-semibold">
            ⚠️ Bu cüzdan adresi için birincil ENS adı bulunamadı.
          </p>
          <p className="text-sm mt-2">
            Bu aracı kullanmak için, lütfen resmi ENS App üzerinden
            (app.ens.domains) bir `.eth` adının "Primary Name" kaydını 
            bu adrese (Sepolia ağında) yönlendir.
          </p>
        </div>
      );
    }

    // Harika! ENS Adı bulundu.
    return (
      <div className="text-left w-full">
        <h2 className="text-2xl font-bold text-center mb-2">
          Profilini düzenle:
        </h2>
        <h3 className="text-3xl font-bold font-mono text-center text-blue-600 mb-8">
          {ensName}
        </h3>
        <ProfileForm ensName={ensName} />
      </div>
    );
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-50">
      
      {/* Header Alanı */}
      <header className="w-full max-w-5xl flex justify-between items-center">
        <h1 className="text-2xl font-bold">ERO QuickProfile</h1>
        <ConnectButton />
      </header>

      {/* Ana İçerik Alanı */}
      <div className="flex-grow flex flex-col justify-center items-center w-full max-w-xl mt-16 text-center">
        {renderContent()}
      </div>
      
    </main>
  );
}