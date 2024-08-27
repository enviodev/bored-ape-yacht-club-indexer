import { BoredApeYachtClub, Nft } from "generated";
import { tryFetchIpfsFile } from "./utils/ipfs";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

BoredApeYachtClub.Transfer.handler(async ({ event, context }) => {
  if (event.params.from === ZERO_ADDRESS) {
    // mint
    let metadata = await tryFetchIpfsFile(
      event.params.tokenId.toString(),
      context
    );

    const nft: Nft = {
      id: event.params.tokenId.toString(),
      owner: event.params.to,
      image: metadata.image,
      attributes: JSON.stringify(metadata.attributes),
    };
    context.Nft.set(nft);
  } else {
    // transfer
    let nft = await context.Nft.get(event.params.tokenId.toString());
    if (!nft) {
      throw new Error("Can't transfer non-existing NFT");
    }
    nft = { ...nft, owner: event.params.to };
    context.Nft.set(nft);
  }
});
