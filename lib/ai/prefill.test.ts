import { describe, expect, it } from "vitest";
import { buildPrefillPrompt } from "./prefill";
import type { ResumeData } from "@/lib/types/resume";

const baseResume = {
  personalInfo: {} as ResumeData["personalInfo"],
  summary: "Full-stack developer with 5 years of experience.",
  experience: [
    {
      id: "e1",
      jobTitle: "Senior Developer",
      company: "Acme",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "Built things.",
    },
  ],
  education: [],
  skills: [],
  certifications: [],
  projects: [],
  languages: [],
  references: [],
} as unknown as ResumeData;

describe("buildPrefillPrompt", () => {
  it("returns the current summary text for the summary section", () => {
    expect(buildPrefillPrompt("summary", undefined, baseResume)).toBe(
      "Full-stack developer with 5 years of experience."
    );
  });

  it("builds a labeled dump of an existing list item's non-empty fields, in Thai when locale is th", () => {
    const result = buildPrefillPrompt("experience", "e1", baseResume, "th");
    expect(result).toContain("ตำแหน่งงาน: Senior Developer");
    expect(result).toContain("บริษัท: Acme");
    expect(result).toContain("รายละเอียด: Built things.");
    expect(result).not.toContain("สถานที่");
  });

  it("uses English labels when locale is en", () => {
    const result = buildPrefillPrompt("experience", "e1", baseResume, "en");
    expect(result).toContain("Job Title: Senior Developer");
    expect(result).toContain("Company: Acme");
    expect(result).toContain("Description: Built things.");
  });

  it("returns empty string for a brand new item with no data yet", () => {
    expect(buildPrefillPrompt("experience", "missing-id", baseResume)).toBe("");
  });

  it("returns empty string when there's no itemId for a per-item section", () => {
    expect(buildPrefillPrompt("experience", undefined, baseResume)).toBe("");
  });

  it("returns empty string for sections without structured fields", () => {
    expect(buildPrefillPrompt("skills", undefined, baseResume)).toBe("");
  });

  it("handles missing resumeData gracefully", () => {
    expect(buildPrefillPrompt("summary", undefined, null)).toBe("");
  });
});
