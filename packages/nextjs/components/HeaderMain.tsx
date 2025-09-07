import { useState, useEffect } from 'react';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('marketplace');
    const [isScrolled, setIsScrolled] = useState(false);

    // Efecto para detectar scroll y cambiar el estilo del header
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { id: 'marketplace', label: 'Marketplace', icon: 'store' },
        { id: 'create', label: 'Crear NFT', icon: 'plus-circle' },
        { id: 'collections', label: 'Colecciones', icon: 'layer-group' },
        { id: 'artists', label: 'Artistas', icon: 'paint-brush' },
        { id: 'about', label: 'Acerca de', icon: 'info-circle' }
    ];

    return (
        <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-gray-900/95 backdrop-blur-md shadow-xl' : 'bg-gradient-to-b from-gray-900 to-transparent'}`}>
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <a className="flex items-center space-x-2 text-xl font-bold">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
                                <i className="fas fa-palette text-white"></i>
                            </div>
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">IntiChain</span>
                        </a>
                    </div>

                    {/* Navegación Desktop - Tipo Tabs */}
                    <nav className="hidden lg:flex items-center h-full">
                        <div className="flex space-x-1 bg-gray-800/50 backdrop-blur-sm rounded-lg p-1 border border-gray-700/30">
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === item.id
                                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                                        : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                                        }`}
                                >
                                    <i className={`fas fa-${item.icon} mr-2`}></i>
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </nav>

                    {/* Botones de acción */}
                    <div className="flex items-center space-x-3">
                        <button className="hidden md:flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg font-semibold text-white hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25">
                            <i className="fas fa-wallet mr-2"></i> Conectar Wallet
                        </button>

                        {/* Avatar de usuario */}
                        <div className="dropdown dropdown-end">
                            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white">
                                    <i className="fas fa-user"></i>
                                </div>
                            </label>
                            <ul tabIndex={0} className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-gray-800 rounded-box w-52 border border-gray-700">
                                <li>
                                    <a className="text-gray-300 hover:bg-gray-700 hover:text-white">
                                        <i className="fas fa-user-circle mr-2"></i> Mi Perfil
                                    </a>
                                </li>
                                <li>
                                    <a className="text-gray-300 hover:bg-gray-700 hover:text-white">
                                        <i className="fas fa-images mr-2"></i> Mis NFTs
                                    </a>
                                </li>
                                <li>
                                    <a className="text-gray-300 hover:bg-gray-700 hover:text-white">
                                        <i className="fas fa-cog mr-2"></i> Configuración
                                    </a>
                                </li>
                                <li>
                                    <a className="text-gray-300 hover:bg-gray-700 hover:text-white">
                                        <i className="fas fa-sign-out-alt mr-2"></i> Cerrar Sesión
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Botón menú móvil */}
                        <button
                            className="lg:hidden btn btn-ghost btn-circle"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Menú móvil */}
                {isMenuOpen && (
                    <div className="lg:hidden bg-gray-800/95 backdrop-blur-md rounded-lg mt-2 p-4 border border-gray-700">
                        <div className="flex flex-col space-y-2">
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveTab(item.id);
                                        setIsMenuOpen(false);
                                    }}
                                    className={`flex items-center px-4 py-3 rounded-lg text-left transition-all duration-200 ${activeTab === item.id
                                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                                        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                                        }`}
                                >
                                    <i className={`fas fa-${item.icon} mr-3`}></i>
                                    {item.label}
                                </button>
                            ))}

                            <button className="flex items-center px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg font-semibold text-white mt-4">
                                <i className="fas fa-wallet mr-3"></i> Conectar Wallet
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Indicador de pestaña activa para desktop */}
            <div className="hidden lg:block container mx-auto px-4">
                <div className="border-b border-gray-700/30 mt-2"></div>
            </div>
        </header>
    );
}