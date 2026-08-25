import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { enforceRateLimit } from "@/lib/rate-limit";
import { optimizeResume, MAX_ROUNDS, TARGET_SCORE } from "@/lib/ai/optimizer";
import { improveRequestSchema } from "@/lib/validation/ai";
import { parseJsonBody } from "@/lib/validation/parse";

const encoder = new TextEncoder();

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = enforceRateLimit(`ai:${user.id}`, 40, 5 * 60 * 1000);
  if (limited) return limited;

  const parsed = await parseJsonBody(req, improveRequestSchema);
  if (parsed.error) return parsed.error;
  const { resumeData, jobDescription, locale, model } = parsed.data;

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
          modelId: model,
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
