// components/RoleManager.tsx
"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import {
    UserIcon,
    ShieldCheckIcon,
    UserPlusIcon,
    TrashIcon,
    CheckBadgeIcon,
    XMarkIcon
} from "@heroicons/react/24/outline";
// import { useScaffoldContractWrite, useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { useUserRole } from "~~/hooks/scaffold-eth/useUserRole";

type Role = "user" | "moderator" | "admin";

interface RoleAssignment {
    address: string;
    role: Role;
}
const useScaffoldContractRead = () => {
    // Simula tres admins
    return {
        data: [
            "0xa0ee7a142d267c1f36714e4a8f75612f20a79720",
            "0xf5178baaadf7ecc3a82dfbdf95629fae6dcaa060",
            "0xab8483f64d9c6d1ecf9b849ae677dd3315835cb2"
        ]
    };
};

// Simulación de escritura en el contrato
const useScaffoldContractWrite = ({ functionName, args, onBlockConfirmation }: any) => {
    return {
        writeAsync: async () => {
            // Simula una espera y luego llama a la confirmación
            await new Promise(res => setTimeout(res, 500));
            onBlockConfirmation?.({ hash: "0x123" });
        }
    };
};


export const RoleManager = () => {
    const { address } = useAccount();
    const { role } = useUserRole();
    const [newAddress, setNewAddress] = useState("");
    const [selectedRole, setSelectedRole] = useState<Role>("user");
    const [assignments, setAssignments] = useState<RoleAssignment[]>([]);
    const [isAdding, setIsAdding] = useState(false);

    // Leer roles existentes del contrato (ejemplo)
    // const { data: existingAdmins } = useScaffoldContractRead({
    //     contractName: "YourAdminContract",
    //     functionName: "getAdmins",
    // });

    // Contrato write para agregar admin
    // const { writeAsync: addAdmin } = useScaffoldContractWrite({
    //     contractName: "YourAdminContract",
    //     functionName: "addAdmin",
    //     args: [newAddress as `0x${string}`],
    //     onBlockConfirmation: (txnReceipt) => {
    //         console.log("Admin added", txnReceipt);
    //         setAssignments(prev => [...prev, { address: newAddress, role: "admin" }]);
    //         setNewAddress("");
    //         setIsAdding(false);
    //     },
    // });

    // Contrato write para remover admin
    // const { writeAsync: removeAdmin } = useScaffoldContractWrite({
    //     contractName: "YourAdminContract",
    //     functionName: "removeAdmin",
    //     args: [newAddress as `0x${string}`],
    //     onBlockConfirmation: (txnReceipt) => {
    //         console.log("Admin removed", txnReceipt);
    //         setAssignments(prev => prev.filter(a => a.address !== newAddress));
    //         setNewAddress("");
    //     },
    // });

    // Cargar asignaciones existentes
    // useEffect(() => {
    //     if (existingAdmins) {
    //         const adminAssignments: RoleAssignment[] = existingAdmins.map((addr: string) => ({
    //             address: addr,
    //             role: "admin"
    //         }));
    //         setAssignments(adminAssignments);
    //     }
    // }, [existingAdmins]);

    // Leer roles existentes del contrato (simulado)
    const { data: existingAdmins } = useScaffoldContractRead();

    // Simulación de addAdmin y removeAdmin
    const addAdmin = async () => {
        setIsAdding(true);
        await new Promise(res => setTimeout(res, 500));
        setAssignments(prev => [...prev, { address: newAddress, role: "admin" }]);
        setNewAddress("");
        setIsAdding(false);
    };

    const removeAdmin = async () => {
        await new Promise(res => setTimeout(res, 500));
        setAssignments(prev => prev.filter(a => a.address !== newAddress));
        setNewAddress("");
    };

    useEffect(() => {
        if (existingAdmins && assignments.length === 0) {
            const adminAssignments: RoleAssignment[] = existingAdmins.map((addr: string) => ({
                address: addr,
                role: "admin"
            }));
            setAssignments(adminAssignments);
        }
    }, [existingAdmins, assignments.length]);

    const handleAddRole = async () => {
        if (!newAddress || !selectedRole) return;

        try {
            if (selectedRole === "admin") {
                await addAdmin();
            }
            // Aquí agregarías más casos para otros roles
        } catch (error) {
            console.error("Error assigning role:", error);
        }
    };

    const handleRemoveRole = async (targetAddress: string, role: Role) => {
        if (role === "admin") {
            setNewAddress(targetAddress);
            await removeAdmin();
        }
        // Aquí agregarías más casos para otros roles
    };

    const getRoleBadge = (role: Role) => {
        const styles = {
            admin: "bg-red-500/20 text-red-400 border-red-500/30",
            moderator: "bg-blue-500/20 text-blue-400 border-blue-500/30",
            user: "bg-green-500/20 text-green-400 border-green-500/30"
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[role]}`}>
                {role.toUpperCase()}
            </span>
        );
    };

    if (role !== "admin") {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="text-center">
                    <ShieldCheckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Acceso restringido</h3>
                    <p className="text-gray-400">Solo los administradores pueden gestionar roles</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Gestión de Roles</h2>
                <ShieldCheckIcon className="h-8 w-8 text-purple-400" />
            </div>

            {/* Formulario para agregar roles */}
            <div className="bg-gray-700/20 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <UserPlusIcon className="h-5 w-5 mr-2" />
                    Asignar Nuevo Rol
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Dirección Wallet
                        </label>
                        <input
                            type="text"
                            value={newAddress}
                            onChange={(e) => setNewAddress(e.target.value)}
                            placeholder="0x..."
                            className="w-full bg-gray-600/30 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Rol
                        </label>
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value as Role)}
                            className="w-full bg-gray-600/30 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                        >
                            <option value="user">Usuario</option>
                            <option value="moderator">Moderador</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={handleAddRole}
                            disabled={!newAddress}
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Asignar Rol
                        </button>
                    </div>
                </div>
            </div>

            {/* Lista de roles asignados */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <CheckBadgeIcon className="h-5 w-5 mr-2" />
                    Roles Asignados
                </h3>

                {assignments.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <UserIcon className="h-12 w-12 mx-auto mb-4" />
                        <p>No hay roles asignados</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {assignments.map((assignment, index) => (
                            <div
                                key={`${assignment.address}-${index}`}
                                className="flex items-center justify-between p-4 bg-gray-700/20 rounded-lg border border-gray-600/30"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                                        <UserIcon className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-mono text-white">
                                            {assignment.address.slice(0, 8)}...{assignment.address.slice(-6)}
                                        </p>
                                        <p className="text-xs text-gray-400">Desde: 12/12/2023</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    {getRoleBadge(assignment.role)}

                                    {assignment.address !== address && (
                                        <button
                                            onClick={() => handleRemoveRole(assignment.address, assignment.role)}
                                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                            title="Remover rol"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    )}

                                    {assignment.address === address && (
                                        <span className="text-xs text-gray-400">(Tú)</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-700/30">
                <div className="text-center p-4 bg-gray-700/20 rounded-lg">
                    <div className="text-2xl font-bold text-white">
                        {assignments.filter(a => a.role === 'admin').length}
                    </div>
                    <div className="text-sm text-gray-400">Administradores</div>
                </div>
                <div className="text-center p-4 bg-gray-700/20 rounded-lg">
                    <div className="text-2xl font-bold text-white">
                        {assignments.filter(a => a.role === 'moderator').length}
                    </div>
                    <div className="text-sm text-gray-400">Moderadores</div>
                </div>
                <div className="text-center p-4 bg-gray-700/20 rounded-lg">
                    <div className="text-2xl font-bold text-white">
                        {assignments.filter(a => a.role === 'user').length}
                    </div>
                    <div className="text-sm text-gray-400">Usuarios con roles</div>
                </div>
            </div>

            {/* Información importante */}
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-start space-x-3">
                    <ShieldCheckIcon className="h-5 w-5 text-blue-400 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-blue-400 mb-2">Información importante</h4>
                        <ul className="text-sm text-blue-300 space-y-1">
                            <li>• Los administradores tienen acceso completo al sistema</li>
                            <li>• Los moderadores pueden gestionar contenido pero no configuraciones</li>
                            <li>• No puedes remover tus propios permisos de administrador</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoleManager;