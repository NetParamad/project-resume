"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useResumeStore } from "@/lib/store/resume-store";
import { useResumeLangStore } from "@/lib/store/resume-lang-store";
import { FormPanel } from "./FormPanel";
import { PreviewPanel } from "./PreviewPanel";
import { BuilderHeader } from "./BuilderHeader";
import { ResumePreview } from "@/components/preview/ResumePreview";
import { ResumeLangProvider } from "@/lib/resume-lang-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FilePenLine, Eye, Loader2, AlertTriangle } from "lucide-react";

export function BuilderLayout({
  resumeId,
  documentType,
  initialTitle,
}: {
  resumeId: string;
  documentType?: "resume" | "cv";
  initialTitle?: string;
}) {
  const t = useTranslations("builder");
  const ct = useTranslations("common");
  const isDirty = useResumeStore((s) => s.isDirty);
  const setCurrentResume = useResumeStore((s) => s.setCurrentResume);
  const resetData = useResumeStore((s) => s.resetData);
  const setDocumentType = useResumeStore((s) => s.setDocumentType);
  const setTitle = useResumeStore((s) => s.setTitle);
  const resumeLang = useResumeLangStore((s) => s.lang);

  const [mobileView, setMobileView] = useState<"form" | "preview">("form");
  const [loading, setLoading] = useState(resumeId !== "new");
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (resumeId === "new") {
      const currentDraft = localStorage.getItem("resume-draft");
      if (currentDraft) {
        localStorage.setItem("resume-draft-backup", currentDraft);
      }
      resetData();
      if (documentType) {
        setDocumentType(documentType);
      }
      if (initialTitle) {
        setTitle(initialTitle);
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError(false);
    fetch(`/api/resumes/${resumeId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load resume");
        return res.json();
      })
      .then((data) => {
        setCurrentResume(data.id, data.title, data.document_type || "resume", data.template, data.data, data.share_slug, data.is_public);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setLoadError(true);
      });
  }, [resumeId, setCurrentResume, resetData, setDocumentType, setTitle, documentType, initialTitle]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  if (loading) {
    return (
      <div className="flex flex-col flex-1 bg-background">
        <BuilderHeader resumeId={resumeId} />
        <div className="flex flex-col items-center justify-center gap-3 flex-1 py-24 text-muted-foreground">
          <Loader2 size={28} className="animate-spin" />
          <p className="text-sm">{ct("loading")}</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col flex-1 bg-background">
        <BuilderHeader resumeId={resumeId} />
        <div className="flex flex-col items-center justify-center gap-3 flex-1 py-24 px-6 text-center">
          <AlertTriangle size={28} className="text-destructive" />
          <p className="text-sm text-muted-foreground max-w-sm">{ct("loadError")}</p>
          <Button
            size="sm"
            onClick={() => {
              setLoading(true);
              setLoadError(false);
              fetch(`/api/resumes/${resumeId}`)
                .then((res) => {
                  if (!res.ok) throw new Error("Failed to load resume");
                  return res.json();
                })
                .then((data) => {
                  setCurrentResume(data.id, data.title, data.document_type || "resume", data.template, data.data, data.share_slug, data.is_public);
                  setLoading(false);
                })
                .catch(() => {
                  setLoading(false);
                  setLoadError(true);
                });
            }}
          >
            {ct("retry")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col flex-1 bg-background">
        <BuilderHeader resumeId={resumeId} />
        <div className="lg:hidden z-30 bg-background/95 backdrop-blur border-b border-border">
          <div className="grid grid-cols-2 gap-1 p-1.5">
            <button
              type="button"
              onClick={() => setMobileView("form")}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors",
                mobileView === "form"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <FilePenLine size={15} />
              {t("form")}
            </button>
            <button
              type="button"
              onClick={() => setMobileView("preview")}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors",
                mobileView === "preview"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Eye size={15} />
              {t("preview")}
            </button>
          </div>
        </div>
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 min-h-0">
          <div
            className={cn(
              "border-b lg:border-b-0 lg:border-r border-border overflow-y-auto",
              mobileView === "preview" && "hidden lg:block",
            )}
          >
            <FormPanel />
          </div>
          <div
            key={String(mobileView)}
            className={cn(
              "overflow-y-auto bg-muted/30 animate-in fade-in-0 duration-200 ease-out",
              mobileView === "form" && "hidden lg:block",
            )}
          >
            <PreviewPanel />
          </div>
        </div>
      </div>
      <div className="print-resume">
        <ResumeLangProvider value={resumeLang === "auto" ? null : resumeLang}>
          <ResumePreview />
        </ResumeLangProvider>
      </div>
    </>
  );
}
