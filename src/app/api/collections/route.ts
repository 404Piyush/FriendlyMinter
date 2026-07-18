import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createMerkleTree } from "@/lib/server/collections";
import { isBackendLive, accountUrl, explorerUrl } from "@/lib/server/umi";
import { getDeployerPubkey } from "@/lib/server/wallet";
import { isValidTreeConfig, nearestValidConfig } from "@/lib/server/tree-config";
import { rateLimit, DEFAULT_BACKEND_LIMIT } from "@/lib/server/rate-limit";
import { verifySignedRequest, AuthError } from "@/lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 8 * 1024;

const bodySchema = z.object({
  name: z.string().min(1).max(64),
  symbol: z.string().min(1).max(10),
  description: z.string().max(500).optional(),
  image: z.string().url().optional(),
  maxDepth: z.number().finite().int().min(3).max(30),
  maxBufferSize: z.number().finite().int().min(1).max(2048),
  canopyDepth: z.number().finite().int().min(0).max(20),
});

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

  // Body-size cap before we even read it.
  const declaredLength = Number(req.headers.get("content-length") ?? "0");
  if (declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: "BODY_TOO_LARGE" },
      { status: 413 }
    );
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

  let walletPubkey: string;
  try {
    const pk = await verifySignedRequest(signed, rawBody);
    walletPubkey = pk.toBase58();
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { error: "AUTH_REJECTED", code: err.code },
        { status: 401 }
      );
    }
    console.error("[/api/collections POST] auth verify failed");
    return NextResponse.json(
      { error: "AUTH_REJECTED", code: "VERIFY_FAILED" },
      { status: 401 }
    );
  }
  // --------------------------------------------------------------------

  let parsed;
  try {
    parsed = bodySchema.parse(JSON.parse(rawBody));
  } catch {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  }

  if (!isValidTreeConfig(parsed.maxDepth, parsed.maxBufferSize)) {
    const suggested = nearestValidConfig(parsed.maxDepth, parsed.maxBufferSize);
    return NextResponse.json(
      {
        error: "INVALID_TREE_CONFIG",
        suggested,
      },
      { status: 400 }
    );
  }

  if (parsed.canopyDepth >= parsed.maxDepth) {
    return NextResponse.json(
      {
        error: "INVALID_TREE_CONFIG",
        suggested: { ...parsed, canopyDepth: Math.max(0, parsed.maxDepth - 1) },
      },
      { status: 400 }
    );
  }

  if (parsed.image) {
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(parsed.image);
    } catch {
      return NextResponse.json(
        { error: "INVALID_IMAGE_URL" },
        { status: 400 }
      );
    }
    if (parsedUrl.protocol !== "https:") {
      return NextResponse.json(
        { error: "INVALID_IMAGE_URL" },
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
        description: parsed.description ?? "",
        image: parsed.image ?? "",
        treeAddress: result.treeAddress,
        treeAuthority: result.treeAuthority,
        creator: getDeployerPubkey(),
        creatorSigner: walletPubkey,
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
    const e = err as Error;
    console.error("[/api/collections POST]", e.message);
    return NextResponse.json(
      { error: "TREE_CREATE_FAILED" },
      { status: 500 }
    );
  }
}