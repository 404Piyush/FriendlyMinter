import 'server-only';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

let cached: Keypair | null = null;

export function getDeployerKeypair(): Keypair {
  if (cached) return cached;

  const raw = process.env.DEPLOYER_SECRET_KEY;
  if (!raw) {
    throw new Error(
      'DEPLOYER_SECRET_KEY not set. Add it to .env.local and restart. ' +
      'See .env.example for how to convert a Solana CLI keypair to base58.'
    );
  }

  try {
    const decoded = bs58.decode(raw.trim());
    cached = Keypair.fromSecretKey(decoded);
    return cached;
  } catch (err) {
    throw new Error(
      `Failed to decode DEPLOYER_SECRET_KEY: ${(err as Error).message}. ` +
      `Expected base58-encoded 64-byte secret key.`
    );
  }
}

export function getDeployerPubkey(): string {
  return getDeployerKeypair().publicKey.toBase58();
}