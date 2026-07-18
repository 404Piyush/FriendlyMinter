'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { publicKey } from '@metaplex-foundation/umi';
import bs58 from 'bs58';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ExternalLink,
  Copy,
  Users,
  Coins,
  Zap,
  Hash,
  Image as ImageIcon,
  Play,
  Pause,
  Loader2,
  Plus,
} from 'lucide-react';

import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useUmi } from '@/lib/bubblegum/umi';
import { mintCnfOne, signatureToBs58 } from '@/lib/bubblegum/mint';
import { useStore, newId, type Job, type MintRecord } from '@/lib/store';

const STATUS_VARIANT: Record<string, 'success' | 'default' | 'secondary' | 'muted' | 'destructive'> = {
  COMPLETED: 'success',
  MINTING: 'default',
  INITIALIZED: 'secondary',
  PAUSED: 'muted',
  DRAFT: 'muted',
  FAILED: 'destructive',
};

interface ConfigRow {
  k: string;
  v: string;
  mono: boolean;
  link?: string;
}

function explorerTreeUrl(address: string, network: string): string {
  const cluster = network === 'mainnet-beta' ? '' : `?cluster=${network}`;
  return `https://explorer.solana.com/address/${address}${cluster}`;
}

function explorerTxUrl(sig: string, network: string): string {
  const cluster = network === 'mainnet-beta' ? '' : `?cluster=${network}`;
  return `https://explorer.solana.com/tx/${sig}${cluster}`;
}

