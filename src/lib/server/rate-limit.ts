import type { NextRequest } from "next/server";

interface RateLimitConfig {
  /** tokens per window */
  refill: number;
  /** window in milliseconds */
  windowMs: number;
  /** max burst */
  capacity: number;
}

interface Bucket {
  tokens: number;
  updatedAt: number;
}

const buckets = new Map<string, Bucket>();

/**
 * Normalise an IP address for rate-limit bucketing.
 * - IPv4: returned as-is
 * - IPv6: collapsed to /64 (the user-facing prefix). A rotating
 *   attacker inside a single /64 can still abuse this, but they can't
 *   spray 2^64 keys.
 * - Anything else: null (caller will fall back to a shared bucket).
 */
function normaliseIp(ip: string | null): string | null {
  if (!ip) return null;
  const trimmed = ip.trim();
  if (!trimmed) return null;
  if (trimmed.includes(".")) {
    // IPv4
    const parts = trimmed.split(".");
    if (parts.length !== 4 || parts.some((p) => !/^\d+$/.test(p))) return null;
    return trimmed;
  }
  if (trimmed.includes(":")) {
    // IPv6: keep first 4 groups (= /64)
    const groups = trimmed.split(":").slice(0, 4).join(":");
    return groups.toLowerCase();
  }
  return null;
}

/**
 * Extract a stable client IP from a Vercel-routed request.
 * Order:
 *   1. x-vercel-forwarded-for (Vercel-managed; not spoofable when set)
 *   2. x-real-ip (common upstream proxy header)
 *   3. null (caller collapses to shared bucket)
 *
 * NOTE: x-forwarded-for is intentionally NOT trusted because clients
 * can set it themselves when hitting Vercel directly.
 */
function getClientIp(req: NextRequest): string | null {
  const vercel = req.headers.get("x-vercel-forwarded-for");
  if (vercel) return normaliseIp(vercel.split(",")[0] ?? null);
  const real = req.headers.get("x-real-ip");
  if (real) return normaliseIp(real.split(",")[0] ?? null);
  return null;
}

export function rateLimit(
  req: NextRequest,
  config: RateLimitConfig,
): { ok: boolean; remaining: number; retryAfterSec: number } {
  const ip = getClientIp(req);
  const key = ip ?? "__shared__";
  const now = Date.now();

  const bucket = buckets.get(key) ?? {
    tokens: config.capacity,
    updatedAt: now,
  };
  const elapsed = now - bucket.updatedAt;
  const refill = (elapsed / config.windowMs) * config.refill;
  bucket.tokens = Math.min(config.capacity, bucket.tokens + refill);
  bucket.updatedAt = now;

  if (bucket.tokens < 1) {
    buckets.set(key, bucket);
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.ceil(((1 - bucket.tokens) / config.refill) * config.windowMs / 1000),
    };
  }

  bucket.tokens -= 1;
  buckets.set(key, bucket);
  return { ok: true, remaining: Math.floor(bucket.tokens), retryAfterSec: 0 };
}

export const DEFAULT_BACKEND_LIMIT: RateLimitConfig = {
  refill: 5,
  windowMs: 60_000,
  capacity: 5,
};