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
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto max-w-5xl px-4 py-12">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/collections">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Collections
          </Link>
        </Button>

        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Coins className="h-4 w-4" />
            New Collection
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Create a cNFT Collection</h1>
          <p className="mt-2 text-muted-foreground">
            Configure metadata + Merkle-tree parameters. Cost estimate updates live.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
                <CardDescription>Basic on-chain metadata for your collection.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="md:col-span-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Solana Genesis Pixels"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1.5"
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
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="A short description of the collection…"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1.5 min-h-[100px]"
                  />
                </div>

                <div>
                  <Label htmlFor="image">Cover Image URL</Label>
                  <Input
                    id="image"
                    placeholder="https://…/cover.png  (IPFS, Arweave, or HTTPS)"
                    className="mt-1.5"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Recommended 1200×630. We auto-detect IPFS / Arweave gateways.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  Merkle Tree Configuration
                </CardTitle>
                <CardDescription>
                  Pick a preset or tune parameters. The tree is created on-chain when you submit.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                  {TREE_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setParams(p.params)}
                      className={`rounded-lg border px-3 py-2 text-left transition-all ${
                        params.maxDepth === p.params.maxDepth
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-primary/50'
                      }`}
                    >
                      <div className="text-sm font-medium">{p.label}</div>
                      <div className="text-xs text-muted-foreground">{p.capacity}</div>
                    </button>
                  ))}
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label>Max Depth</Label>
                    <Input
                      type="number"
                      min={3}
                      max={30}
                      value={params.maxDepth}
                      onChange={(e) => setParams((p) => ({ ...p, maxDepth: Number(e.target.value) }))}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Max Buffer Size</Label>
                    <Input
                      type="number"
                      min={1}
                      max={2048}
                      value={params.maxBufferSize}
                      onChange={(e) => setParams((p) => ({ ...p, maxBufferSize: Number(e.target.value) }))}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Canopy Depth</Label>
                    <Input
                      type="number"
                      min={0}
                      max={20}
                      value={params.canopyDepth}
                      onChange={(e) => setParams((p) => ({ ...p, canopyDepth: Number(e.target.value) }))}
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mint Volume</CardTitle>
                <CardDescription>How many cNFTs do you plan to issue?</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="num">Number of NFTs</Label>
                  <Input
                    id="num"
                    type="number"
                    min={1}
                    value={numNfts}
                    onChange={(e) => setNumNfts(Number(e.target.value))}
                    className="mt-1.5"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar: live cost estimate */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  Cost estimate
                </CardTitle>
                <CardDescription>Solana devnet — paid in SOL.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Row label="Tree + accounts rent" value={`${cost.rent.toFixed(4)} SOL`} />
                <Row label={`${numNfts.toLocaleString()} mint fees`} value={`${cost.mint.toFixed(4)} SOL`} />
                <Row label="Compression fees" value={`${cost.compression.toFixed(4)} SOL`} />
                <div className="border-t pt-3">
                  <div className="flex items-baseline justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      {cost.total.toFixed(4)} SOL
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    vs traditional minting: ~{(numNfts * 0.012).toFixed(2)} SOL
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    <Sparkles className="mr-1 h-3 w-3" /> ~99% cheaper
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-500/20 bg-blue-500/5">
              <CardContent className="flex gap-3 p-4">
                <Info className="h-5 w-5 shrink-0 text-blue-500" />
                <p className="text-sm text-muted-foreground">
                  Submitting creates an on-chain Merkle tree on devnet. Use the
                  {' '}<span className="font-mono text-foreground">Solana Faucet</span> to fund your wallet
                  with devnet SOL before submitting.
                </p>
              </CardContent>
            </Card>

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Create Collection'}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Form is in demo mode — values are not persisted.
            </p>
          </aside>
        </form>
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono text-foreground">{value}</span>
    </div>
  );
}
