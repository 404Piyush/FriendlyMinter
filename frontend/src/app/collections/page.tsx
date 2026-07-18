'use client';

import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { useStore } from '@/lib/store';

const STATUS_VARIANT: Record<string, 'success' | 'default' | 'secondary' | 'muted' | 'destructive'> = {
  COMPLETED: 'success',
  MINTING: 'default',
  INITIALIZED: 'secondary',
  PAUSED: 'muted',
  DRAFT: 'muted',
  FAILED: 'destructive',
};

export default function CollectionsPage() {
  const collections = useStore((s) => s.collections);
  const jobs = useStore((s) => s.jobs);

  return (
    <div>
      <Header />
      <main className="container mx-auto px-6 py-16">
        <div className="mb-12 flex items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Collections</h1>
            <p className="mt-3 max-w-md text-muted-foreground">
              {collections.length === 0
                ? 'No collections yet. Create one to mint real cNFTs on testnet.'
                : 'Manage your cNFT collections. Stored locally in this browser.'}
            </p>
          </div>
          <Button size="lg" asChild>
            <Link href="/collections/create">
              <Plus className="size-4" />
              New collection
            </Link>
          </Button>
        </div>

        {collections.length === 0 ? (
          <div className="grid grid-cols-1 gap-px bg-border">
            <Link
              href="/collections/create"
              className="flex min-h-[200px] flex-col items-start justify-center border-2 border-dashed border-border bg-background p-12 transition-colors hover:border-primary hover:bg-primary/5"
            >
              <Plus className="mb-4 size-5 text-muted-foreground" />
              <h3 className="text-xl font-semibold tracking-tight">Create your first on-chain collection</h3>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Connect a funded wallet, pick a tree size, and FriendlyMinter will create a real Merkle tree
                on Solana testnet via the Metaplex Bubblegum program.
              </p>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-px bg-border md:grid-cols-2 lg:grid-cols-3">
            {collections.map((c) => {
              const minted = jobs.filter((j) => j.collectionId === c.id).reduce((a, j) => a + j.minted, 0);
              const max = c.capacity;
              const pct = max > 0 ? (minted / max) * 100 : 0;
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
                    <Badge variant={STATUS_VARIANT[c.status] ?? 'muted'}>{c.status}</Badge>
                  </div>
                  <h3 className="mt-6 text-xl font-semibold tracking-tight">{c.name}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {c.description ?? `On-chain collection. Merkle tree ${c.merkleTree.slice(0, 4)}…${c.merkleTree.slice(-4)}.`}
                  </p>
                  <div className="mt-8">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{minted.toLocaleString()} minted (session)</span>
                      <span>{max.toLocaleString()} max</span>
                    </div>
                    <div className="mt-2 h-px bg-border">
                      <div className="h-px bg-primary" style={{ width: `${Math.min(100, pct)}%` }} />
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
              <p className="mt-2 text-sm text-muted-foreground">Spin up a Merkle tree in seconds.</p>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
