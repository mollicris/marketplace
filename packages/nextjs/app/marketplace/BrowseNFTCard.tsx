"use client";

import { useEffect, useState } from "react";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { ipfsToHttp } from "~~/utils/ipfs";
import { notification } from "~~/utils/scaffold-eth";

type OffchainMetadata = {
  name?: string;
  description?: string;
  image?: string;
};

type Props = {
  tokenId: bigint;
  nftAddress: `0x${string}`;
  onPurchased?: () => void;
};

export const BrowseNFTCard = ({ tokenId, nftAddress, onPurchased }: Props) => {
  const { address: me } = useAccount();
  const [metadata, setMetadata] = useState<OffchainMetadata | null>(null);
  const [metadataError, setMetadataError] = useState(false);
  const [buying, setBuying] = useState(false);

  const { data: onchainMeta } = useScaffoldReadContract({
    contractName: "MarketplaceNFT",
    functionName: "getTokenMetadata",
    args: [tokenId],
  });

  const { data: listing, refetch: refetchListing } = useScaffoldReadContract({
    contractName: "Marketplace",
    functionName: "getListing",
    args: [nftAddress, tokenId],
  });

  const { writeContractAsync: writeMarketplace } = useScaffoldWriteContract({ contractName: "Marketplace" });

  const tokenURI = onchainMeta?.[2];

  useEffect(() => {
    if (!tokenURI) return;
    let cancelled = false;
    fetch(ipfsToHttp(tokenURI))
      .then(res => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((json: OffchainMetadata) => {
        if (!cancelled) setMetadata(json);
      })
      .catch(err => {
        if (!cancelled) {
          console.error(`Failed to fetch metadata for token ${tokenId}:`, err);
          setMetadataError(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [tokenURI, tokenId]);

  const isActive = Boolean(listing?.active);
  const price = listing?.price ?? 0n;
  const seller = listing?.seller;
  const isOwnListing = me && seller && me.toLowerCase() === seller.toLowerCase();

  if (!isActive) return null;

  const handleBuy = async () => {
    setBuying(true);
    try {
      const toastId = notification.loading("Comprando NFT…");
      await writeMarketplace({
        functionName: "buyNFT",
        args: [nftAddress, tokenId],
        value: price,
      });
      notification.remove(toastId);
      notification.success("¡Compra confirmada!");
      await refetchListing();
      onPurchased?.();
    } catch (err) {
      console.error(err);
      notification.error(err instanceof Error ? err.message : "Error en la compra");
    } finally {
      setBuying(false);
    }
  };

  const displayName = metadata?.name ?? `NFT #${tokenId.toString()}`;
  const imageSrc = metadata?.image ? ipfsToHttp(metadata.image) : "";

  return (
    <div className="group bg-gray-800/30 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/30 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1">
      <div className="relative overflow-hidden bg-gray-900 h-64 flex items-center justify-center">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={displayName}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span className="text-gray-500 text-sm">
            {metadataError ? "Metadata no disponible" : "Cargando metadata…"}
          </span>
        )}
        <div className="absolute top-3 right-3 bg-black/60 text-white px-2 py-1 rounded-full text-xs">
          #{tokenId.toString()}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-white truncate mb-1">{displayName}</h3>
        {metadata?.description && <p className="text-xs text-gray-400 line-clamp-2 mb-3">{metadata.description}</p>}

        <div className="text-xs text-gray-500 mb-3">
          <span className="mr-1">Vendedor:</span>
          {seller && <Address address={seller} size="xs" />}
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-400">Precio</span>
          <span className="font-semibold text-white">{formatEther(price)} ETH</span>
        </div>

        <button
          onClick={handleBuy}
          disabled={buying || !me || Boolean(isOwnListing)}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 rounded-lg text-sm hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCartIcon className="w-4 h-4 inline mr-1" />
          {!me ? "Conectá tu wallet" : isOwnListing ? "Es tu listing" : buying ? "Comprando…" : "Comprar"}
        </button>
      </div>
    </div>
  );
};
