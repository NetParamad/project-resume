"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useResumeStore } from "@/lib/store/resume-store";
import { useAIModelStore } from "@/lib/store/ai-model-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, CheckCircle2, Lightbulb, Bot } from "lucide-react";
import {
  ImproveAgentLog,
  type AgentLogEntry,
  type AgentConfig,
  type AgentDoneResult,
} from "./ImproveAgentLog";
import type { ResumeData } from "@/lib/types/resume";

interface ATSResult {
  score: number;
  keywordsFound: string[];
  missingKeywords: string[];
  suggestions: string[];
}

interface StepEvent {
  type?: string;
  round?: number;
  tool?: string;
  args?: Record<string, unknown>;
  result?: unknown;
  score?: number;
  reason?: string;
}

type AgentStatus = "idle" | "running" | "done" | "error";

export function AtsPanel() {
  const t = useTranslations("ai");
  const locale = useLocale();
  const resumeData = useResumeStore((s) => s.data);
  const setData = useResumeStore((s) => s.setData);
  const model = useAIModelStore((s) => s.override);

  const [result, setResult] = useState<ATSResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [agentStatus, setAgentStatus] = useState<AgentStatus>("idle");
  const [agentConfig, setAgentConfig] = useState<AgentConfig | null>(null);
  const [agentLog, setAgentLog] = useState<AgentLogEntry[]>([]);
  const [agentScores, setAgentScores] = useState<number[]>([]);
  const [agentResult, setAgentResult] = useState<AgentDoneResult | null>(null);
  const [agentError, setAgentError] = useState("");
  const [applied, setApplied] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const resetAgent = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setAgentStatus("idle");
    setAgentConfig(null);
    setAgentLog([]);
    setAgentScores([]);
    setAgentResult(null);
    setAgentError("");
    setApplied(false);
  }, []);

  const handleCheck = async () => {
    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/ai/ats-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData, locale, model }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data as ATSResult);
      }
    } catch {
      setError(t("error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep = useCallback((step: StepEvent) => {
    if (step.type === "tool") {
      if (step.tool === "get_ats_score") {
        setAgentLog((prev) => [...prev, { kind: "analyze" }]);
      } else if (step.tool === "update_section") {
        const section = String(step.args?.section ?? "");
        setAgentLog((prev) => [...prev, { kind: "improve", section }]);
      }
    } else if (step.type === "score" && typeof step.score === "number") {
      const score = step.score;
      setAgentScores((prev) => [...prev, score]);
      setAgentLog((prev) => [...prev, { kind: "score", score }]);
    } else if (step.type === "message" && typeof step.result === "string") {
      const text = step.result;
      setAgentLog((prev) => [...prev, { kind: "message", text }]);
    } else if (step.type === "stop") {
      setAgentLog((prev) => [...prev, { kind: "stop", reason: step.reason }]);
    }
  }, []);

  const handleImprove = async () => {
    resetAgent();
    setAgentStatus("running");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/ai/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData, locale, model }),
        signal: controller.signal,
      });

      if (!res.body) throw new Error("No response stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let sepIndex: number;
        while ((sepIndex = buffer.indexOf("\n\n")) !== -1) {
          const rawEvent = buffer.slice(0, sepIndex);
          buffer = buffer.slice(sepIndex + 2);
          handleSSEEvent(rawEvent);
        }
      }

      setAgentStatus((prev) => (prev === "error" ? prev : "done"));
    } catch {
      if (!controller.signal.aborted) {
        setAgentError(t("agentError"));
        setAgentStatus("error");
      }
    } finally {
      abortRef.current = null;
    }
  };

  const handleSSEEvent = (raw: string) => {
    const lines = raw.split("\n");
    let event = "message";
    let dataStr = "";
    for (const line of lines) {
      if (line.startsWith("event:")) event = line.slice(6).trim();
      else if (line.startsWith("data:")) dataStr += line.slice(5).trim();
    }
    if (!dataStr) return;

    let data: unknown;
    try {
      data = JSON.parse(dataStr);
    } catch {
      return;
    }

    switch (event) {
      case "config": {
        const cfg = data as AgentConfig;
        setAgentConfig(cfg);
        break;
      }
      case "step":
        handleStep(data as StepEvent);
        break;
      case "done": {
        const done = data as AgentDoneResult;
        setAgentResult(done);
        if (Array.isArray(done.scores) && done.scores.length > 0) {
          setAgentScores(done.scores);
        }
        break;
      }
      case "error": {
        const msg = (data as { message?: string }).message;
        setAgentError(msg || t("agentError"));
        setAgentStatus("error");
        break;
      }
    }
  };

  const handleApply = () => {
    if (!agentResult) return;
    setData(agentResult.finalData as ResumeData);
    setApplied(true);
  };

  const scoreColor =
    result && result.score >= 80
      ? "text-green-600"
      : result && result.score >= 60
      ? "text-yellow-600"
      : "text-red-600";

  const lastScore =
    agentScores.length > 0 ? agentScores[agentScores.length - 1] : result?.score ?? "—";

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">{t("atsScoreTitle")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("atsScore", { score: lastScore })}
        </p>
      </div>

      {agentStatus !== "idle" ? (
        <ImproveAgentLog
          status={agentStatus}
          config={agentConfig}
          log={agentLog}
          scores={agentScores}
          result={agentResult}
          error={agentError}
          applied={applied}
          onApply={handleApply}
          onRetry={() => {
            setResult(null);
            handleImprove();
          }}
          onStop={() => {
            abortRef.current?.abort();
            resetAgent();
          }}
        />
      ) : isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      ) : result ? (
        <div className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <span className={`text-4xl font-bold ${scoreColor}`}>
                {result.score}
              </span>
              <span className="text-lg text-muted-foreground ml-1">/100</span>
            </div>

            {result.keywordsFound.length > 0 && (
              <div>
                <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                  <CheckCircle2 size={14} className="text-green-500" />
                  {t("atsKeywords")}
                </h4>
                <div className="flex flex-wrap gap-1">
                  {result.keywordsFound.map((kw) => (
                    <Badge key={kw} variant="secondary" className="text-xs">
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {result.missingKeywords.length > 0 && (
              <div>
                <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                  <AlertTriangle size={14} className="text-yellow-500" />
                  {t("atsMissingKeywords")}
                </h4>
                <div className="flex flex-wrap gap-1">
                  {result.missingKeywords.map((kw) => (
                    <Badge key={kw} variant="outline" className="text-xs text-yellow-600">
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {result.suggestions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Lightbulb size={14} className="text-blue-500" />
                  {t("atsSuggestions")}
                </h4>
                <ul className="space-y-1">
                  {result.suggestions.map((s, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-blue-500 shrink-0">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <Button variant="outline" className="w-full" onClick={handleImprove}>
            <Bot size={14} className="mr-2" />
            {t("improveWithAgent")}
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <Button onClick={handleCheck} className="w-full">
            {t("atsCheck")}
          </Button>
          <Button variant="outline" className="w-full" onClick={handleImprove}>
            <Bot size={14} className="mr-2" />
            {t("improveWithAgent")}
          </Button>
        </div>
      )}
      {error && agentStatus === "idle" && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
