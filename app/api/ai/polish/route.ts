import { NextRequest, NextResponse } from "next/server";
import { polishResume } from "@/lib/ai/polish";
import type { ResumeData } from "@/lib/types/resume";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
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
