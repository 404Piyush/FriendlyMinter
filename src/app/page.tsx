import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Coins, Plus, ArrowRight, Layers, Wallet } from "lucide-react";

export default function Home() {
  return (
    <div>
      <Header />

      <main className="container mx-auto px-6">
        {/* Hero — single column, generous space */}
        <section className="mx-auto max-w-3xl py-24 md:py-36">
          <h1 className="text-5xl font-semibold tracking-tight md:text-6xl">
            Mint thousands of NFTs on Solana.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            FriendlyMinter is a cNFT platform for Solana. Drop a CSV, spin up a Merkle tree, ship
            the drop — all from one wallet-first UI.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button size="lg" asChild>
              <Link href="/collections/create">
                <Plus className="size-4" />
                Start a collection
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/demo">
                Try the demo
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            Uses Solana devnet. No signup, no real SOL.
          </p>
        </section>

        {/* Three stats — flat, no card */}
        <section className="border-t border-border py-16">
          <div className="grid grid-cols-1 gap-y-10 md:grid-cols-3">
            <Stat value="99.9%" label="cheaper than legacy mints" />
            <Stat value="1,000+" label="items per minute" />
            <Stat value="~3s" label="average finalisation" />
          </div>
        </section>

        {/* Three features — minimal cards */}
        <section className="border-t border-border py-20">
          <div className="mb-12 max-w-xl">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Everything you need to ship a drop.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-px bg-border md:grid-cols-3">
            <Feature
              icon={Coins}
              title="Collections"
              body="Create and manage cNFT collections. Tune Merkle-tree parameters per collection."
            />
            <Feature
              icon={Layers}
              title="Bulk mint"
              body="Upload thousands of items via CSV. Run jobs in the background. Watch progress live."
            />
            <Feature
              icon={Wallet}
              title="Wallet-first"
              body="Phantom, Solflare, Torus, Ledger. Keys never leave your browser."
            />
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              See the full flow with mock data.
            </h2>
            <p className="mt-4 text-muted-foreground">
              No wallet. No real SOL. Just look around.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button size="lg" asChild>
                <Link href="/demo">
                  Open demo
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/collections/create">Start a collection</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8">
          <div className="flex flex-col items-start justify-between gap-4 text-sm text-muted-foreground md:flex-row md:items-center">
            <span>© 2026 Piyush · FriendlyMinter</span>
            <div className="flex items-center gap-4">
              <a href="https://github.com/404Piyush/FriendlyMinter" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                GitHub
              </a>
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-success" />
                Solana devnet
              </span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-4xl font-semibold tracking-tight">{value}</div>
      <div className="mt-2 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div className="bg-background p-8">
      <Icon className="mb-6 size-5 text-primary" />
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
