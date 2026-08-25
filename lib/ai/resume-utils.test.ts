import { describe, expect, it } from "vitest";
import { mergeResumeOutput } from "./resume-utils";
import type { ResumeData } from "@/lib/types/resume";

function baseResume(): ResumeData {
  return {
    personalInfo: {
      fullName: "Jane Doe",
      email: "jane@example.com",
      phone: "",
      location: "",
      linkedin: "",
      portfolio: "",
      occupation: "",
      avatar: "https://example.com/avatar.png",
    },
    summary: "Original summary",
    experience: [
      {
        id: "exp-1",
        jobTitle: "Engineer",
        company: "Acme",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "Original description",
      },
    ],
    education: [],
    skills: [],
    certifications: [],
    projects: [],
    languages: [],
    references: [],
  };
}

describe("mergeResumeOutput", () => {
  it("returns the original resume when incoming is not an object", () => {
    const original = baseResume();
    expect(mergeResumeOutput(original, null)).toBe(original);
    expect(mergeResumeOutput(original, "not json")).toBe(original);
    expect(mergeResumeOutput(original, [1, 2, 3])).toBe(original);
  });

  it("preserves existing ids for array sections mapped by index", () => {
    const original = baseResume();
    const merged = mergeResumeOutput(original, {
      experience: [{ jobTitle: "Senior Engineer", description: "Rewritten" }],
    });

    expect(merged.experience[0].id).toBe("exp-1");
    expect(merged.experience[0].jobTitle).toBe("Senior Engineer");
    expect(merged.experience[0].description).toBe("Rewritten");
  });

  it("assigns a new id when incoming has more items than the original", () => {
    const original = baseResume();
    const merged = mergeResumeOutput(original, {
      experience: [
        { jobTitle: "Senior Engineer" },
        { jobTitle: "Also new" },
      ],
    });

    expect(merged.experience[0].id).toBe("exp-1");
    expect(merged.experience[1].id).toBeTruthy();
    expect(merged.experience[1].id).not.toBe("exp-1");
  });

  it("replaces string sections only when the model returned a string", () => {
    const original = baseResume();
    const merged = mergeResumeOutput(original, { summary: "New summary" });
    expect(merged.summary).toBe("New summary");

    const unchanged = mergeResumeOutput(original, { summary: 123 });
    expect(unchanged.summary).toBe("Original summary");
  });

  it("merges personalInfo but always preserves the original avatar", () => {
    const original = baseResume();
    const merged = mergeResumeOutput(original, {
      personalInfo: { fullName: "New Name", avatar: "https://evil.example/x.png" },
    });

    expect(merged.personalInfo.fullName).toBe("New Name");
    expect(merged.personalInfo.avatar).toBe("https://example.com/avatar.png");
  });

  it("ignores sections that are not arrays even if the key is present", () => {
    const original = baseResume();
    const merged = mergeResumeOutput(original, { experience: "not an array" });
    expect(merged.experience).toEqual(original.experience);
  });
});
