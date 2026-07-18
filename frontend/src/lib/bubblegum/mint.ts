import { none, publicKey, some } from '@metaplex-foundation/umi';
import { mintV1 } from '@metaplex-foundation/mpl-bubblegum';
import bs58 from 'bs58';
import type { PublicKey as UmiPK, Umi } from '@metaplex-foundation/umi';

export interface MintCnfArgs {
  merkleTree: UmiPK;
  collection?: UmiPK | null;
  leafOwner: UmiPK;
  metadataUri: string;
  name: string;
  symbol: string;
}

export async function mintCnfOne(umi: Umi, args: MintCnfArgs): Promise<Uint8Array> {
  const tx = await mintV1(umi, {
    leafOwner: args.leafOwner,
    merkleTree: args.merkleTree,
    metadata: {
      name: args.name,
      symbol: args.symbol,
      uri: args.metadataUri,
      collection: args.collection ? some({ key: args.collection, verified: false }) : none(),
      creators: [
        { address: umi.identity.publicKey, verified: true, share: 100 },
      ],
      isMutable: true,
      primarySaleHappened: false,
      sellerFeeBasisPoints: 0,
      tokenStandard: 0,
      uses: none(),
      editionNonce: none(),
    },
  });
  const sig = await tx.sendAndConfirm(umi, { confirm: { commitment: 'confirmed' } });
  return sig.signature;
}

export function signatureToBs58(sig: Uint8Array): string {
  try {
    return bs58.encode(sig);
  } catch {
    return Array.from(sig)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
}

export function pkToString(pk: UmiPK | string): string {
  if (typeof pk === 'string') return pk;
  return publicKey(pk as unknown as Parameters<typeof publicKey>[0]).toString();
}
