import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, ArrowRight, FolderOpen, Coins, Sparkles } from 'lucide-react';

const sampleCollections = [
  {
    id: 'demo-collection-01',
    name: 'Solana Genesis Pixels',
    symbol: 'GPX',
    description: '1,000 generative pixel-art characters minted via Bubblegum.',
    status: 'MINTING',
    minted: 642,
    max: 1000,
    merkleTree: '8xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    image: '🎨',
    depth: 14,
    buffer: 64,
  },
  {
    id: 'demo-collection-02',
    name: 'DeGods Lite',
    symbol: 'DGL',
    description: 'Hand-illustrated profile-pic collection with royalty splits.',
    status: 'INITIALIZED',
    minted: 0,
    max: 5000,
    merkleTree: '6rY9Tg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    image: '👑',
    depth: 17,
    buffer: 64,
  },
  {
    id: 'demo-collection-03',
    name: 'On-chain Receipts',
    symbol: 'RECEIPT',
    description: 'POAP-style attendance tokens, batch-minted after each event.',
    status: 'COMPLETED',
    minted: 2500,
    max: 2500,
    merkleTree: '3aP7Tg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    image: '🧾',
    depth: 14,
    buffer: 64,
  },
];

const statusColor: Record<string, string> = {
  COMPLETED: 'bg-green-500',
  MINTING: 'bg-blue-500 animate-pulse',
  INITIALIZED: 'bg-yellow-500',
  DRAFT: 'bg-gray-500',
  FAILED: 'bg-red-500',
};

export default function CollectionsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <FolderOpen className="h-4 w-4" />
              Collections
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Your Collections</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your cNFT collections. Click any card to inspect, edit or mint.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/collections/create">
              <Plus className="mr-2 h-5 w-5" />
              New Collection
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sampleCollections.map((c) => (
            <Link key={c.id} href={`/collections/${c.id}`} className="group">
              <Card className="h-full transition-all duration-200 group-hover:-translate-y-1 group-hover:border-primary/50 group-hover:shadow-lg">
                <CardHeader>
                  <div className="mb-3 flex h-32 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-blue-500/10 text-6xl">
                    {c.image}
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="truncate">{c.name}</CardTitle>
                      <CardDescription className="truncate">{c.symbol}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      <span className={`mr-1.5 inline-block h-2 w-2 rounded-full ${statusColor[c.status] ?? 'bg-gray-500'}`} />
                      {c.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="line-clamp-2 text-sm text-muted-foreground">{c.description}</p>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Minted</span>
                      <span>
                        {c.minted.toLocaleString()} / {c.max.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-blue-500 transition-all"
                        style={{ width: `${Math.min(100, (c.minted / c.max) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                    <span>Depth {c.depth}</span>
                    <span>Buffer {c.buffer}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          <Link
            href="/collections/create"
            className="group flex min-h-[280px] items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/20 transition-all hover:border-primary/50 hover:bg-primary/5"
          >
            <div className="text-center">
              <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <Plus className="h-6 w-6" />
              </div>
              <p className="font-medium">Create new collection</p>
              <p className="mt-1 text-sm text-muted-foreground">Spin up a Merkle tree in seconds</p>
            </div>
          </Link>
        </div>

        <Card className="mt-12 border-dashed">
          <CardContent className="flex flex-col items-center justify-between gap-4 p-8 sm:flex-row">
            <div className="flex items-start gap-4">
              <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">See it in action with mock data</h3>
                <p className="text-sm text-muted-foreground">
                  The interactive demo simulates the full mint flow without spending devnet SOL.
                </p>
              </div>
            </div>
            <Button asChild variant="outline">
              <Link href="/demo">
                Open demo <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
