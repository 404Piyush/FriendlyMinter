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
  const safeDepth = Number.isFinite(maxDepth) ? Math.max(1, maxDepth) : 14;
  const safeBuffer = Number.isFinite(maxBufferSize) ? Math.max(1, maxBufferSize) : 64;
  const safeCount = Number.isFinite(numNfts) ? Math.max(0, numNfts) : 0;
  const accountsRent = safeBuffer * 0.000005 + 0.00089;
  const treeRent = (2 ** safeDepth) * 0.000005;
  const mintFee = safeCount * 0.000005;
  const compression = safeCount * 0.0000035;
  return {
    rent: accountsRent + treeRent,
    mint: mintFee,
    compression,
    total: accountsRent + treeRent + mintFee + compression,
  };
}

function useCountUp(target: number, duration = 350) {
  const safeTarget = Number.isFinite(target) ? target : 0;
  const [value, setValue] = useState(safeTarget);
  useEffect(() => {
    if (!Number.isFinite(safeTarget)) {
      setValue(0);
      return;
    }
    const start = value;
    const delta = safeTarget - start;
    if (Math.abs(delta) < 0.0001) {
      setValue(safeTarget);
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
  }, [safeTarget]);
  return Number.isFinite(value) ? value : 0;
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
              rel="noopener noreferrer"
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
          className="anim-fade-up anim-stagger-0 mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
          Collections
        </Link>

        <h1 className="anim-fade-up anim-stagger-1 text-4xl font-semibold tracking-tight md:text-5xl">
          New collection
        </h1>
        <p className="anim-fade-up anim-stagger-2 mt-3 text-sm text-muted-foreground">
          Configure the on-chain Merkle tree. The deployer wallet signs and pays the rent.
        </p>

        <form onSubmit={handleSubmit} className="anim-fade-up anim-stagger-3 mt-12 grid gap-16 lg:grid-cols-[1fr_320px]">
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
                      className={`group anim-preset cursor-pointer border px-3 py-1.5 text-sm ${
                        active
                          ? 'border-white/10 bg-sol-gradient text-primary-foreground shadow-[0_0_0_3px_rgba(20,241,149,0.18)]'
                          : 'border-border bg-background text-muted-foreground hover:border-sol-purple/50 hover:text-foreground'
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
            <div className="relative overflow-hidden border border-white/10 bg-sol-gradient p-6 text-primary-foreground anim-fade-up anim-stagger-3 shadow-[0_8px_40px_-12px_rgba(153,69,255,0.5)]">
              <div className="anim-shimmer-bar" />
              <div className="absolute inset-0 -z-0 opacity-30">
                <div className="absolute -right-6 -top-6 size-32 rounded-full bg-white/20 blur-2xl" />
                <div className="absolute -left-6 -bottom-6 size-32 rounded-full bg-white/10 blur-2xl" />
              </div>
              <div className="relative">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 anim-sparkle" />
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary-foreground/90">
                    You save
                  </span>
                </div>
                <div className="anim-savings mt-3 text-6xl font-semibold tracking-tighter tabular-nums text-primary-foreground">
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
                    <div className="relative h-2 flex-1 bg-white/20">
                      <div
                        className="absolute inset-y-0 left-0 right-0 bg-white anim-bar-grow"
                        style={{ animationDuration: '0.4s' }}
                      />
                    </div>
                    <span className="w-16 shrink-0 text-right font-mono tabular-nums text-primary-foreground/90">
                      {animatedLegacy.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em]">
                    <span className="w-12 shrink-0 text-primary-foreground/70">You</span>
                    <div className="relative h-2 flex-1 bg-white/20">
                      <div
                        className="absolute inset-y-0 left-0 bg-white anim-bar-grow"
                        style={{
                          width: `${Math.max(2, (cost.total / Math.max(legacyCost, 0.0001)) * 100)}%`,
                          animationDuration: '0.5s',
                        }}
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
            <div className="anim-fade-up anim-stagger-4">
              <p className="text-sm text-muted-foreground">Estimated cost</p>
              <p
                key={animatedTotal.toFixed(4)}
                className="mt-2 text-5xl font-semibold tracking-tight text-foreground tabular-nums anim-number-flash"
              >
                {animatedTotal.toFixed(4)}
                <span className="ml-2 text-base font-normal text-muted-foreground">SOL</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">on Solana devnet · includes tree rent</p>
            </div>

            {/* Cost composition bar */}
            <div className="anim-fade-up anim-stagger-5">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Cost composition</p>
              <div
                className="mt-2 flex h-1.5 w-full overflow-hidden bg-border"
                title="Tree rent · Mints · Compression"
              >
                <div
                  key={`rent-${rentPct.toFixed(0)}`}
                  className="h-full bg-sol-gradient-horizontal anim-bar-grow"
                  style={{ width: `${rentPct}%`, animationDuration: '0.4s' }}
                />
                <div
                  key={`mint-${mintPct.toFixed(0)}`}
                  className="h-full bg-sol-purple/80 anim-bar-grow"
                  style={{ width: `${mintPct}%`, animationDuration: '0.5s', animationDelay: '60ms' }}
                />
                <div
                  key={`comp-${compPct.toFixed(0)}`}
                  className="h-full bg-sol-green/80 anim-bar-grow"
                  style={{ width: `${compPct}%`, animationDuration: '0.6s', animationDelay: '120ms' }}
                />
              </div>
              <div className="mt-3 space-y-1.5 text-sm">
                <Row
                  k="Tree rent"
                  v={`${animatedRent.toFixed(4)}`}
                  swatch="bg-sol-gradient"
                  emphasize={rentPct > 70}
                  hint={rentPct > 70 ? 'Dominant cost — bigger tree = more rent up front' : undefined}
                />
                <Row k={`${numNfts.toLocaleString()} mints`} v={`${animatedMint.toFixed(4)}`} swatch="bg-sol-purple/80" />
                <Row k="Compression" v={`${animatedComp.toFixed(4)}`} swatch="bg-sol-green/80" />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="anim-cta w-full"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Submitting…
                </>
              ) : (
                <>
                  <Zap className="size-4 transition-transform group-hover:scale-110" />
                  Create collection
                </>
              )}
            </Button>
            <p className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
              <span className="size-1.5 animate-pulse rounded-full bg-success" />
              Signs with the live deployer wallet · on Solana devnet
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
          className={`font-mono tabular-nums transition-colors ${
            emphasize ? 'text-sol-gradient font-semibold' : 'text-foreground'
          }`}
        >
          {v} SOL
        </span>
      </div>
      {hint && <p className="ml-4 mt-1 text-xs text-muted-foreground/80">{hint}</p>}
    </div>
  );
}
