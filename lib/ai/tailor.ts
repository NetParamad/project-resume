import { llmText } from "./client";
import { mergeResumeOutput } from "./resume-utils";
import { resolveLocale } from "./detect-locale";
import type { ResumeData } from "@/lib/types/resume";

function buildSystemPrompt(locale: string): string {
  if (locale === "th") {
    return `คุณคือผู้เชี่ยวชาญการปรับเรซูเม่ให้ตรงกับรายละเอียดงาน (Job Description)
คุณจะได้รับเรซูเม่ในรูปแบบ JSON และรายละเอียดงานเป้าหมาย
กฎ:
1. ปรับเนื้อหาให้ตรงกับคำสำคัญและคุณสมบัติที่งานต้องการ โดยคงข้อเท็จจริงเดิมทั้งหมด
2. ห้ามสร้างประสบการณ์ทำงาน ตำแหน่ง บริษัท ทักษะ หรือการศึกษาที่ไม่มีในเรซูเม่เดิมเด็ดขาด (ปรับปรุงถ้อยคำเท่านั้น)
3. ใช้คำกริยาแสดงความสำเร็จและตัวเลข/metrics ที่วัดได้ตามที่มีอยู่เดิม
4. คงภาษาดั้งเดิมของแต่ละฟิลด์ในเรซูเม่ไว้เสมอ ห้ามแปลเป็นภาษาอื่น แม้ว่ารายละเอียดงานเป้าหมายจะเป็นคนละภาษากับเรซูเม่ก็ตาม ให้ยืมเฉพาะคำสำคัญ (keywords) มาใช้โดยไม่เปลี่ยนภาษาโดยรวมของฟิลด์นั้น
5. เก็บโครงสร้าง JSON เดิมทุกฟิลด์ ฟิลด์ id ของทุก item ต้องคงเดิมทุกตัว
6. ตอบเป็น JSON เท่านั้น ไม่มีข้อความอื่นใด`;
  }
  return `You are an expert at tailoring resumes to a target job description.
You will receive a resume as JSON plus the target job description.
Rules:
1. Rewrite the content to match the required keywords and qualifications of the job, keeping all factual details intact.
2. NEVER invent experience, roles, companies, skills, or education that are not already present in the original resume (reword only).
3. Use strong action verbs and measurable metrics where they already exist.
4. Keep each field in the resume's original language. NEVER translate a field into another language, even if the target job description is in a different language — borrow only its keywords, without switching the field's overall language.
5. Keep the exact same JSON structure and every field; keep the 'id' of every array item identical to the original.
6. Return ONLY valid JSON, no other text.`;
}

function buildUserPrompt(resume: ResumeData, jobDescription: string): string {
  const jobBlock = jobDescription.trim()
    ? `\n\nTarget Job Description:\n${jobDescription.trim()}`
    : "";
  return `Resume JSON:\n${JSON.stringify(resume, null, 2)}${jobBlock}\n\nReturn the tailored resume as a single JSON object.`;
}

export async function tailorResume(options: {
  resumeData: ResumeData;
  jobDescription: string;
  locale?: string;
  modelId?: string;
}): Promise<ResumeData> {
  const { resumeData, jobDescription, modelId } = options;
  const locale = resolveLocale(jobDescription, options.locale);

  const raw = await llmText({
    role: "tailor",
    modelId,
    system: buildSystemPrompt(locale),
    user: buildUserPrompt(resumeData, jobDescription),
  });

  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Tailor output was not valid JSON");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error("Tailor output was not valid JSON");
  }

  return mergeResumeOutput(resumeData, parsed);
}
