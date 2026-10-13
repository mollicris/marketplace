// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

interface IMarketplace {
    struct Listing {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price;
        bool active;
        uint256 timestamp;
    }

    struct SaleInfo {
        address buyer;
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price;
        uint256 timestamp;
    }
    
    event Listed(
        address indexed seller,
        address indexed nftContract,
        uint256 indexed tokenId,
        uint256 price
    );
    
    event Sold(
        address indexed buyer,
        address indexed seller,
        address indexed nftContract,
        uint256 tokenId,
        uint256 price
    );
    
    event Delisted(
        address indexed seller,
        address indexed nftContract,
        uint256 indexed tokenId
    );
    
    function listNFT(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) external;
    
    function buyNFT(
        address nftContract,
        uint256 tokenId
    ) external payable;
    
    function delistNFT(
        address nftContract,
        uint256 tokenId
    ) external;

    function getListing(address nftContract, uint256 tokenId) 
        external 
        view 
        returns (Listing memory);

}