# FriendlyMinter

> Compressed-NFT (cNFT) minting platform for Solana. Mint thousands of NFTs at ~99% lower cost than a traditional Solana mint, with bulk CSV upload, real-time job progress and a polished wallet-first UI.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Solana](https://img.shields.io/badge/Solana-Devnet-9945ff?logo=solana)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)
![License](https://img.shields.io/badge/license-MIT-green)

[Live Demo](https://friendlyminter.vercel.app) · [Report Bug](https://github.com/404Piyush/FriendlyMinter/issues) · [Request Feature](https://github.com/404Piyush/FriendlyMinter/issues)

---

## What is FriendlyMinter?

A friendly UI on top of the [Metaplex Bubblegum](https://docs.metaplex.com/programs/token-metadata/bubblegum) standard. It hides the gnarly Merkle-tree bookkeeping behind:

- **Collection management** — create, edit and inspect cNFT collections.
- **Bulk metadata upload** — drop a CSV, get a queue of pending mints.
- **Live cost estimation** — see rent + mint + compression fees per collection.
- **Job-queue minting** — background jobs with pause / resume / progress.
- **Wallet-first auth** — Phantom, Solflare, Torus, Ledger via `@solana/wallet-adapter`.

The current deployment is the **frontend** with mock-data adapters — fully usable as a portfolio demo and a clickable end-to-end walkthrough. The on-chain minting adapters ship behind the same API surface (see `src/lib/solana.ts`) so swapping `USE_MOCK_API=false` is a drop-in change once a backend is wired up.

---

## Tech stack

| Layer | Library |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind v4 + shadcn/ui-style primitives |
| Wallets | `@solana/wallet-adapter` (Phantom, Solflare, Torus, Ledger) |
| Forms | `react-hook-form` + `zod` |
| Async state | `@tanstack/react-query` |
| Client state | `zustand` |
| Toasts | `sonner` |
| Lint / format | ESLint (Next.js preset), Prettier |

---

## Live demo

**[https://friendlyminter.vercel.app](https://friendlyminter.vercel.app)**

Routes:

| Route | Description |
|---|---|
| `/` | Landing page |
| `/collections` | List collections |
| `/collections/create` | Create a new collection (live cost estimate) |
| `/collections/[id]` | Inspect a collection, see mint progress |
| `/jobs` | Mint jobs (active / paused / completed) |
| `/demo` | Interactive demo with mock data |
| `/docs` | Concepts, CSV format, tech stack |
| `/settings` | Network + RPC configuration |

---

## Run locally

### Prerequisites

- Node.js 18+ (Node 20 LTS recommended)
- npm / pnpm / yarn
- A Solana wallet browser extension (Phantom, Solflare, etc.) — optional for the demo

### Setup

```bash
cd frontend
npm install
cp .env.example .env.local       # tweak if you want a different network
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
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout, metadata, providers
│   │   ├── page.tsx           # Landing page
│   │   ├── collections/       # /collections, /collections/create, /collections/[id]
│   │   ├── jobs/              # Background mint jobs
│   │   ├── demo/              # Interactive demo (mock data)
│   │   ├── docs/              # In-app documentation
│   │   └── settings/          # Network + RPC configuration
│   ├── components/
│   │   ├── ui/                # shadcn-style primitives (button, card, etc.)
│   │   ├── layout/            # Header, Sidebar, Layout
│   │   ├── wallet/            # Wallet provider & connect button
│   │   ├── collections/       # Collection list / form
│   │   ├── upload/            # Drag-drop file & CSV upload
│   │   ├── progress/          # Mint progress widgets
│   │   └── demo/              # Interactive demo showcase
│   ├── lib/
│   │   ├── solana.ts          # RPC connection manager, explorer URLs
│   │   ├── mock-api.ts        # Mock API for demo mode
│   │   ├── mock-data.ts       # Sample users / collections / NFTs
│   │   └── utils.ts           # cn() helper
│   └── types/                 # Shared TypeScript types
├── .env.example               # Copy to .env.local
├── next.config.ts             # Webpack/Next config (image domains, etc.)
└── package.json
```

---

## Environment variables

All vars are prefixed with `NEXT_PUBLIC_` because they are read in the browser. See [`.env.example`](frontend/.env.example).

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SOLANA_NETWORK` | `devnet` | `devnet` / `testnet` / `mainnet-beta` |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | _(empty)_ | Optional custom RPC; falls back to Ankr |
| `NEXT_PUBLIC_ANKR_RPC_URL` | _(empty)_ | Back-compat alias for the above |
| `NEXT_PUBLIC_USE_MOCK_API` | `true` | Use mock data instead of live backend |
| `NEXT_PUBLIC_DEBUG_MODE` | `false` | Verbose console output |
| `NEXT_PUBLIC_MOCK_DELAY` | `1000` | Mock API delay (ms) |

**Do not put a funded wallet's private key in any committed env file.** FriendlyMinter signs mints locally via the connected wallet; no keys ever leave the browser.

---

## Deploy

The app is a standard Next.js 15 project — one-click on Vercel:

1. Push to GitHub (already done if you're reading this).
2. Import the `frontend/` directory in [Vercel](https://vercel.com/new).
3. Set the env vars from [`.env.example`](frontend/.env.example).
4. Deploy. The defaults (`NEXT_PUBLIC_SOLANA_NETWORK=devnet`) work out of the box.

Vercel auto-detects the Next.js build settings. The required Node version is 18+.

Other targets (Netlify, Cloudflare Pages, etc.) work too — just point them at the `frontend/` directory with build command `npm run build` and publish directory `.next`.

---

## License

[MIT](LICENSE) — built by [Piyush (@404Piyush)](https://github.com/404Piyush).

Inspired by the [Metaplex Bubblegum](https://docs.metaplex.com/programs/token-metadata/bubblegum) standard and the wider Solana compressed-NFT ecosystem.