export default function CollectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const wallet = useWallet();
  const { connection } = useConnection();
  const umi = useUmi();
  const collection = useStore((s) => s.collections.find((c) => c.id === id));
  const upsertCollection = useStore((s) => s.updateCollection);
  const addJob = useStore((s) => s.addJob);
  const appendMint = useStore((s) => s.appendMint);
  const updateJob = useStore((s) => s.updateJob);
  const jobs = useStore((s) => s.jobs.filter((j) => j.collectionId === id));

  const [minting, setMinting] = useState(false);
  const [batchCount, setBatchCount] = useState(5);

  const network = (process.env.NEXT_PUBLIC_SOLANA_NETWORK as string) || 'devnet';

  const currentJob = jobs[0];
  const mintedCount = currentJob?.minted ?? 0;
  const total = currentJob?.total ?? 0;
  const lastMints: MintRecord[] = currentJob?.mints ?? [];

  useEffect(() => {
    if (!collection || currentJob) return;
    const j: Job = {
      id: newId('job'),
      collectionId: collection.id,
      status: 'PENDING',
      total: Math.max(1, 16_384 / Math.pow(2, Math.max(0, 14 - collection.maxDepth))),
      minted: 0,
      failed: 0,
      mints: [],
    };
    addJob(j);
  }, [collection?.id]);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied');
  };

  async function mintOne(index: number) {
    if (!collection) return;
    if (!wallet.connected || !wallet.publicKey) {
      toast.error('Connect a wallet first');
      return;
    }
    if (!currentJob) {
      toast.error('Job not initialized');
      return;
    }
    try {
      const sig = await mintCnfOne(umi, {
        merkleTree: publicKey(collection.merkleTree),
        collection: collection.collectionMint ? publicKey(collection.collectionMint) : null,
        leafOwner: publicKey(wallet.publicKey.toBase58()),
        metadataUri: `${(typeof window !== 'undefined' ? window.location.origin : 'https://friendlyminter.vercel.app')}/api/metadata/${encodeURIComponent(collection.id)}/${index}.json`,
        name: `${collection.name} #${index}`,
        symbol: collection.symbol,
      });
      const sigBs58 = signatureToBs58(sig);
      const record: MintRecord = {
        index,
        signature: sigBs58,
        assetId: '',
        name: `${collection.name} #${index}`,
        owner: wallet.publicKey.toBase58(),
        mintedAt: Date.now(),
      };
      appendMint(currentJob.id, record);
      upsertCollection(collection.id, { status: 'MINTING' });
      toast.success(`Minted #${index}`, { description: sigBs58.slice(0, 12) + '…' });
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : String(err);
      toast.error('Mint failed', { description: message });
      updateJob(currentJob.id, { failed: currentJob.failed + 1 });
    }
  }

  async function mintBatch() {
    setMinting(true);
    try {
      const start = (currentJob?.minted ?? 0) + 1;
      for (let i = 0; i < batchCount; i++) {
        await mintOne(start + i);
        await new Promise((r) => setTimeout(r, 250));
      }
    } finally {
      setMinting(false);
    }
  }

  if (!collection) {
    return (
      <div>
        <Header />
        <main className="container mx-auto px-6 py-24 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Collection not found</h1>
          <p className="mt-4 text-muted-foreground">
            This collection doesn&apos;t exist in local store. It may have been created on a different device.
          </p>
          <Button asChild className="mt-6" variant="outline">
            <Link href="/collections">Back to collections</Link>
          </Button>
        </main>
      </div>
    );
  }

  const pct = total > 0 ? Math.min(100, (mintedCount / total) * 100) : 0;

  return (
    <div>
      <Header />
      <main className="container mx-auto px-6 py-16">
        <Link
          href="/collections"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Collections
        </Link>

        <div className="grid items-start gap-12 md:grid-cols-[200px_1fr]">
          <div className="flex aspect-square w-full max-w-[200px] items-center justify-center bg-primary font-mono text-5xl font-bold text-primary-foreground">
            {collection.symbol.slice(0, 4)}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={STATUS_VARIANT[collection.status] ?? 'muted'}>{collection.status}</Badge>
              <Badge variant="outline">{collection.symbol}</Badge>
              <span className="text-sm text-muted-foreground">
                Created {new Date(collection.createdAt).toLocaleString()}
              </span>
            </div>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">{collection.name}</h1>
            {collection.description && (
              <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                {collection.description}
              </p>
            )}

            <div className="mt-8 flex flex-wrap gap-2">
              <Button size="lg" onClick={mintBatch} disabled={minting || !wallet.connected}>
                {minting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Minting…
                  </>
                ) : (
                  <>
                    <Play className="size-4" /> Mint next {batchCount}
                  </>
                )}
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href={explorerTreeUrl(collection.merkleTree, network)} target="_blank" rel="noopener noreferrer">
                  Tree explorer <ExternalLink className="size-4" />
                </a>
              </Button>
              <div className="flex items-center gap-2 border border-border bg-background px-3 font-mono text-sm">
                <label htmlFor="batch" className="text-xs text-muted-foreground">batch</label>
                <input
                  id="batch"
                  type="number"
                  min={1}
                  max={50}
                  value={batchCount}
                  onChange={(e) => setBatchCount(Math.max(1, Math.min(50, Number(e.target.value))))}
                  className="w-12 bg-transparent text-right outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <Card className="mt-12">
          <CardContent className="py-6">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Mint progress (this session)</span>
              <span className="font-mono text-sm text-primary">{pct.toFixed(1)}%</span>
            </div>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-4xl font-semibold tracking-tight">{mintedCount.toLocaleString()}</span>
              <span className="text-muted-foreground">/ {total.toLocaleString()}</span>
            </div>
            <Progress value={pct} className="mt-4 h-px [&>div]:bg-primary" />
            <p className="mt-3 text-xs text-muted-foreground">
              Tree capacity: {collection.capacity.toLocaleString()} leaves (maxDepth {collection.maxDepth}, maxBufferSize {collection.maxBufferSize}).
              Session mints stored in this browser only.
            </p>
          </CardContent>
        </Card>

        <div className="mt-12 grid grid-cols-2 gap-px bg-border md:grid-cols-4">
          <Stat icon={Users} label="Minted" value={mintedCount.toLocaleString()} />
          <Stat icon={Coins} label="Per mint" value="~0.00001" mono />
          <Stat icon={Zap} label="Standard" value="Bubblegum v2" />
          <Stat
            icon={Hash}
            label="Tree"
            value={`${collection.merkleTree.slice(0, 4)}…${collection.merkleTree.slice(-4)}`}
            mono
          />
        </div>

        <Tabs defaultValue="items" className="mt-16">
          <TabsList className="border-b border-border bg-transparent p-0">
            <TabsTrigger
              value="items"
              className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 shadow-none data-[state=active]:border-foreground"
            >
              <ImageIcon className="mr-2 size-4" /> Recent mints
            </TabsTrigger>
            <TabsTrigger
              value="config"
              className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 shadow-none data-[state=active]:border-foreground"
            >
              <Hash className="mr-2 size-4" /> On-chain config
            </TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="mt-6">
            {lastMints.length === 0 ? (
              <p className="border border-border bg-background p-8 text-center text-sm text-muted-foreground">
                No mints yet. Click &quot;Mint next N&quot; above to create your first cNFT on testnet.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3 md:grid-cols-6">
                {lastMints.slice(0, 24).map((m) => (
                  <div key={`${m.index}-${m.signature}`} className="bg-background p-4 text-center">
                    <div className="mb-3 flex h-16 items-center justify-center bg-secondary font-mono text-xl font-semibold">
                      #{m.index}
                    </div>
                    <a
                      href={explorerTxUrl(m.signature, network)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate font-mono text-[10px] text-primary hover:underline"
                    >
                      {m.signature.slice(0, 4)}…{m.signature.slice(-4)}
                    </a>
                    <div className="mt-1 font-mono text-[10px] text-muted-foreground">
                      {new Date(m.mintedAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="config" className="mt-6">
            <div className="border border-border">
              {([
                { k: 'Merkle tree address', v: collection.merkleTree, mono: true, link: explorerTreeUrl(collection.merkleTree, network) },
                ...(collection.collectionMint
                  ? [{ k: 'Collection mint', v: collection.collectionMint, mono: true, link: explorerTreeUrl(collection.collectionMint, network) }]
                  : []),
                ...(collection.treeSignature
                  ? [{ k: 'Tree create tx', v: collection.treeSignature, mono: true, link: explorerTxUrl(collection.treeSignature, network) }]
                  : []),
                { k: 'Max depth', v: String(collection.maxDepth), mono: true },
                { k: 'Max buffer size', v: String(collection.maxBufferSize), mono: true },
                { k: 'Canopy depth', v: String(collection.canopyDepth), mono: true },
                { k: 'Capacity (leaves)', v: collection.capacity.toLocaleString(), mono: true },
                { k: 'Owner', v: collection.owner, mono: true },
                { k: 'Network', v: `Solana ${network}`, mono: false },
                { k: 'Standard', v: 'Metaplex Bubblegum v2', mono: false },
              ] as ConfigRow[]).map((row, i, arr) => (
                <div
                  key={row.k}
                  className={`flex items-center justify-between gap-3 px-5 py-4 ${
                    i < arr.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  <span className="text-sm text-muted-foreground">{row.k}</span>
                  <div className="flex max-w-[60%] items-center gap-2">
                    {row.link ? (
                      <a
                        href={row.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`truncate font-mono text-xs text-primary hover:underline ${row.mono ? '' : 'text-muted-foreground'}`}
                      >
                        {row.v}
                      </a>
                    ) : (
                      <span className={`truncate font-mono text-xs ${row.mono ? '' : 'text-muted-foreground'}`}>
                        {row.v}
                      </span>
                    )}
                    {row.mono && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6 text-muted-foreground hover:text-foreground"
                        onClick={() => copy(row.v)}
                      >
                        <Copy className="size-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="bg-background p-5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </div>
      <div className={`mt-2 truncate text-lg font-semibold ${mono ? 'font-mono text-sm' : ''}`}>
        {value}
      </div>
    </div>
  );
}
