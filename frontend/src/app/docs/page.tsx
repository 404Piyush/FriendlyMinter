import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { DocsSidebar, DocsToc, type DocsSection } from '@/components/docs/DocsLayout';
import { CodeBlock } from '@/components/docs/CodeBlock';

const sections: DocsSection[] = [
  { id: 'introduction', title: 'Introduction' },
  { id: 'quickstart', title: 'Quick start' },
  { id: 'concepts', title: 'Core concepts' },
  { id: 'merkle-trees', title: 'Merkle tree config' },
  { id: 'csv-format', title: 'CSV format' },
  { id: 'api-reference', title: 'API reference' },
  { id: 'tech-stack', title: 'Tech stack' },
];

export default function DocsPage() {
  return (
    <div>
      <Header />
      <div className="container mx-auto px-6">
        <div className="grid gap-12 py-12 md:grid-cols-[220px_1fr] lg:grid-cols-[220px_1fr_180px]">
          <DocsSidebar sections={sections} />

          <main className="min-w-0 max-w-3xl">
            <header className="border-b border-border pb-10">
              <p className="text-sm text-muted-foreground">Documentation</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">
                FriendlyMinter docs
              </h1>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Build with the same APIs the demo uses. Everything runs against mock data until you
                set <code className="font-mono text-foreground">NEXT_PUBLIC_USE_MOCK_API=false</code>{' '}
                and wire a backend.
              </p>
              <div className="mt-8 flex flex-wrap gap-2">
                <Button asChild>
                  <Link href="/demo">Open the demo</Link>
                </Button>
                <Button asChild variant="outline">
                  <a
                    href="https://github.com/404Piyush/FriendlyMinter"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Source on GitHub
                  </a>
                </Button>
              </div>
            </header>

            {/* Introduction */}
            <Section id="introduction" title="Introduction">
              <p>
                FriendlyMinter is a web app for minting{' '}
                <a
                  href="https://docs.metaplex.com/programs/token-metadata/bubblegum"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground underline-offset-4 hover:underline"
                >
                  compressed NFTs
                </a>{' '}
                on Solana. It wraps the Bubblegum standard in a UI so you don&apos;t have to manage
                Merkle trees by hand.
              </p>
              <p>
                The current deployment is a fully clickable frontend. All data flows through{' '}
                <code className="font-mono text-foreground">lib/mock-api.ts</code>, which simulates
                network latency and a couple of failure modes. The real on-chain adapters sit
                behind the same interface, so swapping the data layer is a one-flag change.
              </p>
            </Section>

            {/* Quickstart */}
            <Section id="quickstart" title="Quick start">
              <p>Run the demo locally in three commands:</p>
              <CodeBlock
                language="bash"
                code={`git clone https://github.com/404Piyush/FriendlyMinter.git
cd FriendlyMinter/frontend
npm install && npm run dev`}
              />
              <p>
                Open{' '}
                <a
                  href="http://localhost:3000"
                  className="text-foreground underline-offset-4 hover:underline"
                >
                  http://localhost:3000
                </a>
                . Connect Phantom (or any wallet) and switch it to Devnet. You can mint to your own
                wallet or just play with the UI in mock mode.
              </p>

              <h3>Environment variables</h3>
              <p>All vars are public (browser-readable). Copy <code className="font-mono">.env.example</code> to <code className="font-mono">.env.local</code>:</p>
              <CodeBlock
                language="bash"
                code={`# .env.local
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=
NEXT_PUBLIC_USE_MOCK_API=true`}
              />
            </Section>

            {/* Concepts */}
            <Section id="concepts" title="Core concepts">
              <h3>Compressed NFTs (cNFTs)</h3>
              <p>
                A cNFT is a 32-byte hash stored as a leaf inside a Merkle tree on-chain. The tree
                root is published in a single account. The actual metadata and image live off-chain
                in a ledger maintained by Solana validators.
              </p>
              <p>
                Cost per mint is roughly an order of magnitude lower than a regular NFT, because
                you&apos;re not paying for a new account per mint. You are paying for tree rent
                up front.
              </p>

              <h3>Bubblegum</h3>
              <p>
                Bubblegum is the Metaplex program that defines the cNFT standard. FriendlyMinter
                uses it for tree creation, minting, and transfers. Read the{' '}
                <a
                  href="https://docs.metaplex.com/programs/token-metadata/bubblegum"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground underline-offset-4 hover:underline"
                >
                  official spec
                </a>{' '}
                for protocol-level details.
              </p>
            </Section>

            {/* Merkle trees */}
            <Section id="merkle-trees" title="Merkle tree config">
              <p>
                Each collection is backed by one <em>concurrent</em> Merkle tree. The tree&apos;s
                parameters set its capacity and write throughput.
              </p>
              <div className="my-6 border border-border">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-secondary/30">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Preset</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Depth</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Capacity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Use case</th>
                    </tr>
                  </thead>
                  <tbody>
                    {treeRows.map((r) => (
                      <tr key={r.label} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 font-medium">{r.label}</td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.depth}</td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.capacity}</td>
                        <td className="px-4 py-3 text-muted-foreground">{r.use}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>
                <code className="font-mono text-foreground">maxBufferSize</code> sets how many
                concurrent writes the tree can absorb. Higher buffer = more parallel throughput
                but more rent. <code className="font-mono text-foreground">canopyDepth</code>{' '}
                stores the upper levels of the tree in the transaction itself, which dramatically
                reduces the size of subsequent mint proofs.
              </p>
            </Section>

            {/* CSV format */}
            <Section id="csv-format" title="CSV format">
              <p>
                For bulk mints, drop a CSV with the schema below. The first column is required;
                everything else is optional. Column names match the standard Metaplex metadata
                spec.
              </p>
              <CodeBlock
                language="csv"
                code={`name,description,image,attributes,external_url,animation_url
"#1 Welcome Mat","First in the series",https://example.com/1.png,"bg:purple;rarity:common",,
"#2 Welcome Mat","Second in the series",https://example.com/2.png,"bg:blue;rarity:rare",https://example.com,https://example.com/2.mp4
"#3 Welcome Mat","Third in the series",ipfs://QmXxx...,"bg:green;rarity:epic",,`}
              />
              <p>
                <strong>Attributes:</strong> use{' '}
                <code className="font-mono">trait:value</code> pairs separated by{' '}
                <code className="font-mono">;</code>. For example{' '}
                <code className="font-mono">bg:purple;rarity:epic</code> produces two trait rows in
                the on-chain metadata.
              </p>
              <p>
                <strong>Image URLs:</strong> FriendlyMinter auto-detects{' '}
                <code className="font-mono">ipfs://</code>,{' '}
                <code className="font-mono">ar://</code>, and{' '}
                <code className="font-mono">https://</code> schemes. Pinata, Arweave, and most
                CDNs work out of the box.
              </p>
            </Section>

            {/* API reference */}
            <Section id="api-reference" title="API reference">
              <p>
                The public API lives in two modules. Both are accessible from any client component:
              </p>

              <h3>
                <code className="font-mono text-foreground">lib/solana.ts</code>
              </h3>
              <p>Connection management, network selection, and explorer URL helpers.</p>
              <CodeBlock
                language="ts"
                code={`import {
  getConnection,
  getCurrentNetwork,
  getExplorerUrl,
  testSolanaConnection,
} from '@/lib/solana';

const conn = getConnection();          // singleton Connection for the current network
const network = getCurrentNetwork();   // 'devnet' | 'testnet' | 'mainnet-beta'

const ok = await testSolanaConnection();
const url = getExplorerUrl(signature); // explorer.solana.com/tx/<sig>?cluster=devnet`}
              />

              <h3>
                <code className="font-mono text-foreground">lib/mock-api.ts</code>
              </h3>
              <p>
                Mock data layer. Each method returns a promise that resolves after a configurable
                delay (<code className="font-mono">NEXT_PUBLIC_MOCK_DELAY</code>, default 1000ms).
              </p>
              <CodeBlock
                language="ts"
                code={`import { mockAPI } from '@/lib/mock-api';

// Collections
const collections = await mockAPI.getCollections(userId);
const collection  = await mockAPI.getCollection(id);
const created     = await mockAPI.createCollection({ name, symbol, ... });

// Mint jobs
const job         = await mockAPI.startMintJob(jobId);
await mockAPI.pauseMintJob(jobId);
await mockAPI.resumeMintJob(jobId);

// File uploads
const { url, cid } = await mockAPI.uploadFile(file);`}
              />

              <h3>
                <code className="font-mono text-foreground">components/wallet</code>
              </h3>
              <p>Drop-in wallet adapter wired to the configured network.</p>
              <CodeBlock
                language="tsx"
                code={`import { WalletButton } from '@/components/wallet/WalletButton';
import { useWallet } from '@solana/wallet-adapter-react';

export function MyComponent() {
  const { connected, publicKey, connect, disconnect, signTransaction } = useWallet();
  return <WalletButton />;
}`}
              />
            </Section>

            {/* Tech stack */}
            <Section id="tech-stack" title="Tech stack">
              <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2">
                {stackRows.map((row) => (
                  <div key={row.title} className="bg-background p-5">
                    <h4 className="text-sm font-medium">{row.title}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">{row.libs}</p>
                  </div>
                ))}
              </div>
            </Section>

            <div className="mt-16 border border-border p-8">
              <h3 className="text-xl font-semibold tracking-tight">Prefer to click than read?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                The demo runs the full flow against mock data. No wallet required.
              </p>
              <Button asChild className="mt-5">
                <Link href="/demo">Open demo →</Link>
              </Button>
            </div>
          </main>

          <DocsToc sections={sections} />
        </div>
      </div>
    </div>
  );
}

const treeRows = [
  { label: 'Tiny', depth: '3', capacity: '~8', use: 'Test drops' },
  { label: 'Small', depth: '10', capacity: '~1K', use: 'Small collections' },
  { label: 'Medium', depth: '14', capacity: '~16K', use: 'PFP projects' },
  { label: 'Large', depth: '17', capacity: '~131K', use: 'Generative art' },
  { label: 'XL', depth: '20', capacity: '~1M', use: 'Event tickets, POAPs' },
];

const stackRows = [
  { title: 'Framework', libs: 'Next.js 15 (App Router) + React 19' },
  { title: 'Language', libs: 'TypeScript' },
  { title: 'Type checking', libs: 'strict mode (tsconfig.json)' },
  { title: 'Styling', libs: 'Tailwind CSS v4' },
  { title: 'Solana', libs: '@solana/wallet-adapter, @solana/web3.js' },
  { title: 'State', libs: 'Zustand (client), TanStack Query (server)' },
  { title: 'Forms', libs: 'React Hook Form + Zod' },
  { title: 'Toasts', libs: 'Sonner' },
  { title: 'UI primitives', libs: 'Custom shadcn-style components in src/components/ui' },
];

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-16 scroll-mt-24 first:mt-12">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-6 space-y-4 text-base leading-relaxed text-foreground/90 [&_h3]:mt-8 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:tracking-tight [&_a]:text-foreground [&_a]:underline-offset-4 hover:[&_a]:underline">
        {children}
      </div>
    </section>
  );
}
