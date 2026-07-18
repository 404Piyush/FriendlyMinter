import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createMerkleTree } from '@/lib/server/collections';
import { isBackendLive } from '@/lib/server/umi';
import { getDeployerPubkey } from '@/lib/server/wallet';
import { accountUrl, explorerUrl } from '@/lib/server/umi';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  name: z.string().min(1).max(64),
  symbol: z.string().min(1).max(10),
  description: z.string().max(500).optional(),
  image: z.string().url().optional(),
  maxDepth: z.number().int().min(3).max(30),
  maxBufferSize: z.number().int().min(1).max(2048),
  canopyDepth: z.number().int().min(0).max(20),
});

export async function POST(req: NextRequest) {
  if (!isBackendLive()) {
    return NextResponse.json(
      { error: 'BACKEND_LIVE=false', code: 'BACKEND_DISABLED' },
      { status: 503 }
    );
  }

  let parsed;
  try {
    const json = await req.json();
    parsed = bodySchema.parse(json);
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid request body', details: (err as Error).message },
      { status: 400 }
    );
  }

  try {
    const result = await createMerkleTree({
      maxDepth: parsed.maxDepth,
      maxBufferSize: parsed.maxBufferSize,
      canopyDepth: parsed.canopyDepth,
    });

    return NextResponse.json({
      ok: true,
      collection: {
        name: parsed.name,
        symbol: parsed.symbol,
        description: parsed.description ?? '',
        image: parsed.image ?? '',
        treeAddress: result.treeAddress,
        treeAuthority: result.treeAuthority,
        creator: getDeployerPubkey(),
        maxDepth: parsed.maxDepth,
        maxBufferSize: parsed.maxBufferSize,
        canopyDepth: parsed.canopyDepth,
        signature: result.signature,
        explorer: explorerUrl(result.signature),
        treeExplorer: accountUrl(result.treeAddress),
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    const message = (err as Error).message;
    console.error('[/api/collections POST]', message);
    return NextResponse.json(
      { error: 'Failed to create Merkle tree', details: message },
      { status: 500 }
    );
  }
}