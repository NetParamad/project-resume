import { NextRequest, NextResponse } from "next/server";
import { tailorResume } from "@/lib/ai/tailor";
import type { ResumeData } from "@/lib/types/resume";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { resumeData, jobDescription, locale, model } = await req.json();
    if (!resumeData || typeof resumeData !== "object") {
      return NextResponse.json({ error: "resumeData is required" }, { status: 400 });
    }

    const data = await tailorResume({
      resumeData: resumeData as ResumeData,
      jobDescription: typeof jobDescription === "string" ? jobDescription : "",
      locale: locale || "en",
      modelId: typeof model === "string" ? model : undefined,
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Tailor error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI service error" },
      { status: 500 },
    );
  }
}
