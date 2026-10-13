// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.4.0
pragma solidity ^0.8.27;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

// contract MyToken is ERC721, ERC721URIStorage, AccessControl {
    // bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    // uint256 private _nextTokenId;

    // constructor(address defaultAdmin, address minter) ERC721("MyToken", "MTK") {
    //     _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
    //     _grantRole(MINTER_ROLE, minter);
    // }

    // function safeMint(address to, string memory uri)
    //     public
    //     onlyRole(MINTER_ROLE)
    //     returns (uint256)
    // {
    //     uint256 tokenId = _nextTokenId++;
    //     _safeMint(to, tokenId);
    //     _setTokenURI(tokenId, uri);
    //     return tokenId;
    // }

    // // The following functions are overrides required by Solidity.

    // function tokenURI(uint256 tokenId)
    //     public
    //     view
    //     override(ERC721, ERC721URIStorage)
    //     returns (string memory)
    // {
    //     return super.tokenURI(tokenId);
    // }

    // function supportsInterface(bytes4 interfaceId)
    //     public
    //     view
    //     override(ERC721, ERC721URIStorage, AccessControl)
    //     returns (bool)
    // {
    //     return super.supportsInterface(interfaceId);
    // }
// }
