# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Scaffold-ETH 2 monorepo (Yarn workspaces, Node >= 20.18.3) hosting an NFT marketplace dApp.

- `packages/foundry` — Solidity contracts, tests, deploy scripts (Foundry + Forge).
- `packages/nextjs` — Next.js 15 App Router frontend using Wagmi, Viem, RainbowKit, DaisyUI/Tailwind 4.

## Common commands

Run from the repo root (they delegate to the right workspace):

- `yarn chain` — start a local Anvil node (also sets up the `scaffold-eth-default` keystore).
- `yarn deploy` — runs `packages/foundry/script/Deploy.s.sol` against the current chain and regenerates frontend ABIs. Pass `--file <Script.s.sol>` to deploy a single script, `--network <name>` to target a non-local network (requires a keystore).
- `yarn start` — Next.js dev server on `http://localhost:3000`.
- `yarn test` / `yarn foundry:test` — `forge test`. For a single test: `yarn workspace @se-2/foundry test -- --match-test <TestName>` (or `--match-contract`, `--match-path`). Add `-vvvv` for traces.
- `yarn compile` — `forge compile`.
- `yarn lint` — runs `next lint` and `forge fmt --check` + prettier for the foundry JS helpers.
- `yarn format` — `forge fmt` + prettier across both packages.
- `yarn next:check-types` — TypeScript check without emitting.
- `yarn account:generate` / `yarn account:import` / `yarn account` — manage the deploy keystore and show its balance.
- `yarn verify` — runs `script/VerifyAll.s.sol` for the specified RPC.

The usual dev flow is three terminals: `yarn chain`, then `yarn deploy`, then `yarn start`. Use `http://localhost:3000/debug` to poke contracts via the generated UI.

## Architecture

### Contracts (`packages/foundry/contracts`)

Two concrete contracts share one role system:

- `MarketPlace.sol` (`Marketplace`) — ERC721 escrow-less marketplace. Sellers approve the contract (or `setApprovalForAll`) and call `listNFT`; buyers call `buyNFT` (fixed-price, exact ETH) or `buyNFTWithRoyalties` (tries ERC-2981 via `supportsInterface(0x2a55205a)` + staticcall to `royaltyInfo`). Platform fee is basis points over 10000. Uses OZ `ReentrancyGuard` + `ERC721Holder`. Admin can toggle `approvedNFTContracts`, set fee/recipient, withdraw fees, and emergency-withdraw stuck NFTs. Note: `getActiveListings` / `getListingsBySeller` currently return empty arrays — the mapping-only storage layout cannot enumerate; enumeration must be done off-chain (events) or by changing the storage layout.
- `tokens/MarketplaceNFT.sol` — ERC721 with Pinata/IPFS-aware minting (`safeMint`, `safeMintWithCID`, `safeMintWithTokenIdURI` using `_baseTokenURI`), per-token royalty (bps, capped at 1000 = 10%), per-token creator tracking, and O(n) enumeration by owner/creator. `_tokenIdCounter` starts at 1.
- `roles/MarketplaceAccessControl.sol` + `roles/RoleConstants.sol` — thin wrapper over OZ `AccessControl` defining `ADMIN_ROLE`, `USER_ROLE`, `GUEST_ROLE` (all admin-managed by `ADMIN_ROLE`) and the `onlyAdmin` / `onlyUser` / `onlyGuest` modifiers. **Both** `Marketplace` and `MarketplaceNFT` inherit it, so each deployed instance has its own independent role set — granting USER_ROLE on the marketplace does not grant it on the NFT, and vice versa. The deployer/admin receives all three roles at construction.
- `interfaces/`, `libraries/`, `proxies/` — supporting interfaces and (currently unused) proxy scaffolds. The deployed contracts are not behind proxies today.

The legacy `YourContract.sol` and `DeployYourContract.s.sol` still exist. `DeployYourContract.s.sol` has been repurposed to deploy `MarketplaceNFT("MarketplaceNFT", "MNFT", deployer, "ipfs:")` — the marketplace itself is not wired into any deploy script yet. Add a `DeployMarketplace.s.sol` and register it in `script/Deploy.s.sol` when deploying both.

Solidity versions are mixed (`^0.8.19` and `^0.8.30`) — don't downgrade `MarketPlace.sol` / `MarketplaceNFT.sol` to match older files.

### Deployment pipeline

