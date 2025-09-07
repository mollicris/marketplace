import { useState, useRef, useEffect } from 'react';
import { Step } from '../app/types';

export default function HowItWorks() {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);

    const steps: Step[] = [
        {
            number: 1,
            title: 'Conecta tu Wallet',
            description: 'Conecta tu wallet de preferencia como MetaMask, WalletConnect o Coinbase Wallet.',
            icon: 'wallet'
        },
        {
            number: 2,
            title: 'Crea tu Colección',
            description: 'Configura tu colección, añade logos sociales y personaliza tu perfil de artista.',
            icon: 'layer-group'
        },
        {
            number: 3,
            title: 'Añade tus NFTs',
            description: 'Sube tu obra, añade descripción y propiedades, establece royalties y fija el precio.',
            icon: 'plus-square'
        },
        {
            number: 4,
            title: 'Lista para Vender',
            description: 'Lista tus NFTs para venta fija o en subasta y comienza a generar ingresos con tu arte.',
            icon: 'tags'
        }
    ];

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.2 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="py-16 bg-gradient-to-b from-gray-900 to-black"
        >
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Cómo <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">Funciona</span>
                    </h2>
                    <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                        Cuatro simples pasos para crear, comprar y vender NFTs en nuestra plataforma
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className={`bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30 transition-all duration-500 transform hover:-translate-y-2 ${isVisible ? 'opacity-100' : 'opacity-0 translate-y-10'
                                }`}
                            style={{ transitionDelay: `${index * 100}ms` }}
                        >
                            <div className="w-14 h-14 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg mb-4">
                                {step.number}
                            </div>
                            <div className="flex items-center mb-3">
                                <i className={`fas fa-${step.icon} text-purple-400 mr-2`}></i>
                                <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                            </div>
                            <p className="text-gray-400">{step.description}</p>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg font-semibold text-white hover:from-purple-700 hover:to-indigo-700 transition-all duration-300">
                        Comenzar Ahora
                    </button>
                </div>
            </div>
        </section>
    );
}