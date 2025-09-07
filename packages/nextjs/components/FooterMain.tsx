export default function Footer() {
    return (
        <>
            <footer className="bg-gray-900 text-gray-400 py-12 px-4">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* Brand Section */}
                        <div className="md:col-span-2">
                            <div className="flex items-center mb-4">
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                                    <i className="fas fa-palette text-white"></i>
                                </div>
                                <span className="text-xl font-bold text-white">IntiChain</span>
                            </div>
                            <p className="text-gray-400 mb-6 max-w-md">
                                La plataforma líder para artistas digitales y coleccionistas de NFTs.
                                Conectamos la creatividad con la tecnología blockchain.
                            </p>
                            <div className="flex space-x-4">
                                <a className="text-gray-400 hover:text-purple-400 transition-colors">
                                    <i className="fab fa-twitter text-lg"></i>
                                </a>
                                <a className="text-gray-400 hover:text-purple-400 transition-colors">
                                    <i className="fab fa-discord text-lg"></i>
                                </a>
                                <a className="text-gray-400 hover:text-purple-400 transition-colors">
                                    <i className="fab fa-instagram text-lg"></i>
                                </a>
                                <a className="text-gray-400 hover:text-purple-400 transition-colors">
                                    <i className="fab fa-telegram text-lg"></i>
                                </a>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="text-white font-semibold mb-4">Plataforma</h3>
                            <ul className="space-y-2">
                                <li><a className="hover:text-purple-400 transition-colors">Marketplace</a></li>
                                <li><a className="hover:text-purple-400 transition-colors">Crear NFT</a></li>
                                <li><a className="hover:text-purple-400 transition-colors">Colecciones</a></li>
                                <li><a className="hover:text-purple-400 transition-colors">Artistas</a></li>
                            </ul>
                        </div>

                        {/* Newsletter */}
                        <div>
                            <h3 className="text-white font-semibold mb-4">Mantente actualizado</h3>
                            <p className="text-sm mb-4">Recibe las últimas noticias y actualizaciones</p>
                            <div className="flex flex-col space-y-2">
                                <input
                                    type="email"
                                    placeholder="tu@email.com"
                                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                                />
                                <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg px-4 py-2 hover:from-purple-700 hover:to-indigo-700 transition-all">
                                    Suscribirse
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-sm text-gray-500 mb-4 md:mb-0">
                            © 2025 IntiChain. Todos los derechos reservados.
                        </p>
                        <div className="flex space-x-6 text-sm">
                            <a className="hover:text-purple-400 transition-colors">Términos</a>
                            <a className="hover:text-purple-400 transition-colors">Privacidad</a>
                            <a className="hover:text-purple-400 transition-colors">Cookies</a>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}