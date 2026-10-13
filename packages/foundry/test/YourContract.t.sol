// test/MarketplaceNFTTest.t.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Test, console} from "forge-std/Test.sol";
import {MarketplaceNFT} from "../contracts/tokens/MarketplaceNFT.sol";

contract MarketplaceNFTTest is Test {
    MarketplaceNFT public nft;
    
    address public admin = makeAddr("admin");
    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");
    
    string constant PINATA_CID = "QmXJ6qZ5V7yQ8T2X8KdQvW8LsRcY9aMpXbN6tKdQvW8LsRc";
    string constant PINATA_URI = "https://gateway.pinata.cloud/ipfs/QmXJ6qZ5V7yQ8T2X8KdQvW8LsRcY9aMpXbN6tKdQvW8LsRc";
    
    function setUp() public {
        vm.prank(admin);
        nft = new MarketplaceNFT("Test NFT", "TNFT", admin,PINATA_URI);
        
        vm.prank(admin);
        nft.grantUserRole(user1);
        nft.grantUserRole(user2);
    }
    
    function test_BurnByOwner() public {
        vm.startPrank(user1);
        
        uint256 tokenId = nft.safeMint(user1, PINATA_URI, PINATA_CID, 500);
        assertTrue(nft.exists(tokenId));
        
        // Owner puede quemar
        nft.burn(tokenId);
        assertFalse(nft.exists(tokenId));
        
        vm.stopPrank();
    }
    
    function test_BurnByApproved() public {
        vm.startPrank(user1);
        
        uint256 tokenId = nft.safeMint(user1, PINATA_URI, PINATA_CID, 500);
        
        // Aprobar user2 para quemar
        nft.approve(user2, tokenId);
        
        vm.stopPrank();
        
        // user2 aprobado puede quemar
        vm.prank(user2);
        nft.burn(tokenId);
        
        assertFalse(nft.exists(tokenId));
    }
    
    function test_BurnByApprovedForAll() public {
        vm.startPrank(user1);
        
        uint256 tokenId = nft.safeMint(user1, PINATA_URI, PINATA_CID, 500);
        
        // Aprobar user2 para todos los tokens
        nft.setApprovalForAll(user2, true);
        
        vm.stopPrank();
        
        // user2 puede quemar (approved for all)
        vm.prank(user2);
        nft.burn(tokenId);
        
        assertFalse(nft.exists(tokenId));
    }
    
    function test_BurnByNonOwnerReverts() public {
        vm.startPrank(user1);
        uint256 tokenId = nft.safeMint(user1, PINATA_URI, PINATA_CID, 500);
        vm.stopPrank();
        
        // user2 no aprobado no puede quemar
        vm.prank(user2);
        vm.expectRevert("Caller is not owner nor approved");
        nft.burn(tokenId);
    }
    
    function test_AdminBurn() public {
        vm.startPrank(user1);
        uint256 tokenId = nft.safeMint(user1, PINATA_URI, PINATA_CID, 500);
        vm.stopPrank();
        
        // Admin puede quemar cualquier token
        vm.prank(admin);
        nft.adminBurn(tokenId);
        
        assertFalse(nft.exists(tokenId));
    }
}