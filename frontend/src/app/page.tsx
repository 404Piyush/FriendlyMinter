import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Coins,
  Plus,
  Upload,
  Zap,
  ArrowRight,
  Sparkles,
  Layers,
  Wallet,
  Gauge,
  ShieldCheck,
  Rocket,
  ArrowUpRight,
  Terminal,
  Activity,
  CircleDot,
} from "lucide-react";
import { Header } from "@/components/layout/Header";

const features = [
  {
    code: "01",
    icon: Coins,
    title: "Collection management",
    body: "Create and manage cNFT collections with custom metadata, royalties, and Merkle-tree-backed storage.",
    href: "/collections",
  },
  {
    code: "02",
    icon: Upload,
    title: "Bulk CSV upload",
    body: "Upload thousands of NFT metadata rows at once. Drop a CSV, ship a queue.",
    href: "/collections/create",
  },
  {
    code: "03",
    icon: Zap,
    title: "Job-queue minting",
    body: "Submit mints as background jobs with pause / resume / live progress.",
    href: "/jobs",
  },
  {
    code: "04",
    icon: Layers,
    title: "Merkle tree engine",
    body: "Tune depth, buffer, canopy. The cost panel updates as you type.",
    href: "/docs",
  },
  {
    code: "05",
    icon: Wallet,
    title: "Wallet-first auth",
    body: "Phantom, Solflare, Torus, Ledger. Keys never leave the browser.",
    href: "/docs",
  },
  {
    code: "06",
    icon: Gauge,
    title: "Devnet by default",
    body: "No real SOL required. Use the faucet, ship a test drop, sleep well.",
    href: "/settings",
  },
];

const steps = [
  { code: "01", title: "Connect", body: "Hook a Solana wallet up. Devnet works out of the box.", icon: Wallet },
  { code: "02", title: "Configure", body: "Pick metadata + Merkle-tree parameters. Cost estimates are live.", icon: Layers },
  { code: "03", title: "Mint", body: "Drop a CSV, fire a job, watch the chain settle in real time.", icon: Rocket },
];

const tickerItems = [
  "devnet.solana.com",
  "Bubblegum v2",
  "@solana/web3.js 1.98",
  "Metaplex",
  "Merkle tree · depth 14",
  "Compressed NFT",
  "~5,000 lamports / mint",
  "0.00089 SOL rent",
  "Faucet live",
  "Wallet adapter 0.15",
];

