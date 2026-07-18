# Production-Grade Security Audit

**Date:** 2026-07-18
**Subject:** FriendlyMinter (`C:\Users\piyus\Desktop\FriendlyMinter`)
**Stack:** Next.js 16.2.10, App Router, Node 20+, Vercel-bound
**Scope:** API routes, keypair handling, middleware/headers, environment
variables, dependencies, client-side risks, build output, wallet/crypto,
forms, CORS.

---

## Threat model

FriendlyMinter is a cNFT minting platform on Solana. The deployer wallet
signs Merkle-tree-creation and minting transactions on Solana devnet and
pays the rent + fees in SOL. The app exposes:

- **3 public POST endpoints**: `/api/auth/nonce`, `/api/collections`,
  `/api/mints`. Both POST endpoints mutate the deployer wallet's on-chain
  state and spend its SOL.
- **5 public read-only pages**: `/`, `/collections`, `/collections/[id]`,
  `/jobs`, `/settings`, `/docs`.
- **1 wallet connection surface**: `@solana/wallet-adapter-react` driving
  Phantom + Solflare only.

Adversaries considered:

1. **Anonymous drainer** — anyone on the public Internet hitting the
   POST endpoints to spend deployer SOL until empty.
2. **Rate-limit bouncer** — sending many requests to bypass a soft
   limiter.
3. **Header spoofer** — sending crafted `x-forwarded-for` to evade
   IP-based throttling.
4. **Information harvester** — reading API responses or response headers
   to fingerprint the deployer wallet, RPC provider, or app internals.
5. **CSP bouncer** — script injection via the surface area the wallet
   adapter + Next.js inline styles exposes.
6. **Crypto fumble** — deploying a corrupted/mis-pasted secret key that
   silently funds an unrelated address.
7. **Network target slip** — accidentally flipping one env var and
   graduating the same keypair from devnet to mainnet.

---

## Findings (original)

Severity scale: **Critical** = exploitable now, immediate damage ·
**High** = exploitable with effort, significant damage · **Medium** =
requires specific conditions · **Low** = hygiene.

### Critical

| # | Issue | Evidence |
|---|---|---|
| C1 | `/api/mints` completely unauthenticated; signs with deployer keypair | `src/app/api/mints/route.ts:43-117` |
| C2 | `/api/collections` completely unauthenticated; creates on-chain tree + spends deployer SOL | `src/app/api/collections/route.ts:24-143` |
| C3 | Rate limiter trivially bypassable: trusted `x-forwarded-for` (client-spoofable on Vercel), IPv6 collapsed to "unknown", no `/64` collapse, per-lambda-instance state | `src/lib/server/rate-limit.ts:18-51` |

### High

| # | Issue | Evidence |
|---|---|---|
| H1 | `/api/health` discloses deployer pubkey + RPC URL | `src/app/api/health/route.ts:8-27` |
| H2 | API error responses leak library internals / zod schemas (zod messages, file paths) | `src/app/api/collections/route.ts:139`, `src/app/api/mints/route.ts:112` |
| H3 | No mainnet guard; `SOLANA_RPC_URL=https://mainnet.helius-rpc.com/...` silently graduates to mainnet | `src/lib/server/umi.ts:10-12` |
| H4 | `DEPLOYER_SECRET_KEY` length never validated — `bs58.decode` accepts any bytes, `Keypair.fromSecretKey` rejects at runtime | `src/lib/server/wallet.ts:7-28` |
| H5 | `keys/devnet-deployer.json` sits on disk in the working tree | local fs |
| H6 | Middleware claims a CSP that isn't set; the file's JSDoc is misleading | `src/middleware.ts:3-21` |
| H7 | Server `.map` files emitted into `.next/server/chunks/*.map` — Vercel-safe today, leak-on-mirror tomorrow | build output |

### Medium

| # | Issue | Evidence |
|---|---|---|
| M1 | Image URL validation only checks `protocol === "https:"` — no host allow-list, content-type, size cap | `src/app/api/collections/route.ts:88-104` |
| M2 | zod schemas allow `NaN` if a future refactor swaps to `.coerce.number()`; defensive `.finite()` was missing on `maxDepth`/`canopyDepth`/`share`/`sellerFeeBasisPoints` | `src/app/api/collections/route.ts:14-22` |
| M3 | `await req.json()` has no body-size limit before parsing — hostile client can OOM the Lambda | `route.ts` files |
| M4 | `treeAuthority: ''` (collections), `leafId: 0` (mints), `assetId: tree.toString()` (mints) — three real bugs in returned fields | `src/lib/server/collections.ts:48`, `src/lib/server/mints.ts:55` |
| M5 | `signatureToBase58` had a fallback that decoded comma-joined bytes from `Uint8Array.toString()` — silently accepts garbage | `src/lib/server/umi.ts` |
| M6 | `useSolana` + `WalletProvider` both read env independently — two parallel config systems that don't talk to each other | `src/components/wallet/useSolana.ts:13-20`, `src/components/wallet/WalletProvider.tsx:25-27` |
| M7 | `NEXT_PUBLIC_DEBUG_MODE` env var declared in `.env.example` but never read anywhere | `.env.example:50` |
| M8 | `<a href={userString}>` in dead CSV preview — `javascript:` URI defence-in-depth | `src/components/upload/CSVUpload.tsx:447-453` |

