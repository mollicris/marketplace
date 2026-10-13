// contracts/roles/MarketplaceAccessControl.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./RoleConstants.sol";

contract MarketplaceAccessControl is AccessControl {
    
    constructor(address admin) {
        _grantRole(RoleConstants.ADMIN_ROLE, admin);
        _grantRole(RoleConstants.USER_ROLE, admin);
        _grantRole(RoleConstants.GUEST_ROLE, admin);

        _setRoleAdmin(RoleConstants.ADMIN_ROLE, RoleConstants.ADMIN_ROLE);
        _setRoleAdmin(RoleConstants.USER_ROLE, RoleConstants.ADMIN_ROLE);
        _setRoleAdmin(RoleConstants.GUEST_ROLE, RoleConstants.ADMIN_ROLE);
    }
    
    modifier onlyAdmin() {
        require(hasRole(RoleConstants.ADMIN_ROLE, msg.sender), "Marketplace: Admin role required");
        _;
    }
    
    modifier onlyUser() {
        require(
            hasRole(RoleConstants.USER_ROLE, msg.sender) || 
            hasRole(RoleConstants.ADMIN_ROLE, msg.sender),
            "Marketplace: User role required"
        );
        _;
    }
    
    modifier onlyGuest() {
        require(
            hasRole(RoleConstants.GUEST_ROLE, msg.sender) ||
            hasRole(RoleConstants.USER_ROLE, msg.sender) || 
            hasRole(RoleConstants.ADMIN_ROLE, msg.sender),
            "Marketplace: Guest role required"
        );
        _;
    }
    
    function grantUserRole(address account) external onlyAdmin {
        grantRole(RoleConstants.USER_ROLE, account);
    }
    
    function revokeUserRole(address account) external onlyAdmin {
        revokeRole(RoleConstants.USER_ROLE, account);
    }
    
    function grantGuestRole(address account) external onlyAdmin {
        grantRole(RoleConstants.GUEST_ROLE, account);
    }
    
    function revokeGuestRole(address account) external onlyAdmin {
        revokeRole(RoleConstants.GUEST_ROLE, account);
    }
}