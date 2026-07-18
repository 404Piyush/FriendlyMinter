import 'server-only';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { keypairIdentity, publicKey } from '@metaplex-foundation/umi';
import { fromWeb3JsKeypair } from '@metaplex-foundation/umi-web3js-adapters';
import bs58 from 'bs58';
import { getDeployerKeypair } from './wallet';

let cached: ReturnType<typeof createUmi> | null = null;

function getRpc(): string {
  return process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
}

export function getUmi() {
  if (cached) return cached;

  const kp = getDeployerKeypair();
  const umi = createUmi(getRpc()).use(keypairIdentity(fromWeb3JsKeypair(kp)));

  // Cache the UMI instance for reuse across hot API routes.
  cached = umi;
  return umi;
}

export function isBackendLive(): boolean {
  return process.env.BACKEND_LIVE !== 'false';
}

/**
 * Normalize a UMI Signature (which is a Uint8Array-like) into a base58 string
 * suitable for explorer URLs.
 */
export function signatureToBase58(sig: string | Uint8Array): string {
  if (typeof sig === 'string') {
    // Already a string. If it contains commas, treat as a Uint8Array .toString().
    if (sig.includes(',')) {
      const bytes = new Uint8Array(sig.split(',').map((n) => Number(n.trim())));
      return bs58.encode(bytes);
    }
    return sig;
  }
  // Uint8Array (UMI signatures are byte arrays)
  return bs58.encode(sig);
}

export function explorerUrl(signature: string, network: string = 'devnet'): string {
  const cluster = network === 'mainnet-beta' ? '' : `?cluster=${network}`;
  return `https://explorer.solana.com/tx/${signature}${cluster}`;
}

export function accountUrl(address: string, network: string = 'devnet'): string {
  const cluster = network === 'mainnet-beta' ? '' : `?cluster=${network}`;
  return `https://explorer.solana.com/address/${address}${cluster}`;
}

export { publicKey };