"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import {
    ChartBarIcon,
    UserGroupIcon,
    ShoppingCartIcon,
    ArrowTrendingUpIcon,
    FireIcon,
    ClockIcon,
    CurrencyDollarIcon
} from "@heroicons/react/24/outline";

// Mock data - En una app real esto vendría de tu blockchain/API
const mockStats = {
    totalVolume: "1,245.75",
    totalUsers: "15,842",
    totalSales: "8,456",
    activeListings: "3,287"
};

const mockRecentActivities = [
    { id: 1, user: "0x742d...f44e", action: "purchased", item: "Cosmic Vision #124", price: "1.5 ETH", time: "2 min ago" },
    { id: 2, user: "0x5B38...dC4", action: "listed", item: "Digital Nature #567", price: "2.25 ETH", time: "5 min ago" },
    { id: 3, user: "0xAb84...5cb2", action: "bid", item: "Future City #789", price: "3.1 ETH", time: "10 min ago" },
    { id: 4, user: "0x4B20...a1b3", action: "minted", item: "New Collection #001", price: "0.0 ETH", time: "15 min ago" }
];

const mockTopCollections = [
    { id: 1, name: "Cosmic Visions", volume: "450.25 ETH", items: "1.2K", owners: "845" },
    { id: 2, name: "Digital Nature", volume: "320.75 ETH", items: "980", owners: "612" },
    { id: 3, name: "Future Cities", volume: "285.50 ETH", items: "750", owners: "523" },
    { id: 4, name: "Portrait Masters", volume: "189.25 ETH", items: "420", owners: "387" }
];

const StatCard = ({ title, value, icon: Icon, change, changeType }) => (
    <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30 hover:border-purple-500/30 transition-all duration-300">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-white mt-1">{value}</p>
                {change && (
                    <p className={`text-sm mt-2 ${changeType === 'positive' ? 'text-green-400' : 'text-red-400'}`}>
                        {change}
                    </p>
                )}
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-r from-purple-600/20 to-indigo-600/20">
                <Icon className="h-6 w-6 text-purple-400" />
            </div>
        </div>
    </div>
);

const ActivityItem = ({ activity }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-700/30 last:border-b-0">
        <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-xs text-white">
                    {activity.action === 'purchased' ? '🛒' :
                        activity.action === 'listed' ? '📋' :
                            activity.action === 'bid' ? '💰' : '🆕'}
                </span>
            </div>
            <div>
                <p className="text-sm text-white">
                    <span className="text-purple-400">{activity.user}</span> {activity.action} {activity.item}
                </p>
                <p className="text-xs text-gray-400">{activity.time}</p>
            </div>
        </div>
        <div className="text-right">
            <p className="text-sm font-semibold text-white">{activity.price}</p>
        </div>
    </div>
);

const CollectionCard = ({ collection, rank }) => (
    <div className="flex items-center justify-between p-4 bg-gray-800/20 rounded-lg hover:bg-gray-800/40 transition-colors duration-200">
        <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                {rank}
            </div>
            <div>
                <h4 className="font-semibold text-white">{collection.name}</h4>
                <p className="text-sm text-gray-400">{collection.items} items</p>
            </div>
        </div>
        <div className="text-right">
            <p className="text-sm font-semibold text-white">{collection.volume}</p>
            <p className="text-xs text-gray-400">{collection.owners} owners</p>
        </div>
    </div>
);

export default function Dashboard() {
    const { address } = useAccount();
    const [activeTab, setActiveTab] = useState('overview');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simular carga de datos
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-12">
                <div className="container mx-auto px-4">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-800 rounded w-1/4 mb-8"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-32 bg-gray-800 rounded-xl"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                            Dashboard del Marketplace
                        </h1>
                        <p className="text-gray-400">
                            {address ? `Bienvenido, ${address.slice(0, 8)}...` : 'Conecta tu wallet para ver estadísticas personales'}
                        </p>
                    </div>

                    <div className="flex space-x-2 bg-gray-800/50 rounded-lg p-1 mt-4 lg:mt-0">
                        {[
                            { id: 'overview', label: 'Resumen' },
                            { id: 'analytics', label: 'Analíticas' },
                            { id: 'activity', label: 'Actividad' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                                        : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Volumen Total"
                        value={`${mockStats.totalVolume} ETH`}
                        icon={CurrencyDollarIcon}
                        change="+12.5%"
                        changeType="positive"
                    />
                    <StatCard
                        title="Usuarios Totales"
                        value={mockStats.totalUsers}
                        icon={UserGroupIcon}
                        change="+8.3%"
                        changeType="positive"
                    />
                    <StatCard
                        title="Ventas Totales"
                        value={mockStats.totalSales}
                        icon={ShoppingCartIcon}
                        change="+5.7%"
                        changeType="positive"
                    />
                    <StatCard
                        title="Listados Activos"
                        value={mockStats.activeListings}
                        icon={FireIcon}
                        change="+3.2%"
                        changeType="positive"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Activity */}
                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-white">Actividad Reciente</h2>
                            <ClockIcon className="h-5 w-5 text-purple-400" />
                        </div>
                        <div className="space-y-3">
                            {mockRecentActivities.map(activity => (
                                <ActivityItem key={activity.id} activity={activity} />
                            ))}
                        </div>
                    </div>

                    {/* Top Collections */}
                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-white">Colecciones Top</h2>
                            <ArrowTrendingUpIcon className="h-5 w-5 text-purple-400" />
                        </div>
                        <div className="space-y-3">
                            {mockTopCollections.map((collection, index) => (
                                <CollectionCard
                                    key={collection.id}
                                    collection={collection}
                                    rank={index + 1}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
                    <h2 className="text-xl font-semibold text-white mb-6">Acciones Rápidas</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button className="flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300">
                            <ShoppingCartIcon className="h-5 w-5" />
                            <span>Explorar Marketplace</span>
                        </button>
                        <button className="flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg text-white font-semibold hover:from-green-700 hover:to-teal-700 transition-all duration-300">
                            <span>🛍️</span>
                            <span>Mis NFTs</span>
                        </button>
                        <button className="flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg text-white font-semibold hover:from-orange-700 hover:to-red-700 transition-all duration-300">
                            <span>✨</span>
                            <span>Crear NFT</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}