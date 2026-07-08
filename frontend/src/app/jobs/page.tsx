import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, ArrowRight, Clock, CheckCircle2, AlertCircle, Play, Pause } from 'lucide-react';

const jobs = [
  {
    id: 'job-001',
    collection: 'Solana Genesis Pixels',
    status: 'PROCESSING',
    minted: 642,
    total: 1000,
    startedAt: '12 min ago',
    rate: '53 / sec',
    cost: '0.0063 SOL',
  },
  {
    id: 'job-002',
    collection: 'On-chain Receipts',
    status: 'COMPLETED',
    minted: 2500,
    total: 2500,
    startedAt: '2 days ago',
    rate: '—',
    cost: '0.0187 SOL',
  },
  {
    id: 'job-003',
    collection: 'DeGods Lite',
    status: 'PENDING',
    minted: 0,
    total: 5000,
    startedAt: 'queued',
    rate: '—',
    cost: '~0.0250 SOL',
  },
];

export default function JobsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="h-4 w-4" />
              Mint Jobs
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Background Jobs</h1>
            <p className="mt-2 text-muted-foreground">
              Track your batch mint jobs. Pause, resume or inspect progress at any time.
            </p>
          </div>
          <Button asChild>
            <Link href="/collections/create">
              New Job <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id} className="transition-all hover:shadow-md">
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{job.id}</span>
                      <StatusBadge status={job.status} />
                    </div>
                    <CardTitle className="mt-1">{job.collection}</CardTitle>
                    <CardDescription>
                      Started <span className="font-mono">{job.startedAt}</span> · Rate{' '}
                      <span className="font-mono">{job.rate}</span>
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Cost so far</div>
                    <div className="font-mono text-lg">{job.cost}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>
                      {job.minted.toLocaleString()} / {job.total.toLocaleString()} (
                      {((job.minted / job.total) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <Progress
                    value={(job.minted / job.total) * 100}
                    className="h-2"
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {job.status === 'PROCESSING' && (
                    <Button size="sm" variant="outline">
                      <Pause className="mr-2 h-4 w-4" /> Pause
                    </Button>
                  )}
                  {job.status === 'PENDING' && (
                    <Button size="sm">
                      <Play className="mr-2 h-4 w-4" /> Start
                    </Button>
                  )}
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/collections/demo-collection-01">View collection</Link>
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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; icon: React.ComponentType<{ className?: string }> }> = {
    PROCESSING: { cls: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Activity },
    COMPLETED: { cls: 'bg-green-500/10 text-green-500 border-green-500/20', icon: CheckCircle2 },
    PENDING: { cls: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: Clock },
    FAILED: { cls: 'bg-red-500/10 text-red-500 border-red-500/20', icon: AlertCircle },
  };
  const { cls, icon: Icon } = map[status] ?? { cls: '', icon: Clock as React.ComponentType<{ className?: string }> };
  return (
    <Badge variant="outline" className={cls}>
      <Icon className="mr-1 h-3 w-3" />
      {status}
    </Badge>
  );
}
