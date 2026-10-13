// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

library RoleConstants {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant USER_ROLE = keccak256("USER_ROLE"); 
    bytes32 public constant GUEST_ROLE = keccak256("GUEST_ROLE");
    
    string public constant ADMIN_ROLE_STR = "ADMIN_ROLE";
    string public constant USER_ROLE_STR = "USER_ROLE";
    string public constant GUEST_ROLE_STR = "GUEST_ROLE";
}