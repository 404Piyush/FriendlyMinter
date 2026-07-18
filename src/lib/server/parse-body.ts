import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { ZodError, type ZodTypeAny, z } from "zod";

/**
 * Parse and validate the request body against a Zod schema.
 *
 * On success returns { ok: true, body, rawBody, pubkey }. The caller is
 * expected to read `pubkey` (the verified wallet) from the SIWS envelope
 * when authorisation matters.
 *
 * On any failure (bad JSON, schema mismatch, body too large, bad
 * signature) returns { ok: false, response } — the route handler should
 * immediately `return response;`.
 */
export type ParsedRequest<T> =
  | { ok: true; body: T; rawBody: string; pubkey: string | null }
  | { ok: false; response: NextResponse };

const MAX_BYTES = 8 * 1024;

/**
 * Verify a SIWS envelope attached as `X-Auth` header. Returns null on any
 * shape/verify failure, plus a `verifyFailedResponse` so the caller can
 * short-circuit. We keep the verifier thin here; full auth lives in
 * lib/server/auth.ts.
 */
async function tryVerify(
  req: NextRequest,
  rawBody: string,
): Promise<{ pubkey: string | null; failureResponse: NextResponse | null }> {
  const auth = req.headers.get("x-auth");
  if (!auth) {
    return { pubkey: null, failureResponse: null };
  }

  let signed: {
    pubkey: string;
    signature: string;
    nonce: string;
    timestamp: number;
    method: string;
    path: string;
    body: string;
  };
  try {
    signed = JSON.parse(auth);
  } catch {
    return {
      pubkey: null,
      failureResponse: NextResponse.json(
        { error: "AUTH_MALFORMED", code: "AUTH_MALFORMED" },
        { status: 401 }
      ),
    };
  }

  const { verifySignedRequest, AuthError } = await import("./auth");
  try {
    const pk = await verifySignedRequest(signed, rawBody);
    return { pubkey: pk.toBase58(), failureResponse: null };
  } catch (err) {
    const code = err instanceof AuthError ? err.code : "VERIFY_FAILED";
    return {
      pubkey: null,
      failureResponse: NextResponse.json(
        { error: "AUTH_REJECTED", code },
        { status: 401 }
      ),
    };
  }
}

/**
 * Parse JSON body, optionally enforce auth, and validate against a Zod
 * schema. Centralises the boilerplate that used to be duplicated in every
 * POST route.
 */
export async function parseBody<S extends ZodTypeAny>(
  req: NextRequest,
  schema: S,
  options: { requireAuth?: boolean } = { requireAuth: true },
): Promise<ParsedRequest<z.infer<S>>> {
  const declared = Number(req.headers.get("content-length") ?? "0");
  if (declared > MAX_BYTES) {
    return {
      ok: false,
      response: NextResponse.json({ error: "BODY_TOO_LARGE" }, { status: 413 }),
    };
  }
  const rawBody = await req.text();
  if (rawBody.length > MAX_BYTES) {
    return {
      ok: false,
      response: NextResponse.json({ error: "BODY_TOO_LARGE" }, { status: 413 }),
    };
  }

  if (options.requireAuth) {
    const { pubkey, failureResponse } = await tryVerify(req, rawBody);
    if (failureResponse) return { ok: false, response: failureResponse };
    if (!pubkey) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "AUTH_REQUIRED", code: "AUTH_REQUIRED" },
          { status: 401 }
        ),
      };
    }

    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return {
        ok: false,
        response: NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 }),
      };
    }

    let parsed: z.infer<S>;
    try {
      parsed = schema.parse(body);
    } catch (err) {
      if (err instanceof ZodError) {
        return {
          ok: false,
          response: NextResponse.json(
            { error: "BAD_REQUEST", issues: err.issues },
            { status: 400 }
          ),
        };
      }
      return {
        ok: false,
        response: NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 }),
      };
    }

    return { ok: true, body: parsed, rawBody, pubkey };
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 }),
    };
  }

  try {
    const parsed = schema.parse(body);
    return { ok: true, body: parsed, rawBody, pubkey: null };
  } catch (err) {
    if (err instanceof ZodError) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "BAD_REQUEST", issues: err.issues },
          { status: 400 }
        ),
      };
    }
    return {
      ok: false,
      response: NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 }),
    };
  }
}