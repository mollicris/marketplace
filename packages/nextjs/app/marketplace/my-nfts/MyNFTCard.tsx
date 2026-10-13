"use client";

import { useEffect, useState } from "react";
import { formatEther, parseEther } from "viem";
import { useAccount } from "wagmi";
import { EyeIcon, TagIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { ipfsToHttp } from "~~/utils/ipfs";
import { notification } from "~~/utils/scaffold-eth";

type OffchainMetadata = {
  name?: string;
  description?: string;
  image?: string;
  attributes?: { trait_type: string; value: string }[];
};

type Props = {
  tokenId: bigint;
  nftAddress: `0x${string}`;
  marketplaceAddress: `0x${string}`;
};

export const MyNFTCard = ({ tokenId, nftAddress, marketplaceAddress }: Props) => {
  const { address } = useAccount();
  const [metadata, setMetadata] = useState<OffchainMetadata | null>(null);
  const [metadataError, setMetadataError] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [sellPrice, setSellPrice] = useState("");
  const [busy, setBusy] = useState(false);

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

  const { data: isApproved } = useScaffoldReadContract({
    contractName: "MarketplaceNFT",
    functionName: "isApprovedForAll",
    args: [address, marketplaceAddress],
  });

  const { writeContractAsync: writeNFT } = useScaffoldWriteContract({ contractName: "MarketplaceNFT" });
  const { writeContractAsync: writeMarketplace } = useScaffoldWriteContract({ contractName: "Marketplace" });

  const tokenURI = onchainMeta?.[2];

  useEffect(() => {
    if (!tokenURI) return;
    let cancelled = false;
    const url = ipfsToHttp(tokenURI);
    fetch(url)
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

  const isListed = Boolean(listing?.active);
  const listedPrice = listing?.price ?? 0n;

  const handleList = async () => {
    if (!sellPrice || Number(sellPrice) <= 0) {
      notification.error("Precio inválido");
      return;
    }
    setBusy(true);
    try {
      if (!isApproved) {
        const approvalToast = notification.loading("Aprobando marketplace…");
        await writeNFT({
          functionName: "setApprovalForAll",
          args: [marketplaceAddress, true],
        });
        notification.remove(approvalToast);
      }

      const listToast = notification.loading("Publicando listing…");
      await writeMarketplace({
        functionName: "listNFT",
        args: [nftAddress, tokenId, parseEther(sellPrice)],
      });
      notification.remove(listToast);
      notification.success("NFT listado");
      setShowSellModal(false);
      setSellPrice("");
      await refetchListing();
    } catch (err) {
      console.error(err);
      notification.error(err instanceof Error ? err.message : "Error al listar");
    } finally {
      setBusy(false);
    }
  };

  const handleDelist = async () => {
    setBusy(true);
    try {
      const toastId = notification.loading("Quitando listing…");
      await writeMarketplace({
        functionName: "delistNFT",
        args: [nftAddress, tokenId],
      });
      notification.remove(toastId);
      notification.success("Listing cancelado");
      await refetchListing();
    } catch (err) {
      console.error(err);
      notification.error(err instanceof Error ? err.message : "Error al delistar");
    } finally {
      setBusy(false);
    }
  };

  const displayName = metadata?.name ?? `NFT #${tokenId.toString()}`;
  const imageSrc = metadata?.image ? ipfsToHttp(metadata.image) : "";

  return (
    <>
      <div className="group bg-gray-800/30 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/30 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1">
        <div className="relative overflow-hidden bg-gray-900 h-64 flex items-center justify-center">
          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element -- IPFS gateway URL comes from env at runtime
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
          {isListed && (
            <div className="absolute top-3 left-3 bg-green-500/80 text-white px-2 py-1 rounded-full text-xs">
              En Venta
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-white truncate mb-1">{displayName}</h3>
          <p className="text-xs text-gray-500 font-mono mb-3">Token #{tokenId.toString()}</p>

          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">Precio</span>
            <span className="font-semibold text-white">{isListed ? `${formatEther(listedPrice)} ETH` : "—"}</span>
          </div>

          <div className="flex space-x-2">
            {isListed ? (
              <button
                onClick={handleDelist}
                disabled={busy}
                className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 text-white py-2 rounded-lg text-sm hover:from-red-700 hover:to-rose-700 transition-all disabled:opacity-50"
              >
                <XMarkIcon className="w-4 h-4 inline mr-1" />
                Delistar
              </button>
            ) : (
              <button
                onClick={() => setShowSellModal(true)}
                disabled={busy}
                className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 text-white py-2 rounded-lg text-sm hover:from-green-700 hover:to-teal-700 transition-all disabled:opacity-50"
              >
                <TagIcon className="w-4 h-4 inline mr-1" />
                Vender
              </button>
            )}
            {metadata && (
              <a
                href={imageSrc}
                target="_blank"
                rel="noreferrer"
                className="px-3 bg-gray-700/50 text-gray-300 py-2 rounded-lg text-sm hover:bg-gray-600/50 transition-colors inline-flex items-center"
                title="Ver imagen original"
              >
                <EyeIcon className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {showSellModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800/95 rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-white mb-1">Listar NFT para Venta</h2>
            <p className="text-sm text-gray-400 mb-4">{displayName}</p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-2">Precio (ETH)</label>
              <input
                type="number"
                step="0.001"
                min="0"
                value={sellPrice}
                onChange={e => setSellPrice(e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                placeholder="0.00"
                autoFocus
              />
            </div>

            {!isApproved && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4 text-sm text-yellow-200">
                Vas a firmar dos transacciones: primero autorizar al marketplace a transferir tus NFTs, luego publicar
                el listing.
              </div>
            )}

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-400 mb-1">Fee de Marketplace</h4>
              <p className="text-sm text-blue-300">2.5% aplicado al precio de venta.</p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowSellModal(false);
                  setSellPrice("");
                }}
                disabled={busy}
                className="flex-1 bg-gray-700/50 text-gray-300 py-2 rounded-lg hover:bg-gray-600/50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleList}
                disabled={busy || !sellPrice}
                className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 text-white py-2 rounded-lg hover:from-green-700 hover:to-teal-700 transition-all disabled:opacity-50"
              >
                {busy ? "Procesando…" : "Listar para Venta"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
