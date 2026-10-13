import * as chains from "viem/chains";

export type BaseConfig = {
  targetNetworks: readonly chains.Chain[];
  pollingInterval: number;
  alchemyApiKey: string;
  rpcOverrides?: Record<number, string>;
  walletConnectProjectId: string;
  onlyLocalBurnerWallet: boolean;
};

export type ScaffoldConfig = BaseConfig;

const sepoliaRpcUrl = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL;
// Mainnet is always queried for the ETH/USD price and ENS names.
const mainnetRpcUrl = process.env.NEXT_PUBLIC_MAINNET_RPC_URL;
const rpcOverrides: Record<number, string> = {};
if (sepoliaRpcUrl) rpcOverrides[chains.sepolia.id] = sepoliaRpcUrl;
if (mainnetRpcUrl) rpcOverrides[chains.mainnet.id] = mainnetRpcUrl;

const scaffoldConfig = {
  // The networks on which your DApp is live
  // targetNetworks: [chains.foundry, chains.sepolia],
  targetNetworks: [chains.sepolia],
  // The interval at which your front-end polls the RPC servers for new data (it has no effect if you only target the local network (default is 4000))
  pollingInterval: 30000,
  // All credentials and endpoints come from env vars (.env.local locally, project settings on Vercel).
  alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ?? "",
  rpcOverrides,
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? "",
  onlyLocalBurnerWallet: true,
} as const satisfies ScaffoldConfig;

export default scaffoldConfig;
