# FriendlyMinter

> Compressed-NFT (cNFT) minting platform for Solana. Mint thousands of NFTs at ~99% lower cost than a traditional Solana mint, with live cost estimation and a wallet-first UI.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Solana](https://img.shields.io/badge/Solana-Devnet-9945ff?logo=solana)
![License](https://img.shields.io/badge/license-MIT-green)

[Live Demo](https://friendlyminter.vercel.app) · [Report Bug](https://github.com/404Piyush/FriendlyMinter/issues) · [Request Feature](https://github.com/404Piyush/FriendlyMinter/issues) · [Security Policy](./SECURITY.md)

---

## What is FriendlyMinter?

A friendly UI on top of the [Metaplex Bubblegum](https://docs.metaplex.com/programs/token-metadata/bubblegum) standard. It hides the gnarly Merkle-tree bookkeeping behind:

- **Collection management** — create, edit and inspect cNFT collections.
- **Live cost estimation** — see rent + mint + compression fees per collection before signing.
- **Wallet-signed auth** — every backend mutation requires the user to sign an envelope with their connected wallet. SIWS-style nonce + Ed25519 verification.
- **Merkle tree creation** — the deployer wallet pays the rent; the user signs the intent.
- **Live mainnet guard** — refuses to start the backend if `SOLANA_RPC_URL` points at mainnet without explicit `ALLOW_MAINNET=true`.

The current deployment runs against **Solana devnet**. No real SOL is spent.

---

## Tech stack

| Layer | Library |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind v4 |
| UI primitives | Custom shadcn-style components (`button`, `card`, `input`, …) |
| Wallets | `@solana/wallet-adapter` (Phantom, Solflare) |
| Validation | `zod` |
| Toasts | `sonner` |
| On-chain | `@metaplex-foundation/mpl-bubblegum` + `@solana/web3.js` |

---

## Live demo

**[https://friendlyminter.vercel.app](https://friendlyminter.vercel.app)**

Routes:

| Route | Description |
|---|---|
| `/` | Landing |
| `/collections` | List collections |
| `/collections/create` | Create a new collection — 4-step wizard with live cost |
| `/collections/[id]` | Inspect a collection, see mint progress |
| `/jobs` | Mint jobs |
| `/settings` | Network + RPC configuration |
| `/docs` | Concepts, tech stack, API reference |

---

## Run locally

### Prerequisites

- Node.js 20+
- npm
- A Solana wallet browser extension (Phantom or Solflare)

### Setup

```bash
git clone https://github.com/404Piyush/FriendlyMinter.git
cd FriendlyMinter
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production build

```bash
npm run build
npm run start
```

---

## Project layout

```
.
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout, metadata, providers
│   │   ├── page.tsx                   # Landing
│   │   ├── collections/               # /collections, /create, /[id]
│   │   ├── jobs/                      # Background mint jobs
│   │   ├── docs/                      # In-app documentation
│   │   ├── settings/                  # Network + RPC configuration
│   │   └── api/
│   │       ├── auth/nonce/            # POST → SIWS nonce
│   │       ├── collections/           # POST → create Merkle tree (gated)
│   │       └── mints/                 # POST → mint cNFT (gated)
│   ├── components/
│   │   ├── layout/Header.tsx          # Top nav (Dashboard, Collections, Docs)
│   │   ├── wallet/                    # WalletProvider, WalletButton
│   │   └── ui/                        # button, card, input, badge, …
│   ├── lib/
│   │   ├── server/
│   │   │   ├── auth.ts                # SIWS nonce + Ed25519 verify
│   │   │   ├── collections.ts         # createMerkleTree
│   │   │   ├── mints.ts               # mintCompressedNft
│   │   │   ├── parse-body.ts          # parseBody<T>(req, schema, opts)
│   │   │   ├── rate-limit.ts          # Vercel IP, IPv6 /64, token bucket
│   │   │   ├── tree-config.ts         # valid (depth, bufferSize) pairs
│   │   │   ├── umi.ts                 # UMI init + mainnet guard
│   │   │   └── wallet.ts              # deployer keypair loader
│   │   ├── solana.ts                  # Client-side RPC config
│   │   ├── signed-request.ts          # Client-side SIWS helper
│   │   └── utils.ts                   # cn() helper
│   ├── types/
│   └── middleware.ts                   # CSP + security headers
├── audits/                              # Formal security + code audits
│   ├── 2026-07-18-security-audit.md
│   ├── 2026-07-18-code-audit.md
│   └── 2026-07-18-fixes.md
├── SECURITY.md                          # Vulnerability disclosure
├── .env.example
├── next.config.ts
└── package.json
```

---

## Environment variables

| Variable | Required | Default | Purpose |
|---|:---:|---|---|
| `DEPLOYER_SECRET_KEY` | ✅ | _(none)_ | Base58-encoded 64-byte secret key. Server-only. Used to sign Merkle-tree creation + cNFT minting. |
| `SOLANA_RPC_URL` | ✅ | `https://api.devnet.solana.com` | Server-only. Refuses to start if it contains "mainnet" unless `ALLOW_MAINNET=true`. |
| `BACKEND_LIVE` | ❌ | `true` | Set `false` to make all `/api/*` return 503. |
| `ALLOW_MAINNET` | ❌ | _(none)_ | Must be `true` to start the backend pointing at mainnet. |
| `NEXT_PUBLIC_SOLANA_NETWORK` | ❌ | `devnet` | `devnet` / `testnet` / `mainnet-beta`. Drives the wallet adapter. |
| `NEXT_PUBLIC_USE_MOCK_API` | ❌ | `false` | Legacy flag — kept for backwards compatibility. |

**Never put a funded mainnet wallet's private key in any committed env file.** Deployer keys should live in a credential manager (1Password, AWS Secrets Manager, Doppler, Vercel environment variables).

---

## Deploy

The app is a standard Next.js 16 project — one-click on Vercel:

1. Push to GitHub (already done if you're reading this).
2. Import the repo in [Vercel](https://vercel.com/new). No subdirectory — the project root is the Next.js app.
3. Set the env vars from [`.env.example`](./.env.example).
4. Deploy. The defaults (`devnet`) work out of the box.

Required Node version: **20+** (enforced via `.nvmrc`).

Other targets (Netlify, Cloudflare Pages) work too — point them at the
repo root with build command `npm run build`.

---

## Security

- Formal audit: [`audits/2026-07-18-security-audit.md`](./audits/2026-07-18-security-audit.md)
- Code audit: [`audits/2026-07-18-code-audit.md`](./audits/2026-07-18-code-audit.md)
- Fix log: [`audits/2026-07-18-fixes.md`](./audits/2026-07-18-fixes.md)
- Vulnerability disclosure: [`SECURITY.md`](./SECURITY.md)

Latest snapshot:
- `0` critical, `0` high `npm audit` vulnerabilities
- All `/api/*` POST routes require wallet-signed SIWS envelope
- Mainnet guard refuses to start the backend against `mainnet` without `ALLOW_MAINNET=true`
- CSP, HSTS, COOP, COEP, scrubbed `X-Powered-By` + `Server` on every response

---

## License

[MIT](LICENSE) — built by [Piyush (@404Piyush)](https://github.com/404Piyush).

Inspired by the [Metaplex Bubblegum](https://docs.metaplex.com/programs/token-metadata/bubblegum) standard and the wider Solana compressed-NFT ecosystem.