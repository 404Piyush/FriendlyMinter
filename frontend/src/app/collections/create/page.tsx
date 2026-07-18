'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';

import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

import { useUmi, getSiteUrl } from '@/lib/bubblegum/umi';
import {
  TREE_PRESETS,
  capacityOf,
  createBubblegumCollection,
  createBubblegumTree,
  estimatePerMintSol,
  estimateTreeRentSol,
  type TreeParams,
} from '@/lib/bubblegum/tree';
import { useStore, newId } from '@/lib/store';
import bs58Pkg from 'bs58';

const NETWORK_LABEL: Record<string, string> = {
  devnet: 'Solana Devnet',
  testnet: 'Solana Testnet',
  'mainnet-beta': 'Solana Mainnet',
};

function networkLabelFromEnv(): string {
  const n = (process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet') as string;
  return NETWORK_LABEL[n] ?? 'Solana Devnet';
}

interface PresetRow {
  label: string;
  params: TreeParams;
  capacity: string;
  rentSol: number;
}

export default function CreateCollectionPage() {
  const router = useRouter();
  const wallet = useWallet();
  const { connection } = useConnection();
  const umi = useUmi();
  const addCollection = useStore((s) => s.addCollection);

  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [numNfts, setNumNfts] = useState(100);
  const [params, setParams] = useState<TreeParams>({ ...TREE_PRESETS.medium });
  const [submitting, setSubmitting] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!wallet.connected || !wallet.publicKey) {
      setBalance(null);
      return;
    }
    (async () => {
      try {
        const lamports = await connection.getBalance(wallet.publicKey!);
        if (!cancelled) setBalance(lamports / LAMPORTS_PER_SOL);
      } catch {
        if (!cancelled) setBalance(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [wallet.connected, wallet.publicKey?.toBase58(), connection]);

  const presets: PresetRow[] = useMemo(
    () =>
      (Object.entries(TREE_PRESETS) as [keyof typeof TREE_PRESETS, TreeParams][]).map(
        ([label, p]) => ({
          label,
          params: p,
          capacity: `~${capacityOf(p).toLocaleString()}`,
          rentSol: estimateTreeRentSol(p),
        }),
      ),
    [],
  );

  const treeRent = estimateTreeRentSol(params);
  const mintCost = estimatePerMintSol() * numNfts;
  const total = treeRent + mintCost;
  const funded = balance !== null && balance >= total + 0.005;

  const networkLabel = networkLabelFromEnv();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!wallet.connected || !wallet.publicKey) {
      toast.error('Connect a wallet first');
      return;
    }
    if (!name.trim() || !symbol.trim()) {
      toast.error('Name and symbol are required');
      return;
    }
    if (balance !== null && balance < total + 0.01) {
      toast.error('Wallet balance too low for tree rent + mints', {
        description: `Need ~${total.toFixed(3)} SOL, have ${balance.toFixed(4)} SOL`,
      });
      return;
    }

    setSubmitting(true);
    const collectionId = newId('col');

    try {
      toast.loading('Creating Merkle tree on testnet…', { id: 'create-tree' });

      const tree = await createBubblegumTree(umi, params);
      toast.loading('Creating collection NFT…', { id: 'create-tree' });

      const collection = await createBubblegumCollection(umi, {
        name: name.trim(),
        symbol: symbol.trim().toUpperCase(),
        uri: `${getSiteUrl()}/api/metadata/${encodeURIComponent(collectionId)}/0.json`,
      });

      addCollection({
        id: collectionId,
        name: name.trim(),
        symbol: symbol.trim().toUpperCase(),
        description: description.trim() || undefined,
        merkleTree: tree.merkleTree.toString(),
        collectionMint: collection.collection.toString(),
        owner: wallet.publicKey.toBase58(),
        maxDepth: params.maxDepth,
        maxBufferSize: params.maxBufferSize,
        canopyDepth: params.canopyDepth,
        capacity: capacityOf(params),
        status: 'INITIALIZED',
        createdAt: Date.now(),
        treeSignature: bs58(tree.signature),
        collectionSignature: bs58(collection.signature),
      });

      toast.success(`Collection "${name.trim()}" created on-chain`, {
        id: 'create-tree',
        description: `Tree: ${tree.merkleTree.toString().slice(0, 8)}…`,
      });
      router.push(`/collections/${collectionId}`);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : String(err);
      toast.error('Create failed', {
        id: 'create-tree',
        description: message,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <Header />
      <main className="container mx-auto max-w-5xl px-6 py-16">
        <Link
          href="/collections"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Collections
        </Link>

        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">New collection</h1>

        <form onSubmit={handleSubmit} className="mt-12 grid gap-16 lg:grid-cols-[1fr_280px]">
          <div className="space-y-12">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Metadata</h2>
              <div className="mt-6 space-y-5">
                <div className="grid gap-5 md:grid-cols-3">
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

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Optional description…"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-2 min-h-[100px]"
                  />
                </div>

                <div>
                  <Label htmlFor="image">Cover image URL</Label>
                  <Input id="image" placeholder="https://…/cover.png" className="mt-2" />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold tracking-tight">Merkle tree</h2>
              <div className="mt-6 grid gap-5 md:grid-cols-3">
                <div>
                  <Label>Max depth</Label>
                  <Input
                    type="number"
                    min={3}
                    max={30}
                    value={params.maxDepth}
                    onChange={(e) =>
                      setParams((p) => ({ ...p, maxDepth: Number(e.target.value) }))
                    }
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
                      onChange={(e) =>
                      setParams((p) => ({ ...p, maxBufferSize: Number(e.target.value) }))
                    }
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
                      onChange={(e) =>
                      setParams((p) => ({ ...p, canopyDepth: Number(e.target.value) }))
                    }
                    className="mt-2 font-mono"
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {presets.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setParams(p.params)}
                    className={`border px-3 py-1.5 text-sm transition-colors ${
                      params.maxDepth === p.params.maxDepth &&
                      params.maxBufferSize === p.params.maxBufferSize &&
                      params.canopyDepth === p.params.canopyDepth
                        ? 'border-primary bg-primary/10 text-foreground'
                        : 'border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                    }`}
                  >
                    <span className="font-medium capitalize">{p.label}</span>
                    <span className="ml-2 text-xs">{p.capacity}</span>
                    <span className="ml-2 text-xs text-muted-foreground">~{p.rentSol.toFixed(2)} SOL</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold tracking-tight">Mint volume</h2>
              <div className="mt-6 max-w-xs">
                <Label htmlFor="num">Items queued for mint</Label>
                <Input
                  id="num"
                  type="number"
                  min={1}
                  value={numNfts}
                  onChange={(e) => setNumNfts(Number(e.target.value))}
                  className="mt-2 font-mono"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Each subsequent mint signs only the per-leaf Bubblegum tx (~{estimatePerMintSol().toExponential(2)} SOL).
                </p>
              </div>
            </div>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div>
              <p className="text-sm text-muted-foreground">Estimated cost</p>
              <p className="mt-3 text-5xl font-semibold tracking-tight text-primary">
                {total.toFixed(4)}
                <span className="ml-2 text-base font-normal text-muted-foreground">SOL</span>
              </p>
              <p className="mt-2 text-xs text-muted-foreground">on {networkLabel}</p>
              {balance !== null && (
                <p className={`mt-1 text-xs ${funded ? 'text-success' : 'text-destructive'}`}>
                  Wallet balance: {balance.toFixed(4)} SOL
                </p>
              )}
            </div>

            <div className="space-y-3 border-t border-border pt-6 text-sm">
              <Row k="Tree rent" v={`${treeRent.toFixed(4)}`} />
              <Row k={`${numNfts.toLocaleString()} mints`} v={`${mintCost.toFixed(6)}`} />
            </div>

            <div className="border-t border-border pt-6">
              <Badge variant="success">~99% cheaper than legacy mint</Badge>
              <p className="mt-3 text-xs text-muted-foreground">
                Legacy equivalent for {numNfts.toLocaleString()} items:{' '}
                <span className="font-mono text-foreground">
                  {(numNfts * 0.012).toFixed(2)} SOL
                </span>
                .
              </p>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={submitting || !wallet.connected}
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Submitting…
                </>
              ) : !wallet.connected ? (
                'Connect wallet to continue'
              ) : (
                <>
                  <Sparkles className="size-4" /> Create collection on-chain
                </>
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Real transactions · requires {total.toFixed(3)}+ SOL · signed by your connected wallet.
            </p>
          </aside>
        </form>
      </main>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-mono text-foreground">{v} SOL</span>
    </div>
  );
}

function bs58(bytes: Uint8Array): string {
  try {
    return bs58Pkg.encode(bytes);
  } catch {
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
}
