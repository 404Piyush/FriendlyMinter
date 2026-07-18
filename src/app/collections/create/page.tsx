'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ArrowLeft, Zap, Sparkles } from 'lucide-react';

interface TreeParams {
  maxDepth: number;
  maxBufferSize: number;
  canopyDepth: number;
}

const presets: Array<{ label: string; params: TreeParams; capacity: string }> = [
  { label: 'Small', params: { maxDepth: 14, maxBufferSize: 64, canopyDepth: 0 }, capacity: '~16K NFTs' },
  { label: 'Medium', params: { maxDepth: 17, maxBufferSize: 64, canopyDepth: 0 }, capacity: '~131K' },
  { label: 'Large', params: { maxDepth: 20, maxBufferSize: 64, canopyDepth: 0 }, capacity: '~1M' },
  { label: 'XL', params: { maxDepth: 24, maxBufferSize: 64, canopyDepth: 0 }, capacity: '~16M' },
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

function useCountUp(target: number, duration = 350) {
  const [value, setValue] = useState(target);
  useEffect(() => {
    const start = value;
    const delta = target - start;
    if (Math.abs(delta) < 0.0001) {
      setValue(target);
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(start + delta * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return value;
}

export default function CreateCollectionPage() {
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [numNfts, setNumNfts] = useState(1000);
  const [params, setParams] = useState<TreeParams>({ maxDepth: 14, maxBufferSize: 64, canopyDepth: 0 });
  const [submitting, setSubmitting] = useState(false);

  const cost = estimateCost(params.maxDepth, params.maxBufferSize, numNfts);
  const legacyCost = numNfts * 0.012;
  const savings = ((legacyCost - cost.total) / legacyCost) * 100;

  const animatedTotal = useCountUp(cost.total);
  const animatedRent = useCountUp(cost.rent);
  const animatedMint = useCountUp(cost.mint);
  const animatedComp = useCountUp(cost.compression);
  const animatedLegacy = useCountUp(legacyCost);
  const animatedSavings = useCountUp(savings);

  // Relative weight of each component (for the bar)
  const totalForBar = Math.max(cost.total, 0.000001);
  const rentPct = (cost.rent / totalForBar) * 100;
  const mintPct = (cost.mint / totalForBar) * 100;
  const compPct = (cost.compression / totalForBar) * 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !symbol.trim()) {
      toast.error('Name and symbol are required');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          symbol: symbol.trim(),
          description: description.trim() || undefined,
          image: image.trim() || undefined,
          maxDepth: params.maxDepth,
          maxBufferSize: params.maxBufferSize,
          canopyDepth: params.canopyDepth,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.details || data.error || `HTTP ${res.status}`);
      }

      const col = data.collection;
      toast.success(`Tree created for ${col.name}`, {
        description: (
          <span>
            Tree:{' '}
            <a
              href={col.treeExplorer}
              target="_blank"
              rel="noreferrer"
              className="font-mono underline"
            >
              {col.treeAddress.slice(0, 6)}…{col.treeAddress.slice(-4)}
            </a>
          </span>
        ),
        duration: 12000,
      });
    } catch (err) {
      const message = (err as Error).message;
      toast.error('Create failed', {
        description: message,
        duration: 12000,
      });
    } finally {
      setSubmitting(false);
    }
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

        <form onSubmit={handleSubmit} className="mt-12 grid gap-16 lg:grid-cols-[1fr_320px]">
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
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
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
                {presets.map((p) => {
                  const active = params.maxDepth === p.params.maxDepth;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setParams(p.params)}
                      className={`group cursor-pointer border px-3 py-1.5 text-sm transition-all duration-150 ${
                        active
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground'
                      }`}
                    >
                      <span className="font-medium">{p.label}</span>
                      <span className={`ml-2 text-xs ${active ? 'text-primary-foreground/80' : ''}`}>
                        {p.capacity}
                      </span>
                    </button>
                  );
                })}
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

          {/* Cost summary — animated, USP-forward */}
          <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
            {/* USP — animated savings callout */}
            <div className="relative overflow-hidden border border-primary/40 bg-primary p-6 text-primary-foreground">
              <div className="absolute inset-0 -z-0 opacity-30">
                <div className="absolute -right-6 -top-6 size-32 rounded-full bg-primary-foreground/20 blur-2xl" />
                <div className="absolute -left-6 -bottom-6 size-32 rounded-full bg-primary-foreground/10 blur-2xl" />
              </div>
              <div className="relative">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 animate-pulse" />
                  <span className="text-xs font-medium uppercase tracking-[0.18em]">
                    You save
                  </span>
                </div>
                <div className="mt-3 text-5xl font-semibold tracking-tighter tabular-nums">
                  {Math.max(0, animatedSavings).toFixed(1)}
                  <span className="ml-1 text-2xl">%</span>
                </div>
                <div className="mt-2 text-xs text-primary-foreground/80">
                  vs. a legacy Solana mint of the same volume
                </div>

                {/* Bar: legacy vs friendly */}
                <div className="mt-5 space-y-2">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em]">
                    <span className="w-12 shrink-0 text-primary-foreground/70">Legacy</span>
                    <div className="relative h-2 flex-1 bg-primary-foreground/20">
                      <div
                        className="absolute inset-y-0 left-0 bg-primary-foreground"
                        style={{ width: '100%' }}
                      />
                    </div>
                    <span className="w-16 shrink-0 text-right font-mono tabular-nums text-primary-foreground/90">
                      {animatedLegacy.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em]">
                    <span className="w-12 shrink-0 text-primary-foreground/70">You</span>
                    <div className="relative h-2 flex-1 bg-primary-foreground/20">
                      <div
                        className="absolute inset-y-0 left-0 bg-primary-foreground transition-[width] duration-300 ease-out"
                        style={{ width: `${Math.max(2, (cost.total / Math.max(legacyCost, 0.0001)) * 100)}%` }}
                      />
                    </div>
                    <span className="w-16 shrink-0 text-right font-mono tabular-nums text-primary-foreground">
                      {animatedTotal.toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Total cost */}
            <div>
              <p className="text-sm text-muted-foreground">Estimated cost</p>
              <p className="mt-2 text-5xl font-semibold tracking-tight text-foreground tabular-nums">
                {animatedTotal.toFixed(4)}
                <span className="ml-2 text-base font-normal text-muted-foreground">SOL</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">on Solana devnet · includes tree rent</p>
            </div>

            {/* Cost composition bar */}
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Cost composition</p>
              <div
                className="mt-2 flex h-1.5 w-full overflow-hidden bg-border"
                title="Tree rent · Mints · Compression"
              >
                <div
                  className="h-full bg-primary transition-[width] duration-300 ease-out"
                  style={{ width: `${rentPct}%` }}
                />
                <div
                  className="h-full bg-foreground/60 transition-[width] duration-300 ease-out"
                  style={{ width: `${mintPct}%` }}
                />
                <div
                  className="h-full bg-muted-foreground transition-[width] duration-300 ease-out"
                  style={{ width: `${compPct}%` }}
                />
              </div>
              <div className="mt-3 space-y-1.5 text-sm">
                <Row
                  k="Tree rent"
                  v={`${animatedRent.toFixed(4)}`}
                  swatch="bg-primary"
                  emphasize={rentPct > 70}
                  hint={rentPct > 70 ? 'Dominant cost — bigger tree = more rent up front' : undefined}
                />
                <Row k={`${numNfts.toLocaleString()} mints`} v={`${animatedMint.toFixed(4)}`} swatch="bg-foreground/60" />
                <Row k="Compression" v={`${animatedComp.toFixed(4)}`} swatch="bg-muted-foreground" />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              <Zap className="size-4" />
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

function Row({
  k,
  v,
  swatch,
  emphasize,
  hint,
}: {
  k: string;
  v: string;
  swatch: string;
  emphasize?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-muted-foreground">
          <span className={`inline-block size-2 ${swatch}`} />
          {k}
        </span>
        <span
          className={`font-mono tabular-nums ${
            emphasize ? 'text-primary' : 'text-foreground'
          }`}
        >
          {v} SOL
        </span>
      </div>
      {hint && <p className="ml-4 mt-1 text-xs text-muted-foreground/80">{hint}</p>}
    </div>
  );
}
