import * as React from "react";

interface InfoHintProps {
  text: string;
  className?: string;
}

/**
 * A small ⓘ icon that reveals explanatory text on hover/focus.
 * CSS-only tooltip, keyboard-accessible.
 */
export const InfoHint: React.FC<InfoHintProps> = ({ text, className }) => (
  <span className={`group/hint relative inline-flex ${className ?? ""}`}>
    <span
      tabIndex={0}
      aria-label={text}
      className="inline-flex size-3.5 cursor-help items-center justify-center text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:text-foreground"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <circle cx="6" cy="6" r="5.25" stroke="currentColor" strokeWidth="1" />
        <circle cx="6" cy="3.4" r="0.6" fill="currentColor" />
        <path d="M6 5.2 V8.6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      </svg>
    </span>
    <span
      role="tooltip"
      className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 border border-border bg-card px-3 py-2 text-xs leading-relaxed text-foreground opacity-0 shadow-md transition-opacity duration-150 group-hover/hint:opacity-100 group-focus-within/hint:opacity-100"
    >
      {text}
      <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-border" />
    </span>
  </span>
);