import { llmText } from "./client";
import { mergeResumeOutput } from "./resume-utils";
import type { ResumeData } from "@/lib/types/resume";

function buildSystemPrompt(locale: string): string {
  if (locale === "th") {
    return `คุณคือบรรณาธิการเรซูเม่มืออาชีพ
คุณจะได้รับเรซูเม่ในรูปแบบ JSON
กฎ:
1. แก้ไขไวยากรณ์ การสะกดคำ และความลื่นไหลของภาษาให้เป็นธรรมชาติและมืออาชีพ
2. ทำให้ข้อความกระชับโดยคงความหมายเดิมไว้
3. ห้ามเปลี่ยนแปลงข้อมูลข้อเท็จจริง ตำแหน่งงาน ชื่อบริษัท ทักษะ หรือเพิ่มเติมประสบการณ์ใหม่
4. ห้ามแปลข้อความเป็นภาษาอื่นเด็ดขาด แต่ละฟิลด์ต้องคงภาษาดั้งเดิมไว้ตามที่ผู้ใช้เขียน (ไทยคงเป็นไทย อังกฤษคงเป็นอังกฤษ) แม้เนื้อหาจะปนกันหลายภาษาในเรซูเม่เดียวกันก็ตาม
5. เก็บโครงสร้าง JSON เดิมทุกฟิลด์ และฟิลด์ id ของทุก item ต้องคงเดิมทุกตัว
6. ตอบเป็น JSON เท่านั้น ไม่มีข้อความอื่นใด`;
  }
  return `You are a professional resume editor.
You will receive a resume as JSON.
Rules:
1. Fix grammar, spelling, punctuation, and improve natural professional language flow.
2. Make the text more concise while keeping the exact same meaning.
3. NEVER change factual details, job titles, company names, skills, or add new experience.
4. NEVER translate any text into another language. Keep each field in the same language the user originally wrote it in (Thai stays Thai, English stays English), even if the resume mixes both languages.
5. Keep the exact same JSON structure and every field; keep the 'id' of every array item identical to the original.
6. Return ONLY valid JSON, no other text.`;
}

function parseResumeJson(raw: string): unknown | null {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
}

export async function polishResume(options: {
  resumeData: ResumeData;
  locale?: string;
  modelId?: string;
}): Promise<ResumeData> {
  const { resumeData, locale = "en", modelId } = options;

  const user = `Resume JSON:\n${JSON.stringify(resumeData, null, 2)}\n\nReturn the polished resume as a single JSON object.`;

  let parsed: unknown = null;
  for (let attempt = 1; attempt <= 2 && parsed === null; attempt++) {
    const raw = await llmText({
      role: "polish",
      modelId,
      system:
        attempt === 1
          ? buildSystemPrompt(locale)
          : `${buildSystemPrompt(locale)}\nReturn the raw JSON object without markdown fences, code blocks, or any commentary.`,
      user,
    });
    parsed = parseResumeJson(raw);
  }

  if (parsed === null) {
    throw new Error("Polish output was not valid JSON");
  }

  return mergeResumeOutput(resumeData, parsed);
}
