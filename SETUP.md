# FriendlyMinter → testnet setup

## What I did

- Generated a fresh Solana keypair for funding on Solana **testnet**.
- The repo already supports testnet natively (`src/lib/solana.ts` line 7 maps
  `testnet → https://rpc.ankr.com/solana_testnet` with a public RPC fallback).
  So "make it work on testnet" reduces to flipping one env var — see below.

## New wallet

```
Public key : 9jeG6zLKDU6Sehq3t9SdNGQ7SQ4s1xGyMmcgwAsHJToL
Cluster    : testnet
Keyfile    : /Users/piyushutkar/Desktop/FriendlyMinter/testnet-wallet.json  (Solana CLI format, 64 JSON bytes)
Balance    : 0 SOL (verified with `solana balance --url testnet`)
```

Airdrop testnet SOL with:

```bash
solana airdrop 2 9jeG6zLKDU6Sehq3t9SdNGQ7SQ4s1xGyMmcgwAsHJToL --url testnet
# (Solana testnet airdrops are intermittent; if `solana airdrop` errors out,
# use https://faucet.solana.com — pick the "testnet" tab and paste the pubkey.)
```

Explorer:
`https://explorer.solana.com/address/9jeG6zLKDU6Sehq3t9SdNGQ7SQ4s1xGyMmcgwAsHJToL?cluster=testnet`

> Note on funding: Solana **testnet** SOL is irregular and periodically
> wiped — it's intended for validators and stress-tests, not regular users.
> **devnet** has a reliable public faucet if you only need to test.
> Swap the network value below to `devnet` if the testnet airdrop fails.

## Switch the deployed app to testnet

The `school-kiddos-projects/friendlyminter` Vercel project has no
production deployment yet, so the next push/deploy will pick up the env
var. Set these in Vercel → Project → Settings → Environment Variables
(scope: Production + Preview):

```
NEXT_PUBLIC_SOLANA_NETWORK = testnet
NEXT_PUBLIC_SOLANA_RPC_URL =              (leave blank → uses Ankr solana_testnet)
NEXT_PUBLIC_USE_MOCK_API    = true        (KEEP TRUE — see warning below)
NEXT_PUBLIC_DEBUG_MODE      = false
NEXT_PUBLIC_MOCK_DELAY      = 1000
```

Locally (after cloning `frontend/`):

```bash
cp .env.example .env.local       # if .env.example is missing, create it as below
```

Minimal `.env.local`:

```
NEXT_PUBLIC_SOLANA_NETWORK=testnet
NEXT_PUBLIC_USE_MOCK_API=true
```

## ⚠️ Big caveat — the current code does not actually mint on-chain

This repo is a **frontend-only portfolio demo**. No backend, no Metaplex
Bubblegum SDK, no Merkle-tree creation, no `mintV1` call. Concrete
evidence:

- `package.json` has no `@metaplex-foundation/*` dependency.
- `src/lib/mock-api.ts` reads `process.env.USE_MOCK_API` (note: not
  `NEXT_PUBLIC_USE_MOCK_API`, so the env toggle it watches is always
  unset on the client → mock data is hard-baked on).
- `src/app/collections/create/page.tsx` `handleSubmit` is literally
  `setTimeout(() => toast.success(...), 1000)` — **no transaction is
  signed or sent**.
- The README itself states: *"The current deployment is the frontend
  with mock-data adapters… The on-chain minting adapters ship behind
  the same API surface so swapping USE_MOCK_API=false is a drop-in
  change once a backend is wired up."*

### What you'll see on testnet after the env swap

- Wallet connect (Phantom/Solflare) talks to the real testnet RPC.
- Your funded pubkey shows a non-zero balance in the UI.
- Explorer links point at `?cluster=testnet`.
- **"Create collection" still just fires a toast. No cNFT is minted.**

That's fine as a portfolio walkthrough demo, but if you want real
compressed-NFT mints on testnet, that requires:

1. Add `@metaplex-foundation/mpl-bubblegum`, `@metaplex-foundation/mpl-token-metadata`,
   `@solana/spl-account-compression`, plus a `Keypair` signer from the
   connected wallet (or a server-side keypair).
2. Replace `CreateCollectionPage.handleSubmit` with:
   - `createTreeConfig` instruction (configures maxDepth / maxBufferSize
     on a new Merkle tree account).
   - Wait for tree confirmation.
   - Per-NFT: `mintV1` with metadata JSON uploaded to Arweave/IPFS first.
3. Wire a job-queue that batches mints and signs them with the wallet.
4. Run an indexer (DAS API / Helius / Triton) to read cNFTs back via
   `getAsset`.

That's a multi-day engineering task, not a config flip. Tell me if you
want me to start on it — I'd build it as a separate `feature/bubblegum`
branch with an actual on-chain mint path gated behind a flag, leaving the
mock demo intact.
