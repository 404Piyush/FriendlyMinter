'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Coins,
  Plus,
  ArrowLeft,
  Calculator,
  Sparkles,
  Info,
  Layers,
  ArrowUpRight,
  Hash,
} from 'lucide-react';

interface TreeParams {
  maxDepth: number;
  maxBufferSize: number;
  canopyDepth: number;
}

const TREE_PRESETS: Array<{ label: string; params: TreeParams; capacity: string }> = [
  { label: 'Tiny', params: { maxDepth: 3, maxBufferSize: 8, canopyDepth: 0 }, capacity: '~8 NFTs' },
  { label: 'Small', params: { maxDepth: 10, maxBufferSize: 16, canopyDepth: 3 }, capacity: '~1K NFTs' },
  { label: 'Medium', params: { maxDepth: 14, maxBufferSize: 64, canopyDepth: 0 }, capacity: '~16K NFTs' },
  { label: 'Large', params: { maxDepth: 17, maxBufferSize: 64, canopyDepth: 0 }, capacity: '~131K NFTs' },
  { label: 'XL', params: { maxDepth: 20, maxBufferSize: 64, canopyDepth: 0 }, capacity: '~1M NFTs' },
];

function estimateCost(maxDepth: number, maxBufferSize: number, numNfts: number) {
  const accountsRent = (maxBufferSize * 0.000005) + 0.00089;
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
  const savingsVsLegacy = numNfts * 0.012;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !symbol.trim()) {
      toast.error('Name and symbol are required');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success('Collection created (demo)', {
        description: `${name} (${symbol}) · ${numNfts.toLocaleString()} items`,
      });
    }, 1200);
  };

  return (
    <div className="relative z-10">
      <Header />

      <main className="container mx-auto max-w-6xl px-4 pt-12 pb-24">
        <Link
          href="/collections"
          className="mb-6 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to collections
        </Link>

        <div className="mb-10 border-b border-border pb-6">
          <p className="label">§Create · New entry</p>
          <h1 className="display mt-3 text-5xl md:text-6xl">
            New cNFT<br />
            <span className="italic text-primary">collection</span>.
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Configure metadata and Merkle-tree parameters. The cost panel reacts as you type.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-px bg-border lg:grid-cols-3">
          <div className="space-y-px bg-border lg:col-span-2">
            <Section number="01" title="Metadata" hint="Basic on-chain metadata for your collection.">
              <div className="grid gap-4 md:grid-cols-3">
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

              <div className="mt-5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="A short description of the collection…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-2 min-h-[100px]"
                />
              </div>

              <div className="mt-5">
                <Label htmlFor="image">Cover image URL</Label>
                <Input
                  id="image"
                  placeholder="https://…/cover.png  (IPFS, Arweave, or HTTPS)"
                  className="mt-2"
                />
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Recommended 1200×630 · auto-detects IPFS / Arweave gateways
                </p>
              </div>
            </Section>

            <Section number="02" title="Merkle tree" hint="Pick a preset or tune parameters.">
              <div className="mb-5 grid grid-cols-2 gap-px bg-border md:grid-cols-5">
                {TREE_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setParams(p.params)}
                    className={`flex flex-col items-start gap-1 bg-background p-3 text-left transition-colors ${
                      params.maxDepth === p.params.maxDepth
                        ? 'bg-primary/10 outline outline-1 outline-primary'
                        : 'hover:bg-secondary/40'
                    }`}
                  >
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      Preset
                    </span>
                    <span className="font-serif text-base font-medium">{p.label}</span>
                    <span className="font-mono text-[10px] text-primary">{p.capacity}</span>
                  </button>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
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
            </Section>

            <Section number="03" title="Mint volume" hint="How many cNFTs do you plan to issue?">
              <Input
                type="number"
                min={1}
                value={numNfts}
                onChange={(e) => setNumNfts(Number(e.target.value))}
                className="font-mono"
              />
            </Section>
          </div>

          {/* Sidebar: cost + submit */}
          <aside className="space-y-px bg-border lg:sticky lg:top-20 lg:self-start">
            <div className="bg-card p-6">
              <p className="label">Cost estimate · SOL</p>
              <div className="mt-4 display text-5xl text-primary">{cost.total.toFixed(4)}</div>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                devnet · updated live
              </p>

              <div className="mt-6 space-y-3 border-t border-border pt-4 text-sm">
                <Row k="Tree + accounts rent" v={`${cost.rent.toFixed(4)} SOL`} />
                <Row k={`${numNfts.toLocaleString()} mint fees`} v={`${cost.mint.toFixed(4)} SOL`} />
                <Row k="Compression" v={`${cost.compression.toFixed(4)} SOL`} />
              </div>

              <div className="mt-6 border-t border-border pt-4">
                <div className="flex items-baseline justify-between">
                  <span className="label">vs legacy mint</span>
                  <Badge variant="success">-99%</Badge>
                </div>
                <p className="mt-2 font-mono text-xs text-muted-foreground">
                  You&apos;d spend {savingsVsLegacy.toFixed(2)} SOL on a standard mint.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-primary/5 p-4">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                Submitting creates an on-chain Merkle tree on devnet. Use the{' '}
                <span className="font-mono text-foreground">Solana Faucet</span> to fund your wallet
                with devnet SOL first.
              </p>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? 'Submitting…' : 'Create collection'}
              <ArrowUpRight className="h-4 w-4" />
            </Button>
            <p className="bg-background p-4 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Demo mode · values not persisted
            </p>
          </aside>
        </form>
      </main>
    </div>
  );
}

function Section({
  number,
  title,
  hint,
  children,
}: {
  number: string;
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-background p-6 md:p-8">
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <h3 className="flex items-baseline gap-3 font-serif text-2xl font-medium tracking-tight">
          <span className="font-mono text-sm text-primary">{number}</span>
          {title}
        </h3>
        <p className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground md:block">
          {hint}
        </p>
      </div>
      {children}
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-mono text-foreground">{v}</span>
    </div>
  );
}
