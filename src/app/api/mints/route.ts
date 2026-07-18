import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PublicKey } from '@solana/web3.js';
import { mintCompressedNft } from '@/lib/server/mints';
import { isBackendLive, explorerUrl } from '@/lib/server/umi';
import { rateLimit, DEFAULT_BACKEND_LIMIT } from '@/lib/server/rate-limit';

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

/**
 * Returns true if `s` is a string that can be parsed as a Solana public key.
 * Cheap guard against random bytes slipping into tx fields.
 */
function isPubkey(s: string): boolean {
  try {
    new PublicKey(s);
    return true;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!isBackendLive()) {
    return NextResponse.json(
      { error: 'BACKEND_LIVE=false', code: 'BACKEND_DISABLED' },
      { status: 503 }
    );
  }

  const limit = rateLimit(req, DEFAULT_BACKEND_LIMIT);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many requests', details: `Retry in ${limit.retryAfterSec}s.` },
      {
        status: 429,
        headers: {
          'Retry-After': String(limit.retryAfterSec),
          'X-RateLimit-Remaining': '0',
        },
      }
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

  if (!isPubkey(parsed.treeAddress) || !isPubkey(parsed.leafOwner)) {
    return NextResponse.json(
      { error: 'Invalid public key', details: 'treeAddress and leafOwner must be base58 public keys.' },
      { status: 400 }
    );
  }
  for (const c of parsed.creators) {
    if (!isPubkey(c.address)) {
      return NextResponse.json(
        { error: 'Invalid creator address', details: 'Each creator address must be a base58 public key.' },
        { status: 400 }
      );
    }
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
    const e = err as Error;
    console.error('[/api/mints POST]', e.message);
    return NextResponse.json(
      {
        error: 'Mint failed',
        details: process.env.NODE_ENV === 'development' ? e.message : 'Internal error',
      },
      { status: 500 }
    );
  }
}