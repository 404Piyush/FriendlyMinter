import * as React from "react";

interface InfoHintProps {
  text: string;
  className?: string;
}

/**
 * A small ⓘ icon that reveals explanatory text on hover/focus.
 * CSS-only tooltip, keyboard-accessible.
 *
 * Renders as an SVG (not a text glyph) so the "i" is unambiguously
 * lowercase and perfectly centered regardless of font.
 */
export const InfoHint: React.FC<InfoHintProps> = ({ text, className }) => (
  <span className={`group/hint relative inline-flex shrink-0 ${className ?? ""}`}>
    <span
      tabIndex={0}
      aria-label={text}
      className="inline-flex size-4 cursor-help select-none items-center justify-center rounded-full bg-background text-muted-foreground shadow-[inset_1px_1px_2px_rgba(150,130,100,0.28),inset_-1px_-1px_2px_rgba(255,255,255,0.9)] outline-none transition-colors hover:text-foreground focus-visible:text-foreground"
    >
      <svg
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
        aria-hidden="true"
        style={{ display: "block" }}
      >
        <circle cx="5" cy="5" r="4.25" stroke="currentColor" strokeWidth="1" />
        <circle cx="5" cy="2.75" r="0.55" fill="currentColor" />
        <path
          d="M5 4.4 V7.6"
          stroke="currentColor"
          strokeWidth="1.05"
          strokeLinecap="round"
        />
      </svg>
    </span>
    <span
      role="tooltip"
      className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-xl bg-background px-3 py-2 text-xs leading-relaxed text-foreground opacity-0 shadow-[-3px_-3px_8px_rgba(255,255,255,0.9),4px_4px_8px_rgba(150,130,100,0.28)] transition-opacity duration-150 group-hover/hint:opacity-100 group-focus-within/hint:opacity-100"
    >
      {text}
    </span>
  </span>
);