import { useState } from 'react';
import { NFT } from '../app/types';

export default function FeaturedNFTs() {
    const [nfts, setNfts] = useState<NFT[]>([
        {
            id: 1,
            title: 'Visión Cósmica',
            artist: '@artist_digital',
            price: '1.5 ETH',
            image: 'https://placehold.co/300x300/4f46e5/white?text=Abstract+Art',
            badge: 'NUEVO',
            badgeColor: 'bg-blue-500',
            action: 'Comprar ahora',
            likes: 42
        },
        {
            id: 2,
            title: 'Naturaleza Digital',
            artist: '@eco_artist',
            price: '2.25 ETH',
            image: 'https://placehold.co/300x300/10b981/white?text=Digital+Art',
            badge: 'POPULAR',
            badgeColor: 'bg-purple-600',
            action: 'Pujar',
            likes: 89
        },
        {
            id: 3,
            title: 'Ciudad Futurista',
            artist: '@future_creator',
            price: '3.75 ETH',
            image: 'https://placehold.co/300x300/6366f1/white?text=Cyber+Art',
            badge: 'RARO',
            badgeColor: 'bg-pink-500',
            action: 'Comprar ahora',
            likes: 156
        },
        {
            id: 4,
            title: 'Retrato Digital',
            artist: '@portrait_master',
            price: '5.0 ETH',
            image: 'https://placehold.co/300x300/8b5cf6/white?text=Portrait',
            badge: '1/1',
            badgeColor: 'bg-orange-500',
            action: 'Pujar',
            likes: 203
        }
    ]);

    const [activeFilter, setActiveFilter] = useState('all');

    const filters = [
        { id: 'all', label: 'Todos' },
        { id: 'new', label: 'Nuevos' },
        { id: 'popular', label: 'Populares' },
        { id: 'auction', label: 'Subasta' }
    ];

    return (
        <section className="py-20 bg-gray-900">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                        Colección <span className="text-purple-400">Destacada</span>
                    </h2>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
                        Descubre obras exclusivas de artistas emergentes y consagrados
                    </p>

                    {/* Filtros */}
                    <div className="flex flex-wrap justify-center gap-4 mb-12">
                        {filters.map(filter => (
                            <button
                                key={filter.id}
                                onClick={() => setActiveFilter(filter.id)}
                                className={`px-6 py-2 rounded-full transition-all duration-300 ${activeFilter === filter.id
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                    }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {nfts.map(nft => (
                        <div key={nft.id} className="group bg-gray-800 rounded-xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10">
                            {/* Imagen del NFT */}
                            <div className="relative overflow-hidden">
                                <img
                                    src={nft.image}
                                    alt={nft.title}
                                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute top-3 left-3">
                                    <span className={`px-2 py-1 rounded text-xs font-medium text-white ${nft.badgeColor}`}>
                                        {nft.badge}
                                    </span>
                                </div>
                                <div className="absolute top-3 right-3">
                                    <button className="bg-black/50 rounded-full p-2 backdrop-blur-sm hover:text-red-500 transition-colors">
                                        <i className="fas fa-heart text-sm"></i>
                                        <span className="ml-1 text-xs">{nft.likes}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Contenido */}
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="text-lg font-semibold text-white truncate">
                                        {nft.title}
                                    </h3>
                                </div>

                                <div className="flex items-center mb-4">
                                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-2"></div>
                                    <span className="text-purple-400 text-sm">{nft.artist}</span>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">Precio</p>
                                        <p className="text-lg font-bold text-white">{nft.price}</p>
                                    </div>
                                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors">
                                        {nft.action}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <button className="inline-flex items-center px-8 py-3 bg-transparent border-2 border-purple-600 text-purple-400 rounded-lg font-semibold hover:bg-purple-600 hover:text-white transition-all duration-300 group">
                        Explorar colección completa
                        <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                    </button>
                </div>

                {/* Stats section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 pt-10 border-t border-gray-800">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-purple-400 mb-2">15K+</div>
                        <div className="text-gray-400">NFTs creados</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-purple-400 mb-2">2.5K+</div>
                        <div className="text-gray-400">Artistas activos</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-purple-400 mb-2">8.2K+</div>
                        <div className="text-gray-400">Coleccionistas</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-purple-400 mb-2">12.4K</div>
                        <div className="text-gray-400">Transacciones</div>
                    </div>
                </div>
            </div>
        </section>
    );
}