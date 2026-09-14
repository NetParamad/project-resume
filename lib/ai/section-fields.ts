import { splitFields } from "./split-fields";
import type { SectionType } from "@/lib/types/resume";

export interface SectionFieldSpec {
  key: string;
  label: { th: string; en: string };
}

export function fieldLabel(field: SectionFieldSpec, locale?: string): string {
  return locale === "th" ? field.label.th : field.label.en;
}

/**
 * Per-section field order used in three places that must stay in sync:
 * the pipe-delimited format the AI is asked to return (route.ts), the
 * client-side parser that splits that response back into form fields
 * (split-fields.ts, used by each *Form.tsx), and the auto-fill dialog's
 * prefill text (prefill.ts). Sections not listed here (summary, skills)
 * don't use structured multi-field output.
 */
export const SECTION_FIELDS: Partial<Record<SectionType, SectionFieldSpec[]>> =
  {
    // Field lists mirror each *Form.tsx's actual visible inputs exactly
    // (labels match messages/{th,en}.json's builder.<section> keys) — every
    // input the form renders gets a slot, and nothing else, so the AI's
    // answer maps onto the real form 1:1 instead of only ever hitting a
    // couple of fields.
    experience: [
      { key: "jobTitle", label: { th: "ตำแหน่งงาน", en: "Job Title" } },
      { key: "company", label: { th: "บริษัท", en: "Company" } },
      { key: "startDate", label: { th: "วันที่เริ่ม", en: "Start Date" } },
      { key: "endDate", label: { th: "วันที่สิ้นสุด", en: "End Date" } },
      { key: "description", label: { th: "รายละเอียด", en: "Description" } },
    ],
    education: [
      { key: "degree", label: { th: "วุฒิการศึกษา", en: "Degree" } },
      { key: "institution", label: { th: "สถาบัน", en: "Institution" } },
      { key: "field", label: { th: "สาขาวิชา", en: "Field of Study" } },
      { key: "startDate", label: { th: "วันที่เริ่ม", en: "Start Date" } },
      { key: "endDate", label: { th: "วันที่สิ้นสุด", en: "End Date" } },
      { key: "gpa", label: { th: "เกรดเฉลี่ย", en: "GPA" } },
    ],
    publications: [
      { key: "title", label: { th: "ชื่อผลงาน", en: "Publication Title" } },
      { key: "authors", label: { th: "ผู้แต่ง", en: "Authors" } },
      { key: "journal", label: { th: "วารสาร", en: "Journal" } },
      { key: "year", label: { th: "ปี", en: "Year" } },
      { key: "volume", label: { th: "เล่มที่", en: "Volume" } },
      { key: "pages", label: { th: "หน้า", en: "Pages" } },
      { key: "doi", label: { th: "DOI", en: "DOI" } },
      { key: "url", label: { th: "ลิงก์", en: "URL" } },
    ],
    awards: [
      { key: "name", label: { th: "ชื่อรางวัล", en: "Award Name" } },
      { key: "issuer", label: { th: "ผู้มอบ", en: "Issuer" } },
      { key: "date", label: { th: "วันที่", en: "Date" } },
      { key: "description", label: { th: "รายละเอียด", en: "Description" } },
    ],
    projects: [
      { key: "name", label: { th: "ชื่อโปรเจกต์", en: "Project Name" } },
      { key: "url", label: { th: "ลิงก์", en: "Project URL" } },
      { key: "description", label: { th: "รายละเอียด", en: "Description" } },
    ],
    researchExperience: [
      { key: "role", label: { th: "บทบาท", en: "Role" } },
      { key: "institution", label: { th: "สถาบัน", en: "Institution" } },
      { key: "location", label: { th: "สถานที่", en: "Location" } },
      { key: "supervisor", label: { th: "ที่ปรึกษา", en: "Supervisor" } },
      { key: "startDate", label: { th: "วันที่เริ่ม", en: "Start Date" } },
      { key: "endDate", label: { th: "วันที่สิ้นสุด", en: "End Date" } },
      { key: "description", label: { th: "รายละเอียด", en: "Description" } },
    ],
    teachingExperience: [
      { key: "courseName", label: { th: "ชื่อวิชา", en: "Course Name" } },
      { key: "institution", label: { th: "สถาบัน", en: "Institution" } },
      { key: "role", label: { th: "บทบาท", en: "Role" } },
      { key: "startDate", label: { th: "วันที่เริ่ม", en: "Start Date" } },
      { key: "endDate", label: { th: "วันที่สิ้นสุด", en: "End Date" } },
      { key: "description", label: { th: "รายละเอียด", en: "Description" } },
    ],
  };

/** The field whose presence in the item means "basics already filled in". */
export const SECTION_PRIMARY_FIELD: Partial<Record<SectionType, string>> = {
  experience: "jobTitle",
  awards: "name",
  projects: "name",
  researchExperience: "role",
  teachingExperience: "courseName",
};

export function sectionFieldOrder(section: SectionType): string[] {
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
export function formatResultForPreview(
  section: SectionType,
  raw: string,
  locale?: string
): string {
  const fields = SECTION_FIELDS[section];
  if (!fields || !raw.includes("|")) return raw;

  const parsed = splitFields(
    raw,
    fields.map((f) => f.key)
  );
  const lines = fields
    .map((field) =>
      parsed[field.key]
        ? `${fieldLabel(field, locale)}: ${parsed[field.key]}`
        : null
    )
    .filter((line): line is string => line !== null);

  return lines.length > 0 ? lines.join("\n") : raw;
}
