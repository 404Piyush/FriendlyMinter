'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { InfoHint } from '@/components/ui/info-hint';
import { Stepper } from '@/components/ui/stepper';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, RotateCcw, Check } from 'lucide-react';

interface TreeParams {
  maxDepth: number;
  maxBufferSize: number;
  canopyDepth: number;
}

const FIXED_BUFFER_SIZE = 64;

const PRESETS: Array<{ label: string; sublabel: string; params: TreeParams }> = [
  { label: 'S', sublabel: '16K', params: { maxDepth: 14, maxBufferSize: 64, canopyDepth: 0 } },
  { label: 'M', sublabel: '131K', params: { maxDepth: 17, maxBufferSize: 64, canopyDepth: 0 } },
  { label: 'L', sublabel: '1M', params: { maxDepth: 20, maxBufferSize: 64, canopyDepth: 0 } },
  { label: 'XL', sublabel: '16M', params: { maxDepth: 24, maxBufferSize: 64, canopyDepth: 0 } },
];

const STEPS = [
  { id: 'meta', title: 'Name & symbol', description: 'What the collection is called' },
  { id: 'tree', title: 'Merkle tree', description: 'How many leaves it can hold' },
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
              className="font-mono text-primary underline-offset-4 hover:underline"
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
      toast.error('Create failed', {
        description: message,
        duration: 15000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Header />
      <main className="container mx-auto max-w-6xl px-6 py-10">
        <Link
          href="/collections"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Collections
        </Link>

        <div className="mb-8 flex items-baseline justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-tight">New collection</h1>
          <span className="font-mono text-xs text-muted-foreground">
            {step + 1} / {STEPS.length}
          </span>
        </div>

        {/* Stepper — full-width row of step cards */}
        <Stepper
          steps={STEPS}
          current={step}
          completed={completed}
          onSelect={(i) => {
            if (i < step || completed[i]) setStep(i);
          }}
        />

        {/* Two-column: form + cost rail */}
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_280px]">
          {/* Form column */}
          <div className="min-w-0">
            {step === 0 && (
              <StepFrame
                eyebrow="Step 1 of 4"
                title="Tell us what to call it"
                description="The name and symbol show up in wallets, marketplaces, and explorers."
              >
                <div className="grid gap-6 md:grid-cols-3">
                  <Field
                    label="Collection name"
                    htmlFor="name"
                    hint="Max 64 chars."
                    className="md:col-span-2"
                  >
                    <Input
                      id="name"
                      placeholder="Solana Genesis Pixels"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={64}
                      autoFocus
                    />
                  </Field>
                  <Field
                    label="Symbol"
                    htmlFor="symbol"
                    hint="Max 10 chars. UPPERCASE."
                  >
                    <Input
                      id="symbol"
                      placeholder="GPX"
                      value={symbol}
                      onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                      maxLength={10}
                    />
                  </Field>
                </div>
                <Field
                  label="Description"
                  htmlFor="description"
                  hint="Optional. Shown in marketplaces."
                >
                  <Textarea
                    id="description"
                    placeholder="A pixel-art series of 1,000 generative collectibles on Solana."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[88px]"
                  />
                </Field>
                <Field
                  label="Cover image URL"
                  htmlFor="image"
                  hint="HTTPS only. Shown as the collection thumbnail."
                >
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
                eyebrow="Step 2 of 4"
                title="Pick a tree size"
                description="A Merkle tree stores all your cNFTs. You can't resize it later — pick something with room to grow."
              >
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <Label>Presets</Label>
                    <InfoHint text="Each preset maps to a fixed (depth, buffer) pair the Bubblegum program accepts on Solana devnet. Pick the smallest that fits your collection." />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-4">
                    {PRESETS.map((p) => {
                      const active =
                        maxDepth === p.params.maxDepth && canopyDepth === p.params.canopyDepth;
                      return (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => setPreset(p.params)}
                          className={`group flex flex-col items-start gap-1 border p-3 text-left transition-colors ${
                            active
                              ? 'border-foreground bg-foreground text-background'
                              : 'border-border bg-card text-foreground hover:border-foreground/40'
                          }`}
                        >
                          <div className="flex w-full items-baseline justify-between">
                            <span className="text-lg font-semibold">{p.label}</span>
                            <span className={`font-mono text-xs ${active ? 'text-background/70' : 'text-muted-foreground'}`}>
                              {p.sublabel} leaves
                            </span>
                          </div>
                          <div className={`text-xs ${active ? 'text-background/80' : 'text-muted-foreground'}`}>
                            depth {p.params.maxDepth}, canopy {p.params.canopyDepth}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <Field
                    label="Max depth"
                    htmlFor="maxDepth"
                    hint={`depth = ${maxDepth} → capacity = ${(2 ** maxDepth).toLocaleString()} leaves`}
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
                    hint={`Saves on per-mint proof size. Must be < ${maxDepth}.`}
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
                  label="Buffer size"
                  hint={`Fixed at ${FIXED_BUFFER_SIZE}. Larger buffer = more concurrent writes before the tree fills up.`}
                >
                  <Input value={FIXED_BUFFER_SIZE} disabled className="font-mono" />
                </Field>
              </StepFrame>
            )}

            {step === 2 && (
              <StepFrame
                eyebrow="Step 3 of 4"
                title="How many items?"
                description="The mint fee and compression cost scale linearly with item count."
              >
                <div className="grid gap-6 md:grid-cols-2">
                  <Field
                    label="Items in this collection"
                    htmlFor="num"
                    hint={`1 → 10,000,000 (cap = ${(2 ** maxDepth).toLocaleString()})`}
                  >
                    <Input
                      id="num"
                      type="number"
                      min={1}
                      max={2 ** maxDepth}
                      value={numNfts}
                      onChange={(e) => setNumNfts(Number(e.target.value))}
                      className="font-mono"
                    />
                  </Field>
                  <Field
                    label="Per-item cost"
                    hint="Mint fee + compression."
                  >
                    <div className="flex h-10 items-center border border-border bg-card px-3 font-mono text-sm tabular-nums text-foreground">
                      0.0000085 SOL · {((aMint + aComp) / Math.max(numNfts, 1)).toFixed(7)}/item
                    </div>
                  </Field>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <QuickAmount value={100} onClick={setNumNfts} current={numNfts} label="100" />
                  <QuickAmount value={1000} onClick={setNumNfts} current={numNfts} label="1K" />
                  <QuickAmount value={10000} onClick={setNumNfts} current={numNfts} label="10K" />
                  <QuickAmount value={100000} onClick={setNumNfts} current={numNfts} label="100K" />
                  <QuickAmount value={1000000} onClick={setNumNfts} current={numNfts} label="1M" />
                  <QuickAmount value={Math.min(2 ** maxDepth, 16000000)} onClick={setNumNfts} current={numNfts} label="max" />
                </div>
              </StepFrame>
            )}

            {step === 3 && (
              <StepFrame
                eyebrow="Step 4 of 4"
                title="Review & create"
                description="The deployer wallet signs the create_tree transaction on Solana devnet."
              >
                <dl className="divide-y divide-border border border-border bg-card">
                  <Row label="Name" value={name || '—'} />
                  <Row label="Symbol" value={symbol ? symbol.toUpperCase() : '—'} mono />
                  {description && <Row label="Description" value={description} />}
                  {image && <Row label="Cover image" value={image} mono />}
                  <Row
                    label="Tree size"
                    value={`depth ${maxDepth} · ${treeCapacity(maxDepth)} leaves · canopy ${canopyDepth} · buffer ${FIXED_BUFFER_SIZE}`}
                    mono
                  />
                  <Row label="Items" value={numNfts.toLocaleString()} mono />
                  <Row
                    label="Total cost"
                    value={`${aTotal.toFixed(4)} SOL`}
                    mono
                    emphasize
                  />
                </dl>

                <p className="mt-6 font-mono text-xs text-muted-foreground">
                  Signing with deployer 9Towwzyi7pJbZNi4b25PexUXjHZP2pbFSQWWiMLg3A7e · cluster: devnet
                </p>
              </StepFrame>
            )}

            {/* Navigation */}
            <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
              <div className="flex gap-2">
                <Button variant="ghost" onClick={back} disabled={step === 0 || submitting}>
                  <ArrowLeft className="size-3.5" />
                  Back
                </Button>
                {step === 0 && (
                  <Button variant="ghost" onClick={reset}>
                    <RotateCcw className="size-3.5" />
                    Reset
                  </Button>
                )}
              </div>

              {step < STEPS.length - 1 ? (
                <Button onClick={next} disabled={!canAdvance}>
                  Next
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

          {/* Cost rail — sticky, compact, available on every step */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="border border-border bg-card">
              <div className="border-b border-border px-4 py-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Live cost
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">SOL</span>
                </div>
                <div className="mt-1 font-mono text-2xl tabular-nums">
                  {aTotal.toFixed(4)}
                </div>
              </div>
              <dl className="divide-y divide-border font-mono text-xs">
                <CostRow label="Tree rent" value={aRent.toFixed(4)} hint="one-time" />
                <CostRow label={`${numNfts.toLocaleString()} mints`} value={aMint.toFixed(4)} />
                <CostRow label="Compression" value={aComp.toFixed(4)} />
              </dl>
              <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>vs. legacy mint</span>
                  <span className="font-mono tabular-nums text-foreground">
                    {Math.max(0, savingsPct).toFixed(1)}% off
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span>tree capacity</span>
                  <span className="font-mono tabular-nums text-foreground">
                    {treeCapacity(maxDepth)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 border border-border bg-card p-4 font-mono text-xs text-muted-foreground">
              <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-foreground">
                Cluster
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span>network</span>
                <span className="text-foreground">solana devnet</span>
              </div>
              <div className="flex items-center justify-between">
                <span>program</span>
                <span className="text-foreground">Bubblegum</span>
              </div>
              <div className="flex items-center justify-between">
                <span>fees paid by</span>
                <span className="text-foreground">deployer</span>
              </div>
            </div>
          </aside>
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
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h2>
      {description && (
        <p className="mt-2 max-w-prose text-sm text-muted-foreground">{description}</p>
      )}
      <div className="mt-8 space-y-6">{children}</div>
    </div>
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
      <div className="flex items-center justify-between">
        <Label htmlFor={htmlFor}>{label}</Label>
        {hint && <span className="font-mono text-xs text-muted-foreground">{hint}</span>}
      </div>
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
    <div className="flex items-baseline justify-between gap-4 px-4 py-3">
      <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</dt>
      <dd
        className={`min-w-0 truncate text-right text-sm ${
          mono ? 'font-mono tabular-nums' : ''
        } ${emphasize ? 'text-base font-semibold text-foreground' : 'text-foreground'}`}
      >
        {value}
      </dd>
    </div>
  );
}

function CostRow({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 px-4 py-2.5">
      <dt className="text-muted-foreground">
        {label}
        {hint && <span className="ml-1 text-[10px] text-muted-foreground/70">({hint})</span>}
      </dt>
      <dd className="tabular-nums text-foreground">{value}</dd>
    </div>
  );
}

function QuickAmount({
  value,
  label,
  current,
  onClick,
}: {
  value: number;
  label: string;
  current: number;
  onClick: (v: number) => void;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`border px-3 py-2 text-sm font-mono tabular-nums transition-colors ${
        active
          ? 'border-foreground bg-foreground text-background'
          : 'border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground'
      }`}
    >
      {label}
    </button>
  );
}