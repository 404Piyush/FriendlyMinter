import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Settings, Wallet, Network, Bell, Shield, Info, ExternalLink } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Settings className="h-4 w-4" />
            Settings
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Workspace Settings</h1>
          <p className="mt-2 text-muted-foreground">
            Configure how FriendlyMinter connects to Solana and behaves in your browser.
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5 text-primary" />
                Solana Network
              </CardTitle>
              <CardDescription>
                Choose which Solana network mints should target. The active configuration is read by
                the wallet adapter on load.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <NetworkOption label="Devnet" active description="Free SOL via faucet. Recommended for testing." />
                <NetworkOption label="Testnet" active={false} description="Reserved for validator stress tests." />
                <NetworkOption label="Mainnet" active={false} description="Real SOL. Don't enable until you're ready." />
              </div>

              <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    Network is configured via <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">NEXT_PUBLIC_SOLANA_NETWORK</code>{' '}
                    at build time. Rebuild the app to switch clusters.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                RPC Endpoint
              </CardTitle>
              <CardDescription>
                Override the default Ankr/public RPC. Public endpoints are rate-limited — for production
                use a private provider (Helius, Triton, QuickNode).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="rpc">Custom RPC URL</Label>
                <Input
                  id="rpc"
                  placeholder="https://your-helius-url.com/v0?api-key=…"
                  defaultValue="https://api.devnet.solana.com"
                  className="mt-1.5"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Leave blank to use the default Ankr endpoint.
                </p>
              </div>

              <div>
                <Label htmlFor="commitment">Commitment</Label>
                <Input
                  id="commitment"
                  defaultValue="confirmed"
                  className="mt-1.5"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notifications
              </CardTitle>
              <CardDescription>How you want to know when jobs complete.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Toggle label="In-app toasts" description="Use the Sonner toast stack." defaultChecked />
              <Toggle label="Browser notifications" description="Allow FriendlyMinter to push OS notifications." />
              <Toggle label="Email digests" description="Daily summary of completed jobs." />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Privacy & Security
              </CardTitle>
              <CardDescription>Your wallet keys never leave your browser.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4 text-sm">
                <div className="font-medium text-green-600">Read-only by default</div>
                <p className="mt-1 text-muted-foreground">
                  FriendlyMinter signs mint transactions locally via your wallet. We never see your keys.
                </p>
              </div>
              <Button variant="outline" asChild>
                <a
                  href="https://docs.metaplex.com/programs/token-metadata/bubblegum"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read Bubblegum docs <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function NetworkOption({
  label,
  description,
  active,
}: {
  label: string;
  description: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`rounded-lg border p-4 text-left transition-all ${
        active ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'hover:border-primary/50'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium">{label}</span>
        {active && <Badge>Active</Badge>}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </button>
  );
}

function Toggle({
  label,
  description,
  defaultChecked,
}: {
  label: string;
  description: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="pr-4">
        <div className="font-medium">{label}</div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <label className="inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          defaultChecked={defaultChecked}
          className="peer sr-only"
        />
        <span className="relative h-6 w-11 rounded-full bg-muted transition-colors peer-checked:bg-primary">
          <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-background shadow transition-transform peer-checked:translate-x-5" />
        </span>
      </label>
    </div>
  );
}
