import { z } from "zod";
import { resumeDataSchema, localeSchema, modelSchema } from "./resume";

export const tailorRequestSchema = z.object({
  resumeData: resumeDataSchema,
  jobDescription: z.string().optional().default(""),
  locale: localeSchema,
  model: modelSchema,
});

export const polishRequestSchema = z.object({
  resumeData: resumeDataSchema,
  locale: localeSchema,
  model: modelSchema,
});

export const atsScoreRequestSchema = z.object({
  resumeData: resumeDataSchema,
  jobDescription: z.string().optional(),
  locale: localeSchema,
  model: modelSchema,
});

export const improveRequestSchema = z.object({
  resumeData: resumeDataSchema,
  jobDescription: z.string().optional().default(""),
  locale: localeSchema,
  model: modelSchema,
});

export const autoFillRequestSchema = z.object({
  section: z.string().min(1, "section is required"),
  context: z.record(z.string(), z.unknown()).nullable().default(null),
  prompt: z.string().optional().default(""),
  locale: localeSchema,
  model: modelSchema,
});
