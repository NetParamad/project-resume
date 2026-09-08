import { describe, expect, it } from "vitest";
import { resolveLocale, resolveResumeLocale } from "./detect-locale";

describe("resolveLocale", () => {
  it("detects Thai from free text", () => {
    expect(resolveLocale("สวัสดีครับ ผมชื่อปารมัด")).toBe("th");
  });

  it("detects English from free text", () => {
    expect(resolveLocale("Software Engineer with 5 years experience")).toBe("en");
  });

  it("falls back to the UI locale when no text is provided", () => {
    expect(resolveLocale("", "th")).toBe("th");
    expect(resolveLocale(undefined, "en")).toBe("en");
  });
});

describe("resolveResumeLocale", () => {
  it("prioritizes Thai resume content over English input", () => {
    const resume = {
      personalInfo: { fullName: "ปารมัด สิมะพร" },
      summary: "วิศวกรซอฟต์แวร์",
    };
    expect(resolveResumeLocale(resume, "Software Engineer wanted", "en")).toBe("th");
  });

  it("uses English when resume has no Thai", () => {
    const resume = { summary: "Senior Frontend Developer" };
    expect(resolveResumeLocale(resume, null, "en")).toBe("en");
  });

  it("falls back to UI locale when resume is empty", () => {
    expect(resolveResumeLocale({} as unknown, "", "th")).toBe("th");
  });
});