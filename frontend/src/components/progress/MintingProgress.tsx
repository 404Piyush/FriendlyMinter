'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Pause,
  Play,
  Square,
  RefreshCw,
  ExternalLink,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
} from 'lucide-react';
import { MintJob, MintProgress } from '@/types/nft';
import { getExplorerUrl } from '@/lib/solana';
import { cn } from '@/lib/utils';

interface MintingProgressProps {
  job: MintJob;
  onPause?: (jobId: string) => void;
  onResume?: (jobId: string) => void;
  onCancel?: (jobId: string) => void;
  onRetry?: (jobId: string) => void;
  onDownloadResults?: (jobId: string) => void;
  className?: string;
}

export const MintingProgress: React.FC<MintingProgressProps> = ({
  job,
  onPause,
  onResume,
  onCancel,
  onRetry,
  onDownloadResults,
  className,
}) => {
  const [timeElapsed, setTimeElapsed] = useState<string>('0s');

  // Update elapsed time
  useEffect(() => {
    if (job.status !== 'PROCESSING') return;

    const interval = setInterval(() => {
      const now = new Date();
      const start = new Date(job.createdAt);
      const elapsed = now.getTime() - start.getTime();
      
      const seconds = Math.floor(elapsed / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      
      if (hours > 0) {
        setTimeElapsed(`${hours}h ${minutes % 60}m`);
      } else if (minutes > 0) {
        setTimeElapsed(`${minutes}m ${seconds % 60}s`);
      } else {
        setTimeElapsed(`${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [job.status, job.createdAt]);

  const getStatusColor = (status: MintJob['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'PROCESSING':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'FAILED':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'CANCELLED':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: MintJob['status']) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />;
      case 'PROCESSING':
        return <Zap className="h-4 w-4" />;
      case 'PENDING':
        return <Pause className="h-4 w-4" />;
      case 'FAILED':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const calculateProgress = (): number => {
    return job.progress || 0;
  };

  const calculateSuccessRate = (): number => {
    if (job.mintedCount === 0) return 0;
    return (job.mintedCount / (job.mintedCount + job.failedCount)) * 100;
  };

  const estimateTimeRemaining = (): string => {
    if (job.status !== 'PROCESSING') return 'N/A';
    
    const processed = job.mintedCount + job.failedCount;
    const total = job.totalNfts;
    if (processed === 0) return 'Calculating...';
    
    const elapsed = new Date().getTime() - new Date(job.createdAt).getTime();
    const avgTimePerNft = elapsed / processed;
    const remaining = (total - processed) * avgTimePerNft;
    
    const remainingSeconds = Math.floor(remaining / 1000);
    const remainingMinutes = Math.floor(remainingSeconds / 60);
    const remainingHours = Math.floor(remainingMinutes / 60);
    
    if (remainingHours > 0) {
      return `~${remainingHours}h ${remainingMinutes % 60}m`;
    } else if (remainingMinutes > 0) {
      return `~${remainingMinutes}m ${remainingSeconds % 60}s`;
    } else {
      return `~${remainingSeconds}s`;
    }
  };

  const canPause = job.status === 'PROCESSING' && onPause;
  const canResume = job.status === 'PENDING' && onResume;
  const canCancel = ['PROCESSING', 'PENDING'].includes(job.status) && onCancel;
  const canRetry = job.status === 'FAILED' && onRetry;
  const canDownload = job.status === 'COMPLETED' && onDownloadResults;

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(job.status)}
              Minting Job #{job.id.slice(-8)}
            </CardTitle>
            <CardDescription>
              Collection: {job.collectionId} • {job.totalNfts} NFTs
            </CardDescription>
          </div>
          
          <Badge className={cn('flex items-center gap-1', getStatusColor(job.status))}>
            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span>Overall Progress</span>
            <span className="font-medium">
              {job.mintedCount + job.failedCount} / {job.totalNfts} NFTs
            </span>
          </div>
          
          <Progress value={calculateProgress()} className="h-3" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-lg font-bold text-green-600">
                {job.mintedCount}
              </div>
              <div className="text-muted-foreground">Successful</div>
            </div>
            
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-lg font-bold text-red-600">
                {job.failedCount}
              </div>
              <div className="text-muted-foreground">Failed</div>
            </div>
              
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {Math.round(calculateSuccessRate())}%
                </div>
                <div className="text-muted-foreground">Success Rate</div>
              </div>
              
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-lg font-bold">
                  {job.status === 'PROCESSING' ? estimateTimeRemaining() : timeElapsed}
                </div>
                <div className="text-muted-foreground">
                  {job.status === 'PROCESSING' ? 'ETA' : 'Duration'}
                </div>
              </div>
            </div>
          </div>
        
        {/* Error Information */}
        {job.status === 'FAILED' && job.errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Error Details
            </h4>
            <p className="text-sm text-red-700">{job.errorMessage}</p>
          </div>
        )}
        
        {/* Recent Transactions */}
        {job.transactionSignatures && job.transactionSignatures.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Recent Transactions</h4>
            <div className="space-y-2">
              {job.transactionSignatures.slice(0, 3).map((tx, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm font-mono">
                    {tx.slice(0, 8)}...{tx.slice(-8)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                    asChild
                  >
                    <a
                      href={getExplorerUrl(tx)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-4 border-t">
          {canPause && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPause(job.id)}
            >
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          )}
          
          {canResume && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onResume(job.id)}
            >
              <Play className="h-4 w-4 mr-2" />
              Resume
            </Button>
          )}
          
          {canRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRetry(job.id)}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
          
          {canDownload && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownloadResults(job.id)}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Results
            </Button>
          )}
          
          {canCancel && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onCancel(job.id)}
            >
              <Square className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MintingProgress;