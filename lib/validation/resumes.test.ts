import { describe, expect, it } from "vitest";
import { createResumeSchema, updateResumeSchema } from "./resumes";
import { resumeDataSchema } from "./resume";

describe("shareSlugSchema", () => {
  it("accepts nanoid-style slugs", () => {
    expect(updateResumeSchema.safeParse({ share_slug: "V1StGXR8_Z5j" }).success).toBe(true);
    expect(updateResumeSchema.safeParse({ share_slug: "abc-def_123" }).success).toBe(true);
    expect(updateResumeSchema.safeParse({ share_slug: "john-doe" }).success).toBe(true); // 8 chars ok
  });

  it("rejects arbitrary shapes", () => {
    expect(updateResumeSchema.safeParse({ share_slug: "short" }).success).toBe(false);
    expect(updateResumeSchema.safeParse({ share_slug: "has spaces!!" }).success).toBe(false);
    expect(updateResumeSchema.safeParse({ share_slug: "x".repeat(65) }).success).toBe(false);
    expect(updateResumeSchema.safeParse({ share_slug: "" }).success).toBe(false);
  });
});

describe("createResumeSchema", () => {
  it("rejects unknown templates", () => {
    expect(createResumeSchema.safeParse({ template: "modern" }).success).toBe(true);
    expect(createResumeSchema.safeParse({ template: "<script>" }).success).toBe(false);
  });
});

describe("resumeDataSchema bounds", () => {
  const item = { id: "1" };

  it("accepts content within the loose profile", () => {
    const data = { experience: Array.from({ length: 50 }, () => item), summary: "x".repeat(10_000) };
    expect(resumeDataSchema.safeParse(data).success).toBe(true);
  });

  it("rejects oversized arrays", () => {
    const data = { experience: Array.from({ length: 51 }, () => item) };
    expect(resumeDataSchema.safeParse(data).success).toBe(false);
  });

  it("rejects oversized strings", () => {
    expect(resumeDataSchema.safeParse({ summary: "x".repeat(10_001) }).success).toBe(false);
  });
});
