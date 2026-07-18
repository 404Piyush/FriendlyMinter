'use client';

import { use } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
} from 'lucide-react';
import { toast } from 'sonner';

interface Collection {
  name: string;
  symbol: string;
  status: string;
  minted: number;
  max: number;
  merkleTree: string;
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
    description: 'POAP-style attendance tokens, batch-minted after each event.',
    image: 'RCPT',
    depth: 14,
    buffer: 64,
    createdAt: '2025-09-01',
  },
};

const recentMints = [
  { id: 642, owner: 'Gx9K…mP2', time: '2s' },
  { id: 641, owner: 'B3xF…yR8', time: '4s' },
  { id: 640, owner: 'Ht7W…qN5', time: '6s' },
  { id: 639, owner: '4aB8…kT1', time: '8s' },
  { id: 638, owner: 'Yk2P…vM3', time: '10s' },
  { id: 637, owner: 'Fn6L…xD9', time: '12s' },
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
      <div>
        <Header />
        <main className="container mx-auto px-6 py-24 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Collection not found</h1>
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
    toast.success('Copied');
  };

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
          {/* Cover */}
          <div className="flex aspect-square w-full max-w-[200px] items-center justify-center bg-primary font-mono text-5xl font-bold text-primary-foreground">
            {c.image}
          </div>

          {/* Title + actions */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={STATUS_VARIANT[c.status] ?? 'muted'}>{c.status}</Badge>
              <Badge variant="outline">{c.symbol}</Badge>
              <span className="text-sm text-muted-foreground">Created {c.createdAt}</span>
            </div>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              {c.name}
            </h1>
            <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {c.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              <Button size="lg">
                <Play className="size-4" />
                {c.status === 'INITIALIZED' ? 'Start minting' : 'Resume'}
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
                  Explorer <ExternalLink className="size-4" />
                </a>
              </Button>
              <Button size="lg" variant="ghost">
                <Pause className="size-4" />
                Pause
              </Button>
            </div>
          </div>
        </div>

        {/* Mint progress card */}
        <Card className="mt-12">
          <CardContent className="py-6">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Mint progress</span>
              <span className="font-mono text-sm text-primary">{pct.toFixed(1)}%</span>
            </div>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-4xl font-semibold tracking-tight">
                {c.minted.toLocaleString()}
              </span>
              <span className="text-muted-foreground">/ {c.max.toLocaleString()}</span>
            </div>
            <Progress value={pct} className="mt-4 h-px [&>div]:bg-primary" />
          </CardContent>
        </Card>

        {/* Stats grid */}
        <div className="mt-12 grid grid-cols-2 gap-px bg-border md:grid-cols-4">
          <Stat icon={Users} label="Holders" value="412" />
          <Stat icon={Coins} label="Volume" value="84.3 SOL" />
          <Stat icon={Zap} label="Mint fee" value="~0.00001" mono />
          <Stat icon={Hash} label="Tree" value={`${c.merkleTree.slice(0, 4)}…${c.merkleTree.slice(-4)}`} mono />
        </div>

        {/* Tabs */}
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
            <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3 md:grid-cols-6">
              {recentMints.map((m) => (
                <div key={m.id} className="bg-background p-4 text-center">
                  <div className="mb-3 flex h-16 items-center justify-center bg-secondary font-mono text-xl font-semibold">
                    #{m.id}
                  </div>
                  <div className="truncate font-mono text-[10px] text-muted-foreground">{m.owner}</div>
                  <div className="mt-1 font-mono text-[10px] text-muted-foreground">{m.time} ago</div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="config" className="mt-6">
            <div className="border border-border">
              {[
                { k: 'Merkle tree address', v: c.merkleTree, mono: true },
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
                  <span className="text-sm text-muted-foreground">{row.k}</span>
                  <div className="flex max-w-[60%] items-center gap-2">
                    <span className={`truncate font-mono text-xs ${row.mono ? '' : 'text-muted-foreground'}`}>
                      {row.v}
                    </span>
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
