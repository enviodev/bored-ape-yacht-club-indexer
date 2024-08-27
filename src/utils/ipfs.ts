import { handlerContext } from "generated";

type NftMetadata = {
  image: string;
  attributes: Array<any>;
};

const BASE_URI_UID = "QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq";

async function fetchFromEndpoint(
  endpoint: string,
  tokenId: string,
  context: handlerContext
): Promise<NftMetadata | null> {
  try {
    const response = await fetch(`${endpoint}/${BASE_URI_UID}/${tokenId}`);
    if (response.ok) {
      const metadata: any = await response.json();
      context.log.info(metadata);
      return { attributes: metadata.attributes, image: metadata.image };
    } else {
      throw new Error("Unable to fetch from endpoint");
    }
  } catch (e) {
    context.log.warn(`Unable to fetch from ${endpoint}`);
  }
  return null;
}

export async function tryFetchIpfsFile(
  tokenId: string,
  context: handlerContext
): Promise<NftMetadata> {
  const endpoints = [
    process.env.PINATA_IPFS_GATEWAY || "",
    "https://cloudflare-ipfs.com/ipfs",
    "https://ipfs.io/ipfs",
  ];

  for (const endpoint of endpoints) {
    const metadata = await fetchFromEndpoint(endpoint, tokenId, context);
    if (metadata) {
      return metadata;
    }
  }

  context.log.error("Unable to fetch from all endpoints"); // could do something more here depending on use case
  return { attributes: ["unknown"], image: "unknown" };
}
