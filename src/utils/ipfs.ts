// src/utils/ipfs.ts
import { experimental_createEffect, S, type EffectContext } from "envio";

const nftMetadataSchema = S.schema({
  image: S.string,
  attributes: S.string,
});

type NftMetadata = S.Infer<typeof nftMetadataSchema>;

// unique identifier for the BoredApeYachtClub IPFS tokenURI
const BASE_URI_UID = "QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq";

const endpoints = [
  // Try multiple endpoints to ensure data availability
  // Optional paid gateway (set in .env)
  ...(process.env.PINATA_IPFS_GATEWAY ? [process.env.PINATA_IPFS_GATEWAY] : []),
  "https://cloudflare-ipfs.com/ipfs",
  "https://ipfs.io/ipfs",
];

async function fetchFromEndpoint(
  context: EffectContext,
  endpoint: string,
  tokenId: string
): Promise<NftMetadata | null> {
  try {
    const response = await fetch(`${endpoint}/${BASE_URI_UID}/${tokenId}`);
    if (response.ok) {
      const metadata: any = await response.json();
      return {
        image: metadata.image,
        attributes: JSON.stringify(metadata.attributes),
      };
    } else {
      context.log.warn(`IPFS didn't return 200`, { tokenId, endpoint });
      return null;
    }
  } catch (e) {
    context.log.warn(`IPFS fetch failed`, { tokenId, endpoint, err: e });
    return null;
  }
}

export const getIpfsMetadata = experimental_createEffect(
  {
    name: "getIpfsMetadata",
    input: S.string,
    output: nftMetadataSchema,
  },
  async ({ input: tokenId, context }) => {
    for (const endpoint of endpoints) {
      const metadata = await fetchFromEndpoint(context, endpoint, tokenId);
      if (metadata) {
        return metadata;
      }
    }

    // ⚠️ Dangerous: Sometimes it's better to crash, to prevent corrupted data
    // But we're going to use a fallback value, to keep the indexer process running.
    // Both approaches have their pros and cons.
    context.log.warn(
      "Unable to fetch IPFS. Continuing with fallback metadata.",
      {
        tokenId,
      }
    );
    return { attributes: `["unknown"]`, image: "unknown" };
  }
);
