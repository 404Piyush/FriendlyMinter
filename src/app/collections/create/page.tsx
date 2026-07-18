'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

interface TreeParams {
  maxDepth: number;
  maxBufferSize: number;
  canopyDepth: number;
}

const PRESETS: Array<{ label: string; sublabel: string; params: TreeParams }> = [
  { label: 'S', sublabel: '16K', params: { maxDepth: 14, maxBufferSize: 64, canopyDepth: 0 } },
  { label: 'M', sublabel: '131K', params: { maxDepth: 17, maxBufferSize: 64, canopyDepth: 0 } },
  { label: 'L', sublabel: '1M', params: { maxDepth: 20, maxBufferSize: 64, canopyDepth: 0 } },
  { label: 'XL', sublabel: '16M', params: { maxDepth: 24, maxBufferSize: 64, canopyDepth: 0 } },
];

const FIXED_BUFFER_SIZE = 64;

function estimateCost(maxDepth: number, numNfts: number) {
  const safeDepth = Number.isFinite(maxDepth) ? Math.max(1, maxDepth) : 14;
  const safeCount = Number.isFinite(numNfts) ? Math.max(0, numNfts) : 0;
  const accountsRent = FIXED_BUFFER_SIZE * 0.000005 + 0.00089;
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

function useSmoothNumber(target: number, duration = 250) {
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

function treeCapacity(maxDepth: number): string {
  const leaves = 2 ** maxDepth;
  if (leaves >= 1_000_000) return `${(leaves / 1_000_000).toFixed(0)}M`;
  if (leaves >= 1_000) return `${(leaves / 1_000).toFixed(0)}K`;
  return String(leaves);
}

export default function CreateCollectionPage() {
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [numNfts, setNumNfts] = useState(1000);
  const [maxDepth, setMaxDepth] = useState(14);
  const [canopyDepth, setCanopyDepth] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const cost = estimateCost(maxDepth, numNfts);
  const legacyCost = numNfts * 0.012;
  const savingsPct = legacyCost > 0 ? ((legacyCost - cost.total) / legacyCost) * 100 : 0;

  const aTotal = useSmoothNumber(cost.total);
  const aRent = useSmoothNumber(cost.rent);
  const aMint = useSmoothNumber(cost.mint);
  const aComp = useSmoothNumber(cost.compression);
  const aLegacy = useSmoothNumber(legacyCost);

  const setPreset = (p: TreeParams) => {
    setMaxDepth(p.maxDepth);
    setCanopyDepth(p.canopyDepth);
  };

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
          maxDepth,
          maxBufferSize: FIXED_BUFFER_SIZE,
          canopyDepth,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.details || data.error || `HTTP ${res.status}`);
      }

      const col = data.collection;
      toast.success('Tree created', {
        description: (
          <span>
            Tree:{' '}
            <a
              href={col.treeExplorer}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-primary underline-offset-4 hover:underline"
            >
              {col.treeAddress.slice(0, 6)}…{col.treeAddress.slice(-4)}
            </a>
            {' · '}
            <a
              href={col.explorer}
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-4 hover:underline"
            >
              tx
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
      <main className="container mx-auto max-w-3xl px-6 py-10">

        <Link
          href="/collections"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Collections
        </Link>

        <div className="flex items-baseline justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">New collection</h1>
          <span className="font-mono text-xs text-muted-foreground">
            {FIXED_BUFFER_SIZE}-buf
          </span>
        </div>

        {/* Cost bar — top, always visible. Three columns, no marketing. */}
        <section className="mt-6 border border-border bg-card">
          <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
            <Stat label="Total cost" value={aTotal.toFixed(4)} unit="SOL" />
            <Stat label="Tree rent" value={aRent.toFixed(4)} unit="SOL" />
            <Stat
              label={numNfts.toLocaleString() + ' mints'}
              value={aMint.toFixed(4)}
              unit="SOL"
            />
          </div>
          <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground">
            <span>
              Legacy mint:{' '}
              <span className="font-mono text-foreground">{aLegacy.toFixed(2)}</span>{' '}
              SOL · You save{' '}
              <span className="font-mono text-foreground">
                {Math.max(0, savingsPct).toFixed(1)}%
              </span>
            </span>
            <span>on Solana devnet</span>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="mt-10 space-y-10">

          {/* Metadata */}
          <Section title="Metadata" hint="What the collection will be called.">
            <div className="grid gap-5 md:grid-cols-3">
              <Field label="Name" htmlFor="name" className="md:col-span-2">
                <Input
                  id="name"
                  placeholder="Solana Genesis Pixels"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>
              <Field label="Symbol" htmlFor="symbol">
                <Input
                  id="symbol"
                  placeholder="GPX"
                  maxLength={10}
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                />
              </Field>
            </div>
            <Field label="Description" htmlFor="description">
              <Textarea
                id="description"
                placeholder="Optional."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[80px]"
              />
            </Field>
            <Field label="Cover image URL" htmlFor="image">
              <Input
                id="image"
                placeholder="https://…/cover.png"
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
            </Field>
          </Section>

          {/* Tree */}
          <Section
            title="Merkle tree"
            hint="How many leaves the tree can hold. Bigger trees cost more rent up front."
          >
            <div className="flex flex-wrap items-center gap-2">
              {PRESETS.map((p) => {
                const active =
                  maxDepth === p.params.maxDepth && canopyDepth === p.params.canopyDepth;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setPreset(p.params)}
                    className={`group flex items-baseline gap-2 border px-3 py-1.5 text-sm transition-colors ${
                      active
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground'
                    }`}
                  >
                    <span className="font-semibold">{p.label}</span>
                    <span className="font-mono text-xs opacity-80">{p.sublabel}</span>
                  </button>
                );
              })}
              <span className="ml-auto font-mono text-xs text-muted-foreground">
                capacity ={' '}
                <span className="text-foreground">{treeCapacity(maxDepth)}</span> leaves
              </span>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <Field
                label="Max depth"
                htmlFor="maxDepth"
                hint={`2^${maxDepth} = ${(2 ** maxDepth).toLocaleString()} leaves`}
              >
                <Input
                  id="maxDepth"
                  type="number"
                  min={3}
                  max={30}
                  value={maxDepth}
                  onChange={(e) => setMaxDepth(Number(e.target.value))}
                  className="font-mono"
                />
              </Field>
              <Field
                label="Canopy depth"
                htmlFor="canopyDepth"
                hint="Reduces per-mint proof size. Must be < max depth."
              >
                <Input
                  id="canopyDepth"
                  type="number"
                  min={0}
                  max={Math.max(0, maxDepth - 1)}
                  value={canopyDepth}
                  onChange={(e) => setCanopyDepth(Number(e.target.value))}
                  className="font-mono"
                />
              </Field>
            </div>
          </Section>

          {/* Volume */}
          <Section title="Mint volume" hint="How many items will be minted into this tree.">
            <div className="grid gap-5 md:grid-cols-3">
              <Field label="Items" htmlFor="num">
                <Input
                  id="num"
                  type="number"
                  min={1}
                  value={numNfts}
                  onChange={(e) => setNumNfts(Number(e.target.value))}
                  className="font-mono"
                />
              </Field>
              <Field label="Mint fee" hint={`${aMint.toFixed(4)} SOL`}>
                <div className="font-mono text-sm tabular-nums text-muted-foreground">
                  0.000005 × {numNfts.toLocaleString()}
                </div>
              </Field>
              <Field label="Compression" hint={`${aComp.toFixed(4)} SOL`}>
                <div className="font-mono text-sm tabular-nums text-muted-foreground">
                  0.0000035 × {numNfts.toLocaleString()}
                </div>
              </Field>
            </div>
          </Section>

          <div className="flex items-center justify-between border-t border-border pt-6">
            <p className="font-mono text-xs text-muted-foreground">
              deployer 9Toww…3A7e · devnet · live
            </p>
            <Button type="submit" size="lg" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Create tree'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor}>{label}</Label>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1.5 font-mono text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Stat({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="px-4 py-3">
      <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-mono text-lg tabular-nums">
        {value}
        <span className="ml-1 text-xs font-normal text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}