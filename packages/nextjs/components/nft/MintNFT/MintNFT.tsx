"use client";

import { useState, useRef } from "react";
import { useAccount } from "wagmi";
import {
    PhotoIcon,
    DocumentTextIcon,
    CurrencyDollarIcon,
    TagIcon,
    ArrowUpTrayIcon,
    XMarkIcon
} from "@heroicons/react/24/outline";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";

interface NFTFormData {
    name: string;
    description: string;
    price: string;
    royalty: number;
    image: File | null;
    imagePreview: string;
    attributes: { trait_type: string; value: string }[];
}

export const CreateNFT = () => {
    const { address } = useAccount();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [showSuccess, setShowSuccess] = useState(false);

    const [formData, setFormData] = useState<NFTFormData>({
        name: "",
        description: "",
        price: "",
        royalty: 10,
        image: null,
        imagePreview: "",
        attributes: [{ trait_type: "", value: "" }]
    });

    // Hook para escribir en el contrato de mint
    // const { writeAsync: mintNFT } = useScaffoldWriteContract({
    //     contractName: "YourNFTContract",
    //     functionName: "mintNFT",
    //     args: [
    //         address as `0x${string}`,
    //         formData.imagePreview, // IPFS hash (deberías subir la imagen primero)
    //         formData.name,
    //         formData.description,
    //         BigInt(Math.floor(parseFloat(formData.price) * 1e18 || 0)),
    //         BigInt(formData.royalty * 100) // royalties en basis points (100 = 1%)
    //     ],
    //     onBlockConfirmation: (txnReceipt) => {
    //         console.log("NFT minted successfully!", txnReceipt);
    //         setIsLoading(false);
    //         setShowSuccess(true);
    //         resetForm();
    //     },
    //     onError: (error) => {
    //         console.error("Error minting NFT:", error);
    //         setIsLoading(false);
    //     },
    // });

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setFormData(prev => ({
                    ...prev,
                    image: file,
                    imagePreview: e.target?.result as string
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const addAttribute = () => {
        setFormData(prev => ({
            ...prev,
            attributes: [...prev.attributes, { trait_type: "", value: "" }]
        }));
    };

    const removeAttribute = (index: number) => {
        setFormData(prev => ({
            ...prev,
            attributes: prev.attributes.filter((_, i) => i !== index)
        }));
    };

    const updateAttribute = (index: number, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            attributes: prev.attributes.map((attr, i) =>
                i === index ? { ...attr, [field]: value } : attr
            )
        }));
    };

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            price: "",
            royalty: 10,
            image: null,
            imagePreview: "",
            attributes: [{ trait_type: "", value: "" }]
        });
        setCurrentStep(1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Primero subir la imagen a IPFS (aquí deberías implementar tu servicio IPFS)
            // const ipfsHash = await uploadToIPFS(formData.image);

            // Luego mintear el NFT con el hash de IPFS
            //await mintNFT();
        } catch (error) {
            console.error("Error in minting process:", error);
            setIsLoading(false);
        }
    };

    const steps = [
        { number: 1, title: "Subir Imagen", icon: PhotoIcon },
        { number: 2, title: "Detalles", icon: DocumentTextIcon },
        { number: 3, title: "Precio & Royalties", icon: CurrencyDollarIcon },
        { number: 4, title: "Atributos", icon: TagIcon }
    ];

    if (showSuccess) {
        return (
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-8 border border-gray-700/30 text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">¡NFT Creado Exitosamente!</h3>
                <p className="text-gray-400 mb-6">Tu NFT ha sido minteado en la blockchain</p>
                <button
                    onClick={() => setShowSuccess(false)}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all"
                >
                    Crear otro NFT
                </button>
            </div>
        );
    }

    return (
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Crear Nuevo NFT</h2>
                <p className="text-gray-400">Convierte tu arte digital en un NFT único</p>
            </div>

            {/* Progress Steps */}
            <div className="flex justify-center mb-8">
                <div className="flex space-x-8">
                    {steps.map((step, index) => (
                        <div key={step.number} className="flex flex-col items-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${currentStep >= step.number
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-transparent text-white'
                                : 'border-gray-600 text-gray-400'
                                }`}>
                                <step.icon className="w-6 h-6" />
                            </div>
                            <span className={`text-sm mt-2 ${currentStep >= step.number ? 'text-white' : 'text-gray-400'
                                }`}>
                                {step.title}
                            </span>
                            {index < steps.length - 1 && (
                                <div className={`h-0.5 w-16 mt-6 ${currentStep > step.number ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-gray-600'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step 1: Image Upload */}
                {currentStep === 1 && (
                    <div className="space-y-4">
                        <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-purple-500 transition-colors">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                accept="image/*"
                                className="hidden"
                            />

                            {formData.imagePreview ? (
                                <div className="relative">
                                    <img
                                        src={formData.imagePreview}
                                        alt="Preview"
                                        className="mx-auto max-h-64 rounded-lg object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, image: null, imagePreview: "" }))}
                                        className="absolute top-2 right-2 bg-red-500/80 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-400 mb-2">Arrastra tu imagen o haz click para subir</p>
                                    <p className="text-sm text-gray-500">PNG, JPG, GIF hasta 10MB</p>
                                </>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full bg-gray-700/50 text-gray-300 p-4 rounded-lg hover:bg-gray-600/50 transition-colors"
                        >
                            <ArrowUpTrayIcon className="w-5 h-5 inline mr-2" />
                            Seleccionar Archivo
                        </button>
                    </div>
                )}

                {/* Step 2: Details */}
                {currentStep === 2 && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Nombre del NFT</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                                placeholder="Ej: Visión Cósmica #1"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Descripción</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                rows={4}
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                                placeholder="Describe tu obra de arte..."
                                required
                            />
                        </div>
                    </div>
                )}

                {/* Step 3: Price & Royalties */}
                {currentStep === 3 && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Precio (ETH)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.001"
                                    value={formData.price}
                                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 pl-12 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                                    placeholder="0.00"
                                    required
                                />
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <CurrencyDollarIcon className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Porcentaje de Royalties ({formData.royalty}%)
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="25"
                                step="1"
                                value={formData.royalty}
                                onChange={(e) => setFormData(prev => ({ ...prev, royalty: parseInt(e.target.value) }))}
                                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <div className="flex justify-between text-xs text-gray-400 mt-2">
                                <span>0%</span>
                                <span>25%</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Attributes */}
                {currentStep === 4 && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="block text-sm font-medium text-gray-400">Atributos</label>
                            <button
                                type="button"
                                onClick={addAttribute}
                                className="text-sm text-purple-400 hover:text-purple-300"
                            >
                                + Agregar atributo
                            </button>
                        </div>

                        {formData.attributes.map((attr, index) => (
                            <div key={index} className="flex space-x-2">
                                <input
                                    type="text"
                                    value={attr.trait_type}
                                    onChange={(e) => updateAttribute(index, 'trait_type', e.target.value)}
                                    className="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                                    placeholder="Tipo (ej: Color)"
                                />
                                <input
                                    type="text"
                                    value={attr.value}
                                    onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                                    className="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                                    placeholder="Valor (ej: Azul)"
                                />
                                {formData.attributes.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeAttribute(index)}
                                        className="px-3 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 border-t border-gray-700/30">
                    {currentStep > 1 ? (
                        <button
                            type="button"
                            onClick={() => setCurrentStep(prev => prev - 1)}
                            className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
                        >
                            Anterior
                        </button>
                    ) : (
                        <div></div>
                    )}

                    {currentStep < steps.length ? (
                        <button
                            type="button"
                            onClick={() => setCurrentStep(prev => prev + 1)}
                            disabled={currentStep === 1 && !formData.image}
                            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Siguiente
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={isLoading || !formData.image || !formData.name || !formData.price}
                            className="px-6 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Minteando...
                                </div>
                            ) : (
                                "Crear NFT"
                            )}
                        </button>
                    )}
                </div>
            </form>

            {/* Información de gas fees */}
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-start space-x-3">
                    <CurrencyDollarIcon className="h-5 w-5 text-blue-400 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-blue-400 mb-1">Costos de Transacción</h4>
                        <p className="text-sm text-blue-300">
                            Mintear un NFT requiere pagar gas fees. El costo aproximado es de ~0.002-0.005 ETH.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateNFT;