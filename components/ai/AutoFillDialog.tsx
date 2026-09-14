"use client";

import { useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useAIModelStore } from "@/lib/store/ai-model-store";
import {
  useAILanguageStore,
  type OutputLocale,
} from "@/lib/store/ai-language-store";
import { useResumeStore } from "@/lib/store/resume-store";
import { buildPrefillPrompt } from "@/lib/ai/prefill";
import { formatResultForPreview } from "@/lib/ai/section-fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Sparkles, Loader2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useElapsedSeconds } from "@/lib/hooks/use-elapsed-seconds";
import type { SectionType } from "@/lib/types/resume";

const LANG_OPTIONS: Array<{ value: OutputLocale | null; labelKey: string }> = [
  { value: null, labelKey: "outputLanguageAuto" },
  { value: "th", labelKey: "outputLanguageTh" },
  { value: "en", labelKey: "outputLanguageEn" },
];

interface AutoFillDialogProps {
  section: SectionType;
  itemId?: string;
  trigger?: React.ReactNode;
  children?: React.ReactNode;
}

export function AutoFillDialog({
  section,
  itemId,
  trigger,
  children,
}: AutoFillDialogProps) {
  const t = useTranslations("ai");
  const builderT = useTranslations("builder");
  const locale = useLocale();
  const model = useAIModelStore((s) => s.override);
  const langOverride = useAILanguageStore((s) => s.override);
  const setLangOverride = useAILanguageStore((s) => s.setOverride);
  const outputLocale = langOverride ?? undefined;
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const lastPrefillRef = useRef("");
  const seconds = useElapsedSeconds(isLoading);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setResult("");
    setError("");

    try {
      const resumeData = useResumeStore.getState().data;
      const res = await fetch("/api/ai/auto-fill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section,
          itemId,
          prompt,
          locale,
          outputLocale,
          model,
          resumeData,
        }),
      });
      const data = await res.json();
      if (data.content) {
        setResult(data.content);
      } else {
        setError(data.error || t("error"));
      }
    } catch {
      setError(t("error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (result) {
      const event = new CustomEvent("ai-autofill", {
        detail: { section, content: result, itemId },
      });
      window.dispatchEvent(event);
      setOpen(false);
      setPrompt("");
      setResult("");
      lastPrefillRef.current = "";
    }
  };

  const sectionTitle = builderT(`${section}.title` as never);
  const isPristinePrefill = prompt !== "" && prompt === lastPrefillRef.current;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    // Prefill from what's already saved so "Improve with AI" starts from
    // the existing content instead of a blank box. Re-sync on every open —
    // but only while the box still holds what we last auto-filled (or is
    // empty); once the user types their own words, leave their draft alone.
    // Without the re-sync, closing the dialog after editing other fields
    // (e.g. switching this item to a different company) and reopening it
    // would keep showing the old prefill forever, since `prompt` never
    // resets on its own.
    if (next && (prompt === "" || prompt === lastPrefillRef.current)) {
      const resumeData = useResumeStore.getState().data;
      const prefill = buildPrefillPrompt(section, itemId, resumeData, locale);
      lastPrefillRef.current = prefill;
      if (prefill !== prompt) setPrompt(prefill);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || trigger || (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <Sparkles size={14} className="mr-1 text-amber-500" />
            <span className="text-xs">{t("autoFill")}</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500" />
            {t("autoFill")} — {sectionTitle || section}
          </DialogTitle>
          <DialogDescription>{t("prompt")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {isPristinePrefill && (
            <p className="text-xs text-amber-600 dark:text-amber-500">
              {t("prefillHint")}
            </p>
          )}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">
              {t("outputLanguage")}
            </span>
            {LANG_OPTIONS.map((opt) => {
              const selected = langOverride === opt.value;
              return (
                <button
                  key={opt.labelKey}
                  type="button"
                  onClick={() => setLangOverride(opt.value)}
                  className={cn(
                    "rounded-md border px-2 py-0.5 text-xs transition-all active:scale-[0.98]",
                    selected
                      ? "border-primary bg-primary/5 font-medium"
                      : "border-border text-muted-foreground hover:bg-accent"
                  )}
                >
                  {t(opt.labelKey)}
                </button>
              );
            })}
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t("prompt")}
            className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            rows={3}
          />
          <Button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="mr-2 animate-spin" />
                {t("generating")}
              </>
            ) : (
              <>
                <Sparkles size={14} className="mr-2" />
                {t("autoFill")}
              </>
            )}
          </Button>
          {isLoading && (
            <p className="text-xs text-muted-foreground/60 text-right font-mono tabular-nums">
              {t("elapsedTime", { seconds })}
            </p>
          )}
          {error && (
            <div className="space-y-2">
              <p className="text-sm text-red-500">{error}</p>
              <Button
                onClick={handleGenerate}
                disabled={isLoading || !prompt.trim()}
                variant="outline"
                className="w-full"
              >
                <RotateCcw size={14} className="mr-2" />
                {t("retry")}
              </Button>
            </div>
          )}
          {result && (
            <div className="space-y-2">
              <div className="rounded-md border border-border bg-muted/50 p-3">
                <p className="text-sm whitespace-pre-wrap">
                  {formatResultForPreview(section, result, locale)}
                </p>
              </div>
              <Button
                onClick={handleApply}
                variant="default"
                className="w-full"
              >
                {t("apply")}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
