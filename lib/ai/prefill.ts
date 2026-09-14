import type { ResumeData, SectionType } from "@/lib/types/resume";
import { SECTION_FIELDS, fieldLabel } from "./section-fields";

/**
 * Text to pre-populate the auto-fill dialog's prompt box with when it opens,
 * so "Improve with AI" starts from what's already on the resume instead of a
 * blank box. Returns "" when there's nothing existing to build from (new
 * item, or a section with no structured fields), leaving the box empty.
 */
export function buildPrefillPrompt(
  section: SectionType,
  itemId: string | undefined,
  resumeData: ResumeData | null | undefined,
  locale?: string
): string {
  if (!resumeData) return "";

  if (section === "summary") {
    return resumeData.summary?.trim() ?? "";
  }

  const fields = SECTION_FIELDS[section];
  if (!fields || !itemId) return "";

  // Every list section holds an array of items shaped differently per
  // section (WorkExperience, Education, ...), but all share an `id` field
  // and are addressed here by field name from `fields` above — genuinely
  // dynamic, so a narrow cast to the shared shape is unavoidable here.
  const sectionData = resumeData[section as keyof ResumeData];
  const item = Array.isArray(sectionData)
    ? (sectionData as unknown as Array<Record<string, unknown>>).find(
        (it) => it?.id === itemId
      )
    : undefined;
  if (!item) return "";

  const lines = fields
    .map((field) => {
      const value = item[field.key];
      return typeof value === "string" && value.trim()
        ? `${fieldLabel(field, locale)}: ${value.trim()}`
        : null;
    })
    .filter((line): line is string => line !== null);

  return lines.join("\n");
}
