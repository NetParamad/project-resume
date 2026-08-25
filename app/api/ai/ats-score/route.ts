import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { enforceRateLimit } from "@/lib/rate-limit";
import { scoreResume } from "@/lib/ai/ats";
import { atsScoreRequestSchema } from "@/lib/validation/ai";
import { parseJsonBody } from "@/lib/validation/parse";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = enforceRateLimit(`ai:${user.id}`, 40, 5 * 60 * 1000);
  if (limited) return limited;

  try {
    const parsed = await parseJsonBody(req, atsScoreRequestSchema);
    if (parsed.error) return parsed.error;
    const { resumeData, jobDescription, locale, model } = parsed.data;

    const result = await scoreResume(resumeData, jobDescription, locale || "en", model);
    return NextResponse.json(result);
  } catch (error) {
    console.error("ATS score error:", error);
    return NextResponse.json(
      { error: "AI service error. Please try again." },
      { status: 500 },
    );
  }
}
