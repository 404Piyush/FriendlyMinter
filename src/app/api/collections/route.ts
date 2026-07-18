import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createMerkleTree } from "@/lib/server/collections";
import { isBackendLive, accountUrl, explorerUrl } from "@/lib/server/umi";
import { getDeployerPubkey } from "@/lib/server/wallet";
import { isValidTreeConfig, nearestValidConfig } from "@/lib/server/tree-config";
import { rateLimit, DEFAULT_BACKEND_LIMIT } from "@/lib/server/rate-limit";
import { parseBody } from "@/lib/server/parse-body";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  const parsed = await parseBody(req, bodySchema);
  if (!parsed.ok) return parsed.response;
  const body = parsed.body;
  const walletPubkey = parsed.pubkey;

  if (!isValidTreeConfig(body.maxDepth, body.maxBufferSize)) {
    const suggested = nearestValidConfig(body.maxDepth, body.maxBufferSize);
    return NextResponse.json(
      { error: "INVALID_TREE_CONFIG", suggested },
      { status: 400 }
    );
  }

  if (body.canopyDepth >= body.maxDepth) {
    return NextResponse.json(
      {
        error: "INVALID_TREE_CONFIG",
        suggested: { ...body, canopyDepth: Math.max(0, body.maxDepth - 1) },
      },
      { status: 400 }
    );
  }

  if (body.image) {
    try {
      const u = new URL(body.image);
      if (u.protocol !== "https:") {
        return NextResponse.json(
          { error: "INVALID_IMAGE_URL" },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: "INVALID_IMAGE_URL" },
        { status: 400 }
      );
    }
  }

  try {
    const result = await createMerkleTree({
      maxDepth: body.maxDepth,
      maxBufferSize: body.maxBufferSize,
      canopyDepth: body.canopyDepth,
    });

    return NextResponse.json({
      ok: true,
      collection: {
        name: body.name,
        symbol: body.symbol,
        description: body.description ?? "",
        image: body.image ?? "",
        treeAddress: result.treeAddress,
        treeAuthority: result.treeAuthority,
        creator: getDeployerPubkey(),
        creatorSigner: walletPubkey,
        maxDepth: body.maxDepth,
        maxBufferSize: body.maxBufferSize,
        canopyDepth: body.canopyDepth,
        signature: result.signature,
        explorer: explorerUrl(result.signature),
        treeExplorer: accountUrl(result.treeAddress),
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("[/api/collections POST]", (err as Error).message);
    return NextResponse.json(
      { error: "TREE_CREATE_FAILED" },
      { status: 500 }
    );
  }
}