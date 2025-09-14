// app/my-nfts/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import {
    EyeIcon,
    ArrowTopRightOnSquareIcon,
    ArrowsRightLeftIcon,
    TagIcon,
    UserCircleIcon,
    PhotoIcon,
    XMarkIcon
} from "@heroicons/react/24/outline";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import Link from "next/link";
import { notFound } from "next/navigation";

interface NFT {
    id: number;
    name: string;
    description: string;
    image: string;
    price: string;
    owner: string;
    tokenId: number;
    isForSale: boolean;
    collection: string;
}

export default function MyNFTsPage() {
    const { address, isConnected } = useAccount();
    const [activeTab, setActiveTab] = useState<'owned' | 'created' | 'on-sale'>('owned');
    const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
    const [sellPrice, setSellPrice] = useState("");
    const [isSelling, setIsSelling] = useState(false);

    // Simular datos de NFTs (en producción vendría del contrato)
    const mockNFTs: NFT[] = [
        {
            id: 1,
            name: "Visión Cósmica #1",
            description: "Una obra de arte digital inspirada en el cosmos",
            image: "https://placehold.co/400x400/4f46e5/white?text=Cosmic+Vision",
            price: "1.5 ETH",
            owner: "0x1234...5678",
            tokenId: 1,
            isForSale: true,
            collection: "Cosmic Visions"
        },
        {
            id: 2,
            name: "Naturaleza Digital #42",
            description: "Representación digital de la naturaleza",
            image: "https://placehold.co/400x400/10b981/white?text=Digital+Nature",
            price: "0.0 ETH",
            owner: "0x1234...5678",
            tokenId: 2,
            isForSale: false,
            collection: "Digital Nature"
        },
        {
            id: 3,
            name: "Ciudad Futurista #7",
            description: "Visión de una ciudad del futuro",
            image: "https://placehold.co/400x400/6366f1/white?text=Future+City",
            price: "3.75 ETH",
            owner: "0x1234...5678",
            tokenId: 3,
            isForSale: true,
            collection: "Future Cities"
        }
    ];

    // En producción, usarías esto para leer NFTs reales:
    // const { data: userNFTs, isLoading } = useScaffoldReadContract({
    //     contractName: "YourContract",
    //     functionName: "getUserNFTs",
    //     args: [address],
    // });

    // const { writeAsync: listNFTForSale } = useScaffoldWriteContract({
    //     contractName: "YourNFTMarketplace",
    //     functionName: "listNFTForSale",
    //     args: [
    //         selectedNFT?.tokenId ? BigInt(selectedNFT.tokenId) : BigInt(0),
    //         BigInt(Math.floor(parseFloat(sellPrice) * 1e18 || 0))
    //     ],
    //     onBlockConfirmation: (txnReceipt) => {
    //         console.log("NFT listado para venta", txnReceipt);
    //         setIsSelling(false);
    //         setSelectedNFT(null);
    //         setSellPrice("");
    //     },
    // });

    const filteredNFTs = mockNFTs.filter(nft => {
        if (activeTab === 'owned') return true;
        if (activeTab === 'on-sale') return nft.isForSale;
        if (activeTab === 'created') return nft.owner === address;
        return true;
    });

    //Hacer Mock listNFTForSale para simular lista de NFT para la venta
    const listNFTForSale = mockNFTs.filter(nft => {
        return nft.isForSale;
        return true;
    });



    if (!isConnected) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-8">
                <div className="container mx-auto px-4">
                    <div className="text-center py-12">
                        <UserCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-4">Conecta tu wallet</h2>
                        <p className="text-gray-400 mb-6">Necesitas conectarte para ver tus NFTs</p>
                        <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all">
                            Conectar Wallet
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Mis NFTs</h1>
                    <p className="text-gray-400">
                        Gestiona y visualiza tu colección personal de NFTs
                    </p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30 text-center">
                        <div className="text-2xl font-bold text-white">{mockNFTs.length}</div>
                        <div className="text-sm text-gray-400">Total NFTs</div>
                    </div>
                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30 text-center">
                        <div className="text-2xl font-bold text-white">
                            {mockNFTs.filter(nft => nft.isForSale).length}
                        </div>
                        <div className="text-sm text-gray-400">En Venta</div>
                    </div>
                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30 text-center">
                        <div className="text-2xl font-bold text-white">2</div>
                        <div className="text-sm text-gray-400">Colecciones</div>
                    </div>
                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30 text-center">
                        <div className="text-2xl font-bold text-white">5.25 ETH</div>
                        <div className="text-sm text-gray-400">Valor Total</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-2 bg-gray-800/50 rounded-lg p-1 mb-8">
                    {[
                        { id: 'owned', label: 'Todos mis NFTs', count: mockNFTs.length },
                        { id: 'on-sale', label: 'En Venta', count: mockNFTs.filter(nft => nft.isForSale).length },
                        { id: 'created', label: 'Creados por mí', count: mockNFTs.filter(nft => nft.owner === address).length }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                                : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                                }`}
                        >
                            {tab.label} ({tab.count})
                        </button>
                    ))}
                </div>

                {/* NFTs Grid */}
                {/* {isLoading ? ( */}
                {false ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-gray-800/30 rounded-xl h-64 mb-4"></div>
                                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                                <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredNFTs.length === 0 ? (
                    <div className="text-center py-12">
                        <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">
                            {activeTab === 'owned' && 'No tienes NFTs aún'}
                            {activeTab === 'on-sale' && 'No tienes NFTs en venta'}
                            {activeTab === 'created' && 'No has creado NFTs'}
                        </h3>
                        <p className="text-gray-400 mb-6">
                            {activeTab === 'owned' && 'Comienza a coleccionar NFTs en el marketplace'}
                            {activeTab === 'on-sale' && 'Lista tus NFTs para comenzar a vender'}
                            {activeTab === 'created' && 'Crea tu primer NFT'}
                        </p>
                        <Link
                            href="/create-nft"
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all inline-block"
                        >
                            Crear mi primer NFT
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredNFTs.map(nft => (
                            <div
                                key={nft.id}
                                className="group bg-gray-800/30 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/30 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1"
                            >
                                {/* NFT Image */}
                                <div className="relative overflow-hidden">
                                    <img
                                        src={nft.image}
                                        alt={nft.name}
                                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    {nft.isForSale && (
                                        <div className="absolute top-3 left-3 bg-green-500/80 text-white px-2 py-1 rounded-full text-xs">
                                            En Venta
                                        </div>
                                    )}
                                </div>

                                {/* NFT Info */}
                                <div className="p-4">
                                    <h3 className="font-semibold text-white truncate mb-1">{nft.name}</h3>
                                    <p className="text-sm text-gray-400 truncate mb-3">{nft.collection}</p>

                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm text-gray-400">Precio</span>
                                        <span className="font-semibold text-white">{nft.price}</span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setSelectedNFT(nft)}
                                            className="flex-1 bg-gray-700/50 text-gray-300 py-2 rounded-lg text-sm hover:bg-gray-600/50 transition-colors"
                                        >
                                            <EyeIcon className="w-4 h-4 inline mr-1" />
                                            Detalles
                                        </button>
                                        {!nft.isForSale && (
                                            <button
                                                onClick={() => {
                                                    setSelectedNFT(nft);
                                                    setIsSelling(true);
                                                }}
                                                className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 text-white py-2 rounded-lg text-sm hover:from-green-700 hover:to-teal-700 transition-all"
                                            >
                                                <TagIcon className="w-4 h-4 inline mr-1" />
                                                Vender
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal de Detalles */}
                {selectedNFT && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-800/95 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <h2 className="text-2xl font-bold text-white">{selectedNFT.name}</h2>
                                    <button
                                        onClick={() => setSelectedNFT(null)}
                                        className="text-gray-400 hover:text-white"
                                    >
                                        <XMarkIcon className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <img
                                            src={selectedNFT.image}
                                            alt={selectedNFT.name}
                                            className="w-full rounded-lg"
                                        />
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-2">Descripción</h3>
                                        <p className="text-gray-400 mb-4">{selectedNFT.description}</p>

                                        <div className="space-y-3 mb-6">
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Colección:</span>
                                                <span className="text-white">{selectedNFT.collection}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Precio:</span>
                                                <span className="text-white font-semibold">{selectedNFT.price}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Estado:</span>
                                                <span className={`px-2 py-1 rounded-full text-xs ${selectedNFT.isForSale
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-gray-500/20 text-gray-400'
                                                    }`}>
                                                    {selectedNFT.isForSale ? 'En Venta' : 'No disponible'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex space-x-3">
                                            <button className="flex-1 bg-gray-700/50 text-gray-300 py-2 rounded-lg hover:bg-gray-600/50 transition-colors">
                                                <ArrowsRightLeftIcon className="w-4 h-4 inline mr-1" />
                                                Transferir
                                            </button>
                                            <button className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all">
                                                <ArrowTopRightOnSquareIcon className="w-4 h-4 inline mr-1" />
                                                Ver en Marketplace
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de Venta */}
                {isSelling && selectedNFT && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-800/95 rounded-xl max-w-md w-full p-6">
                            <h2 className="text-2xl font-bold text-white mb-4">Listar NFT para Venta</h2>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Precio (ETH)
                                </label>
                                <input
                                    type="number"
                                    step="0.001"
                                    value={sellPrice}
                                    onChange={(e) => setSellPrice(e.target.value)}
                                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                                <h4 className="font-semibold text-blue-400 mb-2">Fee de Marketplace</h4>
                                <p className="text-sm text-blue-300">2.5% fee aplicado a la venta</p>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setIsSelling(false)}
                                    className="flex-1 bg-gray-700/50 text-gray-300 py-2 rounded-lg hover:bg-gray-600/50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    // onClick={() => listNFTForSale()}
                                    disabled={!sellPrice}
                                    className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 text-white py-2 rounded-lg hover:from-green-700 hover:to-teal-700 transition-all disabled:opacity-50"
                                >
                                    Listar para Venta
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}