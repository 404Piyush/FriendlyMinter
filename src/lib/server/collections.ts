import "server-only";
import { createTree } from "@metaplex-foundation/mpl-bubblegum";
import { generateSigner } from "@metaplex-foundation/umi";
import { getUmi, isBackendLive, signatureToBase58 } from "./umi";

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

export async function createMerkleTree(input: CreateTreeInput): Promise<CreateTreeResult> {
  if (!isBackendLive()) {
    throw new Error("BACKEND_LIVE=false");
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
    confirm: { commitment: "confirmed" },
  });

  return {
    signature: signatureToBase58(result.signature),
    treeAddress: merkleTree.publicKey.toString(),
    treeAuthority: merkleTree.publicKey.toString(),
  };
}