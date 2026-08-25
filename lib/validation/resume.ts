import { z } from "zod";

const arrayItemSchema = z.record(z.string(), z.unknown());

const personalInfoSchema = z
  .object({
    fullName: z.string(),
    email: z.string(),
    phone: z.string(),
    location: z.string(),
    linkedin: z.string(),
    portfolio: z.string(),
    occupation: z.string(),
    avatar: z.string(),
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
    summary: z.string().optional(),
    experience: z.array(arrayItemSchema).optional(),
    education: z.array(arrayItemSchema).optional(),
    skills: z.array(arrayItemSchema).optional(),
    certifications: z.array(arrayItemSchema).optional(),
    projects: z.array(arrayItemSchema).optional(),
    languages: z.array(arrayItemSchema).optional(),
    references: z.array(arrayItemSchema).optional(),
    publications: z.array(arrayItemSchema).optional(),
    researchExperience: z.array(arrayItemSchema).optional(),
    teachingExperience: z.array(arrayItemSchema).optional(),
    awards: z.array(arrayItemSchema).optional(),
    theme: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

export const localeSchema = z.enum(["en", "th"]).optional();
export const modelSchema = z.string().optional();
