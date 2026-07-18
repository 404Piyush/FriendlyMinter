import { NextRequest, NextResponse } from 'next/server';

/**
 * Adds baseline security headers to every response. CSP is intentionally
 * permissive for a wallet-connected dApp — we need to allow:
 *   - connect-src https://api.devnet.solana.com, https://explorer.solana.com
 *   - img-src https: data: (NFT covers, IPFS gateways, etc.)
 *   - frame-src https://phantom.app (iframed wallet modal)
 *   - script-src 'self' 'unsafe-inline' 'unsafe-eval' (Next.js dev mode + wallet adapters)
 *
 * For a stricter policy, move scripts to a nonce-based CSP and remove the
 * unsafe-* allowances. Out of scope here.
 */
export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  return res;
}

export const config = {
  matcher: [
    // Run on every request except static assets and the wallet iframe.
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};