import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PublicKey } from '@solana/web3.js';
import { createMerkleTree } from '@/lib/server/collections';
import { isBackendLive } from '@/lib/server/umi';
import { getDeployerPubkey } from '@/lib/server/wallet';
import { accountUrl, explorerUrl } from '@/lib/server/umi';
import { isValidTreeConfig, nearestValidConfig } from '@/lib/server/tree-config';
import { rateLimit, DEFAULT_BACKEND_LIMIT } from '@/lib/server/rate-limit';

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

  // Rate-limit BEFORE doing any expensive work. The deployer wallet pays real
  // SOL for every tree creation, so an unprotected endpoint can drain it.
  const limit = rateLimit(req, DEFAULT_BACKEND_LIMIT);
  if (!limit.ok) {
    return NextResponse.json(
      {
        error: 'Too many requests',
        details: `Rate limit exceeded. Try again in ${limit.retryAfterSec}s.`,
      },
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
    const json = await req.json();
    parsed = bodySchema.parse(json);
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid request body', details: (err as Error).message },
      { status: 400 }
    );
  }

  if (!isValidTreeConfig(parsed.maxDepth, parsed.maxBufferSize)) {
    const suggested = nearestValidConfig(parsed.maxDepth, parsed.maxBufferSize);
    return NextResponse.json(
      {
        error: 'Invalid tree config',
        details: `Bubblegum does not accept (maxDepth=${parsed.maxDepth}, maxBufferSize=${parsed.maxBufferSize}).`,
        suggested,
      },
      { status: 400 }
    );
  }

  // Bubblegum also requires canopy depth to be strictly less than max depth.
  if (parsed.canopyDepth >= parsed.maxDepth) {
    return NextResponse.json(
      {
        error: 'Invalid tree config',
        details: `canopyDepth (${parsed.canopyDepth}) must be less than maxDepth (${parsed.maxDepth}).`,
        suggested: { ...parsed, canopyDepth: Math.max(0, parsed.maxDepth - 1) },
      },
      { status: 400 }
    );
  }

  // If the user provided an image URL, restrict to https:// to prevent
  // javascript:/data:/file: schemes being smuggled into metadata later.
  if (parsed.image) {
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(parsed.image);
    } catch {
      return NextResponse.json(
        { error: 'Invalid image URL', details: 'Image URL must be a valid absolute URL.' },
        { status: 400 }
      );
    }
    if (parsedUrl.protocol !== 'https:') {
      return NextResponse.json(
        { error: 'Invalid image URL', details: 'Image URL must use https://' },
        { status: 400 }
      );
    }
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
    const e = err as Error & { cause?: unknown };
    console.error('[/api/collections POST]', e.message, e.cause);
    // Don't leak stack traces or library internals in the response body.
    return NextResponse.json(
      {
        error: 'Failed to create Merkle tree',
        details: process.env.NODE_ENV === 'development' ? e.message : 'Internal error',
      },
      { status: 500 }
    );
  }
}