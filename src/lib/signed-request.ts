/**
 * SIWS-style client flow:
 *   1. POST /api/auth/nonce → { nonce, issuedAt, ttlMs }
 *   2. Compute sha256 of the JSON body we'll POST
 *   3. Build the canonical message
 *   4. Ask the connected wallet to signMessage(messageBytes)
 *   5. Return the X-Auth header JSON the route expects
 *
 * Wallet-adapter's `signMessage` returns a Uint8Array signature.
 * Server expects base58-encoded signature.
 */
import bs58 from "bs58";

export interface SignedRequestHeader {
  pubkey: string;
  signature: string;
  nonce: string;
  timestamp: number;
  method: string;
  path: string;
  body: string;
}

export interface Signer {
  publicKey: { toBase58(): string } | null;
  signMessage?: (message: Uint8Array) => Promise<Uint8Array>;
}

export async function buildAuthHeader(args: {
  signer: Signer;
  method: string;
  path: string;
  rawBody: string;
}): Promise<SignedRequestHeader> {
  const { signer, method, path, rawBody } = args;
  if (!signer.publicKey) {
    throw new Error("Wallet not connected");
  }
  if (!signer.signMessage) {
    throw new Error("Wallet does not support message signing");
  }

  const nonceRes = await fetch("/api/auth/nonce", { method: "POST" });
  if (!nonceRes.ok) {
    throw new Error("Failed to issue nonce");
  }
  const { nonce, issuedAt } = (await nonceRes.json()) as {
    nonce: string;
    issuedAt: number;
  };

  const bodyHash = await sha256Hex(rawBody);
  const message = buildMessageBytes({
    nonce,
    timestamp: issuedAt,
    method,
    path,
    bodyHash,
  });

  const signatureBytes = await signer.signMessage(message);
  const signature = bs58.encode(signatureBytes);

  return {
    pubkey: signer.publicKey.toBase58(),
    signature,
    nonce,
    timestamp: issuedAt,
    method,
    path,
    body: bodyHash,
  };
}

function buildMessageBytes(input: {
  nonce: string;
  timestamp: number;
  method: string;
  path: string;
  bodyHash: string;
}): Uint8Array {
  const text =
    "FriendlyMinter\n" +
    `nonce=${input.nonce}\n` +
    `timestamp=${input.timestamp}\n` +
    `method=${input.method.toUpperCase()}\n` +
    `path=${input.path}\n` +
    `body=${input.bodyHash}`;
  return new TextEncoder().encode(text);
}

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}