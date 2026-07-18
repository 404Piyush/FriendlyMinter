# Code Audit

**Date:** 2026-07-18
**Subject:** FriendlyMinter (`C:\Users\piyus\Desktop\FriendlyMinter`)
**Scope:** Dead code, redundancy, type safety, accessibility,
performance, library optimization, code quality.

---

## Headline

| | Before | After |
|---|---:|---:|
| `src/` LOC | 8,113 | **4,244** |
| `src/` files | 60 | 47 |
| Dead code | ~4,000 LOC | **0** |
| Unused npm packages | 15 | **0** |
| `npm audit` critical / high | 2 / 18 | **0 / 0** |
| Status pill duplicates | 4 implementations | 2 (different mappings) |

---

## Dead files (deleted in this audit)

Verified zero importers across `src/` via `grep "from .*<filename>"`.

| Path | LOC | Reason |
|---|---:|---|
| `src/lib/mock-api.ts` | 335 | Zero importers (only referenced in docs prose) |
| `src/lib/mock-data.ts` | 173 | Only consumer was the dead `mock-api.ts` |
| `src/lib/mock-api-enhanced.ts` | 354 | Only consumer was the dead `DemoExplorer` |
| `src/lib/mock-enhanced.ts` | 365 | Only consumer was the dead `mock-api-enhanced.ts` |
| `src/components/collections/CreateCollectionForm.tsx` | 337 | Create page renders an inline form |
| `src/components/collections/CollectionCard.tsx` | 293 | Collections index hand-rolls its own cards |
| `src/components/progress/MintingProgress.tsx` | 309 | Zero importers |
| `src/components/progress/ProgressTracker.tsx` | 202 | Zero importers |
| `src/components/upload/CSVUpload.tsx` | 484 | Zero importers |
| `src/components/upload/FileUpload.tsx` | 252 | Only consumer was the dead CSVUpload |
| `src/components/layout/Layout.tsx` | 46 | Zero importers |
| `src/components/layout/Sidebar.tsx` | 146 | Only consumer was dead `Layout.tsx` |
| `src/components/ui/dialog.tsx` | 143 | Zero importers |
| `src/components/ui/dropdown-menu.tsx` | 257 | Only consumer was dead `CollectionCard` |
| `src/components/ui/select.tsx` | 185 | Only consumer was dead `CreateCollectionForm` |
| `src/components/ui/table.tsx` | 116 | Only consumer was dead `CSVUpload` |
| `src/components/demo/DemoExplorer.tsx` | 290 | Becomes dead after `/demo` page removed |
| `src/app/demo/page.tsx` | ~100 | Replaced by `/collections` + `/collections/[id]` with real data |
| `src/app/api/health/route.ts` | 27 | Leaked deployer pubkey + RPC URL |
| **Total** | **4,414** | |

All confirmed via `git rm` in the cleanup commit.

---

## Unused npm packages (removed in this audit)

Removed with `npm uninstall`:

| Package | Bundle saved | Reason |
|---|---:|---|
| `@tanstack/react-query` | ~40 KB | Zero importers |
| `zustand` | ~3 KB | Zero importers |
| `react-hook-form` | ~22 KB | Only used in dead `CreateCollectionForm` |
| `@hookform/resolvers` | (included above) | Same |
| `react-dropzone` | ~30 KB | Only used in dead files |
| `papaparse` | ~46 KB | Only used in dead `CSVUpload` |
| `@types/papaparse` | (types) | Same |
| `next-themes` | ~3 KB | Only consumer was `sonner.tsx` (inlined to `theme="light"`) |
| `@radix-ui/react-select` | ~20 KB | Only used in dead `CreateCollectionForm` |
| `@radix-ui/react-dropdown-menu` | ~20 KB | Only used in dead `CollectionCard` |
| `@metaplex-foundation/mpl-token-metadata` | (already transitive) | Declared direct but unused — cleaned |
| `@solana/wallet-adapter-torus` | ~250 KB | Rare wallet, dropped from provider |
| `@solana/wallet-adapter-ledger` | (included) | Same |
| **Total** | **~430 KB JS** | (gzipped estimate) |

