import { NextRequest, NextResponse } from "next/server";
import { scoreResume } from "@/lib/ai/ats";

export async function POST(req: NextRequest) {
  try {
    const { resumeData, jobDescription, locale, model } = await req.json();
    const result = await scoreResume(
      resumeData,
      jobDescription,
      locale || "en",
      typeof model === "string" ? model : undefined,
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("ATS score error:", error);
    return NextResponse.json(
      { error: "AI service error. Please try again." },
      { status: 500 },
    );
  }
}
