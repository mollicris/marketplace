export type PinataUploadResult = {
  cid: string;
  uri: string;
};

export type NFTMetadata = {
  name: string;
  description: string;
  image: string;
  attributes?: { trait_type: string; value: string }[];
};

async function postToPinata(init: RequestInit): Promise<PinataUploadResult> {
  const res = await fetch("/api/pinata/upload", init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `Pinata upload failed (${res.status})`);
  }
  return (await res.json()) as PinataUploadResult;
}

export function uploadImageToPinata(file: File): Promise<PinataUploadResult> {
  const body = new FormData();
  body.append("file", file, file.name);
  return postToPinata({ method: "POST", body });
}

export function uploadMetadataToPinata(metadata: NFTMetadata): Promise<PinataUploadResult> {
  return postToPinata({
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(metadata),
  });
}