export default function Home() {
  return (
    <div className="relative z-10">
      <Header />

      {/* Live ticker bar */}
      <div className="border-b border-border bg-background/50">
        <div className="container mx-auto flex items-center gap-3 overflow-hidden py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <div className="flex shrink-0 items-center gap-1.5">
            <CircleDot className="h-3 w-3 text-success" />
            <span className="text-foreground">LIVE</span>
          </div>
          <div className="flex animate-marquee gap-8 whitespace-nowrap">
            {[...tickerItems, ...tickerItems].map((t, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-primary" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative border-b border-border">
        <div className="container mx-auto px-4 pt-12 pb-20 lg:pt-20 lg:pb-28">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Left: number + heading */}
            <div className="lg:col-span-8">
              <div className="mb-8 flex items-center gap-3">
                <Badge variant="outline" className="rounded-[3px]">
                  <Terminal className="mr-1.5 h-3 w-3 text-primary" />
                  Solana · Devnet · cNFT
                </Badge>
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  Issue 03 / 2026
                </span>
              </div>

              <h1 className="display text-[clamp(2.5rem,7vw,6rem)] text-foreground">
                Mint thousands of NFTs
                <br />
                <span className="italic text-primary">without going broke.</span>
              </h1>

              <p className="mt-8 max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground">
                FriendlyMinter is a developer-friendly cNFT platform for Solana. Bulk-upload metadata, spin up a Merkle tree, stream a mint job — all from a clean, fast UI that reads like a magazine, not a SaaS dashboard.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Button size="xl" asChild>
                  <Link href="/collections/create">
                    <Plus className="h-5 w-5" strokeWidth={2.5} />
                    Start a collection
                  </Link>
                </Button>
                <Button size="xl" variant="outline" asChild>
                  <Link href="/demo">
                    Try the demo
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>

              <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                No signup · no credit card · no real SOL
              </p>
            </div>

            {/* Right: ASCII / visual */}
            <div className="lg:col-span-4">
              <Card className="noise overflow-hidden">
                <div className="flex items-center justify-between border-b border-border bg-secondary/50 px-4 py-2">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-destructive" />
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    <span className="h-2 w-2 rounded-full bg-muted" />
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    cNFT · TX preview
                  </span>
                </div>
                <CardContent className="space-y-3 p-5">
                  <Row k="program" v="BGUM" />
                  <Row k="op" v="mint_v1" />
                  <Row k="tree" v="8xKXtg…JsAsU" />
                  <Row k="leaf" v="0x9c4f…b21e" />
                  <Row k="owner" v="7xKXtg…JosgA" />
                  <Row k="fee" v="0.000005 SOL" mono />
                </CardContent>
                <div className="border-t border-border bg-primary/10 px-5 py-3">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="uppercase tracking-[0.18em] text-muted-foreground">
                      confirmed
                    </span>
                    <span className="font-semibold text-primary">2.1s</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border">
        <div className="container mx-auto grid grid-cols-2 gap-px bg-border md:grid-cols-4">
          <Stat number="99.9%" label="cheaper than legacy mints" />
          <Stat number="1,000+" label="mints per minute" />
          <Stat number="100K+" label="max items per tree" />
          <Stat number="~3s" label="avg finalisation" />
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-24">
        <div className="mb-12 flex items-end justify-between gap-6 border-b border-border pb-6">
          <div>
            <p className="label">§02 · Capabilities</p>
            <h2 className="display mt-3 text-4xl sm:text-5xl">Everything you need to ship a drop.</h2>
          </div>
          <p className="hidden max-w-md text-balance text-muted-foreground md:block">
            Six first-class building blocks. From wallet connection to on-chain settlement — the plumbing is already done.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-px bg-border md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Link
              key={f.title}
              href={f.href}
              className="group bg-card p-8 transition-colors hover:bg-secondary/40"
            >
              <div className="mb-6 flex items-start justify-between">
                <span className="font-mono text-xs text-primary">{f.code}</span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
              <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-[3px] bg-primary/10 text-primary">
                <f.icon className="h-4 w-4" />
              </div>
              <h3 className="font-serif text-xl font-medium leading-tight tracking-tight">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-card/40">
        <div className="container mx-auto px-4 py-24">
          <div className="mb-12">
            <p className="label">§03 · Workflow</p>
            <h2 className="display mt-3 text-4xl sm:text-5xl">From zero to fully minted in three steps.</h2>
          </div>
          <div className="grid gap-px bg-border md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.code} className="bg-card p-8">
                <div className="mb-6 flex items-center justify-between">
                  <span className="display text-7xl text-primary">{s.code}</span>
                  <s.icon className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-serif text-2xl font-medium tracking-tight">{s.title}</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-24">
        <div className="border border-primary/30 bg-primary/5 p-10 md:p-16">
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-primary/30 pb-8">
            <div>
              <p className="label">§04 · Call to action</p>
              <h2 className="display mt-3 text-4xl sm:text-5xl">
                Spin up the demo.
                <br />
                <span className="italic">No wallet. No risk. Just look.</span>
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/demo">
                  <Sparkles className="h-4 w-4" />
                  Open demo
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/collections/create">
                  Start a collection <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-8 pt-8 md:grid-cols-3">
            <CtaStat label="network" value="Solana Devnet" />
            <CtaStat label="cost" value="~5,000 lamports / mint" />
            <CtaStat label="status" value="Live · Issue 03" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container mx-auto flex flex-col gap-4 px-4 py-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-[3px] bg-primary text-primary-foreground">
              <Coins className="h-3.5 w-3.5" strokeWidth={2.5} />
            </div>
            <span className="font-serif text-base">FriendlyMinter</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              © 2026 Piyush
            </span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <a href="https://github.com/404Piyush/FriendlyMinter" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
              github <ArrowUpRight className="h-3 w-3" />
            </a>
            <span className="flex items-center gap-1.5">
              <CircleDot className="h-3 w-3 text-success live-dot" />
              devnet
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{k}</span>
      <span className={`truncate text-xs ${mono ? "font-mono text-primary" : ""}`}>{v}</span>
    </div>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="bg-background p-6 md:p-8">
      <div className="display text-4xl text-foreground md:text-5xl">{number}</div>
      <div className="mt-2 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function CtaStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-serif text-xl tracking-tight">{value}</div>
    </div>
  );
}
