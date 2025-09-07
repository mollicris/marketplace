// hooks/useUserRole.js
import { useAccount } from 'wagmi';

// Direcciones de administradores (pueden venir de un contrato o config)
const ADMIN_ADDRESSES = [
    '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720',
    '0xF5178baAadf7ECC3a82DFbdf95629fae6DCaa060'
];

const MODERATOR_ADDRESSES = [
    '0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2'
];

export const useUserRole = () => {
    const { address } = useAccount();

    if (!address) return { role: 'guest', isAdmin: false, isModerator: false };

    if (ADMIN_ADDRESSES.includes(address.toLowerCase())) {
        return { role: 'admin', isAdmin: true, isModerator: true };
    }

    if (MODERATOR_ADDRESSES.includes(address.toLowerCase())) {
        return { role: 'moderator', isAdmin: false, isModerator: true };
    }

    return { role: 'admin', isAdmin: true, isModerator: true };
};