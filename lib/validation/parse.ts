import { NextResponse } from "next/server";
import type { ZodType, z } from "zod";

type ParseResult<T> = { data: T; error?: undefined } | { data?: undefined; error: NextResponse };

export async function parseJsonBody<Schema extends ZodType>(
  req: Request,
  schema: Schema,
): Promise<ParseResult<z.infer<Schema>>> {
  let json: unknown;
  try {
    json = await req.json();
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
