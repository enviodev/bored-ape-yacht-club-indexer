// src/EventHandlers.ts
import { BoredApeYachtClub } from "generated";
import { getIpfsMetadata } from "./utils/ipfs";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

BoredApeYachtClub.Transfer.handler(async ({ event, context }) => {
  if (event.params.from === ZERO_ADDRESS) {
    // mint
    const metadata = await context.effect(
      getIpfsMetadata,
      event.params.tokenId.toString()
    );
    context.Nft.set({
      id: event.params.tokenId.toString(),
      owner: event.params.to,
      image: metadata.image,
      attributes: metadata.attributes,
    });
  } else {
    // transfer
    const nft = await context.Nft.getOrThrow(event.params.tokenId.toString());
    context.Nft.set({
      ...nft,
      owner: event.params.to,
    });
  }
});
