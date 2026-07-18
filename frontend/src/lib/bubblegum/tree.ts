import {
  generateSigner,
  none,
  percentAmount,
} from '@metaplex-foundation/umi';
import {
  createTree,
} from '@metaplex-foundation/mpl-bubblegum';
import { createNft } from '@metaplex-foundation/mpl-token-metadata';
import type { PublicKey as UmiPK, Umi, Signer } from '@metaplex-foundation/umi';

export interface TreeParams {
  maxDepth: number;
  maxBufferSize: number;
  canopyDepth: number;
}

export const TREE_PRESETS: Record<string, TreeParams> = {
  tiny: { maxDepth: 3, maxBufferSize: 8, canopyDepth: 0 },
  small: { maxDepth: 10, maxBufferSize: 16, canopyDepth: 3 },
  medium: { maxDepth: 14, maxBufferSize: 64, canopyDepth: 0 },
  large: { maxDepth: 17, maxBufferSize: 64, canopyDepth: 0 },
  xl: { maxDepth: 20, maxBufferSize: 64, canopyDepth: 0 },
};

export function capacityOf(p: TreeParams): number {
  return Math.pow(2, p.maxDepth);
}

export function estimateTreeRentLamports(p: TreeParams): number {
  const NODE_SIZE = 32;
  const BUFFER_SIZE = 32;
  const PROOF_CHUNK_SIZE = 32;
  const HEADER_SIZE = 14;

  const treeSize =
    HEADER_SIZE + Math.pow(2, p.maxDepth) * NODE_SIZE +
    (p.canopyDepth > 0 ? Math.pow(2, p.canopyDepth) * PROOF_CHUNK_SIZE : 0);
  const treeAccountLamports = treeSize * 2;
  const bufferAccountLamports = (p.maxBufferSize + 1) * BUFFER_SIZE * 2;
  const canopyAccountLamports = 0;

  return treeAccountLamports + bufferAccountLamports + canopyAccountLamports + 10_000;
}

export function estimateTreeRentSol(p: TreeParams): number {
  return estimateTreeRentLamports(p) / 1_000_000_000;
}

export function estimatePerMintSol(): number {
  return 0.000012;
}

export interface CreateTreeResult {
  merkleTree: UmiPK;
  signature: Uint8Array;
}

export async function createBubblegumTree(
  umi: Umi,
  params: TreeParams,
): Promise<CreateTreeResult> {
  const merkleTree: Signer = generateSigner(umi);
  const tx = await createTree(umi, {
    merkleTree,
    maxDepth: params.maxDepth,
    maxBufferSize: params.maxBufferSize,
    canopyDepth: params.canopyDepth,
    treeCreator: umi.identity,
  });
  const sig = await tx.sendAndConfirm(umi, { confirm: { commitment: 'confirmed' } });
  return { merkleTree: merkleTree.publicKey, signature: sig.signature };
}

export interface CreateCollectionResult {
  collection: UmiPK;
  signature: Uint8Array;
}

export async function createBubblegumCollection(
  umi: Umi,
  args: { name: string; symbol: string; uri: string; creators?: { address: UmiPK; verified: boolean; share: number }[] },
): Promise<CreateCollectionResult> {
  const mint: Signer = generateSigner(umi);
  const tx = await createNft(umi, {
    mint,
    name: args.name,
    symbol: args.symbol,
    uri: args.uri,
    isCollection: true,
    sellerFeeBasisPoints: percentAmount(0),
    creators: args.creators ?? [{ address: umi.identity.publicKey, verified: true, share: 100 }],
    collection: none(),
    uses: none(),
    primarySaleHappened: false,
    isMutable: true,
    decimals: 0,
  });
  const sig = await tx.sendAndConfirm(umi, { confirm: { commitment: 'confirmed' } });
  return { collection: mint.publicKey, signature: sig.signature };
}
