'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { InfoHint } from '@/components/ui/info-hint';
import { Stepper, ProgressBar } from '@/components/ui/stepper';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, RotateCcw, Check } from 'lucide-react';

interface TreeParams {
  maxDepth: number;
  maxBufferSize: number;
  canopyDepth: number;
}

const FIXED_BUFFER_SIZE = 64;

const PRESETS: Array<{ label: string; sublabel: string; params: TreeParams }> = [
  { label: 'S', sublabel: '16K leaves', params: { maxDepth: 14, maxBufferSize: 64, canopyDepth: 0 } },
  { label: 'M', sublabel: '131K leaves', params: { maxDepth: 17, maxBufferSize: 64, canopyDepth: 0 } },
  { label: 'L', sublabel: '1M leaves', params: { maxDepth: 20, maxBufferSize: 64, canopyDepth: 0 } },
  { label: 'XL', sublabel: '16M leaves', params: { maxDepth: 24, maxBufferSize: 64, canopyDepth: 0 } },
];

const STEPS = [
  { id: 'meta', title: 'Name & symbol', description: 'What the collection is called' },
  { id: 'tree', title: 'Tree size', description: 'How many leaves it can hold' },
  { id: 'volume', title: 'Mint volume', description: 'How many items you plan to mint' },
  { id: 'review', title: 'Review & create', description: 'Confirm the details' },
];

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

function fmt(n: number, p = 4) {
  return Number.isFinite(n) ? n.toFixed(p) : "0";
}

function treeCapacity(maxDepth: number): string {
  const leaves = 2 ** maxDepth;
  if (leaves >= 1_000_000) return `${(leaves / 1_000_000).toFixed(0)}M`;
  if (leaves >= 1_000) return `${(leaves / 1_000).toFixed(0)}K`;
  return String(leaves);
}

