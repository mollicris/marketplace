import { Feature } from '../app/types';

export default function Features() {
    const features: Feature[] = [
        {
            title: 'Creadores',
            description: 'Sube, mintea y gestiona tus NFTs con nuestro sistema intuitivo. Establece royalties y mantén el control de tu obra.',
            icon: 'paint-brush',
            color: 'from-purple-500 to-pink-500',
            buttonText: 'Empezar a Crear'
        },
        {
            title: 'Coleccionistas',
            description: 'Descubre obras únicas, compra NFTs directamente o participa en subastas exclusivas con garantía de autenticidad.',
            icon: 'gem',
            color: 'from-blue-500 to-cyan-500',
            buttonText: 'Explorar NFTs'
        },
        {
            title: 'Administradores',
            description: 'Gestiona usuarios, verifica contenido y mantén la integridad del marketplace con herramientas de moderación.',
            icon: 'shield-alt',
            color: 'from-green-500 to-teal-500',
            buttonText: 'Panel de Control'
        }
    ];

    return (
        <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                        Una Plataforma para <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">Todos</span>
                    </h2>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                        Diseñada para satisfacer las necesidades de creadores, coleccionistas y administradores por igual.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/30 hover:border-purple-500/30 transition-all duration-500 hover:-translate-y-2"
                        >
                            {/* Icono con gradiente */}
                            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white text-2xl mb-6 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                                <i className={`fas fa-${feature.icon}`}></i>
                            </div>

                            {/* Contenido */}
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-white mb-4">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-400 mb-6 leading-relaxed">
                                    {feature.description}
                                </p>
                                <button className={`px-6 py-3 bg-gradient-to-r ${feature.color} rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-${feature.color.split(' ')[1]}/20 transition-all duration-300`}>
                                    {feature.buttonText}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Separador decorativo */}
                <div className="flex justify-center mt-16">
                    <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"></div>
                </div>
            </div>
        </section>
    );
}