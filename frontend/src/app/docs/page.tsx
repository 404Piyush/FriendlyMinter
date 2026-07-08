import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, Sparkles, Layers, Upload, Zap, Code2, ArrowRight, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';

const sections = [
  {
    icon: Coins,
    title: 'What are Compressed NFTs?',
    body: (
      <>
        <p>
          Compressed NFTs (cNFTs) use Solana&apos;s <em>state compression</em> — storing only a 32-byte
          hash of each NFT inside a Merkle tree on-chain, with the actual data kept in an
          off-chain ledger. The result: <strong>~99% cheaper storage costs</strong> while keeping
          the security guarantees of a Layer-1 asset.
        </p>
        <ul className="mt-3 space-y-1.5 text-sm">
          <li>· Standard issuance: ~12,000 lamports per NFT (≈ 0.000012 SOL).</li>
          <li>· Compressed issuance: ~5,000 lamports per NFT plus amortised tree rent.</li>
          <li>· cNFTs are native — they show up in Phantom & Solflare like any other NFT.</li>
        </ul>
      </>
    ),
  },
  {
    icon: Layers,
    title: 'How Merkle Trees Work Here',
    body: (
      <>
        <p>
          Each collection is backed by a single <strong>concurrent Merkle tree</strong>. The tree
          contains all the leaves for every NFT in that collection. Minting adds a new leaf; the
          tree&apos;s <code className="rounded bg-muted px-1 font-mono">maxDepth</code> and{' '}
          <code className="rounded bg-muted px-1 font-mono">maxBufferSize</code> parameters set its
          capacity and write throughput.
        </p>
        <p className="mt-3">
          The presets on the create page map directly to standard Metaplex Bubblegum
          configurations.
        </p>
      </>
    ),
  },
  {
    icon: Upload,
    title: 'CSV Upload Format',
    body: (
      <>
        <p>The expected CSV schema for bulk minting:</p>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-muted p-3 text-xs">
{`name,description,image,attributes,external_url,animation_url
"#1 Welcome Mat","First in the series",https://…/1.png,"bg:purple;rarity:common",
"#2 Welcome Mat","Second in the series",https://…/2.png,"bg:blue;rarity:rare",https://example.com,https://…/2.mp4`}
        </pre>
        <p className="mt-2 text-sm text-muted-foreground">
          Attributes use <code className="rounded bg-muted px-1 font-mono">trait:value</code>{' '}
          pairs separated by <code className="rounded bg-muted px-1 font-mono">;</code>.
        </p>
      </>
    ),
  },
  {
    icon: Zap,
    title: 'Job Queue & Background Minting',
    body: (
      <>
        <p>
          Mints are dispatched as jobs so the UI stays responsive even when issuing 100k+ items.
          Each job records start time, current progress, mint cost and per-second throughput.
          Failed mints are surfaced in the job detail view with on-chain error logs.
        </p>
      </>
    ),
  },
  {
    icon: Code2,
    title: 'Tech Stack',
    body: (
      <ul className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
        <li>· Next.js 15 (App Router) + React 19</li>
        <li>· TypeScript strict mode</li>
        <li>· Tailwind v4 + shadcn-style primitives</li>
        <li>· @solana/wallet-adapter (Phantom, Solflare, Torus, Ledger)</li>
        <li>· Zustand for client state</li>
        <li>· TanStack Query for server data</li>
        <li>· React Hook Form + Zod for validation</li>
        <li>· Sonner for toasts</li>
      </ul>
    ),
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              Documentation
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How FriendlyMinter works
            </h1>
            <p className="mt-2 text-muted-foreground">
              A short tour of the concepts, schema and architecture behind the platform.
            </p>
          </div>
          <Button asChild variant="outline">
            <a
              href="https://github.com/404Piyush/FriendlyMinter"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="mr-2 h-4 w-4" />
              View source
            </a>
          </Button>
        </div>

        <div className="space-y-6">
          {sections.map((s) => (
            <Card key={s.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <s.icon className="h-5 w-5" />
                  </span>
                  {s.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                {s.body}
              </CardContent>
            </Card>
          ))}

          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-between gap-4 p-8 sm:flex-row">
              <div>
                <h3 className="font-semibold">Skip the docs, try the demo</h3>
                <p className="text-sm text-muted-foreground">
                  See the full UI flow with mock data — no wallet needed.
                </p>
              </div>
              <Button asChild>
                <Link href="/demo">
                  Open Demo <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
