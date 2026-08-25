import { describe, expect, it } from "vitest";
import {
  tailorRequestSchema,
  polishRequestSchema,
  atsScoreRequestSchema,
  autoFillRequestSchema,
} from "./ai";

describe("tailorRequestSchema", () => {
  it("accepts a minimal valid payload and defaults jobDescription", () => {
    const result = tailorRequestSchema.safeParse({ resumeData: {} });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.jobDescription).toBe("");
  });

  it("rejects a missing resumeData", () => {
    const result = tailorRequestSchema.safeParse({ jobDescription: "job" });
    expect(result.success).toBe(false);
  });

  it("rejects resumeData that is not an object", () => {
    const result = tailorRequestSchema.safeParse({ resumeData: "oops" });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown locale", () => {
    const result = tailorRequestSchema.safeParse({ resumeData: {}, locale: "fr" });
    expect(result.success).toBe(false);
  });

  it("rejects experience entries that are not objects", () => {
    const result = tailorRequestSchema.safeParse({
      resumeData: { experience: ["not an object"] },
    });
    expect(result.success).toBe(false);
  });
});

describe("polishRequestSchema", () => {
  it("accepts resumeData with only some sections populated", () => {
    const result = polishRequestSchema.safeParse({
      resumeData: { summary: "hi", experience: [{ jobTitle: "Eng" }] },
      locale: "th",
    });
    expect(result.success).toBe(true);
  });
});

describe("atsScoreRequestSchema", () => {
  it("allows jobDescription and model to be omitted", () => {
    const result = atsScoreRequestSchema.safeParse({ resumeData: { summary: "x" } });
    expect(result.success).toBe(true);
  });
});

describe("autoFillRequestSchema", () => {
  it("requires a non-empty section", () => {
    const result = autoFillRequestSchema.safeParse({ section: "" });
    expect(result.success).toBe(false);
  });

  it("defaults context to null when omitted", () => {
    const result = autoFillRequestSchema.safeParse({ section: "summary" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.context).toBeNull();
  });

  it("accepts a context object", () => {
    const result = autoFillRequestSchema.safeParse({
      section: "experience",
      context: { jobTitle: "Engineer", company: "Acme" },
    });
    expect(result.success).toBe(true);
  });
});
