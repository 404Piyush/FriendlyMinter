import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, ArrowRight, FolderOpen, ArrowUpRight, Sparkles, Activity, Hexagon } from 'lucide-react';

const sampleCollections = [
  {
    id: 'demo-collection-01',
    name: 'Solana Genesis Pixels',
    symbol: 'GPX',
    description: '1,000 generative pixel-art characters minted via Bubblegum.',
    status: 'MINTING',
    minted: 642,
    max: 1000,
    merkleTree: '8xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    image: 'GPX',
    depth: 14,
    buffer: 64,
    accent: 'bg-primary text-primary-foreground',
  },
  {
    id: 'demo-collection-02',
    name: 'DeGods Lite',
    symbol: 'DGL',
    description: 'Hand-illustrated profile-pic collection with royalty splits.',
    status: 'INITIALIZED',
    minted: 0,
    max: 5000,
    merkleTree: '6rY9Tg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    image: 'DGL',
    depth: 17,
    buffer: 64,
    accent: 'bg-accent text-accent-foreground',
  },
  {
    id: 'demo-collection-03',
    name: 'On-chain Receipts',
    symbol: 'RECEIPT',
    description: 'POAP-style attendance tokens, batch-minted after each event.',
    status: 'COMPLETED',
    minted: 2500,
    max: 2500,
    merkleTree: '3aP7Tg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    image: 'RCPT',
    depth: 14,
    buffer: 64,
    accent: 'bg-secondary text-secondary-foreground',
  },
];

const statusConfig: Record<string, { label: string; variant: 'success' | 'default' | 'secondary' | 'destructive' | 'muted' }> = {
  COMPLETED: { label: 'Completed', variant: 'success' },
  MINTING: { label: 'Minting', variant: 'default' },
  INITIALIZED: { label: 'Initialized', variant: 'secondary' },
  DRAFT: { label: 'Draft', variant: 'muted' },
  FAILED: { label: 'Failed', variant: 'destructive' },
};

export default function CollectionsPage() {
  return (
    <div className="relative z-10">
      <Header />

      <main className="container mx-auto px-4 pt-12 pb-24">
        <div className="mb-10 flex flex-col items-start justify-between gap-6 border-b border-border pb-6 md:flex-row md:items-end">
          <div>
            <p className="label">§Collections · {sampleCollections.length} entries</p>
            <h1 className="display mt-3 text-5xl md:text-6xl">Your cNFT collections.</h1>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Manage and inspect your collections. Click a card for on-chain config + mint progress.
            </p>
          </div>
          <Button size="lg" asChild>
            <Link href="/collections/create">
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              New collection
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-px bg-border md:grid-cols-2 lg:grid-cols-3">
          {sampleCollections.map((c) => (
            <Link
              key={c.id}
              href={`/collections/${c.id}`}
              className="group relative flex flex-col bg-background p-6 transition-colors hover:bg-secondary/30"
            >
              <div className="mb-5 flex items-start justify-between">
                <div className={`flex h-14 w-14 items-center justify-center rounded-[3px] font-mono text-sm font-semibold tracking-wider ${c.accent}`}>
                  {c.image}
                </div>
                <Badge variant={statusConfig[c.status]?.variant ?? 'muted'}>
                  {statusConfig[c.status]?.label ?? c.status}
                </Badge>
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-serif text-2xl font-medium leading-tight tracking-tight">
                    {c.name}
                  </h3>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {c.symbol}
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>

              <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {c.description}
              </p>

              <div className="mt-6 space-y-2.5">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  <span>minted</span>
                  <span className="text-foreground">
                    {c.minted.toLocaleString()} / {c.max.toLocaleString()}
                  </span>
                </div>
                <div className="h-1 overflow-hidden bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${Math.min(100, (c.minted / c.max) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center gap-4 border-t border-border pt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                <span>depth {c.depth}</span>
                <span className="text-border">/</span>
                <span>buffer {c.buffer}</span>
                <span className="text-border">/</span>
                <span className="ml-auto truncate">{c.merkleTree.slice(0, 4)}…{c.merkleTree.slice(-4)}</span>
              </div>
            </Link>
          ))}

          {/* Create new tile */}
          <Link
            href="/collections/create"
            className="group relative flex min-h-[360px] flex-col items-start justify-between border-2 border-dashed border-border bg-transparent p-6 transition-colors hover:border-primary hover:bg-primary/5"
          >
            <div className="mb-5 flex items-start justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-[3px] border-2 border-dashed border-border text-muted-foreground">
                <Plus className="h-5 w-5" strokeWidth={2} />
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
            </div>
            <div>
              <h3 className="font-serif text-2xl font-medium tracking-tight">Create new collection</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Spin up a Merkle tree in seconds. Default parameters handle up to 100K items.
              </p>
            </div>
          </Link>
        </div>

        {/* CTA */}
        <div className="mt-16 flex flex-col items-start gap-6 border border-border p-6 md:flex-row md:items-center md:justify-between md:gap-8">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[3px] bg-primary/10 text-primary">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <p className="label">Demo mode</p>
              <h3 className="mt-1 font-serif text-xl tracking-tight">Try the full flow without spending SOL.</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Mock data simulates on-chain settlement. Cost estimates and progress work the same way.
              </p>
            </div>
          </div>
          <Button variant="outline" asChild className="shrink-0">
            <Link href="/demo">
              Open demo <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
