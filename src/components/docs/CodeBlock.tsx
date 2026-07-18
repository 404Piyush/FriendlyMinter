'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  language?: string;
  filename?: string;
  code: string;
};

export function CodeBlock({ language = 'bash', filename, code }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="group relative my-4 border border-border bg-background">
      <div className="flex items-center justify-between border-b border-border bg-secondary/30 px-4 py-2 text-xs">
        <div className="flex items-center gap-3 font-mono text-muted-foreground">
          <span className="text-foreground">{filename ?? language}</span>
          {filename && <span>·</span>}
          <span>{language}</span>
        </div>
        <button
          onClick={copy}
          className={cn(
            'flex items-center gap-1.5 font-mono text-muted-foreground transition-colors hover:text-foreground'
          )}
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="size-3 text-success" />
              <span className="text-success">copied</span>
            </>
          ) : (
            <>
              <Copy className="size-3" />
              <span>copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-foreground/90">
        <code>{code}</code>
      </pre>
    </div>
  );
}
