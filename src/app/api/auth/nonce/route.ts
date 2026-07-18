import { NextResponse } from "next/server";
import { isBackendLive } from "@/lib/server/umi";
import { issueNonce } from "@/lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  if (!isBackendLive()) {
    return NextResponse.json(
      { error: "BACKEND_DISABLED", code: "BACKEND_DISABLED" },
      { status: 503 }
    );
  }
  const { nonce, issuedAt } = issueNonce();
  return NextResponse.json({ nonce, issuedAt, ttlMs: 5 * 60 * 1000 });
}