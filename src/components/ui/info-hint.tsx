import * as React from "react";

interface InfoHintProps {
  text: string;
  className?: string;
}

export const InfoHint: React.FC<InfoHintProps> = ({ text, className }) => (
  <span className={`group/hint relative inline-flex ${className ?? ""}`}>
    <span
      tabIndex={0}
      aria-label={text}
      className="inline-flex size-3.5 cursor-help items-center justify-center rounded-full bg-background text-muted-foreground shadow-[inset_1px_1px_2px_rgba(150,130,100,0.28),inset_-1px_-1px_2px_rgba(255,255,255,0.9)] outline-none transition-colors hover:text-foreground focus-visible:text-foreground"
    >
      <span className="font-mono text-[9px] font-semibold leading-none">i</span>
    </span>
    <span
      role="tooltip"
      className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-xl bg-background px-3 py-2 text-xs leading-relaxed text-foreground opacity-0 shadow-[-3px_-3px_8px_rgba(255,255,255,0.9),4px_4px_8px_rgba(150,130,100,0.28)] transition-opacity duration-150 group-hover/hint:opacity-100 group-focus-within/hint:opacity-100"
    >
      {text}
    </span>
  </span>
);