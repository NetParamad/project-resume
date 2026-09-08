import { llmText } from "./client";
import { extractJsonObject, mergeResumeOutput } from "./resume-utils";
import { resolveResumeLocale } from "./detect-locale";
import type { ResumeData } from "@/lib/types/resume";

function buildSystemPrompt(locale: string): string {
  if (locale === "th") {
    return `คุณคือบรรณาธิการเรซูเม่มืออาชีพ
คุณจะได้รับเรซูเม่ในรูปแบบ JSON
กฎ:
1. แก้ไขไวยากรณ์ การสะกดคำ และความลื่นไหลของภาษาให้เป็นธรรมชาติและมืออาชีพ
2. ทำให้ข้อความกระชับโดยคงความหมายเดิมไว้
3. ห้ามเปลี่ยนแปลงข้อมูลข้อเท็จจริง ตำแหน่งงาน ชื่อบริษัท ทักษะ หรือเพิ่มเติมประสบการณ์ใหม่
4. ห้ามเติมตัวเลข สถิติ เปอร์เซ็นต์ วันที่ หรือข้อมูลใด ๆ ที่ไม่มีอยู่ในเรซูเม่ต้นฉบับ ห้ามปรับปรุงข้อความให้ดูเกินจริง
5. ห้ามแปลข้อความเป็นภาษาอื่นเด็ดขาด แต่ละฟิลด์ต้องคงภาษาดั้งเดิมไว้ตามที่ผู้ใช้เขียน (ไทยคงเป็นไทย อังกฤษคงเป็นอังกฤษ) แม้เนื้อหาจะปนกันหลายภาษาในเรซูเม่เดียวกันก็ตาม
6. เก็บโครงสร้าง JSON เดิมทุกฟิลด์ และฟิลด์ id ของทุก item ต้องคงเดิมทุกตัว
7. ตอบเป็น JSON เท่านั้น ไม่มีข้อความอื่นใด`;
  }
  return `You are a professional resume editor.
You will receive a resume as JSON.
Rules:
1. Fix grammar, spelling, punctuation, and improve natural professional language flow.
2. Make the text more concise while keeping the exact same meaning.
3. NEVER change factual details, job titles, company names, skills, or add new experience.
4. NEVER add numbers, statistics, percentages, dates, or any data that is not present in the original resume. Do not embellish or make the text sound more impressive than the original facts.
5. NEVER translate any text into another language. Keep each field in the same language the user originally wrote it in (Thai stays Thai, English stays English), even if the resume mixes both languages.
6. Keep the exact same JSON structure and every field; keep the 'id' of every array item identical to the original.
7. Return ONLY valid JSON, no other text.`;
}

export async function polishResume(options: {
  resumeData: ResumeData;
  locale?: string;
  modelId?: string;
}): Promise<ResumeData> {
  const { resumeData, locale = "en", modelId } = options;
  const effectiveLocale = resolveResumeLocale(resumeData, null, locale);

  const user = `Resume JSON:\n${JSON.stringify(resumeData, null, 2)}\n\nReturn the polished resume as a single JSON object.`;

  let parsed: unknown = null;
  for (let attempt = 1; attempt <= 2 && parsed === null; attempt++) {
    const raw = await llmText({
      role: "polish",
      modelId,
      system:
        attempt === 1
          ? buildSystemPrompt(effectiveLocale)
          : `${buildSystemPrompt(effectiveLocale)}\nReturn the raw JSON object without markdown fences, code blocks, or any commentary.`,
      user,
    });
    parsed = extractJsonObject(raw);
  }

  if (parsed === null) {
    throw new Error("Polish output was not valid JSON");
  }

  return mergeResumeOutput(resumeData, parsed);
}
