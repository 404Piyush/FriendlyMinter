'use client';

import { useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { mplBubblegum } from '@metaplex-foundation/mpl-bubblegum';
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import type { Umi } from '@metaplex-foundation/umi';

export function useUmi(): Umi {
  const { connection } = useConnection();
  const wallet = useWallet();
  const walletPkStr = wallet.publicKey?.toBase58() ?? '';

  return useMemo(() => {
    const umi = createUmi(connection.rpcEndpoint)
      .use(mplBubblegum())
      .use(mplTokenMetadata());

    const pk = wallet.publicKey;
    const signTx = wallet.signTransaction;
    const signMsg = wallet.signMessage;

    if (wallet.connected && pk && signTx && signMsg) {
      umi.use(
        walletAdapterIdentity({
          publicKey: pk,
          signTransaction: signTx,
          signMessage: signMsg,
        }),
      );
    }

    return umi;
  }, [connection.rpcEndpoint, wallet.connected, walletPkStr, wallet.signTransaction, wallet.signMessage]);
}

export function getSiteUrl(): string {
  if (typeof window !== 'undefined') return window.location.origin;
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://friendlyminter.vercel.app';
}
