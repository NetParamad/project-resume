import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { polishResume } from "@/lib/ai/polish";
import { polishRequestSchema } from "@/lib/validation/ai";
import { parseJsonBody } from "@/lib/validation/parse";
import type { ResumeData } from "@/lib/types/resume";

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

  try {
    const parsed = await parseJsonBody(req, polishRequestSchema);
    if (parsed.error) return parsed.error;
    const { resumeData, locale, model } = parsed.data;

    const data = await polishResume({
      resumeData: resumeData as unknown as ResumeData,
      locale: locale || "en",
      modelId: model,
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Polish error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI service error" },
      { status: 500 },
    );
  }
}
