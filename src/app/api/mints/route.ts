import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { mintCompressedNft } from '@/lib/server/mints';
import { isBackendLive, explorerUrl } from '@/lib/server/umi';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const mintSchema = z.object({
  treeAddress: z.string().min(32).max(64),
  leafOwner: z.string().min(32).max(64),
  name: z.string().min(1).max(64),
  symbol: z.string().min(1).max(10),
  uri: z.string().url().optional(),
  metadataUri: z.string().url().optional(),
  sellerFeeBasisPoints: z.number().int().min(0).max(10000).default(0),
  creators: z
    .array(
      z.object({
        address: z.string().min(32),
        verified: z.boolean(),
        share: z.number().int().min(0).max(100),
      })
    )
    .default([]),
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
    parsed = mintSchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid mint request', details: (err as Error).message },
      { status: 400 }
    );
  }

  try {
    const result = await mintCompressedNft({
      ...parsed,
      uri: parsed.uri ?? '',
      metadataUri: parsed.metadataUri ?? '',
    });
    return NextResponse.json({
      ok: true,
      mint: {
        signature: result.signature,
        leafId: result.leafId,
        assetId: result.assetId,
        explorer: explorerUrl(result.signature),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    const message = (err as Error).message;
    console.error('[/api/mints POST]', message);
    return NextResponse.json(
      { error: 'Mint failed', details: message },
      { status: 500 }
    );
  }
}