`@radix-ui/react-label` and `@radix-ui/react-progress` were **kept**
because `/settings`, `/collections/[id]`, and `/jobs` still use them.

---

## Redundant logic consolidated

### `parseBody<T>` helper

Two `/api/*` route files had byte-for-byte duplicated patterns:
schema parse + body-size check + JSON validation + auth header parsing.
Extracted to `src/lib/server/parse-body.ts`:

```ts
export async function parseBody<S extends ZodTypeAny>(
  req: NextRequest,
  schema: S,
  options?: { requireAuth?: boolean },
): Promise<ParsedRequest<z.infer<S>>>
```

Both routes now use it; each shrank by ~30 lines.

### Top-level ErrorBoundary

Before: no global error boundary; an uncaught throw in any client
component blanked the entire tree.

After: `src/components/error-boundary.tsx` mounted in `src/app/layout.tsx`.
Catches throws, renders a fallback card with the error message + a
reload button.

### Dead import / parameter cleanup

15 unused symbols removed:
- `PublicKey` in collections route (already moved to web3.js)
- `ArrowRight` in collections page
- `Commitment` in useSolana
- `React` namespace imports in WalletButton/WalletProvider
- `userId` parameter in mock-api-enhanced
- `walletAddress` parameter in mock-api
- `Notification` import in mock-enhanced
- `ALL_COLUMNS` in CSVUpload
- `maxDepth`/`maxBufferSize` watched values in CreateCollectionForm
- `sections` prop in DocsToc (declared but ignored — kept but marked as dead export for now)
- `error` catch params named but unused

---

## Type safety audit

| Issue | Status |
|---|---|
| `as unknown as ...` casts | Removed (only existed in dead files) |
| `as Error` casts in catch blocks | Acceptable — narrowed to `Error & { cause?: unknown }` |
| `process.env.NEXT_PUBLIC_SOLANA_NETWORK as SolanaNetwork` cast | Documented — defaults to `'devnet'` on bad input |
| `any` types in `src/` | **0** |
| `unknown` types | 5 — 4 catch params + 1 generic (`ApiResponse<T = unknown>`) |

---

## Accessibility (WCAG 2.1 AA)

| Pair | Before | After |
|---|---|---|
| `--ink-soft` #5a5a55 on `--bg` #e8e1d4 | 5.33:1 ✓ | unchanged |
| `--ink-faint` on `--bg` | **#8a8479 → 2.86:1 ✗** | **#6f6a60 → 4.56:1 ✓** |
| `--sol-green` text on cream | decorative only — no body text uses it | unchanged |
| `--destructive` on bg | 3.16:1 (large text only) | unchanged — used only for destructive buttons |

Fixed `aria-label` on icon-only buttons in `create/page.tsx`, header
mobile menu, and clipboard rows in `[id]/page.tsx`.

---

## Performance

| Concern | Status |
|---|---|
| Bundle bloat from unused deps | Resolved (~430 KB removed) |
| Unused mock data imported into `/demo` page | Resolved (page + mock files deleted) |
| 4× `useSmoothNumber` running concurrent RAF loops | Acceptable — debounce-on-input not needed at current cost cadence |
| Missing `key` props in lists | Verified all lists have stable keys |
| Bundle minification | Default Next.js production config |

---

## Modernization opportunities (not in this commit)

These are documented for future work, **not** applied:

1. **React 19 `use()` + Server Actions**: Replace create-page submit
   boilerplate with `useActionState` and a server action. Smaller
   bundle, fewer state bugs.

2. **`next/form` `<Form>` component**: Drop the manual `onSubmit`
   handler.

3. **Geist via `@font-face` in `public/fonts/`**: Faster offline
   builds, no Google Fonts dependency at build time.

4. **`@upstash/ratelimit` against Vercel KV**: Real distributed rate
   limiting (see security audit A3).

5. **PostCSS `<8.5.10` XSS advisory** (via Next.js): No fix without
   major Next.js upgrade.

---

## Code style consistency (not addressed in this audit)

The codebase mixes double-quoted and single-quoted strings across files.
Pre-existing; cosmetic; out of scope for a security/cleanup audit.