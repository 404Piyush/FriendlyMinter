import 'server-only';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { keypairIdentity, publicKey } from '@metaplex-foundation/umi';
import { fromWeb3JsKeypair } from '@metaplex-foundation/umi-web3js-adapters';
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

export function explorerUrl(signature: string, network: string = 'devnet'): string {
  const cluster = network === 'mainnet-beta' ? '' : `?cluster=${network}`;
  return `https://explorer.solana.com/tx/${signature}${cluster}`;
}

export function accountUrl(address: string, network: string = 'devnet'): string {
  const cluster = network === 'mainnet-beta' ? '' : `?cluster=${network}`;
  return `https://explorer.solana.com/address/${address}${cluster}`;
}

export { publicKey };