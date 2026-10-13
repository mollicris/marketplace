// src/tokens/MarketplaceNFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "../roles/RoleConstants.sol";
import "../roles/MarketplaceAccessControl.sol";

contract MarketplaceNFT is ERC721, MarketplaceAccessControl {
    uint256 private _tokenIdCounter;

    // Mappings para manejar metadata y URIs
    mapping(uint256 => string) private _tokenURIs;
    mapping(uint256 => string) private _tokenCIDs;
    mapping(uint256 => address) public tokenCreator;
    mapping(uint256 => uint256) public tokenRoyalty;
    
    // Base URI para Pinata
    string private _baseTokenURI;
    
    event NFTMinted(uint256 indexed tokenId, address indexed creator, string tokenURI, string cid);
    event RoyaltySet(uint256 indexed tokenId, uint256 royaltyPercentage);
    event NFTBurned(uint256 indexed tokenId);
    event TokenURIUpdated(uint256 indexed tokenId, string newTokenURI);
    event BaseURIUpdated(string newBaseURI);
    
    constructor(
        string memory name,
        string memory symbol,
        address admin,
        string memory baseTokenURI
    ) ERC721(name, symbol) MarketplaceAccessControl(admin) {
        _baseTokenURI = baseTokenURI;
    }
    
    /**
     * @dev Mint con URI completa (máxima flexibilidad)
     */
    function safeMint(
        address to,
        string memory uri,
        string memory cid,
        uint256 royaltyPercentage
    ) public onlyUser returns (uint256) {
        require(royaltyPercentage <= 1000, "Royalty cannot exceed 10%");
        require(bytes(uri).length > 0, "Token URI cannot be empty");
        require(bytes(cid).length > 0, "CID cannot be empty");
        require(to != address(0), "Mint to the zero address");
        
        unchecked {
            _tokenIdCounter++;
        }
        uint256 tokenId = _tokenIdCounter;
        
        _safeMint(to, tokenId);
    _tokenURIs[tokenId] = uri;
        _tokenCIDs[tokenId] = cid;
        tokenCreator[tokenId] = msg.sender;
        tokenRoyalty[tokenId] = royaltyPercentage;
        
    emit NFTMinted(tokenId, msg.sender, uri, cid);
        emit RoyaltySet(tokenId, royaltyPercentage);
        
        return tokenId;
    }

    /**
     * @dev Mint usando solo el CID de Pinata (construye la URI automáticamente)
     */
    function safeMintWithCID(
        address to,
        string memory cid,
        uint256 royaltyPercentage
    ) external onlyUser returns (uint256) {
        string memory uri = string(abi.encodePacked(_baseTokenURI, cid));
        return safeMint(to, uri, cid, royaltyPercentage);
    }

    /**
     * @dev Mint con metadata en formato folder de Pinata
     * Útil cuando tienes una estructura: baseURI/tokenId
     */
    function safeMintWithTokenIdURI(
        address to,
        string memory cid,
        uint256 royaltyPercentage
    ) external onlyUser returns (uint256) {
        unchecked {
            _tokenIdCounter++;
        }
        uint256 tokenId = _tokenIdCounter;
        
    // Para estructura: https://gateway.pinata.cloud/ipfs/QmBaseCID/tokenId
    string memory uri = string(abi.encodePacked(_baseTokenURI, cid, "/", Strings.toString(tokenId)));
        
        _safeMint(to, tokenId);
    _tokenURIs[tokenId] = uri;
        _tokenCIDs[tokenId] = cid;
        tokenCreator[tokenId] = msg.sender;
        tokenRoyalty[tokenId] = royaltyPercentage;
        
    emit NFTMinted(tokenId, msg.sender, uri, cid);
        emit RoyaltySet(tokenId, royaltyPercentage);
        
        return tokenId;
    }

    /**
     * @dev Obtener la URI del token
     */
    function tokenURI(uint256 tokenId) 
        public 
        view 
        virtual 
        override 
        returns (string memory) 
    {
        require(exists(tokenId), "Token does not exist");
        return _tokenURIs[tokenId];
    }

    /**
     * @dev Actualizar URI del token (útil si actualizas metadata en Pinata)
     */
    function updateTokenURI(
        uint256 tokenId, 
        string memory newTokenURI, 
        string memory newCID
    ) external {
        require(exists(tokenId), "Token does not exist");
        require(
            _isOwnerOrApproved(msg.sender, tokenId) || hasRole(RoleConstants.ADMIN_ROLE, msg.sender),
            "Not owner, approved, nor admin"
        );
        
        _tokenURIs[tokenId] = newTokenURI;
        _tokenCIDs[tokenId] = newCID;
        
        emit TokenURIUpdated(tokenId, newTokenURI);
    }

    /**
     * @dev Actualizar Base URI (solo admin)
     */
    function setBaseURI(string memory newBaseURI) external onlyAdmin {
        _baseTokenURI = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }

    /**
     * @dev Obtener Base URI
     */
    function baseURI() external view returns (string memory) {
        return _baseTokenURI;
    }

    // ============ FUNCIONES DE UTILIDAD ============

    function _isOwnerOrApproved(address spender, uint256 tokenId) internal view returns (bool) {
        address owner = _ownerOf(tokenId);
        return (spender == owner || 
                isApprovedForAll(owner, spender) || 
                _getApproved(tokenId) == spender);
    }

    function burn(uint256 tokenId) external {
        require(_isOwnerOrApproved(msg.sender, tokenId), "Caller is not owner nor approved");
        _burnToken(tokenId);
    }

    function adminBurn(uint256 tokenId) external onlyAdmin {
        require(exists(tokenId), "Token does not exist");
        _burnToken(tokenId);
    }

    function exists(uint256 tokenId) public view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    /**
     * @dev Obtener CID de Pinata
     */
    function getTokenCID(uint256 tokenId) external view returns (string memory) {
        require(exists(tokenId), "Token does not exist");
        return _tokenCIDs[tokenId];
    }

    /**
     * @dev Obtener metadata completa del token
     */
    function getTokenMetadata(uint256 tokenId) external view returns (
        address owner,
        address creator,
        string memory tokenURI_,
        string memory cid,
        uint256 royalty
    ) {
        require(exists(tokenId), "Token does not exist");
        return (
            ownerOf(tokenId),
            tokenCreator[tokenId],
            _tokenURIs[tokenId],
            _tokenCIDs[tokenId],
            tokenRoyalty[tokenId]
        );
    }
    
    function supportsInterface(bytes4 interfaceId)
    public
    view
    override(ERC721, AccessControl)
    returns (bool)
{
    return super.supportsInterface(interfaceId);
}
    
   
    function _burnToken(uint256 tokenId) internal {
        require(exists(tokenId), "Token does not exist");

        // Call ERC721's internal burn implementation explicitly
        ERC721._burn(tokenId);

        // Limpiar todos los datos del token
        delete _tokenURIs[tokenId];
        delete _tokenCIDs[tokenId];
        delete tokenCreator[tokenId];
        delete tokenRoyalty[tokenId];

        emit NFTBurned(tokenId);
    }
    
    function getRoyaltyInfo(uint256 tokenId) external view returns (address, uint256) {
        require(exists(tokenId), "Token does not exist");
        return (tokenCreator[tokenId], tokenRoyalty[tokenId]);
    }
    
    function getCurrentTokenId() external view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @dev Obtener tokens por creador
     */
    function getTokensByCreator(address creator) external view returns (uint256[] memory) {
        uint256 count;
        uint256 totalTokens = _tokenIdCounter;
        
        for (uint256 i = 1; i <= totalTokens; i++) {
            if (exists(i) && tokenCreator[i] == creator) {
                count++;
            }
        }
        
        uint256[] memory tokens = new uint256[](count);
        uint256 index;
        
        for (uint256 i = 1; i <= totalTokens; i++) {
            if (exists(i) && tokenCreator[i] == creator) {
                tokens[index] = i;
                index++;
            }
        }
        
        return tokens;
    }

    /**
     * @dev Obtener tokens por propietario
     */
    function getTokensByOwner(address owner) external view returns (uint256[] memory) {
        uint256 count;
        uint256 totalTokens = _tokenIdCounter;
        
        for (uint256 i = 1; i <= totalTokens; i++) {
            if (exists(i) && ownerOf(i) == owner) {
                count++;
            }
        }
        
        uint256[] memory tokens = new uint256[](count);
        uint256 index;
        
        for (uint256 i = 1; i <= totalTokens; i++) {
            if (exists(i) && ownerOf(i) == owner) {
                tokens[index] = i;
                index++;
            }
        }
        
        return tokens;
    }

}