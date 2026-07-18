# FriendlyMinter

A Next.js app for minting compressed NFTs (cNFTs) on Solana via the [Metaplex Bubblegum](https://docs.metaplex.com/programs/token-metadata/bubblegum) standard.

**[Live demo](https://friendlyminter.vercel.app)** · runs on **Solana devnet** · 0 critical / 0 high audit vulns

---

## TL;DR

```bash
git clone https://github.com/404Piyush/FriendlyMinter.git
cd FriendlyMinter
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000, connect Phantom or Solflare on **devnet**, walk through `/collections/create`.

## Stack

- **Next.js 16** (App Router) + **React 19**
- **TypeScript** strict mode
- **Tailwind v4** + custom UI primitives (`src/components/ui/`)
- **Phantom** + **Solflare** via `@solana/wallet-adapter-react`
- **Metaplex Bubblegum** for on-chain Merkle trees and cNFT minting
- **zod** for request validation
- **sonner** for toasts

## What it does

- `/collections/create` — 4-step wizard with live cost estimate. Builds the canonical SIWS message, asks the wallet to sign it, posts to `/api/collections`.
- `/collections` + `/collections/[id]` — list + inspect.
- `/jobs` — mint job queue.
- `/docs` — in-app documentation.
- `/settings` — network + RPC config.

## Routes

| | |
|---|---|
| `GET  /api/auth/nonce`        | issue a SIWS nonce |
| `POST /api/collections`        | create Merkle tree (SIWS-gated, deployer signs + pays) |
| `POST /api/mints`              | mint a cNFT into a tree (SIWS-gated) |
| All pages                      | client-side routes |

## Environment

| Var | Required | Default | Notes |
|---|:---:|---|---|
| `DEPLOYER_SECRET_KEY` | ✅ | — | base58 64-byte key. Server-only. Used to sign on-chain. |
| `SOLANA_RPC_URL`      | ✅ | `https://api.devnet.solana.com` | Server-only. Refuses to start against `mainnet` without `ALLOW_MAINNET=true`. |
| `BACKEND_LIVE`        | ❌ | `true` | `false` → every `/api/*` returns 503. |
| `ALLOW_MAINNET`       | ❌ | — | Must be `true` to start the backend pointing at mainnet. |
| `NEXT_PUBLIC_SOLANA_NETWORK` | ❌ | `devnet` | `devnet` / `testnet` / `mainnet-beta`. |

See [`.env.example`](./.env.example).

## Local development

Requirements: **Node 20+**, a Solana wallet browser extension.

```bash
npm install
cp .env.example .env.local
npm run dev
```

For a real deployer key (so the create button actually works locally):

```bash
solana-keygen new --outfile keys/devnet-deployer.json --force
# base58-encode it into .env.local:
node -e "console.log(require('bs58').default.encode(new Uint8Array(require('./keys/devnet-deployer.json'))))"
# fund it:
solana airdrop 2 -k keys/devnet-deployer.json --url devnet
```

For just clicking around the UI, the `BACKEND_LIVE=false` flag turns the live calls into 503s and you can still see the UI flow without a key.

## Build

```bash
npm run build       # typecheck + bundle
npm run lint
npm audit
```

## Deploy

Standard Next.js on Vercel. No monorepo, no subdirectory — the repo root is the app.

Required env: `DEPLOYER_SECRET_KEY`, `SOLANA_RPC_URL` (both server-only).

## Repository layout

```
.
├── audits/                  Formal security + code audits
│   ├── README.md            Index + re-audit triggers
│   ├── 2026-07-18-security-audit.md
│   ├── 2026-07-18-code-audit.md
│   └── 2026-07-18-fixes.md  Phase-by-phase commit map
├── src/
│   ├── app/                 Next.js App Router (pages + API routes)
│   ├── components/          Header, wallet provider, UI primitives
│   ├── lib/
│   │   ├── server/          Auth, RPC, mints, collections, parsing
│   │   ├── solana.ts        Client RPC config
│   │   ├── signed-request.ts  SIWS helper
│   │   └── utils.ts
│   ├── types/
│   └── middleware.ts        CSP + security headers
├── keys/
│   └── .gitkeep             Local-only keypair dir (gitignored)
├── SECURITY.md              Vulnerability disclosure
├── README.md                (this file)
├── LICENSE                  MIT
├── .env.example
├── next.config.ts
├── tailwind config inline in globals.css
├── tsconfig.json
├── eslint.config.mjs
├── components.json          shadcn config
├── postcss.config.mjs
├── .editorconfig
├── .gitattributes
├── .gitignore
└── .nvmrc                   Node version
```

## Security

- **All POST routes require a wallet-signed SIWS envelope** (nonce + Ed25519 signature over the canonical message).
- **Mainnet guard** refuses to start the backend pointing at mainnet without explicit opt-in.
- **CSP, HSTS, COOP, COEP** on every response; `X-Powered-By` and `Server` headers scrubbed.
- **Rate-limited** by Vercel trusted IP (drops spoofable `x-forwarded-for`, IPv6 collapsed to /64).
- **Body size cap** 8 KB on POST routes.
- **Deployer key custody** is the largest remaining risk — see [`audits/2026-07-18-security-audit.md`](./audits/2026-07-18-security-audit.md) §A1. Production mainnet requires KMS or Fireblocks.

To report a vulnerability: see [SECURITY.md](./SECURITY.md).

## License

[MIT](./LICENSE) — © [Piyush (@404Piyush)](https://github.com/404Piyush).