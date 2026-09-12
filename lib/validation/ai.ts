import { z } from "zod";
import { resumeDataSchema, localeSchema, modelSchema } from "./resume";

const boundedText = z.string().max(20_000);

// Explicit output-language choice. When set it overrides content auto-detection
// and, for whole-resume features, translates every field into that language.
const outputLocaleSchema = z.enum(["en", "th"]).optional();

export const tailorRequestSchema = z.object({
  resumeData: resumeDataSchema,
  jobDescription: boundedText.optional().default(""),
  locale: localeSchema,
  outputLocale: outputLocaleSchema,
  model: modelSchema,
});

export const polishRequestSchema = z.object({
  resumeData: resumeDataSchema,
  locale: localeSchema,
  outputLocale: outputLocaleSchema,
  model: modelSchema,
});

export const atsScoreRequestSchema = z.object({
  resumeData: resumeDataSchema,
  jobDescription: boundedText.optional(),
  locale: localeSchema,
  outputLocale: outputLocaleSchema,
  model: modelSchema,
});

export const improveRequestSchema = z.object({
  resumeData: resumeDataSchema,
  jobDescription: boundedText.optional().default(""),
  locale: localeSchema,
  outputLocale: outputLocaleSchema,
  model: modelSchema,
});

export const extractResumeRequestSchema = z.object({
  text: z.string().min(1).max(100_000),
  locale: localeSchema,
  outputLocale: outputLocaleSchema,
  model: modelSchema,
});

export const autoFillRequestSchema = z.object({
  section: z.string().min(1, "section is required"),
  itemId: z.string().optional(),
  context: z.record(z.string(), z.unknown()).nullable().default(null),
  resumeData: resumeDataSchema.optional(),
  prompt: z.string().optional().default(""),
  locale: localeSchema,
  outputLocale: outputLocaleSchema,
  model: modelSchema,
});
