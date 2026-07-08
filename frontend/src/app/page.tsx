import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Coins,
  Plus,
  Upload,
  Zap,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Layers,
  Wallet,
  Gauge,
  ShieldCheck,
  Rocket,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';

const features = [
  {
    icon: Coins,
    title: 'Collection Management',
    description:
      'Create and manage cNFT collections with custom metadata, royalties, and Merkle-tree-backed storage.',
    href: '/collections',
  },
  {
    icon: Upload,
    title: 'Bulk Upload via CSV',
    description:
      'Upload thousands of NFT metadata rows at once with a CSV and an image batch processor.',
    href: '/collections/create',
  },
  {
    icon: Zap,
    title: 'Job-Queue Minting',
    description:
      'Submit mints as background jobs and watch progress in real time with pause/resume controls.',
    href: '/jobs',
  },
  {
    icon: Layers,
    title: 'Merkle Tree Engine',
    description:
      'Visualise and tune Merkle tree parameters (depth, buffer, canopy) to fit any collection size.',
    href: '/docs',
  },
  {
    icon: ShieldCheck,
    title: 'Wallet-First Auth',
    description:
      'Built on the Solana wallet-adapter stack — Phantom, Solflare, Torus, Ledger all supported.',
    href: '/docs',
  },
  {
    icon: Gauge,
    title: 'Devnet-First',
    description:
      'Default-configured for Solana devnet so you can experiment end-to-end without risking funds.',
    href: '/settings',
  },
];

const steps = [
  {
    num: '01',
    title: 'Connect',
    body: 'Connect a Solana wallet (Phantom, Solflare, etc.). FriendlyMinter runs on Solana devnet by default.',
    icon: Wallet,
  },
  {
    num: '02',
    title: 'Configure',
    body: 'Pick collection metadata and Merkle-tree parameters. The UI estimates rent + fees for you.',
    icon: Layers,
  },
  {
    num: '03',
    title: 'Mint',
    body: 'Bulk upload via CSV (or per-NFT), submit a mint job, and watch the on-chain progress live.',
    icon: Rocket,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/40">
      <Header />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b">
          <div className="absolute inset-0 -z-10 opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/20 blur-3xl" />
          </div>

          <div className="container mx-auto px-4 py-20 lg:py-28">
            <div className="mx-auto max-w-4xl text-center">
              <Badge variant="secondary" className="mb-6 px-4 py-1.5">
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                Compressed NFTs on Solana — 99% cheaper than traditional mints
              </Badge>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Mint thousands of NFTs
                <br />
                <span className="bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent">
                  without going broke.
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                FriendlyMinter is a developer-friendly cNFT platform for Solana. Bulk-upload metadata,
                spin up a Merkle tree, and stream your mint job — all from a clean, fast UI.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button size="lg" asChild className="h-12 px-6 text-base">
                  <Link href="/collections/create">
                    <Plus className="mr-2 h-5 w-5" />
                    Create a Collection
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-12 px-6 text-base">
                  <Link href="/demo">
                    Try the interactive demo
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>

              <p className="mt-6 text-xs uppercase tracking-wider text-muted-foreground">
                No signup · No credit card · Uses Solana devnet by default
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-b bg-muted/30">
          <div className="container mx-auto grid grid-cols-2 gap-8 px-4 py-12 md:grid-cols-4">
            <Stat number="99.9%" label="Cheaper than traditional mints" />
            <Stat number="1,000+" label="NFTs per minute throughput" />
            <Stat number="100K+" label="Max items per collection" />
            <Stat number="~3s" label="Avg finalisation per mint" />
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-20">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to ship an NFT drop
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From wallet connection to on-chain settlement — the boring plumbing is already done.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Link key={f.title} href={f.href} className="group">
                <Card className="h-full transition-all duration-200 group-hover:-translate-y-1 group-hover:border-primary/50 group-hover:shadow-lg">
                  <CardHeader>
                    <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <f.icon className="h-5 w-5" />
                    </div>
                    <CardTitle>{f.title}</CardTitle>
                    <CardDescription>{f.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="border-t bg-muted/30">
          <div className="container mx-auto px-4 py-20">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                How FriendlyMinter works
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Three steps from zero to a fully-minted collection.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((s) => (
                <div key={s.num} className="relative">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                    <s.icon className="h-6 w-6" />
                  </div>
                  <div className="text-sm font-mono text-primary">{s.num}</div>
                  <h3 className="mt-1 text-xl font-semibold">{s.title}</h3>
                  <p className="mt-2 text-muted-foreground">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 py-20">
          <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-blue-500/5">
            <CardContent className="p-10 text-center md:p-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to mint your first collection?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
                Spin up the interactive demo to see exactly what a cNFT mint job looks like end-to-end.
                No wallet, no real SOL, no risk.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/demo">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Open Demo
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/collections/create">
                    Start a Collection
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="border-t bg-background">
          <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-primary" />
              <span>FriendlyMinter · Built by Piyush (@404Piyush)</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              Live on Solana devnet
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center md:text-left">
      <div className="text-3xl font-bold tracking-tight md:text-4xl">{number}</div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
