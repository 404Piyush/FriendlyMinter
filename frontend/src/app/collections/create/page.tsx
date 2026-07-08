'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

interface TreeParams {
  maxDepth: number;
  maxBufferSize: number;
  canopyDepth: number;
}

const presets: Array<{ label: string; params: TreeParams; capacity: string }> = [
  { label: 'Tiny', params: { maxDepth: 3, maxBufferSize: 8, canopyDepth: 0 }, capacity: '~8 NFTs' },
  { label: 'Small', params: { maxDepth: 10, maxBufferSize: 16, canopyDepth: 3 }, capacity: '~1K' },
  { label: 'Medium', params: { maxDepth: 14, maxBufferSize: 64, canopyDepth: 0 }, capacity: '~16K' },
  { label: 'Large', params: { maxDepth: 17, maxBufferSize: 64, canopyDepth: 0 }, capacity: '~131K' },
  { label: 'XL', params: { maxDepth: 20, maxBufferSize: 64, canopyDepth: 0 }, capacity: '~1M' },
];

function estimateCost(maxDepth: number, maxBufferSize: number, numNfts: number) {
  const accountsRent = maxBufferSize * 0.000005 + 0.00089;
  const treeRent = (2 ** maxDepth) * 0.000005;
  const mintFee = numNfts * 0.000005;
  const compression = numNfts * 0.0000035;
  return {
    rent: accountsRent + treeRent,
    mint: mintFee,
    compression,
    total: accountsRent + treeRent + mintFee + compression,
  };
}

export default function CreateCollectionPage() {
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [numNfts, setNumNfts] = useState(1000);
  const [params, setParams] = useState<TreeParams>({ maxDepth: 14, maxBufferSize: 64, canopyDepth: 0 });
  const [submitting, setSubmitting] = useState(false);

  const cost = estimateCost(params.maxDepth, params.maxBufferSize, numNfts);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !symbol.trim()) {
      toast.error('Name and symbol are required');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success(`${name} (${symbol}) created`, {
        description: `${numNfts.toLocaleString()} items queued (demo)`,
      });
    }, 1000);
  };

  return (
    <div>
      <Header />
      <main className="container mx-auto max-w-5xl px-6 py-16">
        <Link
          href="/collections"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Collections
        </Link>

        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
          New collection
        </h1>

        <form onSubmit={handleSubmit} className="mt-12 grid gap-16 lg:grid-cols-[1fr_280px]">
          <div className="space-y-12">
            {/* Metadata */}
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Metadata</h2>
              <div className="mt-6 space-y-5">
                <div className="grid gap-5 md:grid-cols-3">
                  <div className="md:col-span-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Solana Genesis Pixels"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="symbol">Symbol</Label>
                    <Input
                      id="symbol"
                      placeholder="GPX"
                      maxLength={10}
                      value={symbol}
                      onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Optional description…"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-2 min-h-[100px]"
                  />
                </div>

                <div>
                  <Label htmlFor="image">Cover image URL</Label>
                  <Input
                    id="image"
                    placeholder="https://…/cover.png"
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            {/* Tree parameters */}
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Merkle tree</h2>
              <div className="mt-6 grid gap-5 md:grid-cols-3">
                <div>
                  <Label>Max depth</Label>
                  <Input
                    type="number"
                    min={3}
                    max={30}
                    value={params.maxDepth}
                    onChange={(e) => setParams((p) => ({ ...p, maxDepth: Number(e.target.value) }))}
                    className="mt-2 font-mono"
                  />
                </div>
                <div>
                  <Label>Max buffer size</Label>
                  <Input
                    type="number"
                    min={1}
                    max={2048}
                    value={params.maxBufferSize}
                    onChange={(e) => setParams((p) => ({ ...p, maxBufferSize: Number(e.target.value) }))}
                    className="mt-2 font-mono"
                  />
                </div>
                <div>
                  <Label>Canopy depth</Label>
                  <Input
                    type="number"
                    min={0}
                    max={20}
                    value={params.canopyDepth}
                    onChange={(e) => setParams((p) => ({ ...p, canopyDepth: Number(e.target.value) }))}
                    className="mt-2 font-mono"
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {presets.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setParams(p.params)}
                    className={`border px-3 py-1.5 text-sm transition-colors ${
                      params.maxDepth === p.params.maxDepth
                        ? 'border-primary bg-primary/10 text-foreground'
                        : 'border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                    }`}
                  >
                    <span className="font-medium">{p.label}</span>
                    <span className="ml-2 text-xs">{p.capacity}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Volume */}
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Mint volume</h2>
              <div className="mt-6 max-w-xs">
                <Label htmlFor="num">Items in this collection</Label>
                <Input
                  id="num"
                  type="number"
                  min={1}
                  value={numNfts}
                  onChange={(e) => setNumNfts(Number(e.target.value))}
                  className="mt-2 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Cost summary */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div>
              <p className="text-sm text-muted-foreground">Estimated cost</p>
              <p className="mt-3 text-5xl font-semibold tracking-tight text-primary">
                {cost.total.toFixed(4)}
                <span className="ml-2 text-base font-normal text-muted-foreground">SOL</span>
              </p>
              <p className="mt-2 text-xs text-muted-foreground">on Solana devnet</p>
            </div>

            <div className="space-y-3 border-t border-border pt-6 text-sm">
              <Row k="Tree rent" v={`${cost.rent.toFixed(4)}`} />
              <Row k={`${numNfts.toLocaleString()} mints`} v={`${cost.mint.toFixed(4)}`} />
              <Row k="Compression" v={`${cost.compression.toFixed(4)}`} />
            </div>

            <div className="border-t border-border pt-6">
              <Badge variant="success">~99% cheaper than legacy mint</Badge>
              <p className="mt-3 text-xs text-muted-foreground">
                A standard mint for the same volume would cost about{' '}
                <span className="font-mono text-foreground">{(numNfts * 0.012).toFixed(2)} SOL</span>.
              </p>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Create collection'}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Demo mode — values are not persisted.
            </p>
          </aside>
        </form>
      </main>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-mono text-foreground">{v} SOL</span>
    </div>
  );
}
