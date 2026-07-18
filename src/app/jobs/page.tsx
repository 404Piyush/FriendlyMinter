import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Play, Pause } from 'lucide-react';

const jobs = [
  {
    id: 'job-1',
    collection: 'Solana Genesis Pixels',
    status: 'Processing',
    variant: 'default' as const,
    minted: 642,
    total: 1000,
    rate: '53 / sec',
    cost: '0.0063 SOL',
  },
  {
    id: 'job-2',
    collection: 'On-chain Receipts',
    status: 'Completed',
    variant: 'success' as const,
    minted: 2500,
    total: 2500,
    rate: '—',
    cost: '0.0187 SOL',
  },
  {
    id: 'job-3',
    collection: 'DeGods Lite',
    status: 'Pending',
    variant: 'muted' as const,
    minted: 0,
    total: 5000,
    rate: '—',
    cost: '~0.0250 SOL',
  },
];

export default function JobsPage() {
  return (
    <div>
      <Header />
      <main className="container mx-auto px-6 py-16">
        <div className="mb-12 flex items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Jobs</h1>
            <p className="mt-3 max-w-md text-muted-foreground">
              Background batch mint jobs. Pause, resume, inspect.
            </p>
          </div>
          <Button asChild>
            <Link href="/collections/create">Queue new job</Link>
          </Button>
        </div>

        <div className="space-y-px bg-border">
          {jobs.map((job) => (
            <Card key={job.id} className="rounded-none bg-background">
              <CardContent className="py-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={job.variant}>{job.status}</Badge>
                      <span className="font-mono text-xs text-muted-foreground">{job.id}</span>
                    </div>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight">
                      {job.collection}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Rate <span className="font-mono text-foreground">{job.rate}</span> · Cost{' '}
                      <span className="font-mono text-foreground">{job.cost}</span>
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {job.status === 'Processing' && (
                      <Button variant="outline" size="sm">
                        <Pause className="size-4" />
                        Pause
                      </Button>
                    )}
                    {job.status === 'Pending' && (
                      <Button size="sm">
                        <Play className="size-4" />
                        Start
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {job.minted.toLocaleString()} / {job.total.toLocaleString()} (
                      {((job.minted / job.total) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <Progress
                    value={(job.minted / job.total) * 100}
                    className="mt-2 h-px [&>div]:bg-primary"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
