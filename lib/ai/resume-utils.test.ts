import { describe, expect, it } from "vitest";
import {
  extractJsonObject,
  mergeResumeOutput,
  normalizeSummaryString,
} from "./resume-utils";
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
      experience: [{ jobTitle: "Senior Engineer" }, { jobTitle: "Also new" }],
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
      personalInfo: {
        fullName: "New Name",
        avatar: "https://evil.example/x.png",
      },
    });

    expect(merged.personalInfo.fullName).toBe("New Name");
    expect(merged.personalInfo.avatar).toBe("https://example.com/avatar.png");
  });

  it("ignores sections that are not arrays even if the key is present", () => {
    const original = baseResume();
    const merged = mergeResumeOutput(original, { experience: "not an array" });
    expect(merged.experience).toEqual(original.experience);
  });

  function threeExpResume(): ResumeData {
    const base = baseResume();
    base.experience = [
      {
        id: "exp-1",
        jobTitle: "Junior Engineer",
        company: "Acme",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "A",
      },
      {
        id: "exp-2",
        jobTitle: "Engineer",
        company: "Beta",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "B",
      },
      {
        id: "exp-3",
        jobTitle: "Senior Engineer",
        company: "Gamma",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "C",
      },
    ];
    return base;
  }

  it("keeps original items the model dropped (index fallback)", () => {
    const original = threeExpResume();
    const merged = mergeResumeOutput(original, {
      experience: [
        { jobTitle: "Junior Software Engineer", description: "A refined" },
        { jobTitle: "Software Engineer", description: "B refined" },
      ],
    });

    expect(merged.experience).toHaveLength(3);
    expect(merged.experience[0].id).toBe("exp-1");
    expect(merged.experience[0].jobTitle).toBe("Junior Software Engineer");
    expect(merged.experience[2].id).toBe("exp-3");
    expect(merged.experience[2].description).toBe("C");
  });

  it("matches by id and preserves original order when the model reorders", () => {
    const original = threeExpResume();
    const merged = mergeResumeOutput(original, {
      experience: [
        {
          id: "exp-3",
          jobTitle: "Senior Engineer II",
          description: "C refined",
        },
        {
          id: "exp-1",
          jobTitle: "Junior Engineer II",
          description: "A refined",
        },
        { id: "exp-2", jobTitle: "Engineer II", description: "B refined" },
      ],
    });

    expect(merged.experience.map((e) => e.id)).toEqual([
      "exp-1",
      "exp-2",
      "exp-3",
    ]);
    expect(merged.experience[0].jobTitle).toBe("Junior Engineer II");
    expect(merged.experience[2].jobTitle).toBe("Senior Engineer II");
  });

  it("keeps an original item the model omitted from an id-keyed response", () => {
    const original = threeExpResume();
    const merged = mergeResumeOutput(original, {
      experience: [
        { id: "exp-1", jobTitle: "Junior Engineer II" },
        { id: "exp-3", jobTitle: "Senior Engineer II" },
      ],
    });

    expect(merged.experience.map((e) => e.id)).toEqual([
      "exp-1",
      "exp-2",
      "exp-3",
    ]);
    expect(merged.experience[1].jobTitle).toBe("Engineer");
  });
});

describe("normalizeSummaryString", () => {
  it("leaves a normal paragraph untouched", () => {
    const text = "Senior Backend Developer with 5+ years of experience.";
    expect(normalizeSummaryString(text)).toBe(text);
  });

  it("joins a JSON-array-shaped string into a single paragraph", () => {
    const raw = JSON.stringify([
      "Senior Backend Developer with 5+ years of experience building scalable services.",
      "Proficient in PostgreSQL database schema design and optimization.",
      "Hands-on expertise deploying applications with Docker and Kubernetes on AWS.",
    ]);
    expect(normalizeSummaryString(raw)).toBe(
      "Senior Backend Developer with 5+ years of experience building scalable services. " +
        "Proficient in PostgreSQL database schema design and optimization. " +
        "Hands-on expertise deploying applications with Docker and Kubernetes on AWS."
    );
  });

  it("falls back to the original string when it looks like an array but isn't valid JSON", () => {
    const raw =
      "[not really json, just text that happens to start and end with brackets]";
    expect(normalizeSummaryString(raw)).toBe(raw);
  });

  it("falls back to the original string when the array contains non-string items", () => {
    const raw = JSON.stringify(["ok", { nested: true }]);
    expect(normalizeSummaryString(raw)).toBe(raw);
  });

  it("falls back to the original string for an empty array", () => {
    const raw = "[]";
    expect(normalizeSummaryString(raw)).toBe(raw);
  });
});

describe("extractJsonObject", () => {
  it("parses a plain JSON object", () => {
    expect(extractJsonObject('{"a":1}')).toEqual({ a: 1 });
  });

  it("strips ```json fences", () => {
    expect(extractJsonObject('```json\n{"a":1}\n```')).toEqual({ a: 1 });
  });

  it("ignores leading reasoning text and trailing prose", () => {
    const raw = 'Here is the result:\n{"a":{"b":2}}\nHope that helps!';
    expect(extractJsonObject(raw)).toEqual({ a: { b: 2 } });
  });

  it("returns null for a truncated object", () => {
    expect(extractJsonObject('{"a":1,"b":[1,2,3')).toBeNull();
  });

  it("returns null when there is no object at all", () => {
    expect(extractJsonObject("no json here")).toBeNull();
  });
});
