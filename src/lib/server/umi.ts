import "server-only";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { keypairIdentity, publicKey } from "@metaplex-foundation/umi";
import { fromWeb3JsKeypair } from "@metaplex-foundation/umi-web3js-adapters";
import bs58 from "bs58";
import { getDeployerKeypair } from "./wallet";

let cached: ReturnType<typeof createUmi> | null = null;

function getRpc(): string {
  const url = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
  // Refuse to start against mainnet unless ALLOW_MAINNET=true. This prevents
  // a single env var edit from graduating the same deployer keypair from
  // devnet to mainnet and spending real SOL.
  if (url.includes("mainnet") && process.env.ALLOW_MAINNET !== "true") {
    throw new Error(
      "SOLANA_RPC_URL points at mainnet but ALLOW_MAINNET is not set. Refusing to start.",
    );
  }
  return url;
}

export function getUmi() {
  if (cached) return cached;

  const kp = getDeployerKeypair();
  const umi = createUmi(getRpc()).use(keypairIdentity(fromWeb3JsKeypair(kp)));

  cached = umi;
  return umi;
}

export function isBackendLive(): boolean {
  return process.env.BACKEND_LIVE !== "false";
}

export function signatureToBase58(sig: Uint8Array | string): string {
  if (typeof sig === "string") return sig;
  return bs58.encode(sig);
}

export function explorerUrl(signature: string, network: string = "devnet"): string {
  const cluster = network === "mainnet-beta" ? "" : `?cluster=${network}`;
  return `https://explorer.solana.com/tx/${signature}${cluster}`;
}

export function accountUrl(address: string, network: string = "devnet"): string {
  const cluster = network === "mainnet-beta" ? "" : `?cluster=${network}`;
  return `https://explorer.solana.com/address/${address}${cluster}`;
}

export { publicKey };