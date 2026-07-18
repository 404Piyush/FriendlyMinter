import type { NextRequest } from 'next/server';

// Tiny in-memory token bucket. Vercel serverless functions can have multiple
// instances, so this is best-effort — a determined attacker with enough
// parallel requests will still drain the bucket. For a public-facing production
// backend you should pair this with Vercel Firewall or Cloudflare rate limits.
const buckets = new Map<string, { tokens: number; updatedAt: number }>();

interface RateLimitConfig {
  /** tokens per window */
  refill: number;
  /** window in milliseconds */
  windowMs: number;
  /** max burst */
  capacity: number;
}

export function rateLimit(
  req: NextRequest,
  config: RateLimitConfig
): { ok: boolean; remaining: number; retryAfterSec: number } {
  // Use IP from common proxy headers first, then fall back to a generic key.
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
  const key = `${ip}`;
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

// Reasonable defaults for a public dApp backend:
//   5 requests / minute, burst up to 5.
// Anything that hits Bubblegum is expensive; if a real user is creating a
// collection faster than once per 12s they can wait.
export const DEFAULT_BACKEND_LIMIT: RateLimitConfig = {
  refill: 5,
  windowMs: 60_000,
  capacity: 5,
};