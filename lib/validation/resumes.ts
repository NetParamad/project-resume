import { z } from "zod";
import { resumeDataSchema } from "./resume";

export const createResumeSchema = z.object({
  title: z.string().max(200).optional(),
  document_type: z.enum(["resume", "cv"]).optional(),
  template: z.string().optional(),
  data: resumeDataSchema.optional(),
});

export const updateResumeSchema = z.object({
  title: z.string().max(200).optional(),
  document_type: z.enum(["resume", "cv"]).optional(),
  template: z.string().optional(),
  data: resumeDataSchema.optional(),
  is_public: z.boolean().optional(),
  share_slug: z.string().optional(),
});
