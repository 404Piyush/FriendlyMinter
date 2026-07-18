import { Connection, clusterApiUrl } from '@solana/web3.js';

export type SolanaNetwork = 'devnet' | 'testnet' | 'mainnet-beta';

const NETWORK = (process.env.NEXT_PUBLIC_SOLANA_NETWORK as SolanaNetwork) || 'devnet';
const COMMITMENT = 'confirmed' as const;

const RPC_URLS: Record<SolanaNetwork, string> = {
  devnet: 'https://api.devnet.solana.com',
  testnet: 'https://api.testnet.solana.com',
  'mainnet-beta': 'https://api.mainnet-beta.solana.com',
};

const NETWORK_LABELS: Record<SolanaNetwork, string> = {
  devnet: 'Devnet',
  testnet: 'Testnet',
  'mainnet-beta': 'Mainnet Beta',
};

const EXPLORER_URLS: Record<SolanaNetwork, string> = {
  devnet: 'https://explorer.solana.com/?cluster=devnet',
  testnet: 'https://explorer.solana.com/?cluster=testnet',
  'mainnet-beta': 'https://explorer.solana.com/',
};

let cachedConnection: Connection | null = null;

function buildConnection(network: SolanaNetwork): Connection {
  const rpc = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || RPC_URLS[network];
  return new Connection(rpc, {
    commitment: COMMITMENT,
    confirmTransactionInitialTimeout: 60_000,
  });
}

export function getConnection(network: SolanaNetwork = NETWORK): Connection {
  if (cachedConnection && network === NETWORK) return cachedConnection;
  cachedConnection = buildConnection(network);
  return cachedConnection;
}

export function getCurrentNetwork(): SolanaNetwork {
  return NETWORK;
}

export const SOLANA_NETWORKS = NETWORK_LABELS;
export const EXPLORER_BASE_URLS = EXPLORER_URLS;

export function getExplorerUrl(signature: string, network: SolanaNetwork = NETWORK): string {
  return `${EXPLORER_URLS[network]}/tx/${signature}`;
}

export async function testSolanaConnection(): Promise<boolean> {
  try {
    const conn = getConnection();
    const version = await conn.getVersion();
    console.log(`✅ Connected to Solana ${NETWORK}:`, version);
    return true;
  } catch (error) {
    console.error(`❌ Failed to connect to Solana ${NETWORK}:`, error);
    return false;
  }
}