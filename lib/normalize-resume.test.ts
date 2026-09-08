import { describe, expect, it } from "vitest";
import { normalizeResumeData } from "./normalize-resume";

describe("normalizeResumeData", () => {
  it("fills a completely empty payload with default sections", () => {
    const r = normalizeResumeData(undefined);
    expect(r.personalInfo).toMatchObject({ fullName: "", email: "" });
    expect(r.summary).toBe("");
    expect(r.experience).toEqual([]);
    expect(r.education).toEqual([]);
    expect(r.skills).toEqual([]);
    expect(r.theme?.accentColor).toBe("#f97316");
  });

  it("keeps old/incomplete data usable (share page safety)", () => {
    // Shape like a legacy record: only personalInfo + one experience item.
    const r = normalizeResumeData({
      personalInfo: { fullName: "ปารมัด สิมะพร" },
      experience: [{ jobTitle: "Dev", company: "Acme", id: "keep-me" }],
    } as never);

    expect(r.personalInfo.fullName).toBe("ปารมัด สิมะพร");
    // Missing fields get defaults; nothing crashes downstream templates.
    expect(r.summary).toBe("");
    expect(r.education).toEqual([]);
    expect(r.skills).toEqual([]);
    // Array items keep their ids.
    expect(r.experience[0].id).toBe("keep-me");
  });

  it("coerces wrong-typed values into strings", () => {
    const r = normalizeResumeData({
      summary: 123,
      personalInfo: { fullName: null },
    } as never);

    expect(r.summary).toBe("123");
    expect(r.personalInfo.fullName).toBe("");
  });

  it("provides default accentColor when theme is partial", () => {
    const r = normalizeResumeData({ theme: {} } as never);
    expect(r.theme?.accentColor).toBe("#f97316");
  });
});