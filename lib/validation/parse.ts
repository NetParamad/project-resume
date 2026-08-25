import { NextResponse } from "next/server";
import type { ZodType, z } from "zod";

/** Hard cap for JSON request bodies (ADR-0003). */
export const MAX_BODY_BYTES = 1024 * 1024;

type ParseResult<T> = { data: T; error?: undefined } | { data?: undefined; error: NextResponse };

export async function parseJsonBody<Schema extends ZodType>(
  req: Request,
  schema: Schema,
): Promise<ParseResult<z.infer<Schema>>> {
  const contentLength = Number(req.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return {
      error: NextResponse.json(
        { error: "Request body too large", code: "body_too_large", maxBytes: MAX_BODY_BYTES },
        { status: 413 },
      ),
    };
  }

  let raw: string;
  try {
    raw = await req.text();
  } catch {
    return { error: NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }) };
  }

  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) {
    return {
      error: NextResponse.json(
        { error: "Request body too large", code: "body_too_large", maxBytes: MAX_BODY_BYTES },
        { status: 413 },
      ),
    };
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { error: NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }) };
  }

  const result = schema.safeParse(json);
  if (!result.success) {
    return {
      error: NextResponse.json(
        { error: "Invalid request", issues: result.error.flatten() },
        { status: 400 },
      ),
    };
  }

  return { data: result.data };
}
