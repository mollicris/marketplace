import { keccak256, toBytes } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";

export const ADMIN_ROLE = keccak256(toBytes("ADMIN_ROLE"));
export const USER_ROLE = keccak256(toBytes("USER_ROLE"));
export const GUEST_ROLE = keccak256(toBytes("GUEST_ROLE"));

export type UserRole = "admin" | "user" | "guest" | "none";

export const useUserRole = () => {
  const { address } = useAccount();

  const { data: isAdmin, isLoading: loadingAdmin } = useScaffoldReadContract({
    contractName: "Marketplace",
    functionName: "hasRole",
    args: [ADMIN_ROLE, address],
  });

  const { data: isUser, isLoading: loadingUser } = useScaffoldReadContract({
    contractName: "Marketplace",
    functionName: "hasRole",
    args: [USER_ROLE, address],
  });

  const { data: isGuest, isLoading: loadingGuest } = useScaffoldReadContract({
    contractName: "Marketplace",
    functionName: "hasRole",
    args: [GUEST_ROLE, address],
  });

  const isLoading = loadingAdmin || loadingUser || loadingGuest;

  let role: UserRole = "none";
  if (isAdmin) role = "admin";
  else if (isUser) role = "user";
  else if (isGuest) role = "guest";

  return {
    role,
    isAdmin: Boolean(isAdmin),
    isUser: Boolean(isUser),
    isGuest: Boolean(isGuest),
    isLoading,
  };
};
