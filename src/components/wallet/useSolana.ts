'use client';

import { useMemo } from 'react';
import { clusterApiUrl, Commitment } from '@solana/web3.js';
import { SolanaNetwork } from '@/types/api';

const RPC_URLS: Record<SolanaNetwork, string> = {
  'devnet': 'https://api.devnet.solana.com',
  'testnet': 'https://api.testnet.solana.com',
  'mainnet-beta': 'https://api.mainnet-beta.solana.com',
};

export function useSolana() {
  return useMemo(() => {
    const network: SolanaNetwork =
      (process.env.NEXT_PUBLIC_SOLANA_NETWORK as SolanaNetwork) ?? 'devnet';
    const customRpc = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
    const endpoint = customRpc || RPC_URLS[network] || clusterApiUrl(network);
    return { network, endpoint };
  }, []);
}
