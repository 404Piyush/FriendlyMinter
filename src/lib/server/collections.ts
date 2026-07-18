import 'server-only';
import { createTree } from '@metaplex-foundation/mpl-bubblegum';
import { generateSigner } from '@metaplex-foundation/umi';
import { getUmi, isBackendLive, signatureToBase58 } from './umi';

export interface CreateTreeInput {
  maxDepth: number;
  maxBufferSize: number;
  canopyDepth: number;
}

export interface CreateTreeResult {
  signature: string;
  treeAddress: string;
  treeAuthority: string;
}

/**
 * Create a Bubblegum Merkle tree on devnet. The deployer pays for the tree
 * account rent (which dominates the cost at deeper depths) and owns the
 * tree config PDA.
 */
export async function createMerkleTree(input: CreateTreeInput): Promise<CreateTreeResult> {
  if (!isBackendLive()) {
    throw new Error('BACKEND_LIVE=false; refusing to sign real transactions');
  }

  const umi = getUmi();

  const merkleTree = generateSigner(umi);

  const builder = await createTree(umi, {
    merkleTree,
    treeCreator: umi.identity,
    payer: umi.identity,
    maxDepth: input.maxDepth,
    maxBufferSize: input.maxBufferSize,
    canopyDepth: input.canopyDepth,
  });

  const result = await builder.sendAndConfirm(umi, {
    confirm: { commitment: 'confirmed' },
  });

  return {
    signature: signatureToBase58(result.signature),
    treeAddress: merkleTree.publicKey.toString(),
    treeAuthority: '',
  };
}