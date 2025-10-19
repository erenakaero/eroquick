// app/ProfileForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import { sepolia } from "wagmi/chains";

// Wagmi ve Viem'den GEREKLİ TÜM ARAÇLARI import edelim
import { getEnsText, getEnsResolver, writeContract } from "@wagmi/core";
import { useWaitForTransactionReceipt } from "wagmi";
import { useMutation } from "@tanstack/react-query";
import { namehash, encodeFunctionData, parseAbi, Address } from "viem";

// Bu, ENS Public Resolver kontratının ihtiyacımız olan fonksiyonlarının arayüzüdür (ABI)
const publicResolverAbi = parseAbi([
  "function setText(bytes32 node, string calldata key, string calldata value)",
  "function multicall(bytes[] calldata data)",
]);

// Hangi metin kayıtlarını destekleyeceğiz (değişiklik yok)
const profileKeys = [
  { key: "description", label: "Açıklama" },
  { key: "avatar", label: "Avatar URL" },
  { key: "com.twitter", label: "Twitter" },
  { key: "com.github", label: "GitHub" },
  { key: "url", label: "Web Sitesi" },
];

export function ProfileForm({ ensName }: { ensName: string }) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // İşlem (transaction) hash'ini tutmak için yeni bir state
  const [txHash, setTxHash] = useState<Address | undefined>();

  // --- 1. Mevcut Profili Çekme (Değişiklik yok) ---
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        const promises = profileKeys.map((item) =>
          getEnsText({ name: ensName, key: item.key, chainId: sepolia.id })
        );
        const results = await Promise.all(promises);
        const newFormData: Record<string, string> = {};
        profileKeys.forEach((item, index) => {
          newFormData[item.key] = results[index] || "";
        });
        setFormData(newFormData);
      } catch (error) {
        console.error("Profil verileri çekilirken hata:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (ensName) {
      fetchProfileData();
    }
  }, [ensName]);

  // --- 2. Blockchain'e Yazma (Mutasyon) ---
  // Bu hook, profili güncelleme işlemini yönetir
  const { 
    mutate, 
    isPending: isSigning 
  } = useMutation({
    mutationFn: async (dataToSubmit: Record<string, string>) => {
      console.log("Mutasyon başlıyor...");
      setTxHash(undefined); // Önceki tx hash'ini temizle

      // 1. ENS adının 'node'unu hesapla (viem/namehash)
      const node = namehash(ensName);

      // 2. Bu ENS adı için yetkili 'Resolver' kontratının adresini bul
      const resolverAddress = await getEnsResolver({ name: ensName, chainId: sepolia.id });
      if (!resolverAddress) throw new Error("Resolver bulunamadı");
      console.log(`Resolver adresi: ${resolverAddress}`);

      // 3. 'multicall' için veri dizisini hazırla
      // Her bir 'setText' işlemini encode ediyoruz
      const calldata = profileKeys.map((item) =>
        encodeFunctionData({
          abi: publicResolverAbi,
          functionName: "setText",
          args: [node, item.key, dataToSubmit[item.key] || ""], // Formdaki veriyi kullan
        })
      );
      console.log("Calldata oluşturuldu:", calldata);

      // 4. 'multicall' işlemini 'writeContract' ile gönder
      const hash = await writeContract({
        address: resolverAddress,
        abi: publicResolverAbi,
        functionName: "multicall",
        args: [calldata],
        chainId: sepolia.id,
      });

      console.log(`İşlem gönderildi: ${hash}`);
      return hash;
    },
    onSuccess: (hash) => {
      // İşlem imzalandı ve gönderildi
      setTxHash(hash);
    },
    onError: (error) => {
      // Kullanıcı imzalamayı reddederse veya bir hata olursa
      console.error("Mutasyon hatası:", error);
      alert(`Hata: ${error.message}`);
    },
  });

  // --- 3. İşlem Onayını Bekleme ---
  // txHash değiştiğinde, bu hook işlemi takip eder
  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed 
  } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId: sepolia.id,
  });

  // --- 4. Form Gönderme (Submit) ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Sayfanın yeniden yüklenmesini engelle
    console.log("Form gönderiliyor:", formData);
    mutate(formData); // Mutasyonu (blockchain işlemini) tetikle
  };

  // --- 5. Form Girdi (Input) Değişikliği ---
  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };
  
  // --- 6. Formun Görünümü ---
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-lg text-gray-600">Mevcut profil verileri yükleniyor...</p>
      </div>
    );
  }

  const isProcessing = isSigning || isConfirming;

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
      {/* İşlem başarılıysa bir mesaj göster */}
      {isConfirmed && (
        <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-center">
          <strong>Başarılı!</strong> Profilin güncellendi.
          <a 
            href={`https://sepolia.etherscan.io/tx/${txHash}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block mt-2 text-green-600 hover:text-green-800 underline"
          >
            Sepolia Etherscan'de Görüntüle
          </a>
        </div>
      )}

      {/* Input alanları */}
      {profileKeys.map((item) => (
        <div key={item.key} className="flex flex-col text-left">
          <label htmlFor={item.key} className="mb-2 font-bold text-gray-700">
            {item.label} (@{item.key})
          </label>
          <input
            id={item.key}
            type="text"
            value={formData[item.key] || ""}
            onChange={(e) => handleInputChange(item.key, e.target.value)}
            placeholder={item.key === "com.twitter" ? "Sadece kullanıcı adı (örn: vitalikbuterin)" : "..."}
            className="p-3 rounded-lg border border-gray-300 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={isProcessing} // İşlem sırasında formu kilitle
          />
        </div>
      ))}

      {/* Butonun durumunu dinamik olarak değiştir */}
      <button 
        type="submit" 
        disabled={isProcessing} // İşlem sırasında butonu kilitle
        className={`mt-5 p-4 text-white border-none rounded-lg text-lg font-medium transition-colors ${
          isProcessing 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
        }`}
      >
        {isSigning ? "İmza bekleniyor..." : 
         isConfirming ? "İşlem onaylanıyor..." : 
         "Profili Güncelle"}
      </button>
    </form>
  );
}