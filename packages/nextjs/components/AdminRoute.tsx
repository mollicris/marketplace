// components/AdminRoute.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserRole } from '../hooks/scaffold-eth/useUserRole';
import { useAccount } from 'wagmi';

interface AdminRouteProps {
    children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
    const router = useRouter();
    const { address, isConnected } = useAccount();
    const { role, } = useUserRole();

    useEffect(() => {
        console.log("AdminRoute - address:", address, "isConnected:", isConnected, "role:", role);
        if (isConnected && role !== 'admin') {
            router.push('/unauthorized');
        }
    }, [isConnected, router]);

    if (!isConnected) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Conecta tu wallet</h2>
                    <p className="text-gray-400">Necesitas conectarte para acceder al panel de administración</p>
                </div>
            </div>
        );
    }

    //   if (isLoading) {
    //     return (
    //       <div className="flex items-center justify-center min-h-screen">
    //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
    //       </div>
    //     );
    //   }

    if (role !== 'admin') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Acceso denegado</h2>
                    <p className="text-gray-400">No tienes permisos de administrador</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};