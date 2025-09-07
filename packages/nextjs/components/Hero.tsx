import { useEffect, useState, useRef } from 'react';
import { Stat } from '../app/types';

export default function Hero() {
    const [stats, setStats] = useState<Stat[]>([
        { value: 0, title: 'Usuarios Activos', desc: 'Jan 1st - Feb 1st', icon: 'users' },
        { value: 0, title: 'NFTs Creados', desc: '↗︎ 400 (22%)', icon: 'paint-brush' },
        { value: 0, title: 'Volumen Transado', desc: '↗︎ 1.240 (14%)', icon: 'chart-line' }
    ]);

    const [isVisible, setIsVisible] = useState(false);
    const heroRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.3 }
        );

        if (heroRef.current) {
            observer.observe(heroRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        const intervals = stats.map((stat, index) => {
            const targetValue = stat.title === 'Volumen Transado' ? 5200 :
                stat.title === 'NFTs Creados' ? 42000 : 25000;
            const increment = stat.title === 'Volumen Transado' ? 100 :
                stat.title === 'NFTs Creados' ? 500 : 50;

            return setInterval(() => {
                setStats(prev => {
                    const newStats = [...prev];
                    if (newStats[index].value < targetValue) {
                        newStats[index].value += increment;
                        // Asegurarse de no exceder el valor objetivo
                        if (newStats[index].value > targetValue) {
                            newStats[index].value = targetValue;
                        }
                        return newStats;
                    }
                    return prev;
                });
            }, 20);
        });

        return () => intervals.forEach(interval => clearInterval(interval));
    }, [isVisible]);

    return (
        <section
            ref={heroRef}
            className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black overflow-hidden"
        >
            {/* Elementos de fondo decorativos */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-soft-light filter blur-xl animate-pulse-slow"></div>
                <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-soft-light filter blur-xl animate-pulse-slow animation-delay-2000"></div>
            </div>

            <div className="relative z-10 container mx-auto px-4 py-16">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                    {/* Contenido de texto */}
                    <div className="flex-1 text-center lg:text-left">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200 leading-tight mb-6">
                            Descubre, Colecciona y Vende NFTs <span className="text-purple-400">Extraordinarios</span>
                        </h1>
                        <p className="text-xl text-gray-300 mb-8 max-w-2xl">
                            IntiChain es el marketplace premium para artistas digitales y coleccionistas.
                            Únete a nuestra comunidad y explora un mundo de arte digital único.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-12">
                            <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl">
                                Explorar Colecciones
                            </button>
                            <button className="px-8 py-4 border-2 border-purple-500 text-purple-300 rounded-lg font-semibold text-lg hover:bg-purple-900/30 transition-all duration-300">
                                Crear NFT
                            </button>
                        </div>

                        {/* Estadísticas */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {stats.map((stat, index) => (
                                <div
                                    key={index}
                                    className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30 hover:border-purple-500/30 transition-all duration-500"
                                >
                                    <div className="flex items-center mb-4">
                                        <div className="p-3 rounded-lg bg-purple-900/30 mr-4">
                                            <i className={`fas fa-${stat.icon} text-purple-400 text-xl`}></i>
                                        </div>
                                        <div>
                                            <div className="stat-title text-gray-400 text-sm">{stat.title}</div>
                                            <div className="stat-value text-2xl font-bold text-white">
                                                {stat.title === 'Volumen Transado' ? `$${stat.value.toLocaleString()}` : stat.value.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-400">{stat.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Imagen */}
                    <div className="flex-1">
                        <div className="relative">
                            <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                            <img
                                src="https://placehold.co/600x400/4f46e5/white?text=NFT+Marketplace"
                                alt="NFT Marketplace"
                                className="relative rounded-xl shadow-2xl transform hover:scale-105 transition-transform duration-700"
                            />
                            {/* Elemento decorativo flotante */}
                            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-xl rotate-12"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}