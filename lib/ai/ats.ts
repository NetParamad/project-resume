import { llmText } from "./client";

export interface ATSResult {
  score: number;
  keywordsFound: string[];
  missingKeywords: string[];
  suggestions: string[];
}

function buildSystemPrompt(locale: string): string {
  if (locale === "th") {
    return `คุณคือผู้เชี่ยวชาญด้าน ATS (Applicant Tracking System) วิเคราะห์เรซูเม่นี้และให้คะแนน พร้อมคำแนะนำ
วิเคราะห์:
1. คะแนน ATS โดยรวม (0-100)
2. คำหลัก (keywords) ที่พบในเรซูเม่
3. คำหลักที่สำคัญแต่ขาดหายไป
4. คำแนะนำในการปรับปรุง

ตอบเป็น JSON เท่านั้น:
{
  "score": number,
  "keywordsFound": string[],
  "missingKeywords": string[],
  "suggestions": string[]
}`;
  }
  return `You are an ATS (Applicant Tracking System) expert. Analyze this resume and provide a score, keywords analysis, and suggestions.

Analyze:
1. Overall ATS score (0-100)
2. Keywords found in the resume
3. Important missing keywords
4. Suggestions for improvement

Return ONLY valid JSON:
{
  "score": number,
  "keywordsFound": string[],
  "missingKeywords": string[],
  "suggestions": string[]
}`;
}

export async function scoreResume(
  resumeData: object,
  jobDescription?: string,
  locale = "en",
  modelId?: string,
): Promise<ATSResult> {
  const systemPrompt = buildSystemPrompt(locale);
  const resumeText = JSON.stringify(resumeData, null, 2);
  const jobContext = jobDescription
    ? `\n\nTarget Job Description:\n${jobDescription}`
    : "";

  const result = await llmText({
    role: "score",
    modelId,
    system: systemPrompt,
    user: `Resume Data:\n${resumeText}${jobContext}`,
  });
  const text = result ?? "";

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const jsonStr = jsonMatch ? jsonMatch[0] : text;

  try {
    const parsed = JSON.parse(jsonStr);
    return {
      score: Math.max(0, Math.min(100, Number(parsed.score) || 0)),
      keywordsFound: Array.isArray(parsed.keywordsFound) ? parsed.keywordsFound : [],
      missingKeywords: Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    };
  } catch {
    throw new Error("Failed to parse ATS score");
  }
}
