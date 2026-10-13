const DEFAULT_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

function gatewayBase(): string {
  const raw = process.env.NEXT_PUBLIC_IPFS_GATEWAY?.trim();
  if (!raw) return DEFAULT_GATEWAY;
  return raw.endsWith("/") ? raw : `${raw}/`;
}

export function ipfsToHttp(uri: string | undefined | null): string {
  if (!uri) return "";
  if (uri.startsWith("ipfs://")) return `${gatewayBase()}${uri.slice("ipfs://".length)}`;
  return uri;
}
