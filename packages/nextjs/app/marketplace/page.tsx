"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import {
    // FilterIcon,
    MagnifyingGlassIcon,
    ArrowsUpDownIcon,
    FireIcon,
    ClockIcon,
    StarIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";

interface NFT {
    id: number;
    name: string;
    description: string;
    image: string;
    price: string;
    priceETH: number;
    owner: string;
    creator: string;
    tokenId: number;
    isForSale: boolean;
    collection: string;
    likes: number;
    createdAt: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export default function MarketplacePage() {
    const { isConnected } = useAccount();
    const [activeFilter, setActiveFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCollection, setSelectedCollection] = useState('all');
    const [priceRange, setPriceRange] = useState({ min: 0, max: 10 });

    // Mock data - En producción vendría de tu contrato
    const mockNFTs: NFT[] = [
        {
            id: 1,
            name: "Visión Cósmica #1",
            description: "Una obra de arte digital inspirada en el cosmos",
            image: "https://placehold.co/400x400/4f46e5/white?text=Cosmic+Vision",
            price: "1.5 ETH",
            priceETH: 1.5,
            owner: "0x1234...5678",
            creator: "0xabcd...efgh",
            tokenId: 1,
            isForSale: true,
            collection: "Cosmic Visions",
            likes: 42,
            createdAt: "2023-12-01",
            rarity: 'epic'
        },
        {
            id: 2,
            name: "Naturaleza Digital #42",
            description: "Representación digital de la naturaleza",
            image: "https://placehold.co/400x400/10b981/white?text=Digital+Nature",
            price: "2.25 ETH",
            priceETH: 2.25,
            owner: "0x5678...9012",
            creator: "0xijkl...mnop",
            tokenId: 2,
            isForSale: true,
            collection: "Digital Nature",
            likes: 89,
            createdAt: "2023-12-05",
            rarity: 'rare'
        },
        {
            id: 3,
            name: "Ciudad Futurista #7",
            description: "Visión de una ciudad del futuro",
            image: "https://placehold.co/400x400/6366f1/white?text=Future+City",
            price: "3.75 ETH",
            priceETH: 3.75,
            owner: "0x9012...3456",
            creator: "0xqrst...uvwx",
            tokenId: 3,
            isForSale: true,
            collection: "Future Cities",
            likes: 156,
            createdAt: "2023-12-10",
            rarity: 'legendary'
        },
        {
            id: 4,
            name: "Retrato Digital #23",
            description: "Retrato artístico digital único",
            image: "https://placehold.co/400x400/8b5cf6/white?text=Digital+Portrait",
            price: "0.75 ETH",
            priceETH: 0.75,
            owner: "0x3456...7890",
            creator: "0xyzab...cdef",
            tokenId: 4,
            isForSale: true,
            collection: "Digital Portraits",
            likes: 27,
            createdAt: "2023-12-15",
            rarity: 'uncommon'
        },
        {
            id: 5,
            name: "Abstracto #56",
            description: "Composición abstracta moderna",
            image: "https://placehold.co/400x400/ec4899/white?text=Abstract+Art",
            price: "1.2 ETH",
            priceETH: 1.2,
            owner: "0x7890...1234",
            creator: "0xghij...klmn",
            tokenId: 5,
            isForSale: true,
            collection: "Abstract Collection",
            likes: 34,
            createdAt: "2023-12-20",
            rarity: 'common'
        },
        {
            id: 6,
            name: "Geométrico #12",
            description: "Patrones geométricos perfectos",
            image: "https://placehold.co/400x400/06b6d4/white?text=Geometric",
            price: "2.8 ETH",
            priceETH: 2.8,
            owner: "0x1234...5678",
            creator: "0xopqr...stuv",
            tokenId: 6,
            isForSale: true,
            collection: "Geometric Arts",
            likes: 67,
            createdAt: "2023-12-25",
            rarity: 'rare'
        }
    ];

    const collections = [
        { name: "all", label: "Todas las Colecciones" },
        { name: "Cosmic Visions", label: "Cosmic Visions" },
        { name: "Digital Nature", label: "Digital Nature" },
        { name: "Future Cities", label: "Future Cities" },
        { name: "Digital Portraits", label: "Digital Portraits" },
        { name: "Abstract Collection", label: "Abstract Collection" },
        { name: "Geometric Arts", label: "Geometric Arts" }
    ];

    const filters = [
        { id: 'all', label: 'Todos', icon: FireIcon },
        { id: 'new', label: 'Nuevos', icon: ClockIcon },
        { id: 'popular', label: 'Populares', icon: StarIcon },
        { id: 'affordable', label: 'Accesibles', icon: null }
    ];

    const sortOptions = [
        { id: 'newest', label: 'Más recientes' },
        { id: 'price-low', label: 'Precio: Menor a mayor' },
        { id: 'price-high', label: 'Precio: Mayor a menor' },
        { id: 'popular', label: 'Más populares' }
    ];

    const filteredNFTs = mockNFTs
        .filter(nft => {
            // Filtro por colección
            if (selectedCollection !== 'all' && nft.collection !== selectedCollection) {
                return false;
            }

            // Filtro por precio
            if (nft.priceETH < priceRange.min || nft.priceETH > priceRange.max) {
                return false;
            }

            // Filtro por búsqueda
            if (searchQuery && !nft.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !nft.collection.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }

            // Filtros adicionales
            switch (activeFilter) {
                case 'new':
                    // Últimos 7 días
                    return new Date(nft.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                case 'popular':
                    return nft.likes > 50;
                case 'affordable':
                    return nft.priceETH < 1;
                default:
                    return true;
            }
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return a.priceETH - b.priceETH;
                case 'price-high':
                    return b.priceETH - a.priceETH;
                case 'popular':
                    return b.likes - a.likes;
                case 'newest':
                default:
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
        });

    const getRarityColor = (rarity: string) => {
        const colors = {
            common: 'text-gray-400',
            uncommon: 'text-green-400',
            rare: 'text-blue-400',
            epic: 'text-purple-400',
            legendary: 'text-yellow-400'
        };
        return colors[rarity as keyof typeof colors] || 'text-gray-400';
    };

    const getRarityLabel = (rarity: string) => {
        const labels = {
            common: 'Común',
            uncommon: 'Poco Común',
            rare: 'Raro',
            epic: 'Épico',
            legendary: 'Legendario'
        };
        return labels[rarity as keyof typeof labels] || 'Común';
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        Marketplace NFT
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Descubre y colecciona NFTs extraordinarios de artistas talentosos
                    </p>
                </div>

                {/* Stats Banner */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-700/30">
                        <div className="text-2xl font-bold text-white">{mockNFTs.length}</div>
                        <div className="text-sm text-gray-400">NFTs Disponibles</div>
                    </div>
                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-700/30">
                        <div className="text-2xl font-bold text-white">{collections.length - 1}</div>
                        <div className="text-sm text-gray-400">Colecciones</div>
                    </div>
                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-700/30">
                        <div className="text-2xl font-bold text-white">1.2K</div>
                        <div className="text-sm text-gray-400">Artistas</div>
                    </div>
                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-700/30">
                        <div className="text-2xl font-bold text-white">245.75 ETH</div>
                        <div className="text-sm text-gray-400">Volumen</div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30 mb-8">
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                        {/* Search Bar */}
                        <div className="flex-1 relative">
                            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Buscar NFTs, colecciones o artistas..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                            />
                        </div>

                        {/* Sort Dropdown */}
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none appearance-none pr-10"
                            >
                                {sortOptions.map(option => (
                                    <option key={option.id} value={option.id}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <ArrowsUpDownIcon className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                        </div>

                        {/* Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center space-x-2 bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white hover:bg-gray-600/50 transition-colors"
                        >
                            {/* <FilterIcon className="w-5 h-5" /> */}
                            <span>Filtros</span>
                        </button>
                    </div>

                    {/* Expanded Filters */}
                    {showFilters && (
                        <div className="mt-6 pt-6 border-t border-gray-700/30">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Collection Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        Colección
                                    </label>
                                    <select
                                        value={selectedCollection}
                                        onChange={(e) => setSelectedCollection(e.target.value)}
                                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                                    >
                                        {collections.map(collection => (
                                            <option key={collection.name} value={collection.name}>
                                                {collection.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Price Range */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        Rango de Precio (ETH)
                                    </label>
                                    <div className="flex space-x-2 items-center">
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={priceRange.min}
                                            onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseFloat(e.target.value) }))}
                                            className="w-20 bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                                            placeholder="Min"
                                        />
                                        <span className="text-gray-400">-</span>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={priceRange.max}
                                            onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseFloat(e.target.value) }))}
                                            className="w-20 bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                                            placeholder="Max"
                                        />
                                    </div>
                                </div>

                                {/* Status Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        Estado
                                    </label>
                                    <select className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none">
                                        <option value="all">Todos</option>
                                        <option value="buy-now">Compra Ahora</option>
                                        <option value="auction">Subasta</option>
                                        <option value="new">Nuevos</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Filters */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {filters.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveFilter(id)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${activeFilter === id
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                                : 'bg-gray-800/50 text-gray-300 hover:text-white hover:bg-gray-700/50'
                                }`}
                        >
                            {Icon && <Icon className="w-4 h-4" />}
                            <span>{label}</span>
                        </button>
                    ))}
                </div>

                {/* Results Count */}
                <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-400">
                        Mostrando {filteredNFTs.length} de {mockNFTs.length} NFTs
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <span>Ordenar por:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-transparent text-white border-none focus:outline-none"
                        >
                            {sortOptions.map(option => (
                                <option key={option.id} value={option.id}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* NFTs Grid */}
                {filteredNFTs.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gray-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MagnifyingGlassIcon className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No se encontraron NFTs</h3>
                        <p className="text-gray-400 mb-6">Intenta ajustar tus filtros de búsqueda</p>
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setActiveFilter('all');
                                setSelectedCollection('all');
                                setPriceRange({ min: 0, max: 10 });
                            }}
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all"
                        >
                            Limpiar Filtros
                        </button>
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
                                    <div className="absolute top-3 left-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(nft.rarity)} bg-gray-900/80`}>
                                            {getRarityLabel(nft.rarity)}
                                        </span>
                                    </div>
                                    <div className="absolute top-3 right-3">
                                        <button className="bg-gray-900/80 rounded-full p-2 text-gray-300 hover:text-red-500 transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* NFT Info */}
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-semibold text-white truncate flex-1">{nft.name}</h3>
                                        <span className="text-xs text-gray-400 ml-2">#{nft.tokenId}</span>
                                    </div>

                                    <p className="text-sm text-gray-400 truncate mb-3">{nft.collection}</p>

                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <span className="text-sm text-gray-400">Precio</span>
                                            <p className="font-semibold text-white">{nft.price}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm text-gray-400">Likes</span>
                                            <p className="text-white">{nft.likes}</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex space-x-2">
                                        <Link
                                            href={`/nft/${nft.tokenId}`}
                                            className="flex-1 bg-gray-700/50 text-gray-300 py-2 rounded-lg text-sm hover:bg-gray-600/50 transition-colors text-center"
                                        >
                                            Ver Detalles
                                        </Link>
                                        <button className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 rounded-lg text-sm hover:from-purple-700 hover:to-indigo-700 transition-all">
                                            Comprar Ahora
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Load More */}
                {filteredNFTs.length > 0 && (
                    <div className="text-center mt-8">
                        <button className="bg-gray-800/50 text-white px-8 py-3 rounded-lg hover:bg-gray-700/50 transition-colors border border-gray-700/30">
                            Cargar Más NFTs
                        </button>
                    </div>
                )}

                {/* Call to Action */}
                {!isConnected && (
                    <div className="mt-12 text-center">
                        <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-xl p-8 border border-purple-500/30">
                            <h3 className="text-xl font-semibold text-white mb-2">
                                ¿Listo para comenzar a coleccionar?
                            </h3>
                            <p className="text-gray-400 mb-4">
                                Conecta tu wallet para comprar, vender y crear NFTs
                            </p>
                            <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all">
                                Conectar Wallet
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}