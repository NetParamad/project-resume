"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useResumeStore } from "@/lib/store/resume-store";
import { useAIModelStore } from "@/lib/store/ai-model-store";
import { Button } from "@/components/ui/button";
import { Target, CheckCircle2, X, RotateCcw } from "lucide-react";
import { AILoading } from "./AILoading";
import { DiffView } from "./DiffView";
import type { ResumeData } from "@/lib/types/resume";

const STEPS = ["tailorStep1", "tailorStep2", "tailorStep3"];

type Phase = "input" | "loading" | "result" | "applied";

export function TailorPanel() {
  const t = useTranslations("ai");
  const locale = useLocale();
  const resumeData = useResumeStore((s) => s.data);
  const setData = useResumeStore((s) => s.setData);
  const model = useAIModelStore((s) => s.override);

  const [jobDescription, setJobDescription] = useState("");
  const [phase, setPhase] = useState<Phase>("input");
  const [baseData, setBaseData] = useState<ResumeData | null>(null);
  const [resultData, setResultData] = useState<ResumeData | null>(null);
  const [error, setError] = useState("");

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const handleTailor = async () => {
    if (!jobDescription.trim()) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setError("");
    setPhase("loading");
    setBaseData(resumeData);
    setResultData(null);

    try {
      const res = await fetch("/api/ai/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData,
          jobDescription,
          locale,
          model,
        }),
        signal: controller.signal,
      });
      const data = await res.json();
      if (data.data) {
        setResultData(data.data as ResumeData);
        setPhase("result");
      } else {
        setError(data.error || t("error"));
        setPhase("input");
      }
    } catch {
      if (!controller.signal.aborted) {
        setError(t("error"));
        setPhase("input");
      }
    } finally {
      abortRef.current = null;
    }
  };

  const handleApply = () => {
    if (!resultData) return;
    setData(resultData);
    setPhase("applied");
  };

  const handleDiscard = () => {
    setResultData(null);
    setBaseData(null);
    setPhase("input");
  };

  const handleUndo = () => {
    if (!baseData) return;
    setData(baseData);
    setResultData(null);
    setBaseData(null);
    setPhase("input");
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">{t("tailor")}</h2>
        <p className="text-sm text-muted-foreground">{t("tailorDescription")}</p>
      </div>

      {phase === "input" && (
        <div className="space-y-3">
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder={t("tailorPlaceholder")}
            className="w-full min-h-[140px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            rows={6}
          />
          <Button
            onClick={handleTailor}
            disabled={!jobDescription.trim()}
            className="w-full"
          >
            <Target size={14} className="mr-2" />
            {t("tailor")}
          </Button>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      )}

      {phase === "loading" && (
        <AILoading
          steps={STEPS.map((key) => t(key))}
          notice={t("tailorTimeNotice")}
          onCancel={() => {
            abortRef.current?.abort();
            setPhase("input");
          }}
        />
      )}

      {phase === "result" && baseData && resultData && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium">{t("resultTitle")}</h3>
          <DiffView original={baseData} updated={resultData} />
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleApply} className="flex-1">
              <CheckCircle2 size={14} className="mr-2" />
              {t("applyToResume")}
            </Button>
            <Button variant="outline" onClick={handleDiscard} className="flex-1">
              <X size={14} className="mr-2" />
              {t("discard")}
            </Button>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      )}

      {phase === "applied" && (
        <div className="flex flex-col items-center gap-3 py-4">
          <CheckCircle2 size={32} className="text-green-500" />
          <p className="text-sm text-green-600 font-medium">{t("resultApplied")}</p>
          <Button onClick={handleUndo} className="w-full" size="sm">
            <RotateCcw size={14} className="mr-2" />
            {t("undo")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setResultData(null);
              setBaseData(null);
              setPhase("input");
            }}
          >
            {t("runAgain")}
          </Button>
        </div>
      )}
    </div>
  );
}
