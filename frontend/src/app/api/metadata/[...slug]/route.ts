import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await ctx.params;
  const [collectionId, file] = [slug?.[0], slug?.[1]];

  if (!collectionId || !file || !file.endsWith('.json')) {
    return NextResponse.json({ error: 'bad params' }, { status: 400 });
  }

  const indexMatch = file.match(/^(\d+)\.json$/);
  if (!indexMatch) {
    return NextResponse.json({ error: 'bad index' }, { status: 400 });
  }
  const index = parseInt(indexMatch[1], 10);
  const hue = (hashStr(collectionId) + index * 47) % 360;

  const json = {
    name: `FriendlyMinter #${index}`,
    symbol: 'FM',
    description: `cNFT #${index} of collection ${collectionId}, minted via FriendlyMinter on Solana testnet.`,
    image: `https://placehold.co/600x600/${hueToHex(hue)}/${hueToHex((hue + 180) % 360)}/png?text=%23${index}`,
    external_url: `https://friendlyminter.vercel.app/collections/${collectionId}`,
    attributes: [
      { trait_type: 'Collection', value: collectionId },
      { trait_type: 'Index', value: index },
      { trait_type: 'Network', value: 'solana-testnet' },
    ],
    properties: {
      category: 'image',
      creators: [],
    },
  };

  return NextResponse.json(json, {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=60, s-maxage=300',
    },
  });
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function hueToHex(h: number): string {
  return h.toString(16).padStart(2, '0').repeat(3).slice(0, 6);
}
