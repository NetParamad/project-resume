"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { ResumeLangProvider } from "@/lib/resume-lang-context";
import { useResumeLangStore } from "@/lib/store/resume-lang-store";
import { hasThaiInResume, cn } from "@/lib/utils";
import { printResumeFitToOnePage } from "@/lib/print-utils";
import { useToastStore } from "@/lib/store/toast-store";
import type { TemplateType, ResumeData } from "@/lib/types/resume";
import { ModernTemplate } from "@/components/preview/templates/ModernTemplate";
import { ClassicTemplate } from "@/components/preview/templates/ClassicTemplate";
import { MinimalTemplate } from "@/components/preview/templates/MinimalTemplate";
import { CreativeTemplate } from "@/components/preview/templates/CreativeTemplate";
import { AcademicTemplate } from "@/components/preview/templates/cv/AcademicTemplate";
import { ComprehensiveTemplate } from "@/components/preview/templates/cv/ComprehensiveTemplate";
import { CompactTemplate } from "@/components/preview/templates/cv/CompactTemplate";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const templateComponents: Record<TemplateType, React.ComponentType<{ data: ResumeData }>> = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  minimal: MinimalTemplate,
  creative: CreativeTemplate,
  academic: AcademicTemplate,
  comprehensive: ComprehensiveTemplate,
  compact: CompactTemplate,
};

export function ShareResumeView({
  templateType,
  data,
  title,
}: {
  templateType: TemplateType;
  data: ResumeData;
  title?: string;
}) {
  const t = useTranslations("builder");
  const showToast = useToastStore((s) => s.showToast);
  const lang = useResumeLangStore((s) => s.lang);
  const setLang = useResumeLangStore((s) => s.setLang);

  useEffect(() => {
    if (title) {
      document.title = title;
    }
  }, [title]);

  const Template = templateComponents[templateType] ?? ModernTemplate;
  const isThai = lang === "auto" ? hasThaiInResume(data) : lang === "th";

  const handleDownloadPdf = () => {
    printResumeFitToOnePage(
      () => showToast(t("pdfScaledWarning"), "info"),
      () => showToast(t("pdfScaleFailed"), "error"),
    );
  };
  return (
    <div className="max-w-[800px] mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div
          role="group"
          aria-label={t("resumeLang")}
          className="flex items-center gap-1 rounded-md border border-border bg-white p-0.5"
        >
          {(
            [
              { value: "auto", label: t("langAuto") },
              { value: "en", label: "EN" },
              { value: "th", label: "ไทย" },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setLang(option.value)}
              aria-pressed={lang === option.value}
              className={cn(
                "px-2 py-0.5 rounded text-xs transition-colors",
                lang === option.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={handleDownloadPdf} className="shrink-0">
          <Download size={14} className="mr-1" />
          {t("downloadPdf")}
        </Button>
      </div>
      <div
        className={cn("px-4 bg-white shadow-sm rounded-lg overflow-hidden", isThai && "font-thai")}
      >
        <ResumeLangProvider value={lang === "auto" ? null : lang}>
          <Template data={data} />
        </ResumeLangProvider>
      </div>
      <div className="print-resume">
        <ResumeLangProvider value={lang === "auto" ? null : lang}>
          <Template data={data} />
        </ResumeLangProvider>
      </div>
    </div>
  );
}
