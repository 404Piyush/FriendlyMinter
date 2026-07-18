import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

const collections = [
  {
    id: 'demo-collection-01',
    name: 'Solana Genesis Pixels',
    symbol: 'GPX',
    description: '1,000 generative pixel-art characters minted via Bubblegum.',
    status: 'Minting',
    variant: 'default' as const,
    minted: 642,
    max: 1000,
  },
  {
    id: 'demo-collection-02',
    name: 'DeGods Lite',
    symbol: 'DGL',
    description: 'Hand-illustrated profile-pic collection with royalty splits.',
    status: 'Initialized',
    variant: 'secondary' as const,
    minted: 0,
    max: 5000,
  },
  {
    id: 'demo-collection-03',
    name: 'On-chain Receipts',
    symbol: 'RECEIPT',
    description: 'POAP-style attendance tokens, batch-minted after each event.',
    status: 'Completed',
    variant: 'success' as const,
    minted: 2500,
    max: 2500,
  },
];

export default function CollectionsPage() {
  return (
    <div>
      <Header />
      <main className="container mx-auto px-6 py-16">
        <div className="mb-12 flex items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Collections
            </h1>
            <p className="mt-3 max-w-md text-muted-foreground">
              Manage your cNFT collections. Click any card to inspect.
            </p>
          </div>
          <Button size="lg" asChild>
            <Link href="/collections/create">
              <Plus className="size-4" />
              New collection
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-px bg-border md:grid-cols-2 lg:grid-cols-3">
          {collections.map((c) => {
            const pct = (c.minted / c.max) * 100;
            return (
              <Link
                key={c.id}
                href={`/collections/${c.id}`}
                className="group block bg-background p-8 transition-colors hover:bg-secondary/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex size-10 items-center justify-center bg-primary font-mono text-sm font-bold text-primary-foreground">
                    {c.symbol.slice(0, 2)}
                  </div>
                  <Badge variant={c.variant}>{c.status}</Badge>
                </div>

                <h3 className="mt-6 text-xl font-semibold tracking-tight">
                  {c.name}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{c.description}</p>

                <div className="mt-8">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{c.minted.toLocaleString()} minted</span>
                    <span>{c.max.toLocaleString()} max</span>
                  </div>
                  <div className="mt-2 h-px bg-border">
                    <div
                      className="h-px bg-primary"
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}

          <Link
            href="/collections/create"
            className="flex min-h-[260px] flex-col items-start justify-end border-2 border-dashed border-border bg-background p-8 transition-colors hover:border-primary hover:bg-primary/5"
          >
            <Plus className="mb-4 size-5 text-muted-foreground" />
            <h3 className="text-xl font-semibold tracking-tight">Create new collection</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Spin up a Merkle tree in seconds.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
