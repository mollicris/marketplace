"use client";

import { useEffect, useMemo, useState } from "react";
import { formatEther, isAddress } from "viem";
import { useAccount, useBalance } from "wagmi";
import {
  ArrowDownTrayIcon,
  BanknotesIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  FireIcon,
  ShieldCheckIcon,
  ShoppingCartIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { Address, AddressInput } from "~~/components/scaffold-eth";
import {
  useDeployedContractInfo,
  useScaffoldEventHistory,
  useScaffoldReadContract,
  useScaffoldWriteContract,
} from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

type ActivityKind = "listed" | "sold" | "delisted";

interface ActivityItem {
  kind: ActivityKind;
  blockNumber: bigint;
  nftContract: `0x${string}`;
  tokenId: bigint;
  actor: `0x${string}`;
  price?: bigint;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  hint,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  hint?: string;
}) => (
  <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
        {hint && <p className="text-xs text-gray-500 mt-2">{hint}</p>}
      </div>
      <div className="p-3 rounded-lg bg-gradient-to-r from-purple-600/20 to-indigo-600/20">
        <Icon className="h-6 w-6 text-purple-400" />
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const { address } = useAccount();

  const { data: marketplaceInfo } = useDeployedContractInfo({ contractName: "Marketplace" });
  const { data: nftInfo } = useDeployedContractInfo({ contractName: "MarketplaceNFT" });

  const marketplaceAddress = marketplaceInfo?.address;
  const defaultNftAddress = nftInfo?.address;

  const { data: contractBalanceData } = useBalance({ address: marketplaceAddress });

  const { data: platformFee } = useScaffoldReadContract({
    contractName: "Marketplace",
    functionName: "platformFee",
  });

  const { data: feeRecipient } = useScaffoldReadContract({
    contractName: "Marketplace",
    functionName: "feeRecipient",
  });

  const { data: stats } = useScaffoldReadContract({
    contractName: "Marketplace",
    functionName: "getMarketplaceStats",
  });

  const { data: listedEvents } = useScaffoldEventHistory({
    contractName: "Marketplace",
    eventName: "Listed",
    fromBlock: 0n,
    watch: true,
  });

  const { data: soldEvents } = useScaffoldEventHistory({
    contractName: "Marketplace",
    eventName: "Sold",
    fromBlock: 0n,
    watch: true,
  });

  const { data: delistedEvents } = useScaffoldEventHistory({
    contractName: "Marketplace",
    eventName: "Delisted",
    fromBlock: 0n,
    watch: true,
  });

  const totalVolume = useMemo(() => {
    if (!soldEvents) return 0n;
    return soldEvents.reduce<bigint>((acc, ev) => {
      const price = (ev.args?.price ?? 0n) as bigint;
      return acc + price;
    }, 0n);
  }, [soldEvents]);

  const activity = useMemo<ActivityItem[]>(() => {
    const items: ActivityItem[] = [];
    listedEvents?.forEach(ev => {
      items.push({
        kind: "listed",
        blockNumber: ev.blockNumber ?? 0n,
        nftContract: ev.args?.nftContract as `0x${string}`,
        tokenId: (ev.args?.tokenId ?? 0n) as bigint,
        actor: ev.args?.seller as `0x${string}`,
        price: ev.args?.price as bigint | undefined,
      });
    });
    soldEvents?.forEach(ev => {
      items.push({
        kind: "sold",
        blockNumber: ev.blockNumber ?? 0n,
        nftContract: ev.args?.nftContract as `0x${string}`,
        tokenId: (ev.args?.tokenId ?? 0n) as bigint,
        actor: ev.args?.buyer as `0x${string}`,
        price: ev.args?.price as bigint | undefined,
      });
    });
    delistedEvents?.forEach(ev => {
      items.push({
        kind: "delisted",
        blockNumber: ev.blockNumber ?? 0n,
        nftContract: ev.args?.nftContract as `0x${string}`,
        tokenId: (ev.args?.tokenId ?? 0n) as bigint,
        actor: ev.args?.seller as `0x${string}`,
      });
    });
    return items.sort((a, b) => Number(b.blockNumber - a.blockNumber)).slice(0, 10);
  }, [listedEvents, soldEvents, delistedEvents]);

  const { writeContractAsync: writeMarketplace } = useScaffoldWriteContract({
    contractName: "Marketplace",
  });

  const [feePct, setFeePct] = useState("");
  const [newRecipient, setNewRecipient] = useState("");
  const [nftLookup, setNftLookup] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (defaultNftAddress && !nftLookup) setNftLookup(defaultNftAddress);
  }, [defaultNftAddress, nftLookup]);

  const { data: isNftApproved, refetch: refetchApproved } = useScaffoldReadContract({
    contractName: "Marketplace",
    functionName: "approvedNFTContracts",
    args: [isAddress(nftLookup) ? (nftLookup as `0x${string}`) : undefined],
  });

  const feeBpsDisplay = platformFee !== undefined ? Number(platformFee) : undefined;
  const feePctDisplay = feeBpsDisplay !== undefined ? (feeBpsDisplay / 100).toFixed(2) : "—";
  const balanceEth = contractBalanceData ? Number(formatEther(contractBalanceData.value)).toFixed(4) : "0.0000";
  const canWithdraw = contractBalanceData !== undefined && contractBalanceData.value > 0n;

  const handleSetFee = async () => {
    const pct = Number(feePct);
    if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
      notification.error("Ingresá un porcentaje entre 0 y 100");
      return;
    }
    const bps = BigInt(Math.round(pct * 100));
    setPending(true);
    try {
      await writeMarketplace({ functionName: "setPlatformFee", args: [bps] });
      notification.success(`Fee actualizado a ${pct}% (${bps} bps)`);
      setFeePct("");
    } catch (err) {
      console.error(err);
      notification.error(err instanceof Error ? err.message : "Error al actualizar fee");
    } finally {
      setPending(false);
    }
  };

  const handleSetRecipient = async () => {
    if (!isAddress(newRecipient)) {
      notification.error("Dirección inválida");
      return;
    }
    setPending(true);
    try {
      await writeMarketplace({ functionName: "setFeeRecipient", args: [newRecipient as `0x${string}`] });
      notification.success("Fee recipient actualizado");
      setNewRecipient("");
    } catch (err) {
      console.error(err);
      notification.error(err instanceof Error ? err.message : "Error al cambiar recipient");
    } finally {
      setPending(false);
    }
  };

  const handleWithdraw = async () => {
    setPending(true);
    try {
      await writeMarketplace({ functionName: "withdrawFees" });
      notification.success("Fees retirados");
    } catch (err) {
      console.error(err);
      notification.error(err instanceof Error ? err.message : "Error al retirar");
    } finally {
      setPending(false);
    }
  };

  const handleApproveNFT = async (approve: boolean) => {
    if (!isAddress(nftLookup)) {
      notification.error("Dirección inválida");
      return;
    }
    setPending(true);
    try {
      await writeMarketplace({
        functionName: approve ? "approveNFTContract" : "revokeNFTContract",
        args: [nftLookup as `0x${string}`],
      });
      notification.success(approve ? "Contrato NFT aprobado" : "Contrato NFT revocado");
      await refetchApproved();
    } catch (err) {
      console.error(err);
      notification.error(err instanceof Error ? err.message : "Error al cambiar aprobación");
    } finally {
      setPending(false);
    }
  };

  const activityIcon = (kind: ActivityKind) => (kind === "sold" ? "🛒" : kind === "listed" ? "📋" : "❌");

  const activityLabel = (kind: ActivityKind) => (kind === "sold" ? "Compró" : kind === "listed" ? "Listó" : "Deslistó");

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-12">
      <div className="container mx-auto px-4 space-y-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Dashboard del Marketplace</h1>
            <div className="text-gray-400 text-sm flex items-center gap-2">
              {address ? (
                <>
                  <span>Admin:</span>
                  <Address address={address} size="sm" />
                </>
              ) : (
                "Conectá tu wallet"
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Volumen Total"
            value={`${Number(formatEther(totalVolume)).toFixed(4)} ETH`}
            icon={CurrencyDollarIcon}
            hint={`${soldEvents?.length ?? 0} ventas on-chain`}
          />
          <StatCard
            title="Ventas"
            value={stats ? String(stats[1]) : "—"}
            icon={ShoppingCartIcon}
            hint="getMarketplaceStats()"
          />
          <StatCard title="Listados Históricos" value={stats ? String(stats[0]) : "—"} icon={FireIcon} />
          <StatCard title="Balance Contrato" value={`${balanceEth} ETH`} icon={BanknotesIcon} hint="Fees acumulados" />
        </div>

        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <ChartBarIcon className="h-5 w-5 text-purple-400" />
              Configuración de Fees
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="p-4 bg-gray-700/20 rounded-lg">
              <p className="text-sm text-gray-400">Fee actual</p>
              <p className="text-xl font-bold text-white mt-1">
                {feePctDisplay}% <span className="text-sm text-gray-500">({feeBpsDisplay ?? "—"} bps)</span>
              </p>
            </div>
            <div className="p-4 bg-gray-700/20 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Fee recipient</p>
              {feeRecipient ? (
                <Address address={feeRecipient as `0x${string}`} size="sm" />
              ) : (
                <p className="text-gray-500">—</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-700/20 rounded-lg space-y-3">
              <label className="block text-sm font-medium text-gray-400">Nuevo fee (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={feePct}
                onChange={e => setFeePct(e.target.value)}
                placeholder="2.50"
                className="w-full bg-gray-600/30 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              />
              <button
                onClick={handleSetFee}
                disabled={!feePct || pending}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pending ? "Enviando…" : "Guardar fee"}
              </button>
            </div>

            <div className="p-4 bg-gray-700/20 rounded-lg space-y-3">
              <label className="block text-sm font-medium text-gray-400">Nuevo fee recipient</label>
              <AddressInput value={newRecipient} onChange={setNewRecipient} placeholder="0x…" />
              <button
                onClick={handleSetRecipient}
                disabled={!newRecipient || pending}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pending ? "Enviando…" : "Actualizar recipient"}
              </button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-300 font-semibold">Retirar fees acumulados</p>
              <p className="text-xs text-amber-200/70 mt-1">Envía {balanceEth} ETH al recipient configurado.</p>
            </div>
            <button
              onClick={handleWithdraw}
              disabled={!canWithdraw || pending}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white px-5 py-2 rounded-lg font-semibold hover:from-amber-700 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              Retirar
            </button>
          </div>
        </div>

        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-6">
            <ShieldCheckIcon className="h-5 w-5 text-purple-400" />
            Contratos NFT aprobados
          </h2>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-400">Dirección del contrato NFT</label>
            <AddressInput value={nftLookup} onChange={setNftLookup} placeholder="0x…" />

            {isAddress(nftLookup) && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">Estado:</span>
                {isNftApproved ? (
                  <span className="flex items-center gap-1 text-green-400">
                    <CheckCircleIcon className="h-4 w-4" /> Aprobado
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-400">
                    <XCircleIcon className="h-4 w-4" /> No aprobado
                  </span>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleApproveNFT(true)}
                disabled={!isAddress(nftLookup) || pending || Boolean(isNftApproved)}
                className="bg-green-600/80 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Aprobar
              </button>
              <button
                onClick={() => handleApproveNFT(false)}
                disabled={!isAddress(nftLookup) || pending || !isNftApproved}
                className="bg-red-600/80 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Revocar
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Actividad Reciente</h2>
            <ClockIcon className="h-5 w-5 text-purple-400" />
          </div>
          {activity.length === 0 ? (
            <p className="text-center py-8 text-gray-400">Sin actividad on-chain todavía</p>
          ) : (
            <div className="space-y-3">
              {activity.map((item, i) => (
                <div
                  key={`${item.kind}-${item.blockNumber}-${item.nftContract}-${item.tokenId}-${i}`}
                  className="flex items-center justify-between py-3 border-b border-gray-700/30 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-xs text-white">
                      {activityIcon(item.kind)}
                    </div>
                    <div>
                      <div className="text-sm text-white flex items-center gap-2">
                        <Address address={item.actor} size="xs" />
                        <span className="text-gray-400">{activityLabel(item.kind)}</span>
                        <span className="text-purple-400">#{item.tokenId.toString()}</span>
                      </div>
                      <p className="text-xs text-gray-500">Block {item.blockNumber.toString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {item.price !== undefined ? (
                      <p className="text-sm font-semibold text-white">{formatEther(item.price)} ETH</p>
                    ) : (
                      <p className="text-xs text-gray-500">—</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
