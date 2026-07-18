import * as React from "react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  current: number; // 0-indexed
  onSelect?: (i: number) => void;
  completed: boolean[];
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  current,
  onSelect,
  completed,
}) => (
  <ol className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
    {steps.map((step, i) => {
      const isCurrent = i === current;
      const isDone = completed[i] && !isCurrent;
      const isClickable = (isDone || i < current) && Boolean(onSelect);
      return (
        <li
          key={step.id}
          className={cn(
            "border border-border bg-card p-4 transition-colors",
            isCurrent && "border-foreground",
            isClickable && "cursor-pointer hover:bg-secondary/40",
            !isCurrent && !isDone && "opacity-50"
          )}
          onClick={() => isClickable && onSelect?.(i)}
        >
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "flex size-5 items-center justify-center border font-mono text-[10px] tabular-nums",
                isCurrent && "border-foreground bg-foreground text-background",
                isDone && "border-sol-green bg-sol-green text-primary-foreground",
                !isCurrent && !isDone && "border-border text-muted-foreground"
              )}
            >
              {isDone ? "✓" : i + 1}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Step {i + 1}
            </span>
          </div>
          <div className="mt-2 text-sm font-medium text-foreground">{step.title}</div>
          {step.description && (
            <div className="mt-1 text-xs text-muted-foreground">{step.description}</div>
          )}
        </li>
      );
    })}
  </ol>
);