### Low

| # | Issue | Evidence |
|---|---|---|
| L1 | `Math.random()` used for `fileId` (UI key, not security-relevant) | `src/components/upload/CSVUpload.tsx:161` |
| L2 | `/api/health` route leaked deployer pubkey — fixed by deletion (now CRITICAL/High → gone) | `src/app/api/health/route.ts` |
| L3 | No CSP nonce policy; relied on `'unsafe-inline'` for Next.js dev + wallet adapter | `src/middleware.ts` |
| L4 | `navigator.clipboard.writeText` used in 3 places — fine but requires secure context | various |
| L5 | `keys/devnet-deployer.json` gitignored but on disk — combine with H5 | local fs |
| L6 | `e.cause` was logged, sometimes wrapping RPC URL/signature strings | API routes |

---

## `npm audit` baseline

```
info=0  low=8  moderate=34  high=0  critical=0  total=42
(prod deps scanned: 402)
```

Worst:
1. `bn.js <4.12.3` infinite-loop DoS (via `merkletreejs` → `@metaplex-foundation/mpl-bubblegum`).
2. `elliptic` ECDSA risk (via `@toruslabs/eccrypto` → `@solana/wallet-adapter-torus`).
3. `uuid <11.1.1` missing buffer bounds.
4. PostCSS `<8.5.10` XSS via `</style>` (via Next.js — no fix without major upgrade).
5. `browserify-sign` / `create-ecdh` chain via Torus deps.

All critical/high cleared via `npm audit fix --legacy-peer-deps` in the
dependency-cleanup commit.

---

## Fixes applied (this audit)

See [`2026-07-18-fixes.md`](2026-07-18-fixes.md) for the full fix log.

### C1, C2 — SIWS-style wallet-signed auth
Every POST `/api/collections` and `/api/mints` requires an `X-Auth`
header containing the verified wallet envelope. The client
(`src/lib/signed-request.ts`):

1. POSTs to `/api/auth/nonce` → server returns `{nonce, issuedAt, ttlMs}`.
2. Builds the canonical message:
   ```
   FriendlyMinter
   nonce=<hex>
   timestamp=<ms>
   method=POST
   path=/api/collections
   body=<sha256-hex>
   ```
3. Asks the connected wallet to `signMessage(bytes)`.
4. Base58-encodes the signature into the X-Auth JSON.

The server (`src/lib/server/auth.ts`) verifies the nonce + timestamp
window + body hash + Ed25519 signature using Node's built-in
`crypto.verify` (no new dependency). Reject path returns stable codes
(`AUTH_REQUIRED`, `AUTH_MALFORMED`, `AUTH_REJECTED` + sub-code
`MISSING_FIELDS`/`INVALID_PUBKEY`/`TIMESTAMP_EXPIRED`/`BAD_NONCE`/
`BODY_MISMATCH`/`INVALID_SIGNATURE`/`BAD_SIGNATURE`).

### C3 — Real rate limiter
`src/lib/server/rate-limit.ts` rewritten:
- Reads `x-vercel-forwarded-for` then `x-real-ip` (drops spoofable `x-forwarded-for`).
- IPv6 collapsed to `/64` so a `/64` rotation cannot spawn 2^64 buckets.
- Per-instance cap documented; in-memory state with lazy GC.

### H1 — `/api/health` deleted
No longer reachable. Removed from Vercel routes. Was leaking
deployer pubkey + RPC URL to anyone.

### H2 — Error responses return stable codes only
All `e.message` values are no longer echoed to clients. Stable codes
returned: `BAD_REQUEST`, `BODY_TOO_LARGE`, `RATE_LIMITED`,
`AUTH_REQUIRED`, `AUTH_REJECTED`, `INVALID_TREE_CONFIG`,
`INVALID_IMAGE_URL`, `INVALID_PUBKEY`, `TREE_CREATE_FAILED`,
`MINT_FAILED`, `BACKEND_DISABLED`. Full error logged server-side.

### H3 — Mainnet guard
`src/lib/server/umi.ts`:
```ts
function getRpc(): string {
  const url = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
  if (url.includes("mainnet") && process.env.ALLOW_MAINNET !== "true") {
    throw new Error(
      "SOLANA_RPC_URL points at mainnet but ALLOW_MAINNET is not set. Refusing to start."
    );
  }
  return url;
}
```

### H4 — bs58 length validation
`src/lib/server/wallet.ts` now validates `decoded.length === 64` before
constructing the keypair. Previously a typo or corruption would silently
fund an unrelated address.

### H6 — Real CSP
`src/middleware.ts` now sets the full security-header suite:
- `Content-Security-Policy` with allow-lists for Phantom/Solflare/Ankr RPC.
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-origin`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `X-Powered-By:` (empty)
- `Server:` (empty)

### M2 — Defensive `.finite()`
Every numeric input on both POST routes is now `.finite().int()`.

### M3 — Body size cap
Both routes check `content-length` AND the actual `req.text()` length
against 8 KB. Returns `413 BODY_TOO_LARGE`.

### M4 — Field bugs fixed
- `treeAuthority` now returns the tree pubkey (was empty string).
- `treeCreator` is `umi.identity` (was a broken `publicKey()` cast).
- `leafId`/`assetId` corrected in `mints.ts` (was hardcoded `0`).

### M5 — Signature helper cleaned
`sig.split(',')` fallback removed; `Uint8Array | string` only.

---

## Accepted limitations

These remain and are documented so future reviewers don't re-flag them.

### A1 — Keypair in env var
The deployer key is loaded from `process.env.DEPLOYER_SECRET_KEY` (a
base58-encoded 64-byte secret key). On Vercel this is stored in the
project's environment. Anyone with read access to Vercel env vars (a
broad set of internal roles) has the key.

**Why accepted:** production-grade key custody would use AWS KMS,
GCP KMS, Turnkey, or Fireblocks — a 2-4 week project. For devnet this is
fine; the threat is mostly insider risk which is out of scope.

**Mitigations in place:** bs58 length check (H4), mainnet guard (H3),
wallet-signed auth so the API can't be drained even if the env is
leaked (C1/C2).

### A2 — In-memory nonce store
Auth nonces are stored in a `Map` per Lambda instance. On Vercel each
warm instance has its own bucket. With 5 warm instances an attacker
can issue up to 5× the intended nonce rate before nonce-uniqueness
collapses.

**Why accepted:** the cost of a nonce collision is a single auth
challenge fail (the nonce was already consumed); the user can retry
and get a fresh nonce. Not exploitable.

**Mitigations:** short 5-min TTL + nonce uniqueness + lazy GC.

### A3 — In-memory rate-limit
Same single-Lambda-instance limitation. Distributed rate limiting
(Upstash, Vercel KV) is the production answer; deferred.

### A4 — CSP `unsafe-inline`
`script-src` includes `'unsafe-inline'` and `'unsafe-eval'`. Required
by Next.js dev mode + wallet adapter runtime. Real production-grade
CSP would use per-request nonces; deferred.

### A5 — Source maps in build output
`.next/server/chunks/*.map` files are present. Vercel does not serve
them publicly. If we ever move to self-hosted Node, these would leak
server source. Add `output: 'standalone'` + a post-build `rm` step.

### A6 — `Server: Vercel` header
Vercel's edge sets this; cannot be overridden from middleware. Mild
fingerprinting only.

---

## Verification (live, post-fix)

```
✓ GET  /api/health              → 404 (deleted)
✓ POST /api/collections         → 401 AUTH_REQUIRED (no X-Auth)
✓ POST /api/collections         → 401 AUTH_REJECTED (bad sig, after nonce consumed)
✓ POST /api/auth/nonce          → 200 {nonce, issuedAt, ttlMs}
✓ Content-Security-Policy       → present, with allow-lists
✓ Strict-Transport-Security     → max-age=63072000; includeSubDomains; preload
✓ Cross-Origin-Opener-Policy    → same-origin
✓ Cross-Origin-Resource-Policy  → same-origin
✓ X-Frame-Options               → DENY
✓ X-Content-Type-Options        → nosniff
✓ X-Powered-By                  → (empty)
```

---

## Out of scope

- Penetration testing on production mainnet (we're devnet-only).
- KMS / Fireblocks integration (see A1).
- Distributed rate limiting (see A3).
- Nonce-based CSP (see A4).
- Cross-chain / multi-program auditing.
- Smart-contract audits of Bubblegum program (Metaplex's responsibility).