"use client";

import { useMemo, useState } from "react";
import { isAddress } from "viem";
import { useAccount } from "wagmi";
import { CheckBadgeIcon, ShieldCheckIcon, TrashIcon, UserIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { useScaffoldEventHistory, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { ADMIN_ROLE, GUEST_ROLE, USER_ROLE, useUserRole } from "~~/hooks/scaffold-eth/useUserRole";
import { notification } from "~~/utils/scaffold-eth";

type Role = "admin" | "user" | "guest";

interface RoleAssignment {
  address: `0x${string}`;
  role: Role;
}

const HASH_TO_ROLE: Record<string, Role> = {
  [ADMIN_ROLE.toLowerCase()]: "admin",
  [USER_ROLE.toLowerCase()]: "user",
  [GUEST_ROLE.toLowerCase()]: "guest",
};

const roleLabel: Record<Role, string> = {
  admin: "Administrador",
  user: "Usuario",
  guest: "Invitado",
};

const roleBadgeStyles: Record<Role, string> = {
  admin: "bg-red-500/20 text-red-400 border-red-500/30",
  user: "bg-green-500/20 text-green-400 border-green-500/30",
  guest: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

export const RoleManager = () => {
  const { address } = useAccount();
  const { role } = useUserRole();
  const [newAddress, setNewAddress] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role>("user");
  const [pending, setPending] = useState(false);

  const { writeContractAsync: writeMarketplace } = useScaffoldWriteContract({
    contractName: "Marketplace",
  });

  const { data: grantedEvents, isLoading: loadingGranted } = useScaffoldEventHistory({
    contractName: "Marketplace",
    eventName: "RoleGranted",
    watch: true,
  });

  const { data: revokedEvents, isLoading: loadingRevoked } = useScaffoldEventHistory({
    contractName: "Marketplace",
    eventName: "RoleRevoked",
    watch: true,
  });

  const assignments = useMemo<RoleAssignment[]>(() => {
    const counts = new Map<string, number>();

    const bump = (roleHash: string, account: string, delta: number) => {
      const key = `${roleHash.toLowerCase()}|${account.toLowerCase()}`;
      counts.set(key, (counts.get(key) ?? 0) + delta);
    };

    grantedEvents?.forEach(ev => {
      const roleHash = ev.args?.role as string | undefined;
      const account = ev.args?.account as string | undefined;
      if (roleHash && account) bump(roleHash, account, 1);
    });
    revokedEvents?.forEach(ev => {
      const roleHash = ev.args?.role as string | undefined;
      const account = ev.args?.account as string | undefined;
      if (roleHash && account) bump(roleHash, account, -1);
    });

    const result: RoleAssignment[] = [];
    counts.forEach((net, key) => {
      if (net <= 0) return;
      const [roleHash, account] = key.split("|");
      const mapped = HASH_TO_ROLE[roleHash];
      if (!mapped) return;
      result.push({ role: mapped, address: account as `0x${string}` });
    });

    const order: Role[] = ["admin", "user", "guest"];
    return result.sort((a, b) => order.indexOf(a.role) - order.indexOf(b.role) || a.address.localeCompare(b.address));
  }, [grantedEvents, revokedEvents]);

  const isLoadingAssignments = loadingGranted || loadingRevoked;

  const handleAddRole = async () => {
    if (!isAddress(newAddress)) {
      notification.error("Dirección inválida");
      return;
    }
    const target = newAddress as `0x${string}`;
    setPending(true);
    try {
      if (selectedRole === "user") {
        await writeMarketplace({ functionName: "grantUserRole", args: [target] });
      } else if (selectedRole === "guest") {
        await writeMarketplace({ functionName: "grantGuestRole", args: [target] });
      } else {
        await writeMarketplace({
          functionName: "grantRole",
          args: [ADMIN_ROLE, target],
        });
      }
      notification.success(`Rol ${roleLabel[selectedRole]} asignado`);
      setNewAddress("");
    } catch (err) {
      console.error(err);
      notification.error(err instanceof Error ? err.message : "Error al asignar rol");
    } finally {
      setPending(false);
    }
  };

  const handleRemoveRole = async (target: `0x${string}`, targetRole: Role) => {
    setPending(true);
    try {
      if (targetRole === "user") {
        await writeMarketplace({ functionName: "revokeUserRole", args: [target] });
      } else if (targetRole === "guest") {
        await writeMarketplace({ functionName: "revokeGuestRole", args: [target] });
      } else {
        await writeMarketplace({
          functionName: "revokeRole",
          args: [ADMIN_ROLE, target],
        });
      }
      notification.success(`Rol ${roleLabel[targetRole]} removido`);
    } catch (err) {
      console.error(err);
      notification.error(err instanceof Error ? err.message : "Error al remover rol");
    } finally {
      setPending(false);
    }
  };

  const counts = {
    admin: assignments.filter(a => a.role === "admin").length,
    user: assignments.filter(a => a.role === "user").length,
    guest: assignments.filter(a => a.role === "guest").length,
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

      <div className="bg-gray-700/20 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <UserPlusIcon className="h-5 w-5 mr-2" />
          Asignar Nuevo Rol
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Dirección Wallet</label>
            <input
              type="text"
              value={newAddress}
              onChange={e => setNewAddress(e.target.value)}
              placeholder="0x..."
              className="w-full bg-gray-600/30 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Rol</label>
            <select
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value as Role)}
              className="w-full bg-gray-600/30 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="guest">Invitado</option>
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleAddRole}
              disabled={!newAddress || pending}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pending ? "Enviando…" : "Asignar Rol"}
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <CheckBadgeIcon className="h-5 w-5 mr-2" />
          Roles Asignados
        </h3>

        {isLoadingAssignments ? (
          <div className="text-center py-8 text-gray-400">Cargando eventos…</div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <UserIcon className="h-12 w-12 mx-auto mb-4" />
            <p>No hay roles asignados</p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.map(a => (
              <div
                key={`${a.role}-${a.address}`}
                className="flex items-center justify-between p-4 bg-gray-700/20 rounded-lg border border-gray-600/30"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-mono text-white">
                      {a.address.slice(0, 8)}…{a.address.slice(-6)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${roleBadgeStyles[a.role]}`}>
                    {roleLabel[a.role].toUpperCase()}
                  </span>

                  {a.address.toLowerCase() !== address?.toLowerCase() ? (
                    <button
                      onClick={() => handleRemoveRole(a.address, a.role)}
                      disabled={pending}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50"
                      title="Remover rol"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">(Tú)</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-700/30">
        <div className="text-center p-4 bg-gray-700/20 rounded-lg">
          <div className="text-2xl font-bold text-white">{counts.admin}</div>
          <div className="text-sm text-gray-400">Administradores</div>
        </div>
        <div className="text-center p-4 bg-gray-700/20 rounded-lg">
          <div className="text-2xl font-bold text-white">{counts.user}</div>
          <div className="text-sm text-gray-400">Usuarios</div>
        </div>
        <div className="text-center p-4 bg-gray-700/20 rounded-lg">
          <div className="text-2xl font-bold text-white">{counts.guest}</div>
          <div className="text-sm text-gray-400">Invitados</div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <div className="flex items-start space-x-3">
          <ShieldCheckIcon className="h-5 w-5 text-blue-400 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-400 mb-2">Información importante</h4>
            <ul className="text-sm text-blue-300 space-y-1">
              <li>• Admin ⊇ User ⊇ Guest. Un admin puede operar como user y guest.</li>
              <li>• Guest es el mínimo para comprar NFTs en el marketplace.</li>
              <li>• Los cambios se indexan desde eventos on-chain; pueden tardar un bloque en reflejarse.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleManager;
