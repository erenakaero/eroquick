// app/ProfileForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import { sepolia } from "wagmi/chains";

// Wagmi ve Viem'den GEREKLİ TÜM ARAÇLARI import edelim
import { getEnsText, getEnsResolver, writeContract } from "@wagmi/core";
import { useWaitForTransactionReceipt, useConfig } from "wagmi";
import { useMutation } from "@tanstack/react-query";
import { namehash, encodeFunctionData, parseAbi, Address } from "viem";

// Bu, ENS Public Resolver kontratının ihtiyacımız olan fonksiyonlarının arayüzüdür (ABI)
const publicResolverAbi = parseAbi([
  "function setText(bytes32 node, string calldata key, string calldata value)",
  "function multicall(bytes[] calldata data)",
]);

// Which text records we'll support
const profileKeys = [
  { key: "description", label: "Bio" },
  { key: "avatar", label: "Avatar URL" },
  { key: "com.twitter", label: "Twitter" },
  { key: "com.github", label: "GitHub" },
  { key: "url", label: "Website" },
];

export function ProfileForm({ ensName }: { ensName: string }) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // İşlem (transaction) hash'ini tutmak için yeni bir state
  const [txHash, setTxHash] = useState<Address | undefined>();
  
  // Wagmi config'i al
  const config = useConfig();

  // --- 1. Mevcut Profili Çekme ---
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        const promises = profileKeys.map((item) =>
          getEnsText(config, { name: ensName, key: item.key, chainId: sepolia.id })
        );
        const results = await Promise.all(promises);
        const newFormData: Record<string, string> = {};
        profileKeys.forEach((item, index) => {
          newFormData[item.key] = results[index] || "";
        });
        setFormData(newFormData);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (ensName) {
      fetchProfileData();
    }
  }, [ensName, config]);

  // --- 2. Blockchain'e Yazma (Mutasyon) ---
  const {
    mutate,
    isPending: isSigning
  } = useMutation({
    mutationFn: async (dataToSubmit: Record<string, string>) => {
      console.log("Mutation starting...");
      setTxHash(undefined);

      const node = namehash(ensName);
      const resolverAddress = await getEnsResolver(config, { name: ensName, chainId: sepolia.id });
      if (!resolverAddress) throw new Error("Resolver not found");
      console.log(`Resolver address: ${resolverAddress}`);

      const calldata = profileKeys.map((item) =>
        encodeFunctionData({
          abi: publicResolverAbi,
          functionName: "setText",
          args: [node, item.key, dataToSubmit[item.key] || ""],
        })
      );
      console.log("Calldata created:", calldata);

      const hash = await writeContract(config, {
        address: resolverAddress,
        abi: publicResolverAbi,
        functionName: "multicall",
        args: [calldata],
        chainId: sepolia.id,
      });

      console.log(`Transaction sent: ${hash}`);
      return hash;
    },
    onSuccess: (hash) => {
      setTxHash(hash);
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      alert(`Error: ${error.message}`);
    },
  });

  // --- 3. İşlem Onayını Bekleme ---
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed
  } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId: sepolia.id,
  });

  // --- 4. Form Submission ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form:", formData);
    mutate(formData);
  };

  // --- 5. Form Girdi Değişikliği ---
  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // --- 6. Form Display ---
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-lg text-gray-600">Loading current profile data...</p>
      </div>
    );
  }

  const isProcessing = isSigning || isConfirming;

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Edit Your Profile:
        </h2>
        <h3 className="text-3xl font-bold font-mono text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 mb-8">
          {ensName}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        {/* Success message */}
        {isConfirmed && (
          <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-center">
            <strong>Success!</strong> Profile updated.
            <a 
              href={`https://sepolia.etherscan.io/tx/${txHash}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block mt-2 text-green-600 hover:text-green-800 underline"
            >
              View on Sepolia Etherscan
            </a>
          </div>
        )}

        {/* Input alanları */}
        {profileKeys.map((item) => (
          <div key={item.key} className="flex flex-col text-left">
            <label htmlFor={item.key} className="mb-1.5 font-semibold text-gray-700">
              {item.label}
              <span className="font-mono text-xs text-gray-500 ml-2">(@{item.key})</span>
            </label>
            <input
              id={item.key}
              type="text"
              value={formData[item.key] || ""}
              onChange={(e) => handleInputChange(item.key, e.target.value)}
              placeholder={
                item.key === "com.twitter" ? "Username only (e.g: vitalikbuterin)" : "..."
              }
              className="px-3 py-2 rounded-lg border border-gray-300 text-black
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={isProcessing}
            />
          </div>
        ))}

        {/* Button */}
        <button
          type="submit"
          disabled={isProcessing}
          className="w-full mt-4 px-4 py-3 bg-blue-600 text-white rounded-lg
                     font-semibold text-base cursor-pointer
                     hover:bg-blue-700
                     disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSigning ? "Waiting for signature..." :
           isConfirming ? "Confirming transaction..." :
           "Update Profile"}
        </button>
      </form>
    </div>
  );
}