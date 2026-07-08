import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Settings, Wallet, Network, Bell, Shield, Info, ExternalLink, ArrowUpRight, CircleDot } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="relative z-10">
      <Header />

      <main className="container mx-auto max-w-4xl px-4 pt-12 pb-24">
        <div className="mb-10 border-b border-border pb-6">
          <p className="label">§Settings</p>
          <h1 className="display mt-3 text-5xl md:text-6xl">Workspace settings.</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Configure how FriendlyMinter connects to Solana and behaves in your browser.
          </p>
        </div>

        <div className="space-y-px bg-border">
          <Section
            icon={Network}
            number="01"
            title="Solana network"
            hint="Read at build time by the wallet adapter."
          >
            <div className="grid gap-px bg-border md:grid-cols-3">
              {[
                { label: 'Devnet', active: true, body: 'Free SOL via faucet. Recommended.' },
                { label: 'Testnet', active: false, body: 'Validator stress tests.' },
                { label: 'Mainnet', active: false, body: 'Real SOL. Ship when ready.' },
              ].map((net) => (
                <button
                  key={net.label}
                  type="button"
                  className={`group flex flex-col items-start gap-2 bg-background p-5 text-left transition-colors ${
                    net.active ? 'bg-primary/10 outline outline-1 outline-primary' : 'hover:bg-secondary/40'
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="font-serif text-xl font-medium">{net.label}</span>
                    {net.active && <Badge>Active</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{net.body}</p>
                </button>
              ))}
            </div>

            <div className="mt-6 flex items-start gap-3 border border-border bg-secondary/40 p-4">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                Network is configured via{' '}
                <code className="rounded-[2px] bg-background px-1.5 py-0.5 font-mono text-[11px] text-foreground">
                  NEXT_PUBLIC_SOLANA_NETWORK
                </code>{' '}
                at build time. Rebuild to switch clusters.
              </p>
            </div>
          </Section>

          <Section
            icon={Wallet}
            number="02"
            title="RPC endpoint"
            hint="Override the public/ankr RPC. Use a private provider for production."
          >
            <Label htmlFor="rpc">Custom RPC URL</Label>
            <Input
              id="rpc"
              placeholder="https://your-helius-url.com/v0?api-key=…"
              defaultValue="https://api.devnet.solana.com"
              className="mt-2 font-mono"
            />
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Blank → defaults to Ankr
            </p>

            <div className="mt-5">
              <Label htmlFor="commitment">Commitment</Label>
              <Input id="commitment" defaultValue="confirmed" className="mt-2 font-mono" />
            </div>
          </Section>

          <Section icon={Bell} number="03" title="Notifications" hint="How you find out when jobs complete.">
            <div className="space-y-px bg-border">
              {[
                { label: 'In-app toasts', body: 'Use the Sonner toast stack.', def: true },
                { label: 'Browser notifications', body: 'Allow FriendlyMinter to push OS notifications.', def: false },
                { label: 'Email digests', body: 'Daily summary of completed jobs.', def: false },
              ].map((t) => (
                <div key={t.label} className="flex items-center justify-between gap-4 bg-background p-4">
                  <div>
                    <div className="font-medium">{t.label}</div>
                    <p className="text-sm text-muted-foreground">{t.body}</p>
                  </div>
                  <ToggleSwitch defaultChecked={t.def} />
                </div>
              ))}
            </div>
          </Section>

          <Section
            icon={Shield}
            number="04"
            title="Privacy & security"
            hint="Your wallet keys never leave the browser."
          >
            <div className="flex items-start gap-3 border border-success/30 bg-success/5 p-4">
              <CircleDot className="mt-0.5 h-4 w-4 shrink-0 text-success live-dot" />
              <div className="text-sm">
                <div className="font-medium text-success">Read-only by default</div>
                <p className="mt-1 text-muted-foreground">
                  FriendlyMinter signs mint transactions locally via your wallet. We never see your keys.
                </p>
              </div>
            </div>
            <Button variant="outline" asChild className="mt-5">
              <a
                href="https://docs.metaplex.com/programs/token-metadata/bubblegum"
                target="_blank"
                rel="noopener noreferrer"
              >
                Read Bubblegum docs <ArrowUpRight className="h-4 w-4" />
              </a>
            </Button>
          </Section>
        </div>
      </main>
    </div>
  );
}

function Section({
  icon: Icon,
  number,
  title,
  hint,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  number: string;
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-background p-6 md:p-8">
      <div className="mb-5 flex items-baseline gap-3">
        <span className="font-mono text-sm text-primary">{number}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-serif text-2xl font-medium tracking-tight">{title}</h3>
      </div>
      <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{hint}</p>
      {children}
    </section>
  );
}

function ToggleSwitch({ defaultChecked }: { defaultChecked?: boolean }) {
  return (
    <label className="relative inline-flex h-6 w-11 cursor-pointer items-center">
      <input type="checkbox" defaultChecked={defaultChecked} className="peer sr-only" />
      <span
        className={`absolute inset-0 rounded-[2px] border border-border bg-secondary transition-colors peer-checked:border-primary peer-checked:bg-primary`}
      />
      <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-[2px] bg-foreground transition-transform peer-checked:translate-x-5 peer-checked:bg-primary-foreground" />
    </label>
  );
}
