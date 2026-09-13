import { describe, expect, it } from "vitest";
import { formatResultForPreview } from "./section-fields";

describe("formatResultForPreview", () => {
  it("turns leading empty pipe segments into a clean labeled preview", () => {
    const raw = "| | | | | พัฒนาโซลูชันระบบหลายหน่วยงาน ลดขั้นตอนซ้ำซ้อน";
    const result = formatResultForPreview("experience", raw);
    expect(result).toBe("รายละเอียด: พัฒนาโซลูชันระบบหลายหน่วยงาน ลดขั้นตอนซ้ำซ้อน");
    expect(result).not.toContain("|");
  });

  it("shows every non-empty field with its label", () => {
    const raw = "Senior Developer | Acme Co | Bangkok | 2020-01 | 2023-01 | Led the rewrite";
    const result = formatResultForPreview("experience", raw);
    expect(result).toBe(
      "ตำแหน่ง: Senior Developer\nบริษัท: Acme Co\nสถานที่: Bangkok\nวันที่เริ่มงาน: 2020-01\nวันที่สิ้นสุด: 2023-01\nรายละเอียด: Led the rewrite",
    );
  });

  it("returns plain text unchanged when there's no pipe to parse", () => {
    const raw = "- Led the platform rewrite\n- Mentored two engineers";
    expect(formatResultForPreview("experience", raw)).toBe(raw);
  });

  it("returns the raw text unchanged for sections with no structured fields", () => {
    const raw = "Full-stack developer with 5 years of experience.";
    expect(formatResultForPreview("summary", raw)).toBe(raw);
  });
});
