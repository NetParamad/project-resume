import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { TemplateType, ResumeData } from "@/lib/types/resume";
import { ModernTemplate } from "@/components/preview/templates/ModernTemplate";
import { ClassicTemplate } from "@/components/preview/templates/ClassicTemplate";
import { MinimalTemplate } from "@/components/preview/templates/MinimalTemplate";
import { CreativeTemplate } from "@/components/preview/templates/CreativeTemplate";
import { AcademicTemplate } from "@/components/preview/templates/cv/AcademicTemplate";
import { ComprehensiveTemplate } from "@/components/preview/templates/cv/ComprehensiveTemplate";
import { CompactTemplate } from "@/components/preview/templates/cv/CompactTemplate";

const templateComponents: Record<TemplateType, React.ComponentType<{ data: ResumeData }>> = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  minimal: MinimalTemplate,
  creative: CreativeTemplate,
  academic: AcademicTemplate,
  comprehensive: ComprehensiveTemplate,
  compact: CompactTemplate,
};

export default async function SharePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data: resume } = await supabase
    .from("resumes")
    .select("data, title, template")
    .eq("share_slug", slug)
    .eq("is_public", true)
    .single();

  if (!resume) {
    notFound();
  }

  const Template = templateComponents[resume.template as TemplateType] ?? ModernTemplate;

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="max-w-[800px] mx-auto px-4 bg-white shadow-sm rounded-lg overflow-hidden">
        <Template data={resume.data as ResumeData} />
      </div>
    </div>
  );
}
