// app/page.tsx
"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useEnsName } from "wagmi"; // Wagmi'den hook'ları import et
import { sepolia } from "wagmi/chains"; // Sepolia testnet'i import et
import { ProfileForm } from "./ProfileForm"; // ProfileForm bileşenini import et

export default function Home() {
  // 1. Cüzdan bağlantı durumunu ve adresi al
  const { address, isConnected } = useAccount();

  // 2. Adres varsa, bu adrese ait birincil ENS adını ara
  //    Not: Reverse resolution Sepolia testnet üzerindedir.
  const {
    data: ensName,
    isLoading: isEnsLoading,
    isError: isEnsError,
  } = useEnsName({
    address: address,
    chainId: sepolia.id, // Sepolia testnet'i (ID: 11155111) kontrol et
  });

  // 3. Duruma göre ana içeriği (form veya mesaj) gösteren bir fonksiyon
  const renderContent = () => {
    // Cüzdan bağlı değilse
    if (!isConnected) {
      return (
        <p className="text-xl text-gray-600">
          ENS profilini düzenlemek için lütfen cüzdanını bağla.
        </p>
      );
    }

    // Cüzdan bağlı, ENS adı aranıyor...
    if (isEnsLoading) {
      return (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="ml-3 text-xl text-gray-600">ENS adın aranıyor...</p>
        </div>
      );
    }

    // Cüzdan bağlı, ama bu adrese ait birincil ENS adı yok (veya hata oldu)
    if (!ensName || isEnsError) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-lg text-yellow-800 mb-3">
            ⚠️ Bu cüzdan adresi için birincil ENS adı bulunamadı.
          </p>
          <p className="text-sm text-yellow-700">
            Bu aracı kullanmak için, lütfen resmi ENS App üzerinden 
            (app.ens.domains) Sepolia testnet'te bir `.eth` adının "Primary Name" (Birincil Ad) 
            kaydını bu adrese yönlendir.
          </p>
        </div>
      );
    }

    // Harika! ENS Adı bulundu.
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-green-800 mb-4">
          Hoş geldin, <strong className="text-green-900">{ensName}</strong>! 🎉
        </h2>
        <p className="text-lg text-green-700 mb-4">
          Profilini düzenle: <strong>{ensName}</strong>
        </p>
        <p className="text-gray-600 mb-6 text-center">
          Aşağıdan profil bilgilerini (Metin Kayıtları) güncelleyebilirsin.
        </p>
        
        {/*
          ****************************************
          * YENİ FORMUMUZU BURADA ÇAĞIRIYORUZ
          ****************************************
        */}
        <div className="text-left">
          <ProfileForm ensName={ensName} />
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header - Cüzdan Butonu */}
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "flex-end",
          padding: "20px",
        }}
      >
        <ConnectButton />
      </div>

      {/* Ana Başlık */}
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            ENS QuickProfile
          </h1>
          
          {/* Dinamik İçerik Alanı */}
          <div className="w-full max-w-600px text-center">
            {renderContent()}
          </div>
        </div>
      </div>
    </main>
  );
}