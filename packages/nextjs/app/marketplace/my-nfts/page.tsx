"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MyNFTCard } from "./MyNFTCard";
import { useAccount } from "wagmi";
import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { useDeployedContractInfo, useScaffoldReadContract } from "~~/hooks/scaffold-eth";

type Tab = "owned" | "created";

export default function MyNFTsPage() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<Tab>("owned");

  const { data: nftContract } = useDeployedContractInfo({ contractName: "MarketplaceNFT" });
  const { data: marketplaceContract } = useDeployedContractInfo({ contractName: "Marketplace" });

  const { data: ownedIds, isLoading: loadingOwned } = useScaffoldReadContract({
    contractName: "MarketplaceNFT",
    functionName: "getTokensByOwner",
    args: [address],
  });

  const { data: createdIds, isLoading: loadingCreated } = useScaffoldReadContract({
    contractName: "MarketplaceNFT",
    functionName: "getTokensByCreator",
    args: [address],
  });

  const visibleIds = useMemo<readonly bigint[]>(() => {
    if (activeTab === "owned") return (ownedIds as readonly bigint[] | undefined) ?? [];
    return (createdIds as readonly bigint[] | undefined) ?? [];
  }, [activeTab, ownedIds, createdIds]);

  const isLoading = activeTab === "owned" ? loadingOwned : loadingCreated;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <UserCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Conecta tu wallet</h2>
            <p className="text-gray-400 mb-6">Necesitas conectarte para ver tus NFTs</p>
          </div>
        </div>
      </div>
    );
  }

  const canRender = Boolean(nftContract?.address && marketplaceContract?.address);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Mis NFTs</h1>
          <p className="text-gray-400">Gestiona y publica tu colección personal</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30 text-center">
            <div className="text-2xl font-bold text-white">
              {(ownedIds as readonly bigint[] | undefined)?.length ?? 0}
            </div>
            <div className="text-sm text-gray-400">En tu wallet</div>
          </div>
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30 text-center">
            <div className="text-2xl font-bold text-white">
              {(createdIds as readonly bigint[] | undefined)?.length ?? 0}
            </div>
            <div className="text-sm text-gray-400">Creados por vos</div>
          </div>
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30 text-center">
            <div className="text-2xl font-bold text-white break-all">
              {marketplaceContract?.address
                ? `${marketplaceContract.address.slice(0, 6)}…${marketplaceContract.address.slice(-4)}`
                : "—"}
            </div>
            <div className="text-sm text-gray-400">Marketplace</div>
          </div>
        </div>

        <div className="flex space-x-2 bg-gray-800/50 rounded-lg p-1 mb-8">
          {[
            {
              id: "owned" as Tab,
              label: "En tu wallet",
              count: (ownedIds as readonly bigint[] | undefined)?.length ?? 0,
            },
            {
              id: "created" as Tab,
              label: "Creados por vos",
              count: (createdIds as readonly bigint[] | undefined)?.length ?? 0,
            },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                  : "text-gray-300 hover:text-white hover:bg-gray-700/50"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {!canRender ? (
          <div className="text-center py-12 text-gray-400">
            Contratos no desplegados en esta red. Corré <code className="text-purple-300">yarn deploy</code>.
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-800/30 rounded-xl h-64 mb-4"></div>
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : visibleIds.length === 0 ? (
          <div className="text-center py-12">
            <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {activeTab === "owned" ? "No tenés NFTs en tu wallet" : "No creaste ningún NFT"}
            </h3>
            <p className="text-gray-400 mb-6">Dale, minteá uno nuevo.</p>
            <Link
              href="/create-nft"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all inline-block"
            >
              Crear mi primer NFT
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {visibleIds.map(tokenId => (
              <MyNFTCard
                key={tokenId.toString()}
                tokenId={tokenId}
                nftAddress={nftContract!.address as `0x${string}`}
                marketplaceAddress={marketplaceContract!.address as `0x${string}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
