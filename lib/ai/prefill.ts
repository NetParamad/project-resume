import type { ResumeData } from "@/lib/types/resume";
import { SECTION_FIELDS } from "./section-fields";

/**
 * Text to pre-populate the auto-fill dialog's prompt box with when it opens,
 * so "Improve with AI" starts from what's already on the resume instead of a
 * blank box. Returns "" when there's nothing existing to build from (new
 * item, or a section with no structured fields), leaving the box empty.
 */
export function buildPrefillPrompt(
  section: string,
  itemId: string | undefined,
  resumeData: ResumeData | null | undefined,
): string {
  if (!resumeData) return "";

  if (section === "summary") {
    return resumeData.summary?.trim() ?? "";
  }

  const fields = SECTION_FIELDS[section];
  if (!fields || !itemId) return "";

  const sectionData = (resumeData as unknown as Record<string, unknown>)[section];
  const item = Array.isArray(sectionData)
    ? (sectionData as Array<Record<string, unknown>>).find((it) => it?.id === itemId)
    : undefined;
  if (!item) return "";

  const lines = fields
    .map(({ key, label }) => {
      const value = item[key];
      return typeof value === "string" && value.trim() ? `${label}: ${value.trim()}` : null;
    })
    .filter((line): line is string => line !== null);

  return lines.join("\n");
}
