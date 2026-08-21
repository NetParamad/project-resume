import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { polishResume } from "@/lib/ai/polish";
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
    const { resumeData, locale, model } = await req.json();
    if (!resumeData || typeof resumeData !== "object") {
      return NextResponse.json({ error: "resumeData is required" }, { status: 400 });
    }

    const data = await polishResume({
      resumeData: resumeData as ResumeData,
      locale: locale || "en",
      modelId: typeof model === "string" ? model : undefined,
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
