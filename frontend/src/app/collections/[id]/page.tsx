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
    image: '🎨',
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
    image: '👑',
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
    image: '🧾',
    depth: 14,
    buffer: 64,
    createdAt: '2025-09-01',
  },
};

const recentMints = [
  { id: 642, owner: 'Gx9K…mP2', time: '2s ago', img: '🎨' },
  { id: 641, owner: 'B3xF…yR8', time: '4s ago', img: '🎨' },
  { id: 640, owner: 'Ht7W…qN5', time: '6s ago', img: '🎨' },
  { id: 639, owner: '4aB8…kT1', time: '8s ago', img: '🎨' },
  { id: 638, owner: 'Yk2P…vM3', time: '10s ago', img: '🎨' },
  { id: 637, owner: 'Fn6L…xD9', time: '12s ago', img: '🎨' },
];

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
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Collection not found</h1>
          <Button asChild className="mt-4" variant="outline">
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
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/collections">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Collections
          </Link>
        </Button>

        {/* Header */}
        <div className="grid gap-8 md:grid-cols-[300px_1fr]">
          <Card className="overflow-hidden">
            <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-primary/20 to-blue-500/20 text-9xl">
              {c.image}
            </div>
          </Card>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Coins className="h-4 w-4" />
                Collection · {c.symbol}
              </div>
              <h1 className="mt-1 text-4xl font-bold tracking-tight">{c.name}</h1>
              <p className="mt-2 text-lg text-muted-foreground">{c.description}</p>
              <div className="mt-4 flex items-center gap-2">
                <Badge>
                  <Activity className="mr-1 h-3 w-3" />
                  {c.status}
                </Badge>
                <Badge variant="outline">Created {c.createdAt}</Badge>
              </div>
            </div>

            <Card>
              <CardContent className="space-y-3 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Mint progress</div>
                    <div className="mt-1 text-3xl font-bold">
                      {c.minted.toLocaleString()} <span className="text-muted-foreground">/ {c.max.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="text-right text-3xl font-bold text-primary">{pct.toFixed(1)}%</div>
                </div>
                <Progress value={pct} className="h-2" />
              </CardContent>
            </Card>

            <div className="grid gap-3 sm:grid-cols-3">
              <Button>{c.status === 'INITIALIZED' ? 'Start Mint' : 'Resume Mint'}</Button>
              <Button variant="outline" asChild>
                <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
                  View on Explorer <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline">Pause</Button>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-4">
          <Stat icon={Users} label="Holders" value="412" />
          <Stat icon={Coins} label="Volume" value="84.3 SOL" />
          <Stat icon={Zap} label="Mint fee" value="~0.00001 SOL" />
          <Stat icon={Hash} label="Tree address" value={`${c.merkleTree.slice(0, 4)}…${c.merkleTree.slice(-4)}`} mono />
        </div>

        <Tabs defaultValue="items" className="mt-10">
          <TabsList>
            <TabsTrigger value="items">
              <ImageIcon className="mr-2 h-4 w-4" /> Recent Mints
            </TabsTrigger>
            <TabsTrigger value="config">
              <Hash className="mr-2 h-4 w-4" /> Configuration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent mints</CardTitle>
                <CardDescription>Latest on-chain mint events for this collection.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
                  {recentMints.map((m) => (
                    <div key={m.id} className="rounded-lg border p-3 text-center">
                      <div className="mb-2 text-4xl">{m.img}</div>
                      <div className="font-mono text-xs">#{m.id}</div>
                      <div className="mt-1 truncate font-mono text-[10px] text-muted-foreground">{m.owner}</div>
                      <div className="mt-1 flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" /> {m.time}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="config" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>On-chain configuration</CardTitle>
                <CardDescription>Parameters baked into the Merkle tree.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <ConfigRow label="Merkle Tree Address" value={c.merkleTree} mono copy={copy} />
                <ConfigRow label="Creator" value={c.creator} mono copy={copy} />
                <ConfigRow label="Max Depth" value={String(c.depth)} />
                <ConfigRow label="Max Buffer Size" value={String(c.buffer)} />
                <ConfigRow label="Network" value="Solana Devnet" />
                <ConfigRow label="Standard" value="Metaplex Bubblegum (cNFT v2)" />
              </CardContent>
            </Card>
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
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className={`truncate text-sm font-semibold ${mono ? 'font-mono' : ''}`}>{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function ConfigRow({
  label,
  value,
  mono,
  copy,
}: {
  label: string;
  value: string;
  mono?: boolean;
  copy?: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b pb-3 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex max-w-[60%] items-center gap-2">
        <span className={`truncate font-mono text-xs ${mono ? 'text-foreground' : ''}`}>{value}</span>
        {copy && (
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => copy(value)}>
            <Copy className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
