'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { InfoHint } from '@/components/ui/info-hint';
import { Stepper } from '@/components/ui/stepper';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, RotateCcw, Check } from 'lucide-react';
import { buildAuthHeader } from '@/lib/signed-request';

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
  { id: 'meta', title: 'Name' },
  { id: 'tree', title: 'Tree' },
  { id: 'volume', title: 'Volume' },
  { id: 'review', title: 'Review' },
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
  return Number.isFinite(n) ? n.toFixed(p) : '0';
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
  const wallet = useWallet();
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
    if (!wallet.connected || !wallet.publicKey || !wallet.signMessage) {
      toast.error('Connect a wallet to sign the request');
      return;
    }
    setSubmitting(true);
    try {
      const rawBody = JSON.stringify({
        name: name.trim(),
        symbol: symbol.trim(),
        description: description.trim() || undefined,
        image: image.trim() || undefined,
        maxDepth,
        maxBufferSize: FIXED_BUFFER_SIZE,
        canopyDepth,
      });

      const auth = await buildAuthHeader({
        signer: {
          publicKey: wallet.publicKey,
          signMessage: wallet.signMessage,
        },
        method: 'POST',
        path: '/api/collections',
        rawBody,
      });

      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth': JSON.stringify(auth),
        },
        body: rawBody,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.code ?? data.error ?? `HTTP ${res.status}`);
      }

      const data = await res.json();
      const col = data.collection;
      toast.success('Tree created', {
        description: (
          <span className="font-mono">
            {col.treeAddress.slice(0, 6)}…{col.treeAddress.slice(-4)}
          </span>
        ),
        duration: 15000,
      });
      reset();
    } catch (err) {
      toast.error('Create failed', { description: (err as Error).message, duration: 15000 });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Header />
      <main className="container mx-auto max-w-2xl px-6 py-16">
        {/* Top bar: back link + stepper */}
        <div className="mb-10 flex items-center justify-between gap-4">
          <Link
            href="/collections"
            className="inline-flex size-11 items-center justify-center rounded-xl bg-background text-foreground shadow-[-3px_-3px_6px_rgba(255,255,255,0.9),3px_3px_6px_rgba(150,130,100,0.28)] transition-shadow active:shadow-[inset_2px_2px_4px_rgba(150,130,100,0.28),inset_-2px_-2px_4px_rgba(255,255,255,0.9)]"
            aria-label="Back"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <Stepper
            steps={STEPS}
            current={step}
            completed={completed}
            onSelect={(i) => {
              if (i < step || completed[i]) setStep(i);
            }}
          />
        </div>

        {/* Headline — minimal */}
        <h1 className="text-3xl font-semibold tracking-tight">
          {step === 0 && 'Name your collection'}
          {step === 1 && 'Pick a tree size'}
          {step === 2 && 'How many items?'}
          {step === 3 && 'Review & create'}
        </h1>

        {/* Live cost display — single big number, neumorphic */}
        <div className="mt-8 rounded-2xl bg-background px-6 py-5 shadow-[inset_4px_4px_8px_rgba(150,130,100,0.28),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Total cost</span>
            <span className="font-mono text-4xl font-medium tabular-nums tracking-tight">
              {fmt(aTotal)}
              <span className="ml-1 text-base text-muted-foreground">SOL</span>
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
            <span>rent <span className="text-foreground tabular-nums">{fmt(aRent)}</span></span>
            <span>·</span>
            <span>{numNfts.toLocaleString()} mints <span className="text-foreground tabular-nums">{fmt(aMint)}</span></span>
            <span>·</span>
            <span>compression <span className="text-foreground tabular-nums">{fmt(aComp)}</span></span>
            <span>·</span>
            <span>saves <span className="text-sol-green">{Math.max(0, savingsPct).toFixed(1)}%</span></span>
          </div>
        </div>

        {/* Step content */}
        <div className="mt-10">
          {step === 0 && (
            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <Input
                    placeholder="Collection name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={64}
                    autoFocus
                  />
                </div>
                <Input
                  placeholder="Symbol"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  maxLength={10}
                  className="font-mono"
                />
              </div>
              <Textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[80px] rounded-xl bg-background px-4 py-2 text-base shadow-[inset_2px_2px_4px_rgba(150,130,100,0.28),inset_-2px_-2px_4px_rgba(255,255,255,0.9)] outline-none transition-shadow duration-150 placeholder:text-ink-faint focus:shadow-[inset_3px_3px_6px_rgba(150,130,100,0.32),inset_-3px_-3px_6px_rgba(255,255,255,1)]"
              />
              <Input
                placeholder="Cover image URL (optional)"
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-4">
                {PRESETS.map((p) => {
                  const active =
                    maxDepth === p.params.maxDepth && canopyDepth === p.params.canopyDepth;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setPreset(p.params)}
                      className={`flex flex-col items-center gap-1 rounded-2xl py-5 transition-shadow ${
                        active
                          ? 'bg-background text-foreground shadow-[inset_4px_4px_8px_rgba(150,130,100,0.32),inset_-4px_-4px_8px_rgba(255,255,255,1)]'
                          : 'bg-background text-foreground shadow-[-4px_-4px_8px_rgba(255,255,255,0.9),4px_4px_8px_rgba(150,130,100,0.28)] active:shadow-[inset_3px_3px_6px_rgba(150,130,100,0.28),inset_-3px_-3px_6px_rgba(255,255,255,0.9)]'
                      }`}
                    >
                      <span className="text-3xl font-semibold tracking-tight">{p.label}</span>
                      <span className="font-mono text-xs text-muted-foreground">{p.sublabel}</span>
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-muted-foreground">
                  Depth
                  <InfoHint text="2^depth leaves. depth 14 holds ~16K cNFTs." />
                </label>
                <label className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-muted-foreground sm:justify-end">
                  Canopy
                  <InfoHint text="Caches proofs off-chain. Must be < depth." />
                </label>
                <Input
                  type="number"
                  min={3}
                  max={30}
                  value={maxDepth}
                  onChange={(e) => setMaxDepth(Number(e.target.value))}
                  className="font-mono"
                />
                <Input
                  type="number"
                  min={0}
                  max={Math.max(0, maxDepth - 1)}
                  value={canopyDepth}
                  onChange={(e) => setCanopyDepth(Number(e.target.value))}
                  className="font-mono"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <Input
                type="number"
                min={1}
                max={2 ** maxDepth}
                value={numNfts}
                onChange={(e) => setNumNfts(Number(e.target.value))}
                className="font-mono text-2xl"
              />
              <div className="flex flex-wrap gap-2">
                {[100, 1000, 10_000, 100_000, 1_000_000].map((v) => (
                  <QuickAmount key={v} value={v} current={numNfts} onClick={setNumNfts} />
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-6 md:grid-cols-[1fr_280px]">
              <div className="rounded-2xl bg-background p-6 shadow-[-6px_-6px_14px_rgba(255,255,255,0.9),6px_6px_14px_rgba(150,130,100,0.28)]">
                <dl className="space-y-3 font-mono text-sm">
                  <ReviewRow label="Name" value={name || '—'} />
                  <ReviewRow label="Symbol" value={symbol ? symbol.toUpperCase() : '—'} />
                  {description && <ReviewRow label="Description" value={description} />}
                  <ReviewRow
                    label="Tree"
                    value={`depth ${maxDepth} · ${treeCapacity(maxDepth)} leaves · buffer ${FIXED_BUFFER_SIZE}`}
                  />
                  <ReviewRow label="Items" value={numNfts.toLocaleString()} />
                </dl>
                <p className="mt-4 font-mono text-[10px] text-muted-foreground">
                  9Toww…3A7e · devnet
                </p>
              </div>

              <aside className="self-start rounded-2xl bg-background p-6 shadow-[inset_4px_4px_8px_rgba(150,130,100,0.28),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Total cost
                </div>
                <div className="mt-2 font-mono text-5xl font-medium tabular-nums tracking-tight">
                  {fmt(aTotal)}
                  <span className="ml-2 text-base font-normal text-muted-foreground">SOL</span>
                </div>
                <div className="mt-4 space-y-1.5 font-mono text-xs">
                  <ReviewCostLine label="tree rent" value={fmt(aRent)} />
                  <ReviewCostLine
                    label={`${numNfts.toLocaleString()} mints`}
                    value={fmt(aMint)}
                  />
                  <ReviewCostLine label="compression" value={fmt(aComp)} />
                </div>
                <div className="mt-4 border-t border-border pt-3 font-mono text-xs text-muted-foreground">
                  saves{' '}
                  <span className="text-sol-green">
                    {Math.max(0, savingsPct).toFixed(1)}%
                  </span>{' '}
                  vs legacy mint
                </div>
              </aside>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-10 flex items-center justify-between">
          <Button variant="neu" onClick={back} disabled={step === 0 || submitting}>
            <ArrowLeft className="size-4" />
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={next} disabled={!canAdvance} size="lg">
              Continue
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting} size="lg">
              {submitting ? 'Signing…' : 'Create tree'}
              {!submitting && <Check className="size-4" />}
            </Button>
          )}
        </div>

        {step > 0 && (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-3" />
              Start over
            </button>
          </div>
        )}
      </main>
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
      className={`rounded-xl px-4 py-2 font-mono text-sm tabular-nums transition-shadow ${
        active
          ? 'bg-background text-foreground shadow-[inset_3px_3px_6px_rgba(150,130,100,0.32),inset_-3px_-3px_6px_rgba(255,255,255,1)]'
          : 'bg-background text-muted-foreground shadow-[-2px_-2px_4px_rgba(255,255,255,0.9),2px_2px_4px_rgba(150,130,100,0.28)] hover:text-foreground active:shadow-[inset_2px_2px_4px_rgba(150,130,100,0.28),inset_-2px_-2px_4px_rgba(255,255,255,0.9)]'
      }`}
    >
      {label}
    </button>
  );
}

function ReviewRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{label}</dt>
      <dd className="text-right tabular-nums text-foreground">{value}</dd>
    </div>
  );
}

function ReviewCostLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="text-foreground tabular-nums">{value}</span>
    </div>
  );
}