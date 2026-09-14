import { describe, expect, it } from "vitest";
import { formatResultForPreview } from "./section-fields";

describe("formatResultForPreview", () => {
  it("turns leading empty pipe segments into a clean labeled preview", () => {
    const raw = "| | | | พัฒนาโซลูชันระบบหลายหน่วยงาน ลดขั้นตอนซ้ำซ้อน";
    const result = formatResultForPreview("experience", raw, "th");
    expect(result).toBe(
      "รายละเอียด: พัฒนาโซลูชันระบบหลายหน่วยงาน ลดขั้นตอนซ้ำซ้อน"
    );
    expect(result).not.toContain("|");
  });

  it("shows every non-empty field with its Thai label when locale is th", () => {
    const raw =
      "Senior Developer | Acme Co | 2020-01 | 2023-01 | Led the rewrite";
    const result = formatResultForPreview("experience", raw, "th");
    expect(result).toBe(
      "ตำแหน่งงาน: Senior Developer\nบริษัท: Acme Co\nวันที่เริ่ม: 2020-01\nวันที่สิ้นสุด: 2023-01\nรายละเอียด: Led the rewrite"
    );
  });

  it("shows every non-empty field with its English label when locale is en", () => {
    const raw =
      "Senior Developer | Acme Co | 2020-01 | 2023-01 | Led the rewrite";
    const result = formatResultForPreview("experience", raw, "en");
    expect(result).toBe(
      "Job Title: Senior Developer\nCompany: Acme Co\nStart Date: 2020-01\nEnd Date: 2023-01\nDescription: Led the rewrite"
    );
  });

  it("returns plain text unchanged when there's no pipe to parse", () => {
    const raw = "- Led the platform rewrite\n- Mentored two engineers";
    expect(formatResultForPreview("experience", raw, "th")).toBe(raw);
  });

  it("returns the raw text unchanged for sections with no structured fields", () => {
    const raw = "Full-stack developer with 5 years of experience.";
    expect(formatResultForPreview("summary", raw, "th")).toBe(raw);
  });
});
