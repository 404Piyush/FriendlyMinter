import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, ArrowUpRight, Clock, CheckCircle2, AlertCircle, Play, Pause } from 'lucide-react';

const jobs = [
  {
    id: 'JOB-0001',
    collection: 'Solana Genesis Pixels',
    status: 'PROCESSING',
    minted: 642,
    total: 1000,
    startedAt: '12 min ago',
    rate: '53 / sec',
    cost: '0.0063 SOL',
  },
  {
    id: 'JOB-0002',
    collection: 'On-chain Receipts',
    status: 'COMPLETED',
    minted: 2500,
    total: 2500,
    startedAt: '2 days ago',
    rate: '—',
    cost: '0.0187 SOL',
  },
  {
    id: 'JOB-0003',
    collection: 'DeGods Lite',
    status: 'PENDING',
    minted: 0,
    total: 5000,
    startedAt: 'queued',
    rate: '—',
    cost: '~0.0250 SOL',
  },
];

const STATUS_VARIANT: Record<
  string,
  { cls: string; icon: React.ComponentType<{ className?: string }> }
> = {
  PROCESSING: { cls: 'border-primary/40 bg-primary/15 text-primary', icon: Activity },
  COMPLETED: { cls: 'border-success/40 bg-success/15 text-success', icon: CheckCircle2 },
  PENDING: { cls: 'border-muted-foreground/40 bg-secondary text-muted-foreground', icon: Clock },
  FAILED: { cls: 'border-destructive/40 bg-destructive/15 text-destructive', icon: AlertCircle },
};

export default function JobsPage() {
  return (
    <div className="relative z-10">
      <Header />

      <main className="container mx-auto px-4 pt-12 pb-24">
        <div className="mb-10 flex flex-col items-start justify-between gap-6 border-b border-border pb-6 md:flex-row md:items-end">
          <div>
            <p className="label">§Jobs · {jobs.length} entries</p>
            <h1 className="display mt-3 text-5xl md:text-6xl">Background jobs.</h1>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Track your batch mint jobs in real time. Pause, resume, inspect.
            </p>
          </div>
          <Button asChild>
            <Link href="/collections/create">
              Queue a new job <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="space-y-px bg-border">
          {jobs.map((job) => (
            <Card key={job.id} className="rounded-none bg-background">
              <CardHeader className="border-b border-border">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                        {job.id}
                      </span>
                      <StatusPill status={job.status} />
                    </div>
                    <CardTitle className="mt-1">{job.collection}</CardTitle>
                    <CardDescription className="mt-1">
                      Started <span className="font-mono text-foreground">{job.startedAt}</span> ·
                      rate <span className="font-mono text-foreground">{job.rate}</span>
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="label">Cost so far</div>
                    <div className="mt-1 font-mono text-lg text-primary">{job.cost}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    <span>Progress</span>
                    <span>
                      {job.minted.toLocaleString()} / {job.total.toLocaleString()} (
                      {((job.minted / job.total) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <Progress
                    value={(job.minted / job.total) * 100}
                    className="h-1 [&>div]:bg-primary"
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {job.status === 'PROCESSING' && (
                    <Button size="sm" variant="outline">
                      <Pause className="h-3.5 w-3.5" /> Pause
                    </Button>
                  )}
                  {job.status === 'PENDING' && (
                    <Button size="sm">
                      <Play className="h-3.5 w-3.5" /> Start
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" asChild>
                    <Link href="/collections/demo-collection-01">
                      View collection <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const cfg = STATUS_VARIANT[status] ?? STATUS_VARIANT.PENDING;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[2px] border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] ${cfg.cls}`}
    >
      <Icon className="h-3 w-3" />
      {status}
    </span>
  );
}
