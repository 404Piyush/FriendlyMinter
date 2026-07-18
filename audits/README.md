# Audits

Formal audits of the FriendlyMinter codebase. Each document is
versioned by date; later audits supersede earlier ones for overlapping
findings.

## Index

| Date | Scope | Findings | Status |
|---|---|---:|---|
| [2026-07-18](./2026-07-18-security-audit.md) | Production-grade security review (API, keypair, headers, deps, client) | 3 Critical · 7 High · 13 Medium · 15 Low | All Critical + High resolved; accepted limitations documented |
| [2026-07-18](./2026-07-18-code-audit.md) | Dead code, redundancy, type safety, a11y, performance, library optimization | 4,414 dead LOC · 15 unused packages · 0 critical/high audit | Resolved |
| [2026-07-18](./2026-07-18-fixes.md) | Fix log mapping every finding → commit → resolution | — | 3 commits shipped |

## What each document covers

### Security audit
Threat model, original findings by severity with `file:line` evidence,
fixes applied, accepted limitations, out-of-scope items.

### Code audit
Dead file inventory, unused dependency inventory, redundant logic,
type safety, accessibility (WCAG contrast), performance, modernisation
opportunities not applied.

### Fixes log
Phase-by-phase commit map. Each finding → commit → resolution table.
LOC delta summary. Deployment status.

## Re-running an audit

A new audit should be triggered when:

1. **A new endpoint is added** to `/api/*` — security audit applies.
2. **A new external dependency is added** — re-run `npm audit` and
   confirm no critical/high.
3. **The deployer key custody model changes** (e.g. moving to KMS) —
   security audit's `A1` becomes the next focus.
4. **The deployer network changes** (devnet → mainnet) — security
   audit's `A4` becomes the next focus, plus a new audit specifically
   for production mainnet risks.
5. **Quarterly** — at minimum, even with no code changes.

See `SECURITY.md` at the repo root for the vulnerability disclosure
process.