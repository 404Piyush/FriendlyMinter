'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/layout/Header';
import {
  Play,
  Pause,
  RotateCcw,
  Users,
  Folder,
  Coins,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { mockAPI } from '@/lib/mock-api-enhanced';
import { EnhancedCollection, MintJob, User, NFTMetadata, Analytics, Notification } from '@/types';
import { toast } from 'sonner';

type StatusKey = 'PROCESSING' | 'COMPLETED' | 'PENDING' | 'FAILED' | 'INITIALIZED';

const STATUS_VARIANT: Record<StatusKey, 'default' | 'success' | 'muted' | 'destructive' | 'secondary'> = {
  PROCESSING: 'default',
  COMPLETED: 'success',
  PENDING: 'muted',
  FAILED: 'destructive',
  INITIALIZED: 'secondary',
};

const STATUS_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  PROCESSING: Activity,
  COMPLETED: CheckCircle2,
  PENDING: Clock,
  FAILED: AlertCircle,
  INITIALIZED: Clock,
};

export function DemoExplorer() {
  const [users, setUsers] = useState<User[]>([]);
  const [collections, setCollections] = useState<EnhancedCollection[]>([]);
  const [mintJobs, setMintJobs] = useState<MintJob[]>([]);
  const [nftMetadata, setNftMetadata] = useState<NFTMetadata[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [u, c, j, n, a, no] = await Promise.all([
        mockAPI.getUsers(),
        mockAPI.getCollections(),
        mockAPI.getMintJobs(),
        mockAPI.getNftMetadata(),
        mockAPI.getAnalytics(),
        mockAPI.getNotifications('user-1'),
      ]);
      setUsers(u);
      setCollections(c);
      setMintJobs(j);
      setNftMetadata(n);
      setAnalytics(a);
      setNotifications(no);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleStart = async (id: string) => {
    await mockAPI.startMintJob(id);
    await load();
    toast.success('Mint job started');
  };
  const handlePause = async (id: string) => {
    await mockAPI.pauseMintJob(id);
    await load();
    toast.success('Mint job paused');
  };

  const totalNfts = collections.reduce((acc, c) => acc + (c.mintedCount || 0), 0);
  const totalCapacity = collections.reduce((acc, c) => acc + (c.maxNfts || 0), 0);

  return (
    <div>
      <Header />
      <main className="container mx-auto px-6 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Demo</h1>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Full flow with mock data. Start / pause mint jobs, inspect collections and NFTs.
            </p>
          </div>
          <Button variant="outline" onClick={load} disabled={loading}>
            <RotateCcw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            Reload
          </Button>
        </div>

        {/* Stats */}
        <section className="mt-12 grid grid-cols-2 gap-px bg-border md:grid-cols-4">
          <Stat icon={Users} label="Users" value={String(users.length)} />
          <Stat icon={Folder} label="Collections" value={String(collections.length)} />
          <Stat icon={Coins} label="NFTs minted" value={totalNfts.toLocaleString()} />
          <Stat icon={TrendingUp} label="Volume" value={`${analytics?.totalVolume?.toFixed(1) ?? '0.0'} SOL`} />
        </section>

        {/* Tabs */}
        <Tabs defaultValue="collections" className="mt-16">
          <TabsList className="border-b border-border bg-transparent p-0">
            <TabsTrigger
              value="collections"
              className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 shadow-none data-[state=active]:border-foreground"
            >
              <Folder className="mr-2 size-4" /> Collections
            </TabsTrigger>
            <TabsTrigger
              value="jobs"
              className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 shadow-none data-[state=active]:border-foreground"
            >
              <Activity className="mr-2 size-4" /> Mint jobs
            </TabsTrigger>
            <TabsTrigger
              value="nfts"
              className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 shadow-none data-[state=active]:border-foreground"
            >
              <Coins className="mr-2 size-4" /> NFTs
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 shadow-none data-[state=active]:border-foreground"
            >
              <TrendingUp className="mr-2 size-4" /> Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="collections" className="mt-6">
            <DataTable headers={['Name', 'Symbol', 'Status', 'Minted', 'Volume', 'Floor']}>
              {collections.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.symbol}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={c.status} />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {c.mintedCount?.toLocaleString() ?? 0} / {c.maxNfts?.toLocaleString() ?? 0}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{c.volume24h?.toFixed(2) ?? '0.00'} SOL</td>
                  <td className="px-4 py-3 font-mono text-xs">{c.floorPrice?.toFixed(2) ?? '0.00'} SOL</td>
                </tr>
              ))}
            </DataTable>
            <p className="mt-4 text-xs text-muted-foreground">
              Capacity used across all collections:{' '}
              <span className="font-mono text-foreground">
                {totalNfts.toLocaleString()} / {totalCapacity.toLocaleString()}
              </span>
            </p>
          </TabsContent>

          <TabsContent value="jobs" className="mt-6">
            <DataTable headers={['Job', 'Collection', 'Status', 'Progress', 'Action']}>
              {mintJobs.map((job) => {
                const pct = (job.mintedCount / job.totalNfts) * 100;
                const Icon = STATUS_ICON[job.status] ?? Clock;
                const col = collections.find((c) => c.id === job.collectionId);
                return (
                  <tr key={job.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {job.id.slice(0, 12)}
                    </td>
                    <td className="px-4 py-3">{col?.name ?? job.collectionId}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5">
                        <Icon className="size-3 text-muted-foreground" />
                        <span className="text-sm">{job.status}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {job.mintedCount.toLocaleString()} / {job.totalNfts.toLocaleString()} (
                      {pct.toFixed(1)}%)
                    </td>
                    <td className="px-4 py-3">
                      {job.status === 'PENDING' && (
                        <Button size="sm" onClick={() => handleStart(job.id)}>
                          <Play className="size-3" /> Start
                        </Button>
                      )}
                      {job.status === 'PROCESSING' && (
                        <Button size="sm" variant="outline" onClick={() => handlePause(job.id)}>
                          <Pause className="size-3" /> Pause
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </DataTable>
          </TabsContent>

          <TabsContent value="nfts" className="mt-6">
            <DataTable headers={['Name', 'Collection', 'Rarity', 'Token ID', 'Minted']}>
              {nftMetadata.slice(0, 12).map((nft, i) => (
                <tr key={`${nft.collectionId}-${nft.tokenId}-${i}`} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{nft.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {nft.collectionId}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{nft.rarity ?? 'common'}</Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">#{nft.tokenId}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {nft.tokenId % 3 === 0 ? (
                      <span className="text-success">Yes</span>
                    ) : (
                      <span className="text-muted-foreground">No</span>
                    )}
                  </td>
                </tr>
              ))}
            </DataTable>
            <p className="mt-4 text-xs text-muted-foreground">
              Showing first {Math.min(12, nftMetadata.length)} of {nftMetadata.length}.
            </p>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <DataTable headers={['Time', 'Type', 'Title', 'Status']}>
              {notifications.map((n) => (
                <tr key={n.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {new Date(n.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{n.type}</Badge>
                  </td>
                  <td className="px-4 py-3">{n.title}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{n.message}</td>
                </tr>
              ))}
            </DataTable>
          </TabsContent>
        </Tabs>

        {/* Users panel */}
        <section className="mt-20 border-t border-border pt-12">
          <h2 className="text-2xl font-semibold tracking-tight">Users</h2>
          <p className="mt-2 text-sm text-muted-foreground">{users.length} mock users</p>
          <div className="mt-6 grid grid-cols-1 gap-px bg-border md:grid-cols-3">
            {users.slice(0, 6).map((u) => (
              <div key={u.id} className="bg-background p-5">
                <div className="font-medium">{u.name}</div>
                <div className="mt-1 font-mono text-xs text-muted-foreground">
                  {u.walletAddress?.slice(0, 6)}…{u.walletAddress?.slice(-6)}
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{u.totalCollections} collections</span>
                  <span>·</span>
                  <span>{u.totalNftsMinted.toLocaleString()} minted</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function DataTable({
  headers,
  children,
}: {
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/30">
            {headers.map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-medium text-muted-foreground"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-background">{children}</tbody>
      </table>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-background p-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const Icon = STATUS_ICON[status] ?? Clock;
  const variant = STATUS_VARIANT[status as StatusKey] ?? 'muted';
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="size-3" />
      <Badge variant={variant}>{status}</Badge>
    </span>
  );
}
