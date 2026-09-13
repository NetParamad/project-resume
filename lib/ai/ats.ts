import { llmText } from "./client";
import { resolveResumeLocale } from "./detect-locale";
import { buildPersona } from "./persona";
import { extractJsonObject } from "./resume-utils";

export interface ATSResult {
  score: number;
  keywordsFound: string[];
  missingKeywords: string[];
  suggestions: string[];
}

function buildSystemPrompt(locale: "th" | "en"): string {
  const persona = buildPersona(locale);

  if (locale === "th") {
    return `${persona}

### งานนี้: ประเมินความเข้ากันได้กับ ATS

วิเคราะห์เรซูเม่ที่ให้มา แล้วรายงาน:
1. คะแนน ATS โดยรวม (0-100)
2. คำหลัก (keywords) ที่พบในเรซูเม่
3. คำหลักสำคัญที่ขาดหายไป
4. คำแนะนำในการปรับปรุงที่นำไปทำได้จริง

หากมีรายละเอียดงานเป้าหมายแนบมา ให้ประเมินเทียบกับคำหลักและคุณสมบัติของงานนั้น

ตอบเป็น JSON ที่ถูกต้องเท่านั้น ไม่มีข้อความอื่นและไม่ครอบด้วย markdown:
{
  "score": number,
  "keywordsFound": string[],
  "missingKeywords": string[],
  "suggestions": string[]
}`;
  }

  return `${persona}

### THIS TASK: ATS COMPATIBILITY EVALUATION

Analyze the provided resume and report:
1. Overall ATS score (0-100)
2. Keywords found in the resume
3. Important missing keywords
4. Actionable suggestions for improvement

If a target job description is attached, evaluate against its keywords and requirements.

Return ONLY valid JSON, with no other text and no markdown fences:
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
  uiLocale = "en",
  modelId?: string,
  forceLocale?: "th" | "en",
  timeoutMs?: number,
): Promise<ATSResult> {
  const locale = forceLocale ?? resolveResumeLocale(resumeData, jobDescription, uiLocale);
  const systemPrompt = buildSystemPrompt(locale);
  const resumeText = JSON.stringify(resumeData, null, 2);
  const jobContext = jobDescription
    ? `\n\nTarget Job Description:\n${jobDescription}`
    : "";

  const user = `Resume Data:\n${resumeText}${jobContext}`;

  let parsed: unknown = null;
  for (let attempt = 1; attempt <= 2 && parsed === null; attempt++) {
    const raw = await llmText({
      role: "score",
      modelId,
      system:
        attempt === 1
          ? systemPrompt
          : `${systemPrompt}\nReturn the raw JSON object only — no markdown fences, no commentary, and make sure the JSON is complete.`,
      user,
      timeoutMs,
    });
    parsed = extractJsonObject(raw);
  }

  if (parsed === null || typeof parsed !== "object") {
    throw new Error("Failed to parse ATS score");
  }

  const record = parsed as Record<string, unknown>;
  return {
    score: Math.max(0, Math.min(100, Number(record.score) || 0)),
    keywordsFound: Array.isArray(record.keywordsFound) ? record.keywordsFound : [],
    missingKeywords: Array.isArray(record.missingKeywords) ? record.missingKeywords : [],
    suggestions: Array.isArray(record.suggestions) ? record.suggestions : [],
  };
}
