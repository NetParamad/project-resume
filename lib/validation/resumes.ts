import { z } from "zod";
import { resumeDataSchema } from "./resume";

export const TEMPLATE_IDS = [
  "modern",
  "classic",
  "minimal",
  "creative",
  "academic",
  "comprehensive",
  "compact",
] as const;

/** Slugs are capability tokens (ADR-0002): unguessable nanoid-style only. */
export const shareSlugSchema = z.string().regex(/^[A-Za-z0-9_-]{8,64}$/);

export const createResumeSchema = z.object({
  title: z.string().max(200).optional(),
  document_type: z.enum(["resume", "cv"]).optional(),
  template: z.enum(TEMPLATE_IDS).optional(),
  data: resumeDataSchema.optional(),
});

export const updateResumeSchema = z.object({
  title: z.string().max(200).optional(),
  document_type: z.enum(["resume", "cv"]).optional(),
  template: z.enum(TEMPLATE_IDS).optional(),
  data: resumeDataSchema.optional(),
  is_public: z.boolean().optional(),
  share_slug: shareSlugSchema.optional(),
});
