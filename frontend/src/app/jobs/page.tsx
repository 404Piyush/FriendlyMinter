'use client';

import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Play, Pause } from 'lucide-react';
import { useStore } from '@/lib/store';

const STATUS_VARIANT: Record<string, 'success' | 'default' | 'secondary' | 'muted' | 'destructive'> = {
  COMPLETED: 'success',
  PROCESSING: 'default',
  PENDING: 'secondary',
  PAUSED: 'muted',
  FAILED: 'destructive',
};

const STATUS_LABEL: Record<string, string> = {
  COMPLETED: 'Completed',
  PROCESSING: 'Processing',
  PENDING: 'Pending',
  PAUSED: 'Paused',
  FAILED: 'Failed',
};

export default function JobsPage() {
  const jobs = useStore((s) => s.jobs);
  const collections = useStore((s) => s.collections);

  return (
    <div>
      <Header />
      <main className="container mx-auto px-6 py-16">
        <div className="mb-12 flex items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Jobs</h1>
            <p className="mt-3 max-w-md text-muted-foreground">
              {jobs.length === 0
                ? 'No mint jobs yet. Create a collection to start a job.'
                : 'Per-browser mint sessions. Clear localStorage to reset.'}
            </p>
          </div>
          <Button asChild>
            <Link href="/collections/create">Queue new job</Link>
          </Button>
        </div>

        {jobs.length === 0 ? (
          <div className="border border-dashed border-border bg-background p-12 text-center text-muted-foreground">
            No jobs. Every collection starts a job when you open it.
          </div>
        ) : (
          <div className="space-y-px bg-border">
            {jobs.map((job) => {
              const col = collections.find((c) => c.id === job.collectionId);
              return (
                <Card key={job.id} className="rounded-none bg-background">
                  <CardContent className="py-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant={STATUS_VARIANT[job.status] ?? 'muted'}>
                            {STATUS_LABEL[job.status] ?? job.status}
                          </Badge>
                          <span className="font-mono text-xs text-muted-foreground">{job.id}</span>
                        </div>
                        <Link
                          href={`/collections/${job.collectionId}`}
                          className="mt-2 block text-xl font-semibold tracking-tight hover:underline"
                        >
                          {col?.name ?? 'Unknown collection'}
                        </Link>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Mints <span className="font-mono text-foreground">{job.minted.toLocaleString()}</span> · Failed{' '}
                          <span className="font-mono text-foreground">{job.failed.toLocaleString()}</span> · Total{' '}
                          <span className="font-mono text-foreground">{job.total.toLocaleString()}</span>
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {job.status === 'PROCESSING' && (
                          <Button variant="outline" size="sm">
                            <Pause className="size-4" />
                            Pause
                          </Button>
                        )}
                        {job.status === 'PENDING' && (
                          <Button size="sm" asChild>
                            <Link href={`/collections/${job.collectionId}`}>
                              <Play className="size-4" />
                              Start
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {job.minted.toLocaleString()} / {job.total.toLocaleString()} (
                          {((job.minted / Math.max(1, job.total)) * 100).toFixed(1)}%)
                        </span>
                      </div>
                      <Progress
                        value={(job.minted / Math.max(1, job.total)) * 100}
                        className="mt-2 h-px [&>div]:bg-primary"
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
