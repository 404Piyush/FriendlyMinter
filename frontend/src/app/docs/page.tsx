import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';

export default function DocsPage() {
  return (
    <div>
      <Header />
      <main className="container mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Docs</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Concepts, formats, and architecture — short on prose, long on specifics.
        </p>

        <article className="prose prose-invert mt-16 max-w-none">
          <Section title="Compressed NFTs">
            <p>
              Compressed NFTs use Solana&apos;s state compression. Each NFT is a single 32-byte
              hash inside a Merkle tree on-chain. Actual data lives off-chain in a ledger operated
              by validators.
            </p>
            <p className="mt-3 text-muted-foreground">
              Cost drops from ~12,000 lamports per NFT to ~5,000 lamports plus amortised tree rent.
              Trade-off: you need a Merkle tree, and reading proofs off-chain is a bit more involved.
            </p>
          </Section>

          <Section title="Merkle trees">
            <p>
              Each collection is backed by a single concurrent Merkle tree.{' '}
              <code className="font-mono text-foreground">maxDepth</code> sets capacity,{' '}
              <code className="font-mono text-foreground">maxBufferSize</code> sets concurrent write
              throughput.
            </p>
            <div className="mt-6 border border-border">
              <table className="w-full text-sm">
                <tbody>
                  {[
                    ['Tiny', 'depth 3', '~8 items'],
                    ['Small', 'depth 10', '~1K'],
                    ['Medium', 'depth 14', '~16K'],
                    ['Large', 'depth 17', '~131K'],
                    ['XL', 'depth 20', '~1M'],
                  ].map(([label, d, c]) => (
                    <tr key={label} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium">{label}</td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">{d}</td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">{c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="CSV format">
            <p>Bulk-mint schema:</p>
            <pre className="mt-4 overflow-x-auto border border-border bg-background p-4 font-mono text-xs leading-relaxed text-foreground">
{`name,description,image,attributes,external_url,animation_url
"#1 Welcome Mat","First in the series",https://…/1.png,"bg:purple;rarity:common",
"#2 Welcome Mat","Second in the series",https://…/2.png,"bg:blue;rarity:rare",https://example.com,https://…/2.mp4`}
            </pre>
            <p className="mt-3 text-sm text-muted-foreground">
              Attributes use <code className="font-mono">trait:value</code> separated by{' '}
              <code className="font-mono">;</code>.
            </p>
          </Section>

          <Section title="Tech stack">
            <ul className="space-y-1.5 text-sm">
              <li>· Next.js 15 (App Router) + React 19</li>
              <li>· TypeScript</li>
              <li>· Tailwind v4</li>
              <li>· @solana/wallet-adapter</li>
              <li>· Zustand · TanStack Query · React Hook Form + Zod · Sonner</li>
            </ul>
          </Section>
        </article>

        <div className="mt-16 border border-primary/30 bg-primary/5 p-8">
          <h3 className="text-xl font-semibold tracking-tight">See it without writing code.</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            The interactive demo simulates the full flow with mock data.
          </p>
          <Button asChild className="mt-5">
            <Link href="/demo">Open demo →</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12 first:mt-0">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-4 text-base leading-relaxed text-foreground/90">{children}</div>
    </section>
  );
}
