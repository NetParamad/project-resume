"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useResumeStore } from "@/lib/store/resume-store";
import { useAIModelStore } from "@/lib/store/ai-model-store";
import { Button } from "@/components/ui/button";
import { Sparkles, CheckCircle2, X, RotateCcw, Clock } from "lucide-react";
import { AILoading } from "./AILoading";
import { DiffView } from "./DiffView";
import type { ResumeData } from "@/lib/types/resume";

const STEPS = ["polishStep1", "polishStep2", "polishStep3"];

type Phase = "input" | "loading" | "result" | "applied";

export function PolishPanel() {
  const t = useTranslations("ai");
  const locale = useLocale();
  const resumeData = useResumeStore((s) => s.data);
  const setData = useResumeStore((s) => s.setData);
  const model = useAIModelStore((s) => s.override);

  const [phase, setPhase] = useState<Phase>("input");
  const [baseData, setBaseData] = useState<ResumeData | null>(null);
  const [resultData, setResultData] = useState<ResumeData | null>(null);
  const [error, setError] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState<number | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const startRef = useRef(0);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const handlePolish = async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setError("");
    setPhase("loading");
    setBaseData(resumeData);
    setResultData(null);
    setElapsedSeconds(null);
    startRef.current = Date.now();

    try {
      const res = await fetch("/api/ai/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData, locale, model }),
        signal: controller.signal,
      });
      const data = await res.json();
      if (data.data) {
        setElapsedSeconds((Date.now() - startRef.current) / 1000);
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
        <h2 className="text-base font-semibold">{t("polish")}</h2>
        <p className="text-sm text-muted-foreground">{t("polishDescription")}</p>
      </div>

      {phase === "input" && (
        <div className="space-y-3">
          <Button onClick={handlePolish} className="w-full">
            <Sparkles size={14} className="mr-2" />
            {t("polishNow")}
          </Button>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      )}

      {phase === "loading" && (
        <AILoading
          steps={STEPS.map((key) => t(key))}
          notice={t("polishTimeNotice")}
          onCancel={() => {
            abortRef.current?.abort();
            setPhase("input");
          }}
        />
      )}

      {phase === "result" && baseData && resultData && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-medium">{t("resultTitle")}</h3>
            {elapsedSeconds !== null && (
              <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                <Clock size={12} />
                {t("completedIn", { seconds: elapsedSeconds.toFixed(1) })}
              </span>
            )}
          </div>
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
