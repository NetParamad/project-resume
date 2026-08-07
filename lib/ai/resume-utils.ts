import { nanoid } from "nanoid";
import type { ResumeData } from "@/lib/types/resume";

const ARRAY_SECTIONS = [
  "experience",
  "education",
  "skills",
  "certifications",
  "projects",
  "languages",
  "references",
  "publications",
  "researchExperience",
  "teachingExperience",
  "awards",
] as const;

const STRING_SECTIONS = ["summary"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function getExistingIds(current: unknown): string[] {
  if (!Array.isArray(current)) return [];
  return current
    .map((item) => (isRecord(item) && typeof item.id === "string" ? item.id : ""))
    .filter(Boolean);
}

function mergeArrayItem(
  incoming: unknown,
  existingIds: string[],
  index: number,
): Record<string, unknown> {
  const base: Record<string, unknown> = {};
  if (isRecord(incoming)) {
    for (const [key, value] of Object.entries(incoming)) {
      if (key === "id") continue;
      base[key] = value;
    }
  }
  const id =
    typeof incoming !== "object" ||
    incoming === null ||
    !isRecord(incoming) ||
    typeof (incoming as Record<string, unknown>).id !== "string"
      ? existingIds[index] ?? nanoid()
      : (incoming as Record<string, unknown>).id;
  return { ...base, id };
}

/**
 * Merge AI-produced resume output back onto the original draft.
 * - array sections: items are mapped by index, preserving the original item `id`
 *   (the model may omit or drop ids; they are never invented for existing items)
 * - summary/string fields: replaced when the model returned a string
 * - personalInfo/theme/optional sections: preserved from the original when absent
 */
export function mergeResumeOutput(
  original: ResumeData,
  incoming: unknown,
): ResumeData {
  if (!isRecord(incoming)) return original;

  const merged = JSON.parse(JSON.stringify(original)) as ResumeData;

  for (const section of ARRAY_SECTIONS) {
    if (!(section in incoming)) continue;
    const value = incoming[section];
    if (!Array.isArray(value)) continue;

    const existingIds = getExistingIds(original[section]);
    merged[section] = value
      .map((item, index) => mergeArrayItem(item, existingIds, index))
      .filter(isRecord) as never;
  }

  for (const section of STRING_SECTIONS) {
    if (typeof incoming[section] === "string") {
      (merged as unknown as Record<string, unknown>)[section] = incoming[section];
    }
  }

  if (isRecord(incoming.personalInfo)) {
    merged.personalInfo = {
      ...merged.personalInfo,
      ...(incoming.personalInfo as Record<string, unknown>),
      avatar: merged.personalInfo.avatar,
    } as ResumeData["personalInfo"];
  }

  return merged;
}
