"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hardhat } from "viem/chains";
import { Bars3Icon, BugAntIcon } from "@heroicons/react/24/outline";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick, useTargetNetwork } from "~~/hooks/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Debug Contracts",
    href: "/debug",
    icon: <BugAntIcon className="h-4 w-4" />,
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (

          <Link
            key={href}
            href={href}
            passHref
            className={`${isActive ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg" : "text-gray-300 hover:text-white hover:bg-gray-700/50"
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

  // Efecto para detectar scroll y cambiar el estilo del header
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useOutsideClick(burgerMenuRef, () => {
    setIsMenuOpen(false);
  });

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
              <HeaderMenuLinks />
            </div>
          </nav>

          {/* Botones de acción */}
          <div className="flex items-center space-x-3">
            <RainbowKitCustomConnectButton />
            {isLocalNetwork && <FaucetButton />}

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
            <ul className="space-y-2">
              {menuLinks.map(({ label, href, icon }) => {
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
        )}
      </div>

      {/* Indicador de separación */}
      <div className="hidden lg:block container mx-auto px-4">
        <div className="border-b border-gray-700/30 mt-2"></div>
      </div>
    </header>
  );
};