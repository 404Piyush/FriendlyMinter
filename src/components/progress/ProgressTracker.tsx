'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Circle,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ProgressStep {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'skipped';
  progress?: number; // 0-100
  error?: string;
  startTime?: Date;
  endTime?: Date;
}

interface ProgressTrackerProps {
  steps: ProgressStep[];
  title?: string;
  description?: string;
  showProgress?: boolean;
  showTiming?: boolean;
  className?: string;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  steps,
  title = 'Progress',
  description,
  showProgress = true,
  showTiming = true,
  className,
}) => {
  const getStepIcon = (step: ProgressStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'skipped':
        return <Circle className="h-5 w-5 text-gray-400" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStepBadge = (step: ProgressStep) => {
    switch (step.status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case 'in-progress':
        return <Badge variant="default" className="bg-blue-500">In Progress</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'skipped':
        return <Badge variant="secondary">Skipped</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const formatDuration = (start: Date, end?: Date) => {
    const endTime = end || new Date();
    const duration = endTime.getTime() - start.getTime();
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  const overallProgress = React.useMemo(() => {
    const completedSteps = steps.filter(step => step.status === 'completed').length;
    const totalSteps = steps.length;
    return totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  }, [steps]);

  const currentStep = steps.find(step => step.status === 'in-progress');
  const hasErrors = steps.some(step => step.status === 'failed');

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {hasErrors ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : currentStep ? (
                <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
              ) : overallProgress === 100 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Clock className="h-5 w-5 text-gray-500" />
              )}
              {title}
            </CardTitle>
            {description && (
              <CardDescription>{description}</CardDescription>
            )}
          </div>
          
          {showProgress && (
            <div className="text-right">
              <div className="text-2xl font-bold">
                {Math.round(overallProgress)}%
              </div>
              <div className="text-sm text-muted-foreground">
                {steps.filter(s => s.status === 'completed').length} of {steps.length} completed
              </div>
            </div>
          )}
        </div>
        
        {showProgress && (
          <Progress value={overallProgress} className="mt-4" />
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start gap-4">
              {/* Step Icon */}
              <div className="flex-shrink-0 mt-1">
                {getStepIcon(step)}
              </div>
              
              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium">{step.title}</h4>
                  {getStepBadge(step)}
                </div>
                
                {step.description && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {step.description}
                  </p>
                )}
                
                {/* Step Progress */}
                {step.status === 'in-progress' && step.progress !== undefined && (
                  <div className="mb-2">
                    <Progress value={step.progress} className="h-2" />
                    <div className="text-xs text-muted-foreground mt-1">
                      {step.progress}% complete
                    </div>
                  </div>
                )}
                
                {/* Error Message */}
                {step.status === 'failed' && step.error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                    <p className="text-sm text-red-700">{step.error}</p>
                  </div>
                )}
                
                {/* Timing Information */}
                {showTiming && step.startTime && (
                  <div className="text-xs text-muted-foreground mt-2">
                    {step.status === 'completed' && step.endTime ? (
                      <span>Completed in {formatDuration(step.startTime, step.endTime)}</span>
                    ) : step.status === 'in-progress' ? (
                      <span>Running for {formatDuration(step.startTime)}</span>
                    ) : step.status === 'failed' && step.endTime ? (
                      <span>Failed after {formatDuration(step.startTime, step.endTime)}</span>
                    ) : (
                      <span>Started at {step.startTime.toLocaleTimeString()}</span>
                    )}
                  </div>
                )}
              </div>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-6 mt-8 w-px h-8 bg-border" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressTracker;