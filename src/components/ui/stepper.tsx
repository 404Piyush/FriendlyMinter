import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  id: string;
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  current: number;
  onSelect?: (i: number) => void;
  completed: boolean[];
}

/**
 * Editorial single-line breadcrumb stepper.
 * Active step is a filled pill in Solana green. Completed steps show a
 * green checkmark. Pending steps are muted.
 */
export const Stepper: React.FC<StepperProps> = ({ steps, current, onSelect, completed }) => (
  <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
    <div className="flex items-center gap-2 mr-3">
      <span className="text-muted-foreground uppercase tracking-[0.18em]">
        Step
      </span>
      <span className="text-foreground tabular-nums">
        {String(current + 1).padStart(2, "0")}
      </span>
      <span className="text-muted-foreground">of</span>
      <span className="text-muted-foreground tabular-nums">
        {String(steps.length).padStart(2, "0")}
      </span>
    </div>

    <div className="h-px flex-1 bg-border min-w-[24px]" />

    <nav aria-label="Progress" className="flex flex-wrap items-center gap-1">
      {steps.map((step, i) => {
        const isCurrent = i === current;
        const isDone = completed[i] && !isCurrent;
        const isClickable = (isDone || i < current) && Boolean(onSelect);
        return (
          <React.Fragment key={step.id}>
            {i > 0 && (
              <span aria-hidden="true" className="text-muted-foreground/50 select-none">
                ·
              </span>
            )}
            <button
              type="button"
              disabled={!isClickable && !isCurrent}
              onClick={() => isClickable && onSelect?.(i)}
              className={cn(
                "group inline-flex items-center gap-1.5 border px-2.5 py-1 transition-colors",
                isCurrent &&
                  "border-foreground bg-foreground text-background",
                isDone &&
                  "border-sol-green bg-sol-green/10 text-foreground hover:bg-sol-green/20 cursor-pointer",
                !isCurrent && !isDone && "border-border text-muted-foreground",
                isClickable && "cursor-pointer"
              )}
            >
              <span
                className={cn(
                  "inline-flex size-3.5 items-center justify-center",
                  isCurrent && "text-background",
                  isDone && "text-sol-green",
                  !isCurrent && !isDone && "text-muted-foreground"
                )}
              >
                {isDone ? (
                  <Check className="size-3" strokeWidth={3} />
                ) : (
                  <span className="text-[10px] font-semibold tabular-nums">{i + 1}</span>
                )}
              </span>
              <span className={cn(isCurrent ? "text-background" : "")}>{step.title}</span>
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  </div>
);

/**
 * Tiny progress bar (0..1) rendered as a 2px line.
 */
export const ProgressBar: React.FC<{ value: number }> = ({ value }) => (
  <div className="h-[2px] w-full bg-border">
    <div
      className="h-full bg-foreground transition-[width] duration-300 ease-out"
      style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }}
    />
  </div>
);