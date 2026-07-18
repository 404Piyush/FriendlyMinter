import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PublicKey } from "@solana/web3.js";
import { mintCompressedNft } from "@/lib/server/mints";
import { isBackendLive, explorerUrl } from "@/lib/server/umi";
import { rateLimit, DEFAULT_BACKEND_LIMIT } from "@/lib/server/rate-limit";
import { parseBody } from "@/lib/server/parse-body";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const mintSchema = z.object({
  treeAddress: z.string().min(32).max(64),
  leafOwner: z.string().min(32).max(64),
  name: z.string().min(1).max(64),
  symbol: z.string().min(1).max(10),
  uri: z.string().url().optional(),
  metadataUri: z.string().url().optional(),
  sellerFeeBasisPoints: z.number().finite().int().min(0).max(10000).default(0),
  creators: z
    .array(
      z.object({
        address: z.string().min(32),
        verified: z.boolean(),
        share: z.number().finite().int().min(0).max(100),
      })
    )
    .default([]),
});

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
      { error: "BACKEND_DISABLED", code: "BACKEND_DISABLED" },
      { status: 503 }
    );
  }

  const limit = rateLimit(req, DEFAULT_BACKEND_LIMIT);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "RATE_LIMITED", retryAfterSec: limit.retryAfterSec },
      {
        status: 429,
        headers: {
          "Retry-After": String(limit.retryAfterSec),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  const parsed = await parseBody(req, mintSchema);
  if (!parsed.ok) return parsed.response;
  const body = parsed.body;

  if (!isPubkey(body.treeAddress) || !isPubkey(body.leafOwner)) {
    return NextResponse.json({ error: "INVALID_PUBKEY" }, { status: 400 });
  }
  for (const c of body.creators) {
    if (!isPubkey(c.address)) {
      return NextResponse.json({ error: "INVALID_PUBKEY" }, { status: 400 });
    }
  }

  try {
    const result = await mintCompressedNft({
      ...body,
      uri: body.uri ?? "",
      metadataUri: body.metadataUri ?? "",
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
    console.error("[/api/mints POST]", (err as Error).message);
    return NextResponse.json({ error: "MINT_FAILED" }, { status: 500 });
  }
}