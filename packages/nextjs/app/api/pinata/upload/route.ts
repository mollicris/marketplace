import { NextRequest, NextResponse } from "next/server";

const PINATA_FILE_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";
const PINATA_JSON_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

type PinataResponse = {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
};

export async function POST(req: NextRequest) {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) {
    return NextResponse.json({ error: "PINATA_JWT not configured on the server" }, { status: 500 });
  }

  const contentType = req.headers.get("content-type") ?? "";

  try {
    if (contentType.startsWith("multipart/form-data")) {
      const inbound = await req.formData();
      const file = inbound.get("file");
      if (!(file instanceof Blob)) {
        return NextResponse.json({ error: "Missing 'file' field" }, { status: 400 });
      }

      const filename = (file as Blob & { name?: string }).name || `upload-${Date.now()}`;
      const outbound = new FormData();
      outbound.append("file", file, filename);
      outbound.append("pinataMetadata", JSON.stringify({ name: filename }));

      const res = await fetch(PINATA_FILE_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${jwt}` },
        body: outbound,
      });

      if (!res.ok) {
        const detail = await res.text();
        return NextResponse.json({ error: "Pinata upload failed", detail }, { status: res.status });
      }

      const data = (await res.json()) as PinataResponse;
      return NextResponse.json({ cid: data.IpfsHash, uri: `ipfs://${data.IpfsHash}` });
    }

    if (contentType.includes("application/json")) {
      const body = await req.json();
      const res = await fetch(PINATA_JSON_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pinataContent: body,
          pinataMetadata: { name: `metadata-${Date.now()}.json` },
        }),
      });

      if (!res.ok) {
        const detail = await res.text();
        return NextResponse.json({ error: "Pinata upload failed", detail }, { status: res.status });
      }

      const data = (await res.json()) as PinataResponse;
      return NextResponse.json({ cid: data.IpfsHash, uri: `ipfs://${data.IpfsHash}` });
    }

    return NextResponse.json(
      { error: "Unsupported content-type; use multipart/form-data or application/json" },
      { status: 415 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