export default function CreateCollectionPage() {
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState<boolean[]>([false, false, false, false]);

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

  const setPreset = (p: TreeParams) => {
    setMaxDepth(p.maxDepth);
    setCanopyDepth(p.canopyDepth);
  };

  const canAdvance = (() => {
    if (step === 0) return name.trim().length > 0 && symbol.trim().length > 0;
    if (step === 1) return maxDepth >= 3 && maxDepth <= 30 && canopyDepth >= 0 && canopyDepth < maxDepth;
    if (step === 2) return numNfts > 0;
    return true;
  })();

  const next = () => {
    if (!canAdvance) return;
    setCompleted((c) => c.map((v, i) => (i === step ? true : v)));
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const back = () => setStep((s) => Math.max(0, s - 1));
  const reset = () => {
    setStep(0);
    setCompleted([false, false, false, false]);
  };

  const handleSubmit = async () => {
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
      toast.success('Tree created on Solana devnet', {
        description: (
          <span>
            Tree:{' '}
            <a
              href={col.treeExplorer}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono underline-offset-4 hover:underline"
            >
              {col.treeAddress.slice(0, 6)}…{col.treeAddress.slice(-4)}
            </a>
          </span>
        ),
        duration: 15000,
      });
      reset();
    } catch (err) {
      const message = (err as Error).message;
      toast.error('Create failed', { description: message, duration: 15000 });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Header />
      <main className="container mx-auto max-w-4xl px-6 py-12">
        <Link
          href="/collections"
          className="mb-6 inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3" />
          Collections
        </Link>

        <div className="flex items-baseline justify-between gap-4">
          <h1 className="text-5xl tracking-tight md:text-6xl">New collection</h1>
          <span className="font-mono text-xs text-muted-foreground">
            {step + 1} of {STEPS.length}
          </span>
        </div>

        <p className="mt-3 max-w-prose text-base text-muted-foreground">
          Set up an on-chain Merkle tree that will hold your compressed NFTs. The deployer
          wallet signs the create-tree transaction on Solana devnet — no mainnet funds touched.
        </p>

        {/* Stepper breadcrumb */}
        <div className="mt-10">
          <Stepper
            steps={STEPS}
            current={step}
            completed={completed}
            onSelect={(i) => {
              if (i < step || completed[i]) setStep(i);
            }}
          />
        </div>
        <ProgressBar value={(step + 1) / STEPS.length} />

        {/* Slim cost bar */}
        <CostBar
          total={aTotal}
          rent={aRent}
          mints={aMint}
          comp={aComp}
          numNfts={numNfts}
          capacity={treeCapacity(maxDepth)}
          savingsPct={savingsPct}
        />

        {/* Form body */}
        <div className="mt-12">
          {step === 0 && (
            <StepFrame
              eyebrow="Step 01 — Name & symbol"
              title="Tell us what to call it"
              description="The name and symbol show up in wallets, marketplaces, and the Solana explorer."
            >
              <div className="grid gap-6 md:grid-cols-3">
                <Field label="Collection name" htmlFor="name" className="md:col-span-2">
                  <Input
                    id="name"
                    placeholder="Solana Genesis Pixels"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={64}
                    autoFocus
                  />
                </Field>
                <Field label="Symbol" htmlFor="symbol">
                  <Input
                    id="symbol"
                    placeholder="GPX"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    maxLength={10}
                  />
                </Field>
              </div>
              <Field label="Description" htmlFor="description">
                <Textarea
                  id="description"
                  placeholder="Optional. A short pitch for the collection."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[88px] rounded-md border border-border bg-card px-3 py-2 text-sm shadow-sm transition-colors hover:border-foreground/30 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
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
            </StepFrame>
          )}

          {step === 1 && (
            <StepFrame
              eyebrow="Step 02 — Tree size"
              title="How big should the tree be?"
              description="Pick the smallest preset that fits. You can't resize later — but you can always create another tree."
            >
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <Label>Presets</Label>
                  <InfoHint text="Each preset is a (depth, buffer) pair the Bubblegum program accepts on devnet. Pick the smallest that fits your collection — bigger trees cost more rent up front." />
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {PRESETS.map((p) => {
                    const active =
                      maxDepth === p.params.maxDepth && canopyDepth === p.params.canopyDepth;
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setPreset(p.params)}
                        className={`group flex flex-col items-start gap-1 rounded-lg border p-4 text-left transition-colors ${
                          active
                            ? 'border-foreground bg-foreground text-background shadow-sm'
                            : 'border-border bg-card text-foreground hover:border-foreground/40'
                        }`}
                      >
                        <div className="flex w-full items-baseline justify-between">
                          <span className="text-2xl font-serif leading-none tracking-tight">{p.label}</span>
                          <span className={`font-mono text-[10px] uppercase tracking-[0.18em] ${active ? 'text-background/70' : 'text-muted-foreground'}`}>
                            {p.sublabel}
                          </span>
                        </div>
                        <div className={`font-mono text-xs ${active ? 'text-background/80' : 'text-muted-foreground'}`}>
                          depth {p.params.maxDepth} · canopy {p.params.canopyDepth}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8 grid gap-6 md:grid-cols-2">
                <Field
                  label={
                    <span className="inline-flex items-center gap-2">
                      Max depth
                      <InfoHint text="Depth sets the tree's capacity: 2^depth leaves. depth 14 holds ~16K cNFTs, depth 20 holds ~1M." />
                    </span>
                  }
                  htmlFor="maxDepth"
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
                  label={
                    <span className="inline-flex items-center gap-2">
                      Canopy depth
                      <InfoHint text="The canopy caches Merkle proofs off-chain, reducing per-mint proof size. Must be less than max depth." />
                    </span>
                  }
                  htmlFor="canopyDepth"
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

              <Field
                label={
                  <span className="inline-flex items-center gap-2">
                    Buffer size
                    <InfoHint text="The buffer holds the next-available leaves for concurrent writes. Larger buffer = more headroom but slightly more rent." />
                  </span>
                }
              >
                <Input value={FIXED_BUFFER_SIZE} disabled className="font-mono" />
              </Field>
            </StepFrame>
          )}

          {step === 2 && (
            <StepFrame
              eyebrow="Step 03 — Mint volume"
              title="How many items?"
              description="The mint fee and compression cost scale linearly with item count. Tree rent is paid once."
            >
              <div className="grid gap-6 md:grid-cols-2">
                <Field
                  label={
                    <span className="inline-flex items-center gap-2">
                      Items
                      <InfoHint text="Total cNFTs you plan to mint into this tree. Caps at the tree's capacity (2^max depth). You don't have to mint them all at once." />
                    </span>
                  }
                  htmlFor="num"
                >
                  <Input
                    id="num"
                    type="number"
                    min={1}
                    max={2 ** maxDepth}
                    value={numNfts}
                    onChange={(e) => setNumNfts(Number(e.target.value))}
                    className="font-mono text-base"
                  />
                </Field>
                <Field label="Per-item cost">
                  <div className="flex h-10 items-center rounded-md border border-border bg-muted px-3 font-mono text-sm tabular-nums text-muted-foreground">
                    0.0000085 SOL · {((aMint + aComp) / Math.max(numNfts, 1)).toFixed(7)} each
                  </div>
                </Field>
              </div>

              <div>
                <Label>Quick amounts</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[100, 1000, 10_000, 100_000, 1_000_000].map((v) => (
                    <QuickAmount key={v} value={v} current={numNfts} onClick={setNumNfts} />
                  ))}
                </div>
              </div>
            </StepFrame>
          )}

          {step === 3 && (
            <StepFrame
              eyebrow="Step 04 — Review"
              title="Last look before signing"
              description="The deployer wallet will sign a create_tree transaction on Solana devnet."
            >
              <dl className="overflow-hidden rounded-lg border border-border bg-card">
                <Row label="Name" value={name || '—'} />
                <Row label="Symbol" value={symbol ? symbol.toUpperCase() : '—'} mono />
                {description && <Row label="Description" value={description} />}
                {image && <Row label="Cover image" value={image} mono />}
                <Row
                  label="Tree"
                  value={`depth ${maxDepth} · ${treeCapacity(maxDepth)} leaves · canopy ${canopyDepth} · buffer ${FIXED_BUFFER_SIZE}`}
                  mono
                />
                <Row label="Items" value={numNfts.toLocaleString()} mono />
                <Row
                  label="Total cost"
                  value={`${fmt(aTotal)} SOL`}
                  mono
                  emphasize
                />
              </dl>

              <p className="mt-6 font-mono text-xs text-muted-foreground">
                Deployer 9Towwzyi7pJbZNi4b25PexUXjHZP2pbFSQWWiMLg3A7e · devnet
              </p>
            </StepFrame>
          )}

          {/* Navigation */}
          <div className="mt-12 flex items-center justify-between border-t border-border pt-6">
            <div className="flex gap-2">
              <Button variant="ghost" onClick={back} disabled={step === 0 || submitting}>
                <ArrowLeft className="size-3.5" />
                Back
              </Button>
              {step > 0 && (
                <Button variant="ghost" onClick={reset} disabled={submitting}>
                  <RotateCcw className="size-3.5" />
                  Start over
                </Button>
              )}
            </div>

            {step < STEPS.length - 1 ? (
              <Button onClick={next} disabled={!canAdvance} size="lg">
                Continue
                <ArrowRight className="size-3.5" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting} size="lg">
                {submitting ? 'Signing…' : 'Create tree on devnet'}
                {!submitting && <Check className="size-4" />}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StepFrame({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl tracking-tight md:text-4xl">{title}</h2>
      {description && (
        <p className="mt-3 max-w-prose text-base leading-relaxed text-muted-foreground">{description}</p>
      )}
      <div className="mt-10 space-y-7">{children}</div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  className,
  children,
}: {
  label: React.ReactNode;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor} className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </Label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  emphasize,
}: {
  label: string;
  value: string;
  mono?: boolean;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border px-5 py-3.5 last:border-0">
      <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</dt>
      <dd
        className={`min-w-0 truncate text-right text-sm ${
          mono ? 'font-mono tabular-nums' : ''
        } ${emphasize ? 'text-lg font-serif font-normal tracking-tight text-foreground' : 'text-foreground'}`}
      >
        {value}
      </dd>
    </div>
  );
}

function QuickAmount({
  value,
  current,
  onClick,
}: {
  value: number;
  current: number;
  onClick: (v: number) => void;
}) {
  const active = current === value;
  const label = value >= 1_000_000 ? `${value / 1_000_000}M` : `${value / 1000}K`;
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`rounded-md border px-3 py-1.5 font-mono text-xs tabular-nums transition-colors ${
        active
          ? 'border-foreground bg-foreground text-background'
          : 'border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground'
      }`}
    >
      {label}
    </button>
  );
}

function CostBar({
  total,
  rent,
  mints,
  comp,
  numNfts,
  capacity,
  savingsPct,
}: {
  total: number;
  rent: number;
  mints: number;
  comp: number;
  numNfts: number;
  capacity: string;
  savingsPct: number;
}) {
  return (
    <section className="mt-8 rounded-lg border border-border bg-card px-5 py-3 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 font-mono text-xs">
        <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          Live cost
        </span>
        <span className="text-base font-serif font-normal tracking-tight text-foreground tabular-nums">
          {fmt(total)} <span className="text-xs text-muted-foreground">SOL</span>
        </span>
        <span className="text-muted-foreground">
          rent <span className="text-foreground tabular-nums">{fmt(rent)}</span>
        </span>
        <span className="text-muted-foreground">
          {numNfts.toLocaleString()} mints <span className="text-foreground tabular-nums">{fmt(mints)}</span>
        </span>
        <span className="text-muted-foreground">
          compression <span className="text-foreground tabular-nums">{fmt(comp)}</span>
        </span>
        <span className="text-muted-foreground">
          saves <span className="text-foreground tabular-nums">{Math.max(0, savingsPct).toFixed(1)}%</span>
        </span>
        <span className="text-muted-foreground">
          capacity <span className="text-foreground">{capacity}</span> leaves
        </span>
      </div>
    </section>
  );
}