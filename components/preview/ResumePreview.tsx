"use client";

import { useResumeStore } from "@/lib/store/resume-store";
import type { TemplateType, ResumeData } from "@/lib/types/resume";
import { ModernTemplate } from "./templates/ModernTemplate";
import { ClassicTemplate } from "./templates/ClassicTemplate";
import { MinimalTemplate } from "./templates/MinimalTemplate";
import { CreativeTemplate } from "./templates/CreativeTemplate";
import { AcademicTemplate } from "./templates/cv/AcademicTemplate";
import { ComprehensiveTemplate } from "./templates/cv/ComprehensiveTemplate";
import { CompactTemplate } from "./templates/cv/CompactTemplate";

const templateComponents: Record<TemplateType, React.ComponentType<{ data: ResumeData }>> = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  minimal: MinimalTemplate,
  creative: CreativeTemplate,
  academic: AcademicTemplate,
  comprehensive: ComprehensiveTemplate,
  compact: CompactTemplate,
};

export function ResumePreview() {
  const data = useResumeStore((s) => s.data);
  const template = useResumeStore((s) => s.template);

  const Template = templateComponents[template] ?? ModernTemplate;

  return (
    <div id="resume-preview" className="bg-white shadow-sm rounded-lg overflow-hidden">
      <Template data={data} />
    </div>
  );
}
