'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export type DocsSection = {
  id: string;
  title: string;
};

export function DocsSidebar({ sections }: { sections: DocsSection[] }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: [0, 1] }
    );

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  return (
    <aside className="hidden md:block">
      <div className="sticky top-24">
        <p className="text-xs font-medium text-muted-foreground">On this page</p>
        <nav className="mt-4 flex flex-col">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={cn(
                'border-l py-1.5 pl-4 text-sm transition-colors',
                active === s.id
                  ? 'border-foreground text-foreground'
                  : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
              )}
            >
              {s.title}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}

export function DocsToc({ sections }: { sections: DocsSection[] }) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24">
        <p className="text-xs font-medium text-muted-foreground">External</p>
        <nav className="mt-4 flex flex-col gap-2 text-sm">
          <a
            href="https://docs.metaplex.com/programs/token-metadata/bubblegum"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            Bubblegum ↗
          </a>
          <a
            href="https://solana.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            Solana docs ↗
          </a>
          <a
            href="https://github.com/404Piyush/FriendlyMinter"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            GitHub ↗
          </a>
        </nav>
      </div>
    </aside>
  );
}
