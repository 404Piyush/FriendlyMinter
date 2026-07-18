# Security Policy

## Supported versions

| Version | Supported |
|---|---|
| `master` (production at https://friendlyminter.vercel.app) | ✅ |
| Older | ❌ |

This is an open-source project; only the latest `master` receives
security fixes.

## Reporting a vulnerability

**Please do not open a public GitHub issue for security problems.**

Email: **piyush@404piyush.dev** (replace with the maintainer's
actual address before publishing; placeholder is obvious).

Include:

- Description of the vulnerability.
- Steps to reproduce.
- Affected endpoint(s) and file(s) (`file:line` if known).
- Attack scenario (what's the realistic impact).
- Whether you've tested the issue.

You should receive an acknowledgement within **72 hours**.

## Response timeline

| Phase | Time |
|---|---|
| Acknowledge | within 72 hours |
| Triage + severity | within 7 days |
| Fix Critical | within 7 days |
| Fix High | within 30 days |
| Fix Medium / Low | next release |

## Audits

Formal security audits live in [`audits/`](./audits/). The most recent:

- [`audits/2026-07-18-security-audit.md`](./audits/2026-07-18-security-audit.md)
- [`audits/2026-07-18-code-audit.md`](./audits/2026-07-18-code-audit.md)
- [`audits/2026-07-18-fixes.md`](./audits/2026-07-18-fixes.md)

## Threat model

FriendlyMinter signs Solana devnet transactions on behalf of users via
a deployer keypair held in Vercel environment variables. The threat
model focuses on:

- Anonymous POST flooding to drain the deployer wallet.
- Bypassing the per-IP rate limiter.
- Header spoofing to evade rate limiting.
- Information disclosure via API responses or response headers.
- Cross-site script injection via the wallet adapter surface.
- Crypto-fumble (corrupted/mis-pasted secret keys).
- Accidentally graduating the deployer key from devnet to mainnet.

Production mainnet launches require a separate audit cycle including
key-custody review (KMS, Fireblocks, Turnkey) and SIWS-derived nonce
storage (Upstash / Vercel KV).

## Accepted limitations

These remain by design and are documented in the audit:

1. **Keypair in env var** — production custody would use KMS / Fireblocks.
2. **In-memory nonce store** — Vercel Lambda instances each hold their
   own nonce map. A distributed store (Upstash Redis, Vercel KV) is the
   production answer.
3. **In-memory rate-limit** — same single-instance limitation.
4. **CSP `unsafe-inline`** — required by Next.js dev mode + wallet
   adapter runtime. Real production CSP would use per-request nonces.
5. **Source maps in build output** — `.next/server/chunks/*.map`
   files are emitted but Vercel does not serve them publicly.

## Security header suite (live on every response)

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.phantom.app https://*.solflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://api.devnet.solana.com https://explorer.solana.com https://*.helius-rpc.com https://*.ankr.com wss://*.ankr.com; frame-src https://phantom.app https://*.solflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
X-Powered-By: (empty)
Server: (empty)
```

## What we **don't** need a CVE for

- **Vulnerabilities in upstream dependencies** — please report to the
  upstream maintainer. We're consumers, not maintainers.
- **Vulnerabilities in `@solana/web3.js`, `@metaplex-foundation/*`, or
  Bubblegum program** — same; report upstream.

## Recognition

We don't run a paid bug bounty. We will, however:

- Credit you in the audit's "fixed by" line if you wish.
- Send you a FriendlyMinter NFT (when we have one).
- Mention your handle in the next release notes (with permission).

Thanks for keeping FriendlyMinter and its users safe.