"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useResumeStore } from "@/lib/store/resume-store";
import { useAIModelStore } from "@/lib/store/ai-model-store";
import { normalizeResumeData } from "@/lib/normalize-resume";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, FileText, CheckCircle2, RotateCcw, Eye, Clock } from "lucide-react";
import type { ResumeData } from "@/lib/types/resume";

const ARRAY_KEYS = [
  "experience",
  "education",
  "skills",
  "certifications",
  "projects",
  "languages",
  "references",
  "publications",
  "researchExperience",
  "teachingExperience",
  "awards",
] as const;

export function ExtractPanel({ onClose }: { onClose?: () => void }) {
  const t = useTranslations("ai");
  const bt = useTranslations("builder");
  const locale = useLocale();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [missing, setMissing] = useState<string[]>([]);
  const [usedFallback, setUsedFallback] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [finalElapsed, setFinalElapsed] = useState<number | null>(null);
  const setCurrentResume = useResumeStore((s) => s.setCurrentResume);
  const documentType = useResumeStore((s) => s.documentType);
  const model = useAIModelStore((s) => s.override);
  const startRef = useRef(0);

  useEffect(() => {
    if (!isLoading) {
      setSeconds(0);
      return;
    }
    const tick = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(tick);
  }, [isLoading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setError("");
      setMissing([]);
      setUsedFallback(false);
      setFinalElapsed(null);
    }
  };

  const handleExtract = async () => {
    if (!file) return;
    setIsLoading(true);
    setError("");
    startRef.current = Date.now();

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("locale", locale);
      if (model) formData.append("model", model);

      const res = await fetch("/api/ai/extract-resume", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        const normalized = normalizeResumeData(data as Partial<ResumeData>);
        const empty: string[] = [];
        if (!normalized.summary) empty.push("summary");
        for (const key of ARRAY_KEYS) {
          if ((normalized as unknown as Record<string, unknown[]>)[key].length === 0) {
            empty.push(key);
          }
        }
        setMissing(empty);
        setUsedFallback(data.source === "heuristic");
        setFinalElapsed((Date.now() - startRef.current) / 1000);
        const defaultTemplate = documentType === "cv" ? "academic" : "modern";
        setCurrentResume(null, "Imported Resume", documentType, defaultTemplate, normalized);
        setDone(true);
        setFile(null);
      }
    } catch {
      setError(t("error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">{t("extractResume")}</h2>
        <p className="text-sm text-muted-foreground">{t("extractDescription")}</p>
      </div>

      {done ? (
        <div className="flex flex-col items-center gap-3 py-4">
          <CheckCircle2 size={32} className="text-green-500" />
          <p className="text-sm font-medium">{t("importedTitle")}</p>
          <p className="text-sm text-muted-foreground text-center max-w-[420px]">
            {t("importedDone")}
          </p>
          {finalElapsed !== null && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock size={12} />
              {t("completedIn", { seconds: finalElapsed.toFixed(1) })}
            </p>
          )}
          {usedFallback && (
            <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 text-center max-w-[420px]">
              {t("importedHeuristic")}
            </p>
          )}
          {missing.length > 0 && (
            <div className="text-sm text-muted-foreground text-center max-w-[420px] border rounded-md px-3 py-2 bg-muted/50">
              <span className="font-medium">{t("importedMissing")}:</span>{" "}
              {missing.map((key) => bt(`${key}.title`)).join(", ")}
            </div>
          )}
          <Button
            size="sm"
            className="w-full"
            onClick={() => {
              onClose?.();
              window.setTimeout(() => {
                document.getElementById("preview-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }, 300);
            }}
          >
            <Eye size={14} className="mr-2" />
            {t("importView")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setDone(false);
              setError("");
              setMissing([]);
              setUsedFallback(false);
              setFinalElapsed(null);
            }}
          >
            <RotateCcw size={14} className="mr-2" />
            {t("importAgain")}
          </Button>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-indeterminate" style={{ width: "40%" }} />
          </div>
          <div className="border-2 border-border rounded-lg p-6 space-y-3">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 size={14} className="animate-spin shrink-0" />
            {t("analyzing")}
          </p>
          <p className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground/60">{t("extractTimeNotice")}</span>
            <span className="text-xs text-muted-foreground/60 font-mono tabular-nums shrink-0">
              {t("elapsedTime", { seconds })}
            </span>
          </p>
        </div>
      ) : (
        <>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-muted-foreground/50 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-colors cursor-pointer">
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="sr-only"
              id="resume-upload"
              aria-label={t("uploadPdf")}
            />
            <label htmlFor="resume-upload" className="cursor-pointer">
              {file ? (
                <div className="flex items-center justify-center gap-2">
                  <FileText size={20} className="text-primary" />
                  <span className="text-sm font-medium">{file.name}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload size={24} className="text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {t("uploadPdf")}
                  </p>
                </div>
              )}
            </label>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </>
      )}

      {!done && (
        <Button
          onClick={handleExtract}
          disabled={!file || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 size={14} className="mr-2 animate-spin" />
              {t("analyzing")}
            </>
          ) : (
            <>
              <Upload size={14} className="mr-2" />
              {t("extractResume")}
            </>
          )}
        </Button>
      )}
    </div>
  );
}
