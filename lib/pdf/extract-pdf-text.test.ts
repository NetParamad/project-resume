import { describe, expect, it } from "vitest";
import { normalizeThaiSpacing } from "./extract-pdf-text";

describe("normalizeThaiSpacing", () => {
  it("drops stray spaces between Thai letters", () => {
    expect(normalizeThaiSpacing("ประสบการ ณ์ ทํา งาน")).toBe("ประสบการณ์ทำงาน");
  });

  it("rejoins a glyph-shredded Thai run", () => {
    const shredded = "เ ชี ยวชาญการ พั ฒนาซอฟ ต์ แว ร์";
    expect(normalizeThaiSpacing(shredded)).toBe("เชียวชาญการพัฒนาซอฟต์แวร์");
  });

  it("recomposes decomposed SARA AM (nikhahit + sara aa)", () => {
    // U+0E17 U+0E4D U+0E32 -> U+0E17 U+0E33  (ทํา -> ทำ)
    expect(normalizeThaiSpacing("ทํา")).toBe("ทำ");
  });

  it("keeps spaces between Thai and digits or Latin", () => {
    expect(normalizeThaiSpacing("ทํางาน 8 ปี")).toBe("ทำงาน 8 ปี");
    expect(normalizeThaiSpacing("จัดการโครงการ agile")).toBe("จัดการโครงการ agile");
    expect(normalizeThaiSpacing("ลดเวลา 30 %")).toBe("ลดเวลา 30 %");
  });

  it("leaves plain English untouched", () => {
    expect(normalizeThaiSpacing("Software Engineer, 8 years")).toBe("Software Engineer, 8 years");
  });

  it("does not collapse newlines between Thai lines", () => {
    expect(normalizeThaiSpacing("ประสบการณ์\nการศึกษา")).toBe("ประสบการณ์\nการศึกษา");
  });
});
