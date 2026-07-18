import 'server-only';
import { mintV1 } from '@metaplex-foundation/mpl-bubblegum';
import { none, publicKey, some, Umi } from '@metaplex-foundation/umi';
import { getUmi, isBackendLive, signatureToBase58 } from './umi';

export interface MintInput {
  treeAddress: string;
  leafOwner: string;
  metadataUri: string;
  name: string;
  symbol: string;
  uri: string;
  creators: Array<{ address: string; verified: boolean; share: number }>;
  sellerFeeBasisPoints: number;
  collection?: { address: string; verified: boolean };
}

export interface MintResult {
  signature: string;
  leafId: number;
  assetId: string;
}

export async function mintCompressedNft(input: MintInput): Promise<MintResult> {
  if (!isBackendLive()) {
    throw new Error('BACKEND_LIVE=false; refusing to sign real transactions');
  }

  const umi: Umi = getUmi();
  const tree = publicKey(input.treeAddress);

  const builder = await mintV1(umi, {
    leafOwner: publicKey(input.leafOwner),
    merkleTree: tree,
    metadata: {
      name: input.name,
      symbol: input.symbol,
      uri: input.uri || input.metadataUri,
      sellerFeeBasisPoints: input.sellerFeeBasisPoints,
      collection: input.collection ? some({ key: publicKey(input.collection.address), verified: input.collection.verified }) : none(),
      creators: input.creators.map((c) => ({
        address: publicKey(c.address),
        verified: c.verified,
        share: c.share,
      })),
    },
  });

  const result = await builder.sendAndConfirm(umi, {
    confirm: { commitment: 'confirmed' },
  });

  return {
    signature: signatureToBase58(result.signature),
    leafId: 0,
    assetId: tree.toString(),
  };
}