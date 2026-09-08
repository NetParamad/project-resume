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

/**
 * Pull the first balanced JSON object out of a raw LLM reply, tolerating
 * ```json fences, leading reasoning text, and trailing prose. Returns null
 * when nothing parses (e.g. the response was truncated mid-object).
 */
export function extractJsonObject(raw: string): unknown | null {
  let text = raw.trim();

  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();

  const start = text.indexOf("{");
  if (start === -1) return null;

  // Try the widest candidate first, then walk a few closing braces inward to
  // recover from trailing prose. Bounded so a brace-heavy resume can't spin.
  let end = text.lastIndexOf("}");
  for (let attempt = 0; attempt < 20 && end > start; attempt++) {
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {
      end = text.lastIndexOf("}", end - 1);
    }
  }
  return null;
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
 * Merge one AI-rewritten array section back onto the original.
 *
 * tailor/polish only ever *reword* existing items — they must never drop or
 * reorder them. When every incoming item carries a known `id` we match by id
 * and keep the original ordering, so a reordered response can't shuffle
 * content. Otherwise we fall back to index mapping, and in both cases any
 * original item the model failed to return (truncated / dropped output) is
 * kept as-is rather than silently lost.
 */
function mergeArraySection(
  originalItems: unknown,
  incoming: unknown[],
): Record<string, unknown>[] {
  const originalArray = Array.isArray(originalItems) ? originalItems : [];
  const existingIds = getExistingIds(originalArray);
  const existingIdSet = new Set(existingIds);
  const keepOriginal = (item: unknown): Record<string, unknown> =>
    JSON.parse(JSON.stringify(item)) as Record<string, unknown>;

  const incomingHaveKnownIds =
    incoming.length > 0 &&
    incoming.every(
      (item) =>
        isRecord(item) &&
        typeof item.id === "string" &&
        existingIdSet.has(item.id),
    );

  if (incomingHaveKnownIds) {
    const incomingById = new Map<string, Record<string, unknown>>();
    for (const item of incoming as Record<string, unknown>[]) {
      incomingById.set(item.id as string, item);
    }

    return originalArray.map((orig, index) => {
      const id =
        isRecord(orig) && typeof orig.id === "string"
          ? orig.id
          : existingIds[index];
      const replacement = id ? incomingById.get(id) : undefined;
      if (replacement) return mergeArrayItem(replacement, existingIds, index);
      return isRecord(orig)
        ? keepOriginal(orig)
        : mergeArrayItem(orig, existingIds, index);
    });
  }

  const merged = incoming
    .map((item, index) => mergeArrayItem(item, existingIds, index))
    .filter(isRecord);

  for (let i = merged.length; i < originalArray.length; i++) {
    const orig = originalArray[i];
    if (isRecord(orig)) merged.push(keepOriginal(orig));
  }

  return merged;
}

/**
 * Merge AI-produced resume output back onto the original draft.
 * - array sections: matched by `id` (falling back to index), preserving the
 *   original item `id` and ordering; items the model drops are kept as-is so
 *   a truncated or partial response never deletes resume entries
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

    merged[section] = mergeArraySection(original[section], value) as never;
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
