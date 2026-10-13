"use client";

import { useMemo } from "react";
import { BrowseNFTCard } from "./BrowseNFTCard";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { useDeployedContractInfo, useScaffoldEventHistory } from "~~/hooks/scaffold-eth";

type ListedKey = string; // `${nftAddress}-${tokenId}`

export default function MarketplacePage() {
  const { data: nftContract } = useDeployedContractInfo({ contractName: "MarketplaceNFT" });
  const { data: marketplaceContract } = useDeployedContractInfo({ contractName: "Marketplace" });

  const { data: listedEvents, isLoading } = useScaffoldEventHistory({
    contractName: "Marketplace",
    eventName: "Listed",
    watch: true,
  });

  // Deduplicate: keep the latest Listed event per (nftContract, tokenId).
  // Each card re-reads getListing() to know the current price + active flag.
  const uniqueListings = useMemo(() => {
    if (!listedEvents) return [] as { nftAddress: `0x${string}`; tokenId: bigint }[];
    const seen = new Map<ListedKey, { nftAddress: `0x${string}`; tokenId: bigint }>();
    for (const ev of listedEvents) {
      const nftAddress = ev.args.nftContract as `0x${string}` | undefined;
      const tokenId = ev.args.tokenId as bigint | undefined;
      if (!nftAddress || tokenId === undefined) continue;
      seen.set(`${nftAddress.toLowerCase()}-${tokenId.toString()}`, { nftAddress, tokenId });
    }
    return Array.from(seen.values());
  }, [listedEvents]);

  const canRender = Boolean(nftContract?.address && marketplaceContract?.address);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Marketplace</h1>
          <p className="text-gray-400">Descubrí y comprá NFTs únicos</p>
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
        ) : uniqueListings.length === 0 ? (
          <div className="text-center py-12">
            <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Todavía no hay NFTs en venta</h3>
            <p className="text-gray-400">Cuando alguien liste su primer NFT, aparecerá acá.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {uniqueListings.map(({ nftAddress, tokenId }) => (
              <BrowseNFTCard key={`${nftAddress}-${tokenId.toString()}`} nftAddress={nftAddress} tokenId={tokenId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
