import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { optimizeResume, MAX_ROUNDS, TARGET_SCORE } from "@/lib/ai/optimizer";

const encoder = new TextEncoder();

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = rateLimit(`ai:${user.id}`, 40, 5 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  const { resumeData, jobDescription, locale, model } = await req.json();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (type: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      };

      try {
        send("config", { maxRounds: MAX_ROUNDS, target: TARGET_SCORE });

        const result = await optimizeResume({
          resumeData,
          jobDescription,
          locale: locale || "en",
          modelId: typeof model === "string" ? model : undefined,
          onStep: (step) => send("step", step),
        });

        send("done", result);
      } catch (error) {
        console.error("Improve agent error:", error);
        send("error", {
          message: error instanceof Error ? error.message : "Agent failed",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
