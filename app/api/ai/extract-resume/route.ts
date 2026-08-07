import { NextRequest, NextResponse } from "next/server";
import { parseResumeText } from "@/lib/parse-resume-text";
import { sanitizeExtractedResume } from "@/lib/normalize-resume";
import { llmText } from "@/lib/ai/client";
import { PDFParse } from "pdf-parse";
import path from "path";
import type { ResumeData } from "@/lib/types/resume";

const WORKER_PATH = path.join(
  process.cwd(),
  "node_modules/pdfjs-dist/build/pdf.worker.mjs",
);

PDFParse.setWorker(WORKER_PATH);

const RESUME_JSON_SCHEMA = {
  personalInfo: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    portfolio: "",
    occupation: "",
    avatar: "",
  },
  summary: "",
  experience: [{ jobTitle: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" }],
  education: [{ degree: "", institution: "", field: "", startDate: "", endDate: "", gpa: "" }],
  skills: [{ name: "", level: "intermediate" }],
  certifications: [{ name: "", issuer: "", date: "" }],
  projects: [{ name: "", url: "", description: "" }],
  languages: [{ name: "", proficiency: "intermediate" }],
  references: [{ name: "", title: "", company: "", email: "", phone: "" }],
  publications: [{ title: "", authors: "", journal: "", year: "", volume: "", pages: "", doi: "", url: "" }],
  researchExperience: [{ role: "", institution: "", location: "", startDate: "", endDate: "", current: false, description: "", supervisor: "" }],
  teachingExperience: [{ courseName: "", institution: "", role: "", startDate: "", endDate: "", description: "" }],
  awards: [{ name: "", issuer: "", date: "", description: "" }],
};

function buildSystemPrompt(locale: string): string {
  const schema = JSON.stringify(RESUME_JSON_SCHEMA, null, 2);
  if (locale === "th") {
    return `คุณคือผู้เชี่ยวชาญด้านการดึงข้อมูลจากเรซูเม่ ดึงข้อมูลทั้งหมดจากเรซูเม่ที่อัปโหลดแล้วตอบเป็น JSON เท่านั้นตามโครงสร้างด้านล่าง

กฎ:
- เนื้อหาของเรซูเม่อาจเป็นภาษาไทย อังกฤษ หรือทั้งสองภาษา (แบบสองภาษา) ให้ดึงข้อมูลทั้งหมดไม่จำกัดภาษา
- แยกแต่ละตำแหน่งงาน/บริษัท/โครงการ/การศึกษาออกเป็น 1 element ใน array ต่างหาก ห้ามรวมหลายรายการเข้าด้วยกัน และห้ามเหลือแค่รายการเดียว
- วันที่, ตำแหน่ง, บริษัท, และรายละเอียด ต้องตรงกับรายการนั้น ๆ ห้ามสลับหรือปนกับรายการอื่น
- ใส่รายละเอียดให้มากที่สุดเท่าที่มีในเรซูเม่ (สถานที่, ผู้ควบคุมงาน supervisor, เกรด gpa ฯลฯ)
- คืนเฉพาะค่าของฟิลด์เท่านั้น ห้ามรวมคำนำหน้า ป้ายกำกับ หรือคำอธิบาย เช่น ห้าม "My name is Paramad" ให้คืน "Paramad" แทน (ชื่อ, อีเมล, โทรศัพท์, ตำแหน่ง ฯลฯ ต้องเป็นค่าล้วน)
- description ให้เก็บข้อความ bullet ต่าง ๆ ไว้ โดยคั่นแต่ละบรรทัดด้วย \\n
- คืนค่าเป็น JSON ที่ถูกต้องเท่านั้น ห้ามมี Markdown, code fence, หรือข้อความอื่นใดนอกจาก JSON
- ตอบแบบ compact (ไม่เว้นบรรทัด ไม่จัดรูปแบบ) เพื่อประหยัดเนื้อที่
- ใช้ชื่อฟิลด์ให้ตรงตามโครงสร้างเป๊ะ
- skills.level ใช้ได้เฉพาะ: beginner, intermediate, advanced, expert
- languages.proficiency ใช้ได้เฉพาะ: native, fluent, advanced, intermediate, basic
- วันที่คงรูปแบบเดิม ถ้าไม่พบให้ใช้สตริงว่าง ""
- ฟิลด์ที่ไม่มีข้อมูลให้ใช้ค่าเริ่มต้น ("" หรือ false)

โครงสร้าง:
${schema}`;
  }
  return `You are a resume data extraction expert. Extract ALL information from the uploaded resume and return ONLY valid JSON matching the structure below.

Rules:
- The resume content may be in Thai, English, or both (bilingual). Extract ALL information regardless of language.
- Put each distinct job/company/project/education into its OWN separate element in the array. Never merge multiple entries into one, and never output just a single entry.
- Dates, job title, company, and description must belong to the correct entry. Never shift or mix them across entries.
- Include as much detail as available in the resume (location, supervisor, GPA, etc.).
- Output ONLY the raw value for each field. Never include lead-in phrases, labels, or explanations, e.g. NOT "My name is Paramad", instead "Paramad" (name, email, phone, job title, etc. must be the bare value).
- For description, keep the bullet points and separate each line with a newline character (\\n).
- Return ONLY valid JSON. No markdown, no code fences, no extra text.
- Respond compactly (no newlines, no formatting) to save space.
- Use exact field names from the structure.
- skills.level may only be: beginner, intermediate, advanced, expert
- languages.proficiency may only be: native, fluent, advanced, intermediate, basic
- Keep dates as written. Use an empty string "" when a value is not found.
- For fields with no data use the default value ("" or false).

Structure:
${schema}`;
}

async function extractTextFromPDF(buffer: Buffer): Promise<string | null> {
  let pdf;
  try {
    pdf = new PDFParse({ data: buffer, useSystemFonts: true });
    const result = await pdf.getText();
    const text = result.text?.trim();
    return text || null;
  } catch (e) {
    console.warn("pdf-parse failed:", e);
    return null;
  } finally {
    await pdf?.destroy();
  }
}

function extractJSON(raw: string): object | null {
  let text = raw.trim();

  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  text = text.slice(start, end + 1);

  try {
    return JSON.parse(text);
  } catch {
    try {
      return JSON.parse(text.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]"));
    } catch {
      return null;
    }
  }
}

const REQUIRED_ARRAY_FIELDS = [
  "experience",
  "education",
  "skills",
  "certifications",
  "projects",
  "languages",
  "references",
] as const;

function hasValidShape(result: object): boolean {
  if (typeof result !== "object" || Array.isArray(result)) return false;
  const record = result as Record<string, unknown>;
  return REQUIRED_ARRAY_FIELDS.every(
    (field) => record[field] === undefined || Array.isArray(record[field]),
  );
}

async function tryAIExtract(
  text: string,
  locale: string,
  modelId?: string,
): Promise<object | null> {
  const systemPrompt = buildSystemPrompt(locale);

  for (let attempt = 0; attempt < 2; attempt++) {
    let raw: string;
    try {
      const user =
        attempt === 0
          ? `Resume text:\n${text}`
          : `Your previous output was invalid or incomplete. Return ONLY complete, valid JSON matching the exact structure (no markdown, no code fences, include every entry).\n\nResume text:\n${text}`;
      raw = await llmText({
        role: "extract",
        modelId,
        system: systemPrompt,
        user,
      });
    } catch (e) {
      console.warn("AI extract failed:", e);
      return null;
    }

    const parsed = extractJSON(raw);
    if (parsed && hasValidShape(parsed)) return parsed;
    console.warn("AI extract returned invalid JSON, retrying:", raw.slice(0, 200));
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const locale = (formData.get("locale") as string) || "en";
    const model = (formData.get("model") as string) || undefined;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || "application/pdf";

    if (mimeType === "application/pdf") {
      const extractedText = await extractTextFromPDF(fileBuffer);
      if (!extractedText) {
        const msg = locale === "th"
          ? "ไม่สามารถอ่านข้อความจากไฟล์ PDF ได้ กรุณาลองไฟล์อื่น"
          : "Could not extract text from this PDF. Please try another file.";
        return NextResponse.json({ error: msg }, { status: 422 });
      }

      const aiResult = await tryAIExtract(extractedText, locale, model);
      if (aiResult) {
        return NextResponse.json({
          ...sanitizeExtractedResume(aiResult as Partial<ResumeData>),
          source: "ai",
        });
      }

      const parsed = parseResumeText(extractedText) as unknown as Partial<ResumeData>;
      return NextResponse.json({
        ...sanitizeExtractedResume(parsed),
        source: "heuristic",
      });
    }

    const msg = locale === "th"
      ? "รองรับเฉพาะไฟล์ PDF เท่านั้นในโหมดออฟไลน์"
      : "Only PDF files are supported in offline mode";
    return NextResponse.json({ error: msg }, { status: 400 });
  } catch (error) {
    console.error("Extract resume error:", error);
    return NextResponse.json(
      { error: "Failed to process resume" },
      { status: 500 },
    );
  }
}
