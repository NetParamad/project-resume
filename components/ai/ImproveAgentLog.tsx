"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  FileText,
  AlertTriangle,
  RotateCcw,
  Square,
  Clock,
} from "lucide-react";
import { sectionTitle, renderValue, truncate } from "./section-utils";

export type AgentLogEntry =
  | { kind: "analyze" }
  | { kind: "improve"; section: string }
  | { kind: "score"; score: number }
  | { kind: "stop"; reason?: string }
  | { kind: "message"; text: string };

export interface AgentConfig {
  maxRounds: number;
  target: number;
}

export interface AgentDoneResult {
  finalData: unknown;
  scores: number[];
  stopReason: string;
  changes: Array<{ section: string; previous: unknown; current: unknown }>;
  summary: string;
}

interface ImproveAgentLogProps {
  status: "running" | "done" | "error";
  config: AgentConfig | null;
  log: AgentLogEntry[];
  scores: number[];
  result: AgentDoneResult | null;
  error: string;
  elapsedSeconds?: number | null;
  applied: boolean;
  onApply: () => void;
  onRetry: () => void;
  onStop: () => void;
}

export function ImproveAgentLog({
  status,
  config,
  log,
  scores,
  result,
  error,
  elapsedSeconds,
  applied,
  onApply,
  onRetry,
  onStop,
}: ImproveAgentLogProps) {
  const t = useTranslations("ai");
  const builderT = useTranslations("builder");

  const sectionTitleFor = (section: string) => sectionTitle(builderT, section);

  const stopLabel = (reason?: string) => {
    switch (reason) {
      case "target_reached":
        return t("targetReached");
      case "plateau":
        return t("noImprovement");
      case "no_tool_calls":
        return t("agentNoChanges");
      default:
        return t("maxRounds");
    }
  };

  return (
    <div className="space-y-4">
      {status === "running" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 size={16} className="animate-spin" />
            {config
              ? t("agentStatus", { round: Math.min(log.filter((l) => l.kind === "score").length + 1, config.maxRounds), maxRounds: config.maxRounds })
              : t("agentStart")}
          </div>
          <Button variant="outline" size="sm" onClick={onStop} className="w-full">
            <Square size={14} className="mr-2" />
            {t("stop")}
          </Button>
        </div>
      )}

      {status === "done" && typeof elapsedSeconds === "number" && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock size={12} />
          {t("completedIn", { seconds: elapsedSeconds.toFixed(1) })}
        </p>
      )}

      {scores.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {scores.map((score, i) => (
            <div key={i} className="flex items-center gap-2">
              <span
                className={`text-sm font-semibold px-2 py-0.5 rounded-md ${
                  score >= 85
                    ? "bg-green-100 text-green-700"
                    : "bg-muted text-foreground"
                }`}
              >
                {score}
              </span>
              {i < scores.length - 1 && <TrendingUp size={14} className="text-muted-foreground" />}
            </div>
          ))}
          <span className="text-xs text-muted-foreground">/100 · {t("scoreHistory")}</span>
        </div>
      )}

      <div className="rounded-md border border-border bg-muted/40 p-3 space-y-2 max-h-[200px] overflow-y-auto">
        {log.length === 0 && status === "running" && (
          <p className="text-xs text-muted-foreground">{t("agentStart")}</p>
        )}
        {log.map((entry, i) => {
          switch (entry.kind) {
            case "analyze":
              return (
                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles size={12} className="text-amber-500 shrink-0" />
                  {t("agentAnalyzing")}
                </div>
              );
            case "improve":
              return (
                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FileText size={12} className="text-blue-500 shrink-0" />
                  {t("agentImproving", { section: sectionTitleFor(entry.section) })}
                </div>
              );
            case "score":
              return (
                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <TrendingUp size={12} className="text-green-500 shrink-0" />
                  {t("agentRescoring")} {t("agentScore", { score: entry.score })}
                </div>
              );
            case "stop":
              return (
                <div key={i} className="flex items-center gap-2 text-xs font-medium text-foreground">
                  <CheckCircle2 size={12} className="text-green-500 shrink-0" />
                  {stopLabel(entry.reason)}
                </div>
              );
            case "message":
              return (
                <div key={i} className="text-xs text-foreground">
                  <span className="font-medium">{t("agentSummary")}: </span>
                  <span className="whitespace-pre-wrap">{truncate(entry.text, 220)}</span>
                </div>
              );
          }
        })}
      </div>

      {status === "error" && (
        <div className="space-y-3">
          <p className="text-sm text-red-500 flex items-center gap-2">
            <AlertTriangle size={14} />
            {error || t("agentError")}
          </p>
          <Button variant="outline" className="w-full" onClick={onRetry}>
            <RotateCcw size={14} className="mr-2" />
            {t("retry")}
          </Button>
        </div>
      )}

      {status === "done" && result && result.changes.length === 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <AlertTriangle size={14} className="text-yellow-500" />
            {t("agentNoChanges")}
          </p>
          <Button variant="outline" className="w-full" onClick={onRetry}>
            <RotateCcw size={14} className="mr-2" />
            {t("retry")}
          </Button>
        </div>
      )}

      {result && result.changes.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">{t("changesSummary")}</h4>
          <div className="space-y-2 max-h-[220px] overflow-y-auto">
            {result.changes.map((change, i) => (
              <div key={i} className="rounded-md border border-border p-2 text-xs">
                <div className="font-medium text-foreground mb-1">
                  {sectionTitleFor(change.section)}
                </div>
                <div className="text-muted-foreground line-through decoration-red-400/60">
                  {renderValue(change.section, change.previous) || "—"}
                </div>
                <div className="text-foreground">
                  {renderValue(change.section, change.current) || "—"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {status === "done" && !applied && (
        <Button onClick={onApply} className="w-full">
          <CheckCircle2 size={14} className="mr-2" />
          {t("applyChanges")}
        </Button>
      )}

      {applied && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-green-600 flex items-center gap-2">
            <CheckCircle2 size={16} />
            {t("agentDone")}
          </p>
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RotateCcw size={14} className="mr-2" />
            {t("atsCheck")}
          </Button>
        </div>
      )}
    </div>
  );
}
