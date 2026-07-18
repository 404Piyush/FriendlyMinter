import "server-only";
import { createHash, createPublicKey, verify } from "node:crypto";
import { publicKey as umiPublicKey } from "@metaplex-foundation/umi";
import { PublicKey as Web3PublicKey } from "@solana/web3.js";

/**
 * SIWS-style wallet signature verification for the FriendlyMinter backend.
 *
 * Flow:
 *   1. Client calls POST /api/auth/nonce → server returns a random nonce.
 *   2. Client builds the canonical message:
 *        "FriendlyMinter\nnonce=<hex>\ntimestamp=<ms>\nmethod=<POST|...>\npath=<url>\nbody=<sha256-hex>"
 *      and asks the connected wallet to signMessage() the UTF-8 bytes.
 *   3. Client posts { pubkey, signature, nonce, timestamp, method, path, body } to the action route.
 *   4. Server verifies:
 *        - nonce exists, is unused, was issued < 5 min ago
 *        - timestamp within ±5 min of server clock
 *        - signature is valid for the message bytes
 *        - pubkey is valid base58 public key
 *        - body matches the posted body (recomputed hash)
 */

interface NonceRecord {
  nonce: string;
  createdAt: number;
}

interface SignedRequest {
  pubkey: string;        // base58 wallet pubkey
  signature: string;     // base58-encoded signature
  nonce: string;
  timestamp: number;     // ms since epoch
  method: string;        // POST, etc.
  path: string;          // request path
  body: string;          // raw request body string (sha256 hex computed server-side from this)
}

const NONCE_TTL_MS = 5 * 60 * 1000;
const TIMESTAMP_SKEW_MS = 5 * 60 * 1000;

// In-memory nonce store. Same caveat as the rate limiter: per-lambda on Vercel.
// For prod-grade, swap with Upstash Redis or Vercel KV.
const nonces = new Map<string, NonceRecord>();

function randomNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function issueNonce(): { nonce: string; issuedAt: number } {
  const nonce = randomNonce();
  nonces.set(nonce, { nonce, createdAt: Date.now() });
  // Lazy GC: remove expired nonces opportunistically
  if (nonces.size > 1024) {
    const now = Date.now();
    for (const [k, v] of nonces) {
      if (now - v.createdAt > NONCE_TTL_MS) nonces.delete(k);
    }
  }
  return { nonce, issuedAt: Date.now() };
}

export function consumeNonce(nonce: string): boolean {
  const rec = nonces.get(nonce);
  if (!rec) return false;
  if (Date.now() - rec.createdAt > NONCE_TTL_MS) {
    nonces.delete(nonce);
    return false;
  }
  nonces.delete(nonce);
  return true;
}

/**
 * Build the canonical message the wallet signs. This exact format must be
 * used on both client and server.
 */
export function buildSignedMessage(input: {
  nonce: string;
  timestamp: number;
  method: string;
  path: string;
  bodyHash: string; // hex sha256 of raw body
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

/**
 * SHA-256 hex of a UTF-8 string. Subtle crypto is Web Crypto.
 */
export async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Verify a signed request. Returns the verified wallet pubkey on success,
 * or throws an Error with a stable code.
 */
export async function verifySignedRequest(
  signed: SignedRequest,
  rawBody: string,
): Promise<Web3PublicKey> {
  // 1. Validate shape
  if (!signed.pubkey || !signed.signature || !signed.nonce || !signed.timestamp) {
    throw new AuthError("MISSING_FIELDS", "Missing required signature fields");
  }

  let pubkey: Web3PublicKey;
  try {
    pubkey = new Web3PublicKey(signed.pubkey);
  } catch {
    throw new AuthError("INVALID_PUBKEY", "Invalid public key");
  }

  // 2. Check timestamp window
  const now = Date.now();
  if (Math.abs(now - signed.timestamp) > TIMESTAMP_SKEW_MS) {
    throw new AuthError("TIMESTAMP_EXPIRED", "Signature timestamp out of window");
  }

  // 3. Consume nonce (must exist + be unused)
  if (!consumeNonce(signed.nonce)) {
    throw new AuthError("BAD_NONCE", "Nonce invalid or already used");
  }

  // 4. Re-hash body and compare
  const expectedHash = await sha256Hex(rawBody);
  if (signed.body !== expectedHash) {
    throw new AuthError("BODY_MISMATCH", "Request body hash does not match");
  }

  // 5. Verify signature against the canonical message
  const message = buildSignedMessage({
    nonce: signed.nonce,
    timestamp: signed.timestamp,
    method: signed.method,
    path: signed.path,
    bodyHash: signed.body,
  });

  let signatureBytes: Uint8Array;
  try {
    const bs58mod = await import("bs58");
    const bs58 = (bs58mod as { default: { decode: (s: string) => Uint8Array } }).default;
    signatureBytes = bs58.decode(signed.signature);
  } catch {
    throw new AuthError("INVALID_SIGNATURE", "Signature is not valid base58");
  }

  if (signatureBytes.length !== 64) {
    throw new AuthError("INVALID_SIGNATURE", "Signature must be 64 bytes");
  }

  const ok = verifyEd25519(pubkey.toBytes(), message, signatureBytes);
  if (!ok) {
    throw new AuthError("BAD_SIGNATURE", "Signature does not verify");
  }

  return pubkey;
}

/**
 * Verify an Ed25519 signature using Node's built-in crypto. We use the raw
 * `verify` rather than KeyObject because UMI's PublicKey returns the 32-byte
 * raw form, not a DER-encoded SPKI.
 */
function verifyEd25519(
  publicKeyBytes: Uint8Array,
  message: Uint8Array,
  signature: Uint8Array,
): boolean {
  if (publicKeyBytes.length !== 32) return false;
  try {
    // Construct a Node KeyObject in raw Ed25519 form. Node 18+ supports
    // this; key format "raw" + "node.ed25519" gives us the 32-byte pubkey.
    const keyObject = createPublicKey({
      key: Buffer.concat([
        // 12-byte DER prefix for Ed25519 SubjectPublicKeyInfo
        Buffer.from([0x30, 0x2a, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70, 0x03, 0x21, 0x00]),
        Buffer.from(publicKeyBytes),
      ]),
      format: "der",
      type: "spki",
    });
    return verify(null, message, keyObject, signature);
  } catch {
    return false;
  }
}

// Suppress unused import warning for createHash (kept for future use)
void createHash;

export class AuthError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export type { SignedRequest };