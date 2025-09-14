"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hardhat } from "viem/chains";
import { Bars3Icon, BugAntIcon, UserIcon, ShieldCheckIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useUserRole } from "../hooks/scaffold-eth/useUserRole";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
  roles?: ('guest' | 'user' | 'admin' | 'moderator')[];
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
    icon: <UserIcon className="h-4 w-4" />,
    roles: ['guest', 'user', 'moderator']
  },
  {
    label: "Marketplace",
    href: "/marketplace",
    roles: ['guest', 'user', 'moderator']
  },
  {
    label: "Mis NFTs",
    href: "/marketplace/my-nfts",
    roles: ['user', 'moderator'] // Solo usuarios conectados
  },
  {
    label: "Crear NFT",
    href: "/create-nft",
    roles: ['user', 'moderator']
  },
];

export const adminLinks: HeaderMenuLink[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: <ChartBarIcon className="h-4 w-4" />,
    roles: ['admin', 'moderator']
  },
  {
    label: "Configuración",
    href: "/admin/settings",
    icon: <ShieldCheckIcon className="h-4 w-4" />,
    roles: ['admin'] // Solo admin completo
  },
  {
    label: "Debug Contracts",
    href: "/debug",
    icon: <BugAntIcon className="h-4 w-4" />,
    roles: ['admin']
  }
];

export const HeaderMenuLinks = ({ userRole }: { userRole: string }) => {
  const pathname = usePathname();

  const allLinks = [...menuLinks, ...adminLinks];
  const filteredLinks = allLinks.filter(link =>
    !link.roles || link.roles.includes(userRole as any)
  );

  return (
    <>
      {filteredLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        const isAdminLink = adminLinks.some(adminLink => adminLink.href === href);

        return (
          <Link
            key={href}
            href={href}
            passHref
            className={`${isActive ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg" :
              isAdminLink ? "text-orange-300 hover:bg-orange-900/30 hover:text-orange-100" :
                "text-gray-300 hover:text-white hover:bg-gray-700/50"
              } px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2`}
          >
            {icon}
            <span>{label}</span>
          </Link>
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  const { role, isAdmin, isModerator } = useUserRole();

  // Efecto para detectar scroll
  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useOutsideClick(burgerMenuRef, () => setIsMenuOpen(false));

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-gray-900/95 backdrop-blur-md shadow-xl' : 'bg-gradient-to-b from-gray-900 to-transparent'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" passHref className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
                <div className="flex relative w-8 h-8">
                  <Image alt="SE2 logo" className="cursor-pointer" fill src="/logointi.svg" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white">IntiChain-NFT</span>
                <span className="text-xs text-gray-400">MarketPlace</span>
              </div>
            </Link>
          </div>

          {/* Navegación Desktop */}
          <nav className="hidden lg:flex items-center h-full">
            <div className="flex space-x-2 bg-gray-800/50 backdrop-blur-sm rounded-lg p-1 border border-gray-700/30">
              <HeaderMenuLinks userRole={role} />
            </div>
          </nav>

          {/* Botones de acción */}
          <div className="flex items-center space-x-3">
            <RainbowKitCustomConnectButton />
            {isLocalNetwork && <FaucetButton />}

            {/* Indicador de rol */}
            {role !== 'guest' && (
              <div className="hidden md:flex items-center px-3 py-1 rounded-full bg-gray-800/50 text-xs text-gray-300">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                {role.toUpperCase()}
              </div>
            )}

            {/* Botón menú móvil */}
            <button
              className="lg:hidden btn btn-ghost btn-circle"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {isMenuOpen && (
          <div className="lg:hidden bg-gray-800/95 backdrop-blur-md rounded-lg mt-2 p-4 border border-gray-700">
            {/* Información del usuario */}
            <div className="mb-4 p-3 bg-gray-700/30 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Rol: </span>
                <span className="text-purple-400 font-medium capitalize">{role}</span>
              </div>
              {isAdmin && (
                <div className="mt-1 text-xs text-orange-400">
                  <ShieldCheckIcon className="h-3 w-3 inline mr-1" />
                  Privilegios de Administrador
                </div>
              )}
            </div>

            {/* Menú principal */}
            <div className="mb-4">
              <div className="text-xs text-gray-500 uppercase font-semibold mb-2">Navegación Principal</div>
              <ul className="space-y-2">
                {menuLinks
                  .filter(link => !link.roles || link.roles.includes(role as any))
                  .map(({ label, href, icon }) => {
                    const isActive = usePathname() === href;
                    return (
                      <li key={href}>
                        <Link
                          href={href}
                          passHref
                          onClick={() => setIsMenuOpen(false)}
                          className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                            : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                            }`}
                        >
                          {icon}
                          <span className="ml-3">{label}</span>
                        </Link>
                      </li>
                    );
                  })}
              </ul>
            </div>

            {/* Menú administrativo (si aplica) */}
            {(isAdmin || isModerator) && (
              <div>
                <div className="text-xs text-orange-500 uppercase font-semibold mb-2">
                  Herramientas de {isAdmin ? 'Administración' : 'Moderación'}
                </div>
                <ul className="space-y-2">
                  {adminLinks
                    .filter(link => !link.roles || link.roles.includes(role as any))
                    .map(({ label, href, icon }) => {
                      const isActive = usePathname() === href;
                      return (
                        <li key={href}>
                          <Link
                            href={href}
                            passHref
                            onClick={() => setIsMenuOpen(false)}
                            className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                              ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white'
                              : 'text-orange-300 hover:bg-orange-900/30 hover:text-orange-100'
                              }`}
                          >
                            {icon}
                            <span className="ml-3">{label}</span>
                          </Link>
                        </li>
                      );
                    })}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Indicador de separación */}
      <div className="hidden lg:block container mx-auto px-4">
        <div className="border-b border-gray-700/30 mt-2"></div>
      </div>
    </header>
  );
};