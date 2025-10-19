// app/page.tsx
"use client";

import React, { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useEnsName } from "wagmi";
import { sepolia } from "wagmi/chains";
import { ProfileForm } from "./ProfileForm";

export default function Home() {
  const { address, isConnected } = useAccount();
  const [currentView, setCurrentView] = useState('landing');

  const {
    data: ensName,
    isLoading: isEnsLoading,
    isError: isEnsError,
  } = useEnsName({
    address: address,
    chainId: sepolia.id,
  });

  // Debug için console log ekle
  React.useEffect(() => {
    if (address) {
      console.log("Connected wallet address:", address);
      console.log("Current chain ID:", sepolia.id);
      console.log("ENS name result:", ensName);
      console.log("ENS loading:", isEnsLoading);
      console.log("ENS error:", isEnsError);
    }
  }, [address, ensName, isEnsLoading, isEnsError]);

  // ENS adı bulunduğunda otomatik olarak profil editörüne geç
  React.useEffect(() => {
    if (ensName && isConnected) {
      setCurrentView('profile');
    }
  }, [ensName, isConnected]);

  // renderContent fonksiyonu
  const renderContent = () => {
    if (!isConnected) {
      return (
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Welcome!</h2>
          <p className="text-gray-600">
            Please connect your wallet to manage your decentralized identity.
          </p>
        </div>
      );
    }

    if (isEnsLoading) {
      return (
        <div className="flex justify-center items-center h-24">
          <p className="text-gray-600 animate-pulse">Searching for your ENS name...</p>
        </div>
      );
    }

    if (!ensName || isEnsError) {
      return (
        <div className="p-4 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-lg">
          <p className="font-semibold">
            ⚠️ No primary ENS name found for this wallet address.
          </p>
          <p className="text-sm mt-2">
            To use this tool, please set a `.eth` name's "Primary Name" record 
            to this address (on Sepolia) via the official ENS App (app.ens.domains).
          </p>
        </div>
      );
    }

    return <ProfileForm ensName={ensName} />;
  };

  // Landing Page görünümü
  if (currentView === 'landing') {
    return (
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
        
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 p-6 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="text-white" fill="none" height="32" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="32" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
              <span className="ml-2 text-xl font-bold text-white">ERO QuickProfile</span>
            </div>
            <ConnectButton 
              accountStatus="address"
              chainStatus="icon"
              showBalance={false}
            />
          </div>
        </header>

        {/* Main Content */}
        <div className="relative flex h-full grow flex-col justify-center items-center px-4">
          <div className="text-center">
            <h1 className="text-white text-5xl md:text-7xl font-black tracking-tighter leading-tight max-w-4xl font-extrabold">
              Decentralized Identity. Effortless Control.
            </h1>
            <p className="mt-8 text-xl text-gray-300 max-w-2xl mx-auto">
              Manage your ENS profile with one click. Update your avatar, social links, 
              and bio effortlessly.
            </p>
            <div className="mt-12">
              <button 
                onClick={() => setCurrentView('dashboard')}
                className="bg-white text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Manage Profile
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="absolute bottom-0 left-0 right-0 p-6 z-10">
          <div className="text-center text-gray-400">
            <p>Built for <span className="font-semibold text-white">ETHRome 2025</span> with ❤️</p>
          </div>
        </footer>
      </div>
    );
  }

  // Dashboard görünümü
  if (currentView === 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="w-full bg-white shadow-sm border-b">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setCurrentView('landing')}
                  className="text-blue-600 hover:text-blue-800 mr-4"
                >
                  ← Back
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                  <span className="text-blue-600">ERO</span>
                  <span>QuickProfile</span>
                </h1>
              </div>
              <ConnectButton 
                accountStatus="address"
                chainStatus="icon"
                showBalance={false}
              />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Eğer profil editörü görünümündeyse, sadece ProfileForm'u göster
  if (currentView === 'profile' && ensName) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-gray-100">
        <ProfileForm ensName={ensName} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-4 sm:p-8 bg-gray-100">
      {/* Header */}
      <header className="w-full max-w-5xl flex justify-between items-center py-4">
        <div className="flex items-center">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className="text-blue-600 hover:text-blue-800 mr-4"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            <span className="text-blue-600">ERO</span>
            <span>QuickProfile</span>
          </h1>
        </div>
        <ConnectButton 
          accountStatus="address"
          chainStatus="icon"
          showBalance={false}
        />
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col justify-center items-center w-full">
        <div className="w-full max-w-xl bg-white rounded-xl shadow-xl p-6 sm:p-10">
          {renderContent()}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="w-full max-w-5xl text-center py-6">
        <p className="text-sm text-gray-500">
          Built for <span className="font-semibold">ETHRome 2025</span> with ❤️ by{" "}
          <a 
            href="https://github.com/erenakaero"
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 hover:underline"
          >
            erenakaero
          </a>
        </p>
      </footer>
    </div>
  );
}