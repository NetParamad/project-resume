import { z } from "zod";

/**
 * Loose bounds profile (ADR-0003): generous enough for long real-world CVs
 * but finite, so a single field can never carry unbounded payloads.
 * The overall size is additionally capped by MAX_BODY_BYTES in parse.ts.
 */
const boundedString = z.string().max(10_000);
const boundedArray = z.array(z.record(z.string(), z.unknown())).max(50);

const personalInfoSchema = z
  .object({
    fullName: boundedString,
    email: boundedString,
    phone: boundedString,
    location: boundedString,
    linkedin: boundedString,
    portfolio: boundedString,
    occupation: boundedString,
    avatar: z.string().max(2048),
  })
  .partial()
  .passthrough();

/**
 * Deliberately lenient: ResumeData is a JSONB blob shaped by the client
 * store and rewritten by AI calls, so this only pins down top-level types
 * (object/array/string) rather than every field of every section item.
 */
export const resumeDataSchema = z
  .object({
    personalInfo: personalInfoSchema.optional(),
    summary: boundedString.optional(),
    experience: boundedArray.optional(),
    education: boundedArray.optional(),
    skills: boundedArray.optional(),
    certifications: boundedArray.optional(),
    projects: boundedArray.optional(),
    languages: boundedArray.optional(),
    references: boundedArray.optional(),
    publications: boundedArray.optional(),
    researchExperience: boundedArray.optional(),
    teachingExperience: boundedArray.optional(),
    awards: boundedArray.optional(),
    theme: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

export const localeSchema = z.enum(["en", "th"]).optional();
export const modelSchema = z.string().max(100).optional();
