// app/create-nft/page.tsx
"use client";

import { useAccount } from "wagmi";
import MintNFT from "~~/components/nft/MintNFT/MintNFT";

export default function CreateNFTPage() {
    const { isConnected } = useAccount();

    if (!isConnected) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-8">
                <div className="container mx-auto px-4">
                    <div className="text-center py-12">
                        <h2 className="text-2xl font-bold text-white mb-4">Conecta tu wallet</h2>
                        <p className="text-gray-400">Necesitas conectarte para crear NFTs</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-8">
            <div className="container mx-auto px-4 max-w-2xl">
                <MintNFT />
            </div>
        </div>
    );
}