/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ModernTemplate } from "./templates/ModernTemplate";
import { ResumeLangProvider } from "@/lib/resume-lang-context";
import { normalizeResumeData } from "@/lib/normalize-resume";
import type { ResumeData } from "@/lib/types/resume";

// Minimal/legacy payload — exactly what the share page used to crash on.
const legacy: Partial<ResumeData> = {
  personalInfo: { fullName: "Paramad Test", email: "p@test.dev" } as never,
  experience: [{ jobTitle: "Dev", company: "Acme" }] as never,
};

function renderWith(template: React.ReactElement) {
  return render(<ResumeLangProvider value={null}>{template}</ResumeLangProvider>);
}

describe("ModernTemplate", () => {
  it("renders old/incomplete resume data without crashing", () => {
    const data = normalizeResumeData(legacy);
    renderWith(<ModernTemplate data={data} />);

    expect(screen.getByText("Paramad Test")).toBeTruthy();
    expect(screen.getByText("Dev")).toBeTruthy();
  });

  it("renders an empty resume without crashing", () => {
    const data = normalizeResumeData(undefined);
    renderWith(<ModernTemplate data={data} />);
    expect(document.querySelector(".p-6")).not.toBeNull();
  });
});