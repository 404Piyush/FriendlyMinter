import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Network, Wallet, Bell, Shield } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div>
      <Header />
      <main className="container mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Settings</h1>

        <div className="mt-12 space-y-16">
          {/* Network */}
          <section>
            <div className="flex items-center gap-3">
              <Network className="size-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold tracking-tight">Network</h2>
            </div>
            <div className="mt-6 grid gap-px bg-border md:grid-cols-3">
              {[
                { label: 'Devnet', active: true, body: 'Free SOL via faucet.' },
                { label: 'Testnet', active: false, body: 'Validator tests.' },
                { label: 'Mainnet', active: false, body: 'Real SOL.' },
              ].map((n) => (
                <button
                  key={n.label}
                  type="button"
                  className={`bg-background p-5 text-left transition-colors ${
                    n.active ? 'outline outline-1 outline-primary' : 'hover:bg-secondary/40'
                  }`}
                >
                  <div className="font-medium">{n.label}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                </button>
              ))}
            </div>
          </section>

          {/* RPC */}
          <section>
            <div className="flex items-center gap-3">
              <Wallet className="size-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold tracking-tight">RPC endpoint</h2>
            </div>
            <div className="mt-6 space-y-5">
              <div>
                <Label htmlFor="rpc">Custom RPC URL</Label>
                <Input
                  id="rpc"
                  placeholder="https://…"
                  defaultValue="https://api.devnet.solana.com"
                  className="mt-2 font-mono"
                />
              </div>
              <div>
                <Label htmlFor="commitment">Commitment</Label>
                <Input
                  id="commitment"
                  defaultValue="confirmed"
                  className="mt-2 max-w-[180px] font-mono"
                />
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section>
            <div className="flex items-center gap-3">
              <Bell className="size-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold tracking-tight">Notifications</h2>
            </div>
            <div className="mt-6 space-y-px bg-border">
              {[
                { label: 'In-app toasts', def: true },
                { label: 'Browser notifications', def: false },
                { label: 'Email digests', def: false },
              ].map((t) => (
                <div key={t.label} className="flex items-center justify-between bg-background px-5 py-4">
                  <span>{t.label}</span>
                  <label className="relative inline-flex h-6 w-11 cursor-pointer items-center">
                    <input type="checkbox" defaultChecked={t.def} className="peer sr-only" />
                    <span className="absolute inset-0 border border-border bg-secondary transition-colors peer-checked:border-primary peer-checked:bg-primary" />
                    <span className="absolute left-0.5 top-0.5 size-5 bg-foreground transition-transform peer-checked:translate-x-5 peer-checked:bg-primary-foreground" />
                  </label>
                </div>
              ))}
            </div>
          </section>

          {/* Security */}
          <section>
            <div className="flex items-center gap-3">
              <Shield className="size-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold tracking-tight">Privacy</h2>
            </div>
            <p className="mt-6 border-l-2 border-primary/40 bg-secondary/30 px-5 py-4 text-sm text-muted-foreground">
              FriendlyMinter signs mint transactions locally via your wallet. Your keys never leave
              the browser.
            </p>
            <Button variant="outline" asChild className="mt-6">
              <a
                href="https://docs.metaplex.com/programs/token-metadata/bubblegum"
                target="_blank"
                rel="noopener noreferrer"
              >
                Bubblegum docs ↗
              </a>
            </Button>
          </section>
        </div>
      </main>
    </div>
  );
}
