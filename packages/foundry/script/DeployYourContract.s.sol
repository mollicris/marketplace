// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import "../contracts/tokens/MarketplaceNFT.sol";
/**
 * @notice Deploy script for MarketplaceNFT contract
 * @dev Inherits ScaffoldETHDeploy which:
 *      - Includes forge-std/Script.sol for deployment
 *      - Includes ScaffoldEthDeployerRunner modifier
 *      - Provides `deployer` variable
 * Example:
 * yarn deploy --file DeployYourContract.s.sol  # local anvil chain
 * yarn deploy --file DeployYourContract.s.sol --network optimism # live network (requires keystore)
 */
contract DeployYourContract is ScaffoldETHDeploy {
    /**
     * @dev Deployer setup based on `ETH_KEYSTORE_ACCOUNT` in `.env`:
     *      - "scaffold-eth-default": Uses Anvil's account #9 (0xa0Ee7A142d267C1f36714E4a8F75612F20a79720), no password prompt
     *      - "scaffold-eth-custom": requires password used while creating keystore
     *
     * Note: Must use ScaffoldEthDeployerRunner modifier to:
     *      - Setup correct `deployer` account and fund it
     *      - Export contract addresses & ABIs to `nextjs` packages
     */
    function run() external ScaffoldEthDeployerRunner {
        MarketplaceNFT nft = new MarketplaceNFT("MarketplaceNFT", "MNFT", deployer, "ipfs://");

        if (block.chainid == 31337) {
            address[10] memory devUsers = [
                0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266, // anvil #0
                0x70997970C51812dc3A010C7d01b50e0d17dc79C8, // anvil #1
                0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC, // anvil #2
                0x90F79bf6EB2c4f870365E785982E1f101E93b906, // anvil #3
                0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65, // anvil #4
                0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc, // anvil #5
                0x976EA74026E726554dB657fA54763abd0C3a0aa9, // anvil #6
                0x14dC79964da2C08b23698B3D3cc7Ca32193d9955, // anvil #7
                0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f, // anvil #8
                0x46EBb31e48453bd127A32F249fAA13C40CEb5626  // dev wallet (MetaMask)
            ];
            for (uint256 i = 0; i < devUsers.length; i++) {
                if (devUsers[i] != deployer) {
                    nft.grantUserRole(devUsers[i]);
                }
            }
        }
    }
}
