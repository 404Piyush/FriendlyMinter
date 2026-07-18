import "server-only";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

let cached: Keypair | null = null;

export function getDeployerKeypair(): Keypair {
  if (cached) return cached;

  const raw = process.env.DEPLOYER_SECRET_KEY;
  if (!raw) {
    throw new Error("DEPLOYER_SECRET_KEY not set");
  }

  let decoded: Uint8Array;
  try {
    decoded = bs58.decode(raw.trim());
  } catch {
    throw new Error("DEPLOYER_SECRET_KEY is not valid base58");
  }

  if (decoded.length !== 64) {
    throw new Error(
      `DEPLOYER_SECRET_KEY decoded to ${decoded.length} bytes, expected 64`,
    );
  }

  cached = Keypair.fromSecretKey(decoded);
  return cached;
}

export function getDeployerPubkey(): string {
  return getDeployerKeypair().publicKey.toBase58();
}