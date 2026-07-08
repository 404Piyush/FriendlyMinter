import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Coins,
  Layers,
  Upload,
  Zap,
  Code2,
  ArrowUpRight,
  Github,
  Hash,
  CircleDot,
} from 'lucide-react';

const sections = [
  {
    code: '01',
    icon: Coins,
    title: 'Compressed NFTs, explained',
    body: (
      <div className="space-y-3 leading-relaxed">
        <p>
          Compressed NFTs (cNFTs) use Solana&apos;s <em>state compression</em> — only a 32-byte
          hash of each NFT lives on-chain inside a Merkle tree. The actual data sits in an
          off-chain ledger. The result: <strong>~99% cheaper storage</strong>, same security guarantees
          as a Layer-1 asset.
        </p>
        <ul className="space-y-1.5 border-l-2 border-primary/40 pl-4 font-mono text-sm">
          <li>· standard issuance ≈ 12,000 lamports / NFT</li>
          <li>· compressed issuance ≈ 5,000 lamports + amortised tree rent</li>
          <li>· cNFTs are native — they appear in Phantom &amp; Solflare like any other NFT</li>
        </ul>
      </div>
    ),
  },
  {
    code: '02',
    icon: Layers,
    title: 'How Merkle trees work here',
    body: (
      <div className="space-y-3 leading-relaxed">
        <p>
          Each collection is backed by a single <strong>concurrent Merkle tree</strong>. The tree contains
          all the leaves for every NFT in that collection. Minting adds a new leaf;{' '}
          <code className="rounded-[2px] bg-muted px-1.5 py-0.5 font-mono text-xs">maxDepth</code> and{' '}
          <code className="rounded-[2px] bg-muted px-1.5 py-0.5 font-mono text-xs">maxBufferSize</code> set its
          capacity and write throughput.
        </p>
        <p>The presets on the create page map directly to standard Metaplex Bubblegum configurations.</p>
      </div>
    ),
  },
  {
    code: '03',
    icon: Upload,
    title: 'CSV upload format',
    body: (
      <div className="space-y-3">
        <p className="leading-relaxed">Expected CSV schema for bulk minting:</p>
        <pre className="overflow-x-auto border border-border bg-background p-4 font-mono text-xs leading-relaxed text-foreground">
{`name,description,image,attributes,external_url,animation_url
"#1 Welcome Mat","First in the series",https://…/1.png,"bg:purple;rarity:common",
"#2 Welcome Mat","Second in the series",https://…/2.png,"bg:blue;rarity:rare",https://example.com,https://…/2.mp4`}
        </pre>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Attributes use{' '}
          <code className="rounded-[2px] bg-muted px-1.5 py-0.5 font-mono text-xs">trait:value</code>{' '}
          pairs separated by{' '}
          <code className="rounded-[2px] bg-muted px-1.5 py-0.5 font-mono text-xs">;</code>.
        </p>
      </div>
    ),
  },
  {
    code: '04',
    icon: Zap,
    title: 'Job queue & background minting',
    body: (
      <p className="leading-relaxed">
        Mints are dispatched as jobs so the UI stays responsive when issuing 100k+ items. Each job
        records start time, current progress, mint cost and per-second throughput. Failed mints are
        surfaced in the job detail view with on-chain error logs.
      </p>
    ),
  },
  {
    code: '05',
    icon: Code2,
    title: 'Tech stack',
    body: (
      <ul className="grid grid-cols-1 gap-1.5 border-l border-border pl-4 font-mono text-sm sm:grid-cols-2">
        <li>· Next.js 15 (App Router)</li>
        <li>· React 19</li>
        <li>· TypeScript strict mode</li>
        <li>· Tailwind v4 + custom UI primitives</li>
        <li>· @solana/wallet-adapter</li>
        <li>· Zustand for client state</li>
        <li>· TanStack Query for server data</li>
        <li>· React Hook Form + Zod</li>
        <li>· Sonner for toasts</li>
      </ul>
    ),
  },
];

export default function DocsPage() {
  return (
    <div className="relative z-10">
      <Header />

      <main className="container mx-auto max-w-4xl px-4 pt-12 pb-24">
        <div className="mb-10 flex flex-col items-start justify-between gap-6 border-b border-border pb-6 md:flex-row md:items-end">
          <div>
            <p className="label">§Docs · Manual</p>
            <h1 className="display mt-3 text-5xl md:text-6xl">
              How FriendlyMinter <span className="italic text-primary">works</span>.
            </h1>
            <p className="mt-3 max-w-xl text-muted-foreground">
              A short tour of the concepts, schema and architecture behind the platform.
            </p>
          </div>
          <Button variant="outline" asChild>
            <a
              href="https://github.com/404Piyush/FriendlyMinter"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-4 w-4" />
              Source
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </Button>
        </div>

        <div className="space-y-px bg-border">
          {sections.map((s) => (
            <article key={s.title} className="bg-background p-6 md:p-8">
              <div className="mb-5 flex items-baseline gap-4">
                <span className="font-mono text-sm text-primary">{s.code}</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-[3px] bg-primary/10 text-primary">
                  <s.icon className="h-4 w-4" />
                </div>
                <h2 className="font-serif text-2xl font-medium tracking-tight">{s.title}</h2>
              </div>
              <div className="text-muted-foreground">{s.body}</div>
            </article>
          ))}
        </div>

        <div className="mt-16 border border-primary/30 bg-primary/5 p-8 md:p-12">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="label">Skip the docs</p>
              <h3 className="mt-2 font-serif text-3xl tracking-tight">See the full UI flow with mock data.</h3>
              <p className="mt-2 text-sm text-muted-foreground">No wallet needed.</p>
            </div>
            <Button asChild size="lg">
              <Link href="/demo">
                Open demo <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
