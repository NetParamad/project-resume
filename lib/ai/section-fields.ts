import { splitFields } from "./split-fields";

export interface SectionFieldSpec {
  key: string;
  label: string;
}

/**
 * Per-section field order used in three places that must stay in sync:
 * the pipe-delimited format the AI is asked to return (route.ts), the
 * client-side parser that splits that response back into form fields
 * (split-fields.ts, used by each *Form.tsx), and the auto-fill dialog's
 * prefill text (prefill.ts). Sections not listed here (summary, skills)
 * don't use structured multi-field output.
 */
export const SECTION_FIELDS: Record<string, SectionFieldSpec[]> = {
  // Field lists mirror each *Form.tsx's actual visible inputs exactly
  // (labels match messages/th.json's builder.<section> keys) — every input
  // the form renders gets a slot, and nothing else, so the AI's answer maps
  // onto the real form 1:1 instead of only ever hitting a couple of fields.
  experience: [
    { key: "jobTitle", label: "ตำแหน่งงาน" },
    { key: "company", label: "บริษัท" },
    { key: "startDate", label: "วันที่เริ่ม" },
    { key: "endDate", label: "วันที่สิ้นสุด" },
    { key: "description", label: "รายละเอียด" },
  ],
  education: [
    { key: "degree", label: "วุฒิการศึกษา" },
    { key: "institution", label: "สถาบัน" },
    { key: "field", label: "สาขาวิชา" },
    { key: "startDate", label: "วันที่เริ่ม" },
    { key: "endDate", label: "วันที่สิ้นสุด" },
    { key: "gpa", label: "เกรดเฉลี่ย" },
  ],
  publications: [
    { key: "title", label: "ชื่อผลงาน" },
    { key: "authors", label: "ผู้แต่ง" },
    { key: "journal", label: "วารสาร" },
    { key: "year", label: "ปี" },
    { key: "volume", label: "เล่มที่" },
    { key: "pages", label: "หน้า" },
    { key: "doi", label: "DOI" },
    { key: "url", label: "ลิงก์" },
  ],
  awards: [
    { key: "name", label: "ชื่อรางวัล" },
    { key: "issuer", label: "ผู้มอบ" },
    { key: "date", label: "วันที่" },
    { key: "description", label: "รายละเอียด" },
  ],
  projects: [
    { key: "name", label: "ชื่อโปรเจกต์" },
    { key: "url", label: "ลิงก์" },
    { key: "description", label: "รายละเอียด" },
  ],
  researchExperience: [
    { key: "role", label: "บทบาท" },
    { key: "institution", label: "สถาบัน" },
    { key: "location", label: "สถานที่" },
    { key: "supervisor", label: "ที่ปรึกษา" },
    { key: "startDate", label: "วันที่เริ่ม" },
    { key: "endDate", label: "วันที่สิ้นสุด" },
    { key: "description", label: "รายละเอียด" },
  ],
  teachingExperience: [
    { key: "courseName", label: "วิชาที่สอน" },
    { key: "institution", label: "สถาบัน" },
    { key: "role", label: "บทบาท" },
    { key: "startDate", label: "วันที่เริ่ม" },
    { key: "endDate", label: "วันที่สิ้นสุด" },
    { key: "description", label: "รายละเอียด" },
  ],
};

/** The field whose presence in the item means "basics already filled in". */
export const SECTION_PRIMARY_FIELD: Record<string, string> = {
  experience: "jobTitle",
  awards: "name",
  projects: "name",
  researchExperience: "role",
  teachingExperience: "courseName",
};

export function sectionFieldOrder(section: string): string[] {
  return (SECTION_FIELDS[section] ?? []).map((f) => f.key);
}

/**
 * Turns a raw pipe-delimited AI response into a readable "label: value"
 * preview for the auto-fill dialog. When a field the user hasn't filled in
 * yet (e.g. job title/company) is left blank on purpose, the raw response
 * looks like "| | | | | actual content" — technically correct for
 * splitFields to parse, but confusing to show verbatim. Reuses the exact
 * same splitFields() the Form components apply on, so the preview always
 * matches what actually gets saved.
 */
export function formatResultForPreview(section: string, raw: string): string {
  const fields = SECTION_FIELDS[section];
  if (!fields || !raw.includes("|")) return raw;

  const parsed = splitFields(raw, fields.map((f) => f.key));
  const lines = fields
    .map(({ key, label }) => (parsed[key] ? `${label}: ${parsed[key]}` : null))
    .filter((line): line is string => line !== null);

  return lines.length > 0 ? lines.join("\n") : raw;
}
