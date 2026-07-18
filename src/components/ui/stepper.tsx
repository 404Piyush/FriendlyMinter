import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  id: string;
  title: string;
}

interface StepperProps {
  steps: Step[];
  current: number;
  onSelect?: (i: number) => void;
  completed: boolean[];
}

/**
 * Minimal neumorphic stepper — just dots with a connecting line.
 * Active dot is the foreground colour and slightly larger.
 * Completed dots show a green tick.
 */
export const Stepper: React.FC<StepperProps> = ({ steps, current, onSelect, completed }) => (
  <ol className="flex items-center gap-1.5">
    {steps.map((step, i) => {
      const isCurrent = i === current;
      const isDone = completed[i] && !isCurrent;
      const isClickable = (isDone || i < current) && Boolean(onSelect);
      const isLast = i === steps.length - 1;
      return (
        <React.Fragment key={step.id}>
          <li className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={!isClickable && !isCurrent}
              onClick={() => isClickable && onSelect?.(i)}
              aria-label={`${i + 1}. ${step.title}`}
              className={cn(
                "relative inline-flex size-9 items-center justify-center rounded-full transition-shadow",
                isCurrent &&
                  "bg-background text-foreground shadow-[inset_3px_3px_6px_rgba(150,130,100,0.32),inset_-3px_-3px_6px_rgba(255,255,255,1)]",
                isDone &&
                  "bg-sol-green text-primary-foreground shadow-[-2px_-2px_4px_rgba(255,255,255,0.6),2px_2px_4px_rgba(20,241,149,0.3)] cursor-pointer hover:brightness-95",
                !isCurrent && !isDone &&
                  "bg-background text-muted-foreground shadow-[-2px_-2px_4px_rgba(255,255,255,0.9),2px_2px_4px_rgba(150,130,100,0.18)]",
                isClickable && "cursor-pointer"
              )}
            >
              {isDone ? (
                <Check className="size-4" strokeWidth={3} />
              ) : (
                <span className="font-mono text-xs font-semibold tabular-nums">{i + 1}</span>
              )}
            </button>
            {isCurrent && (
              <span className="hidden font-medium text-foreground sm:inline-block">
                {step.title}
              </span>
            )}
          </li>
          {!isLast && (
            <span
              aria-hidden="true"
              className={cn(
                "h-px w-6 transition-colors",
                isDone || (isCurrent && i < current + 1) ? "bg-sol-green/40" : "bg-ink-faint/30"
              )}
            />
          )}
        </React.Fragment>
      );
    })}
  </ol>
);