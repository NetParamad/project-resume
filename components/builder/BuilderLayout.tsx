"use client";

import { useEffect } from "react";
import { useResumeStore } from "@/lib/store/resume-store";
import { FormPanel } from "./FormPanel";
import { PreviewPanel } from "./PreviewPanel";
import { BuilderHeader } from "./BuilderHeader";

export function BuilderLayout({
  resumeId,
  documentType,
  initialTitle,
}: {
  resumeId: string;
  documentType?: "resume" | "cv";
  initialTitle?: string;
}) {
  const isDirty = useResumeStore((s) => s.isDirty);
  const setCurrentResume = useResumeStore((s) => s.setCurrentResume);
  const resetData = useResumeStore((s) => s.resetData);
  const setDocumentType = useResumeStore((s) => s.setDocumentType);
  const setTitle = useResumeStore((s) => s.setTitle);

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
    } else {
      fetch(`/api/resumes/${resumeId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load resume");
          return res.json();
        })
        .then((data) => {
          setCurrentResume(data.id, data.title, data.document_type || "resume", data.template, data.data, data.share_slug, data.is_public);
        })
        .catch((err) => console.error("Failed to load resume:", err));
    }
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

  return (
    <div className="flex flex-col flex-1 bg-background">
      <BuilderHeader resumeId={resumeId} />
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        <div className="border-b lg:border-b-0 lg:border-r border-border overflow-y-auto">
          <FormPanel />
        </div>
        <div className="overflow-y-auto bg-muted/30">
          <PreviewPanel />
        </div>
      </div>
    </div>
  );
}
