'use client';

import { use } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  ExternalLink,
  Copy,
  Users,
  Activity,
  Coins,
  Hash,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Zap,
  ArrowUpRight,
} from 'lucide-react';
import { toast } from 'sonner';

interface Collection {
  name: string;
  symbol: string;
  status: string;
  minted: number;
  max: number;
  merkleTree: string;
  creator: string;
  description: string;
  image: string;
  depth: number;
  buffer: number;
  createdAt: string;
}

const COLLECTIONS: Record<string, Collection> = {
  'demo-collection-01': {
    name: 'Solana Genesis Pixels',
    symbol: 'GPX',
    status: 'MINTING',
    minted: 642,
    max: 1000,
    merkleTree: '8xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    creator: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    description: '1,000 generative pixel-art characters minted via Bubblegum.',
    image: 'GPX',
    depth: 14,
    buffer: 64,
    createdAt: '2025-08-15',
  },
  'demo-collection-02': {
    name: 'DeGods Lite',
    symbol: 'DGL',
    status: 'INITIALIZED',
    minted: 0,
    max: 5000,
    merkleTree: '6rY9Tg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    creator: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    description: 'Hand-illustrated profile-pic collection with royalty splits.',
    image: 'DGL',
    depth: 17,
    buffer: 64,
    createdAt: '2025-08-22',
  },
  'demo-collection-03': {
    name: 'On-chain Receipts',
    symbol: 'RECEIPT',
    status: 'COMPLETED',
    minted: 2500,
    max: 2500,
    merkleTree: '3aP7Tg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    creator: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    description: 'POAP-style attendance tokens, batch-minted after each event.',
    image: 'RCPT',
    depth: 14,
    buffer: 64,
    createdAt: '2025-09-01',
  },
};

const recentMints = [
  { id: 642, owner: 'Gx9K…mP2', time: '2s ago' },
  { id: 641, owner: 'B3xF…yR8', time: '4s ago' },
  { id: 640, owner: 'Ht7W…qN5', time: '6s ago' },
  { id: 639, owner: '4aB8…kT1', time: '8s ago' },
  { id: 638, owner: 'Yk2P…vM3', time: '10s ago' },
  { id: 637, owner: 'Fn6L…xD9', time: '12s ago' },
];

const STATUS_VARIANT: Record<string, 'success' | 'default' | 'secondary' | 'muted' | 'destructive'> = {
  COMPLETED: 'success',
  MINTING: 'default',
  INITIALIZED: 'secondary',
  DRAFT: 'muted',
  FAILED: 'destructive',
};

export default function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const c = COLLECTIONS[id];
  const explorerUrl = `https://explorer.solana.com/address/${c?.merkleTree ?? ''}?cluster=devnet`;

  if (!c) {
    return (
      <div className="relative z-10">
        <Header />
        <main className="container mx-auto px-4 py-20 text-center">
          <p className="label">404 · Not found</p>
          <h1 className="display mt-3 text-5xl">No such collection.</h1>
          <Button asChild className="mt-6" variant="outline">
            <Link href="/collections">Back to collections</Link>
          </Button>
        </main>
      </div>
    );
  }

  const pct = (c.minted / c.max) * 100;
  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="relative z-10">
      <Header />

      <main className="container mx-auto px-4 pt-12 pb-24">
        <Link
          href="/collections"
          className="mb-6 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to collections
        </Link>

        {/* Header */}
        <div className="grid gap-10 border-b border-border pb-10 md:grid-cols-[260px_1fr]">
          <div className="flex aspect-square items-center justify-center bg-primary font-mono text-7xl font-semibold text-primary-foreground">
            {c.image}
          </div>

          <div className="space-y-6">
            <div>
              <p className="label">§{c.symbol} · created {c.createdAt}</p>
              <h1 className="display mt-3 text-5xl md:text-6xl">{c.name}</h1>
              <p className="mt-3 max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground">
                {c.description}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge variant={STATUS_VARIANT[c.status] ?? 'muted'}>{c.status}</Badge>
                <Badge variant="outline">depth {c.depth} / buffer {c.buffer}</Badge>
                <Badge variant="outline">Bubblegum v2</Badge>
              </div>
            </div>

            <div className="border border-border bg-card p-6">
              <div className="flex items-baseline justify-between">
                <span className="label">Mint progress</span>
                <span className="font-mono text-xs text-primary">{pct.toFixed(1)}%</span>
              </div>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="display text-4xl">{c.minted.toLocaleString()}</span>
                <span className="text-muted-foreground">/ {c.max.toLocaleString()}</span>
              </div>
              <Progress value={pct} className="mt-4 h-1 [&>div]:bg-primary" />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button size="lg">
                {c.status === 'INITIALIZED' ? 'Start minting' : c.status === 'COMPLETED' ? 'Re-mint' : 'Resume mint'}
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
                  Explorer <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <Button size="lg" variant="ghost">
                Pause
              </Button>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="my-10 grid grid-cols-2 gap-px bg-border md:grid-cols-4">
          <Stat icon={Users} label="Holders" value="412" />
          <Stat icon={Coins} label="Volume" value="84.3 SOL" />
          <Stat icon={Zap} label="Mint fee" value="~0.00001 SOL" mono />
          <Stat icon={Hash} label="Tree" value={`${c.merkleTree.slice(0, 4)}…${c.merkleTree.slice(-4)}`} mono />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="items">
          <TabsList className="border-b border-border bg-transparent p-0">
            <TabsTrigger
              value="items"
              className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <ImageIcon className="mr-2 h-4 w-4" /> Recent mints
            </TabsTrigger>
            <TabsTrigger
              value="config"
              className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <Hash className="mr-2 h-4 w-4" /> On-chain config
            </TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="mt-6">
            <div className="border border-border">
              <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3 md:grid-cols-6">
                {recentMints.map((m) => (
                  <div key={m.id} className="bg-card p-4">
                    <div className="mb-3 flex h-16 items-center justify-center bg-secondary font-mono text-2xl font-semibold">
                      {c.image}
                    </div>
                    <div className="font-mono text-xs">#{m.id}</div>
                    <div className="mt-1 truncate font-mono text-[10px] text-muted-foreground">
                      {m.owner}
                    </div>
                    <div className="mt-1 flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" /> {m.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="config" className="mt-6">
            <div className="border border-border bg-card">
              {[
                { k: 'Merkle tree address', v: c.merkleTree, mono: true },
                { k: 'Creator', v: c.creator, mono: true },
                { k: 'Max depth', v: String(c.depth), mono: true },
                { k: 'Max buffer size', v: String(c.buffer), mono: true },
                { k: 'Network', v: 'Solana Devnet', mono: false },
                { k: 'Standard', v: 'Metaplex Bubblegum v2', mono: false },
              ].map((row, i, arr) => (
                <div
                  key={row.k}
                  className={`flex items-center justify-between gap-3 px-5 py-4 ${
                    i < arr.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  <span className="label">{row.k}</span>
                  <div className="flex max-w-[60%] items-center gap-2">
                    <span className={`truncate font-mono text-xs ${row.mono ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {row.v}
                    </span>
                    {row.mono && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-primary"
                        onClick={() => copy(row.v)}
                      >
                        <Copy className="h-3 w-3" />
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
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <span className="label">{label}</span>
      </div>
      <div className={`mt-2 truncate font-serif text-2xl tracking-tight ${mono ? 'font-mono text-base' : ''}`}>
        {value}
      </div>
    </div>
  );
}