`script/Deploy.s.sol` is the entry point; it instantiates and runs per-contract deploy scripts. Each per-contract script extends `ScaffoldETHDeploy` and uses the `ScaffoldEthDeployerRunner` modifier (from `DeployHelpers.s.sol`) which:
- selects the deployer keystore (default `scaffold-eth-default` → Anvil account #9),
- funds the deployer on local chains,
- after deployment exports addresses + ABIs to `packages/nextjs/contracts/deployedContracts.ts` so the frontend hot-reloads.

Never hand-edit `packages/nextjs/contracts/deployedContracts.ts` — rerun `yarn deploy` instead.

### Frontend (`packages/nextjs`)

- App Router. Route groups: `app/(auth)/create-nft`, `app/admin`, `app/marketplace/{browse,collections,my-nfts}`, `app/debug`, `app/blockexplorer`.
- Target network defaults to local Foundry (chain id 31337) via `scaffold.config.ts`. Change `targetNetworks` there to point at a live chain; `onlyLocalBurnerWallet: true` restricts the burner wallet to local.
- All on-chain reads/writes/events MUST go through the scaffold-eth hooks in `hooks/scaffold-eth/` (`useScaffoldReadContract`, `useScaffoldWriteContract`, `useScaffoldEventHistory`, `useScaffoldWatchContractEvent`, `useScaffoldContract`, `useDeployedContractInfo`, `useTransactor`) — do not call wagmi/viem contract hooks directly. See `.cursor/rules/scaffold-eth.mdc` for usage examples; it is authoritative.
- Display primitives in `components/scaffold-eth/` are required for addresses, address inputs, balances, and ETH inputs (`Address`, `AddressInput`, `Balance`, `EtherInput`).
- Role-aware UI: `hooks/scaffold-eth/useUserRole.ts` + `components/AdminRoute.tsx` gate admin pages. `components/RoleManager.tsx` currently uses stubbed read/write hooks (TODO) — if touching it, re-wire to the real scaffold-eth hooks against `MarketplaceAccessControl`'s `grantRole`/`revokeRole`.
- Global state in `services/store/store.ts` (Zustand). Wagmi config in `services/web3/`.

### Pinata / IPFS

- Server-side route handler at `app/api/pinata/upload/route.ts` proxies both file (`multipart/form-data`) and JSON (`application/json`) uploads using `PINATA_JWT` (never exposed to the client). Response shape: `{ cid, uri }` where `uri = ipfs://<cid>`.
- Client helpers in `services/pinata/pinata.ts`: `uploadImageToPinata(file)` and `uploadMetadataToPinata(metadata)`. The mint flow in `components/nft/MintNFT/MintNFT.tsx` is: upload image → build ERC-721 metadata JSON with `image: ipfs://<imgCid>` → upload metadata → `MarketplaceNFT.safeMintWithCID(to, metadataCid, royaltyBps)`.
- `utils/ipfs.ts` exports `ipfsToHttp(uri)` that resolves `ipfs://` URIs against `NEXT_PUBLIC_IPFS_GATEWAY` (defaults to `https://gateway.pinata.cloud/ipfs/`). Use it everywhere you render NFT images or fetch metadata; never hardcode a gateway.
- Required envs (see `packages/nextjs/.env.example`): `PINATA_JWT` (server), `NEXT_PUBLIC_IPFS_GATEWAY` (client, optional).
- Contract baseURI is `ipfs://` (set in `DeployYourContract.s.sol`), so `tokenURI(tokenId)` returns `ipfs://<metadataCid>` — resolve it through `ipfsToHttp` before fetching.

### Testing

Only `test/YourContract.t.sol` exists today — there are no tests yet for `Marketplace` or `MarketplaceNFT`. When adding tests, place them under `packages/foundry/test` and name them `<Contract>.t.sol`.

## Conventions / gotchas

- `fs_permissions = [{ access = "read-write", path = "./"}]` is set in `foundry.toml` to let deploy scripts write ABIs — scripts rely on `--ffi`, so always keep the `--ffi` flag when invoking forge scripts manually.
- `platformFee` on `Marketplace` is basis points (10000 = 100%). Keep that in mind when writing admin UI or tests.
- `buyNFT` requires `msg.value == listing.price` exactly (not `>=`); the frontend must send the precise amount.
- `onlyGuest` is the loosest modifier (admin ⊇ user ⊇ guest), so buyers must still hold at least `GUEST_ROLE` on the marketplace instance. New users won't be able to buy until an admin grants them a role.
