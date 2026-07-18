import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PublicKey } from "@solana/web3.js";
import { mintCompressedNft } from "@/lib/server/mints";
import { isBackendLive, explorerUrl } from "@/lib/server/umi";
import { rateLimit, DEFAULT_BACKEND_LIMIT } from "@/lib/server/rate-limit";
import { verifySignedRequest, AuthError } from "@/lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 8 * 1024;

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

  const declaredLength = Number(req.headers.get("content-length") ?? "0");
  if (declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "BODY_TOO_LARGE" }, { status: 413 });
  }
  const rawBody = await req.text();
  if (rawBody.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "BODY_TOO_LARGE" }, { status: 413 });
  }

  // ---- Auth (SIWS) ---------------------------------------------------
  const auth = req.headers.get("x-auth");
  if (!auth) {
    return NextResponse.json(
      { error: "AUTH_REQUIRED", code: "AUTH_REQUIRED" },
      { status: 401 }
    );
  }

  let signed: {
    pubkey: string;
    signature: string;
    nonce: string;
    timestamp: number;
    method: string;
    path: string;
    body: string;
  };
  try {
    signed = JSON.parse(auth);
  } catch {
    return NextResponse.json(
      { error: "AUTH_MALFORMED", code: "AUTH_MALFORMED" },
      { status: 401 }
    );
  }

  try {
    await verifySignedRequest(signed, rawBody);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { error: "AUTH_REJECTED", code: err.code },
        { status: 401 }
      );
    }
    console.error("[/api/mints POST] auth verify failed");
    return NextResponse.json(
      { error: "AUTH_REJECTED", code: "VERIFY_FAILED" },
      { status: 401 }
    );
  }
  // --------------------------------------------------------------------

  let parsed;
  try {
    parsed = mintSchema.parse(JSON.parse(rawBody));
  } catch {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  }

  if (!isPubkey(parsed.treeAddress) || !isPubkey(parsed.leafOwner)) {
    return NextResponse.json({ error: "INVALID_PUBKEY" }, { status: 400 });
  }
  for (const c of parsed.creators) {
    if (!isPubkey(c.address)) {
      return NextResponse.json({ error: "INVALID_PUBKEY" }, { status: 400 });
    }
  }

  try {
    const result = await mintCompressedNft({
      ...parsed,
      uri: parsed.uri ?? "",
      metadataUri: parsed.metadataUri ?? "",
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
    console.error("[/api/mints POST]", e.message);
    return NextResponse.json({ error: "MINT_FAILED" }, { status: 500 });
  }
}