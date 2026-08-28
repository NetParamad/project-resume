"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useResumeStore } from "@/lib/store/resume-store";
import { usePreviewZoomStore } from "@/lib/store/preview-zoom-store";
import { useResumeLangStore, type ResumeLangPreference } from "@/lib/store/resume-lang-store";
import { ResumePreview } from "@/components/preview/ResumePreview";
import { ResumeLangProvider } from "@/lib/resume-lang-context";
import { cn } from "@/lib/utils";

const A4_WIDTH = 794;

const ZOOM_OPTIONS = ["fit", 75, 100, 125] as const;

const LANG_OPTIONS: { value: ResumeLangPreference; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "th", label: "ไทย" },
];

export function PreviewPanel() {
  const t = useTranslations("builder");
  const data = useResumeStore((s) => s.data);
  const title = useResumeStore((s) => s.title);
  const zoom = usePreviewZoomStore((s) => s.zoom);
  const setZoom = usePreviewZoomStore((s) => s.setZoom);
  const resumeLang = useResumeLangStore((s) => s.lang);
  const setResumeLang = useResumeLangStore((s) => s.setLang);

  useEffect(() => {
    if (title) {
      document.title = title;
    }
  }, [title]);

  const hasData = data.personalInfo.fullName || data.summary || data.experience.length > 0;

  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(1);
  const [innerHeight, setInnerHeight] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const available = el.clientWidth - 8;
      const next = Math.max(0.25, Math.min(available / A4_WIDTH, 1.25));
      // Ignore sub-percent changes: a scrollbar toggling on/off nudges
      // clientWidth by a few px, which would otherwise re-trigger this
      // observer in a feedback loop and make the preview visibly shake.
      setFitScale((prev) => (Math.abs(next - prev) < 0.005 ? prev : next));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const update = () => setInnerHeight(el.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [hasData]);

  const scale = zoom === "fit" ? fitScale : zoom / 100;

  return (
    <div id="preview-panel" className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h2 className="text-lg font-semibold">{t("preview")}</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <div
            role="group"
            aria-label={t("resumeLang")}
            className="flex items-center gap-1 rounded-md border border-border p-0.5"
          >
            {LANG_OPTIONS.map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => setResumeLang(option.value)}
                aria-pressed={resumeLang === option.value}
                className={cn(
                  "px-2 py-0.5 rounded text-xs transition-colors",
                  resumeLang === option.value
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:text-foreground",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
            {ZOOM_OPTIONS.map((option) => (
              <button
                key={String(option)}
                type="button"
                onClick={() => setZoom(option)}
                aria-pressed={zoom === option}
                className={cn(
                  "px-2 py-0.5 rounded text-xs transition-colors",
                  zoom === option
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:text-foreground",
                )}
              >
                {option === "fit" ? t("zoomFit") : `${option}%`}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div ref={containerRef} className="w-full">
        <div
          className="mx-auto overflow-hidden"
          style={{ width: A4_WIDTH * scale, height: Math.max(innerHeight * scale, 120) }}
        >
          <div
            ref={innerRef}
            className="w-full origin-top-left transition-transform duration-150 ease-out"
            style={{ width: A4_WIDTH, transform: `scale(${scale})` }}
          >
            {hasData ? (
              <ResumeLangProvider value={resumeLang === "auto" ? null : resumeLang}>
                <ResumePreview />
              </ResumeLangProvider>
            ) : (
              <div className="flex items-center justify-center h-64 bg-muted/50 rounded-lg border border-dashed border-border">
                <p className="text-muted-foreground text-sm">{t("emptyState")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
