import { getSiteUrl } from './umi';
import { publicKey } from '@metaplex-foundation/umi';

export interface MetadataItem {
  collectionId: string;
  index: number;
  name: string;
  description?: string;
  image?: string;
  attributes?: { trait_type: string; value: string }[];
}

export function buildMetadataJson(item: MetadataItem): Record<string, unknown> {
  return {
    name: item.name,
    description: item.description ?? `${item.name} — cNFT minted via FriendlyMinter on Solana testnet.`,
    image: item.image ?? defaultImageUrl(item),
    external_url: `${getSiteUrl()}/collections/${item.collectionId}`,
    attributes: item.attributes ?? [],
    properties: {
      category: 'image',
      creators: [],
    },
  };
}

export function metadataUrl(collectionId: string, index: number): string {
  return `${getSiteUrl()}/api/metadata/${encodeURIComponent(collectionId)}/${index}.json`;
}

function defaultImageUrl(item: MetadataItem): string {
  const hue = (hash(item.collectionId + item.index) % 360);
  return `https://placehold.co/512x512/${hueToHex(hue)}/${hueToHex((hue + 180) % 360)}/png?text=${encodeURIComponent(item.name)}`;
}

function hueToHex(h: number): string {
  return h.toString(16).padStart(2, '0').repeat(3).slice(0, 6);
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}
