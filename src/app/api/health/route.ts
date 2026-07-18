import { NextResponse } from 'next/server';
import { getDeployerPubkey } from '@/lib/server/wallet';
import { isBackendLive } from '@/lib/server/umi';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pubkey = getDeployerPubkey();
    return NextResponse.json({
      ok: true,
      live: isBackendLive(),
      deployer: pubkey,
      rpc: process.env.SOLANA_RPC_URL ?? 'https://api.devnet.solana.com',
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        live: false,
        error: (err as Error).message,
      },
      { status: 503 }
    );
  }
}