// src/Marketplace.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./roles/MarketplaceAccessControl.sol";
import "./interfaces/IMarketplace.sol";

contract Marketplace is IMarketplace, MarketplaceAccessControl, ReentrancyGuard, ERC721Holder {
    using Address for address payable;
    
    mapping(address => mapping(uint256 => Listing)) public listings;
    mapping(address => bool) public approvedNFTContracts;
    mapping(uint256 => SaleInfo) public saleHistory;
    
    uint256 public platformFee;
    address public feeRecipient;
    uint256 public totalListings;
    uint256 public totalSales;
    
    constructor(
        address admin,
        uint256 _platformFee,
        address _feeRecipient
    ) MarketplaceAccessControl(admin) {
        platformFee = _platformFee;
        feeRecipient = _feeRecipient;
    }
    
    function listNFT(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) external override onlyUser nonReentrant {
        require(price > 0, "Price must be greater than 0");
        require(
            IERC721(nftContract).ownerOf(tokenId) == msg.sender,
            "Not the owner"
        );
        require(
            IERC721(nftContract).isApprovedForAll(msg.sender, address(this)) ||
            IERC721(nftContract).getApproved(tokenId) == address(this),
            "Marketplace not approved"
        );
        
        listings[nftContract][tokenId] = Listing({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            price: price,
            active: true,
            timestamp: block.timestamp
        });
        
        unchecked {
            totalListings++;
        }
        
        emit Listed(msg.sender, nftContract, tokenId, price);
    }
    
    function buyNFT(
        address nftContract,
        uint256 tokenId
    ) external payable override onlyGuest nonReentrant {
        Listing storage listing = listings[nftContract][tokenId];
        
        require(listing.active, "NFT not for sale");
        require(msg.value == listing.price, "Incorrect price");
        require(IERC721(nftContract).ownerOf(tokenId) == listing.seller, "Seller no longer owner");
        
        address seller = listing.seller;
        uint256 price = listing.price;
        
        // Calcular fees
        uint256 platformFeeAmount = (price * platformFee) / 10000;
        uint256 sellerAmount = price - platformFeeAmount;
        
        // Desactivar listing
        listing.active = false;
        
        // Transferir NFT
        IERC721(nftContract).safeTransferFrom(seller, msg.sender, tokenId);
        
        // Distribuir fondos
        payable(seller).sendValue(sellerAmount);
        if (platformFeeAmount > 0) {
            payable(feeRecipient).sendValue(platformFeeAmount);
        }
        
        // Registrar venta
        saleHistory[totalSales] = SaleInfo({
            buyer: msg.sender,
            seller: seller,
            nftContract: nftContract,
            tokenId: tokenId,
            price: price,
            timestamp: block.timestamp
        });
        
        unchecked {
            totalSales++;
        }
        
        emit Sold(msg.sender, seller, nftContract, tokenId, price);
    }
    
    function delistNFT(
        address nftContract,
        uint256 tokenId
    ) external override nonReentrant {
        Listing storage listing = listings[nftContract][tokenId];
        
        require(listing.seller == msg.sender, "Not the seller");
        require(listing.active, "NFT not listed");
        
        listing.active = false;
        
        emit Delisted(msg.sender, nftContract, tokenId);
    }
    
    // Funciones administrativas
    function setPlatformFee(uint256 _platformFee) external onlyAdmin {
        platformFee = _platformFee;
    }
    
    function setFeeRecipient(address _feeRecipient) external onlyAdmin {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _feeRecipient;
    }
    
    function approveNFTContract(address nftContract) external onlyAdmin {
        approvedNFTContracts[nftContract] = true;
    }
    
    function revokeNFTContract(address nftContract) external onlyAdmin {
        approvedNFTContracts[nftContract] = false;
    }
    
    function getListing(address nftContract, uint256 tokenId) 
        external 
        view 
        override
        returns (Listing memory) 
    {
        return listings[nftContract][tokenId];
    }

    function getActiveListings(uint256 limit, uint256 offset) 
        external 
        view 
        returns (Listing[] memory) 
    {
        Listing[] memory emptyListings = new Listing[](0);
        return emptyListings;
    }

    function getListingsBySeller(address seller) external view returns (Listing[] memory) {
        // Esta es una implementación simplificada
        // En producción, necesitarías una estructura de datos más eficiente
        Listing[] memory sellerListings = new Listing[](0);
        return sellerListings;
    }
    
    function withdrawFees() external onlyAdmin {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        payable(feeRecipient).sendValue(balance);
    }
    
    function getMarketplaceStats() external view returns (
        uint256 totalListingsCount,
        uint256 totalSalesCount,
        uint256 currentPlatformFee
    ) {
        return (totalListings, totalSales, platformFee);
    }

    // FUNCIÓN MEJORADA: Con royalties
    function buyNFTWithRoyalties(
        address nftContract,
        uint256 tokenId
    ) external payable onlyGuest nonReentrant {
        Listing storage listing = listings[nftContract][tokenId];
        
        require(listing.active, "NFT not for sale");
        require(msg.value == listing.price, "Incorrect price");
        require(IERC721(nftContract).ownerOf(tokenId) == listing.seller, "Seller no longer owner");
        
        address seller = listing.seller;
        uint256 price = listing.price;
        
        // Calcular fees y royalties
        uint256 platformFeeAmount = (price * platformFee) / 10000;
        
        // Intentar obtener royalties del contrato NFT (si existe la función)
        uint256 royaltyAmount = 0;
        address royaltyReceiver = address(0);
        
        try IERC721(nftContract).supportsInterface(0x2a55205a) returns (bool supportsRoyalties) {
            if (supportsRoyalties) {
                // El contrato soporta ERC-2981 (Royalty Standard)
                (royaltyReceiver, royaltyAmount) = _getRoyaltyInfo(nftContract, tokenId, price);
            }
        } catch {}
        
        uint256 sellerAmount = price - platformFeeAmount - royaltyAmount;
        
        // Verificar que las cantidades son válidas
        require(sellerAmount > 0, "Invalid amount distribution");
        
        // Desactivar listing
        listing.active = false;
        
        // Transferir NFT
        IERC721(nftContract).safeTransferFrom(seller, msg.sender, tokenId);
        
        // Distribuir fondos
        payable(seller).sendValue(sellerAmount);
        if (platformFeeAmount > 0) {
            payable(feeRecipient).sendValue(platformFeeAmount);
        }
        if (royaltyAmount > 0 && royaltyReceiver != address(0)) {
            payable(royaltyReceiver).sendValue(royaltyAmount);
        }
        
        // Registrar venta
        saleHistory[totalSales] = SaleInfo({
            buyer: msg.sender,
            price: price,
            timestamp: block.timestamp,
            seller: seller,
            nftContract: nftContract,
            tokenId: tokenId
        });
        
        unchecked {
            totalSales++;
        }
        
        emit Sold(msg.sender, seller, nftContract, tokenId, price);
    }

    // Función helper para obtener información de royalties
    function _getRoyaltyInfo(
        address nftContract, 
        uint256 tokenId, 
        uint256 salePrice
    ) internal view returns (address receiver, uint256 royaltyAmount) {
        // Intentar llamar a royaltyInfo si el contrato soporta ERC-2981
        (bool success, bytes memory data) = nftContract.staticcall(
            abi.encodeWithSignature("royaltyInfo(uint256,uint256)", tokenId, salePrice)
        );
        
        if (success && data.length >= 64) {
            (receiver, royaltyAmount) = abi.decode(data, (address, uint256));
        }
        
        return (receiver, royaltyAmount);
    }

    // Función para ver el balance del contrato
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // Función de emergencia para recuperar NFTs atascados (solo admin)
    function emergencyWithdrawNFT(
        address nftContract, 
        uint256 tokenId, 
        address to
    ) external onlyAdmin {
        require(to != address(0), "Invalid recipient");
        IERC721(nftContract).safeTransferFrom(address(this), to, tokenId);
    }
}