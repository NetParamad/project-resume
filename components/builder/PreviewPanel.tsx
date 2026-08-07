"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useResumeStore } from "@/lib/store/resume-store";
import { usePreviewZoomStore } from "@/lib/store/preview-zoom-store";
import { ResumePreview } from "@/components/preview/ResumePreview";
import { cn } from "@/lib/utils";

const A4_WIDTH = 794;

const ZOOM_OPTIONS = ["fit", 75, 100, 125] as const;

export function PreviewPanel() {
  const t = useTranslations("builder");
  const data = useResumeStore((s) => s.data);
  const zoom = usePreviewZoomStore((s) => s.zoom);
  const setZoom = usePreviewZoomStore((s) => s.setZoom);

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
      setFitScale(Math.max(0.25, Math.min(available / A4_WIDTH, 1.25)));
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
      <div className="flex items-center justify-between gap-2 mb-4">
        <h2 className="text-lg font-semibold">{t("preview")}</h2>
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
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option === "fit" ? t("zoomFit") : `${option}%`}
            </button>
          ))}
        </div>
      </div>
      <div ref={containerRef} className="w-full">
        <div
          className="mx-auto overflow-hidden"
          style={{ width: A4_WIDTH * scale, height: Math.max(innerHeight * scale, 120) }}
        >
          <div
            ref={innerRef}
            className="w-full origin-top-left"
            style={{ width: A4_WIDTH, transform: `scale(${scale})` }}
          >
            {hasData ? (
              <ResumePreview />
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
