"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useAIModelStore } from "@/lib/store/ai-model-store";
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

interface AutoFillDialogProps {
  section: string;
  itemId?: string;
  trigger?: React.ReactNode;
  children?: React.ReactNode;
}

export function AutoFillDialog({ section, itemId, trigger, children }: AutoFillDialogProps) {
  const t = useTranslations("ai");
  const builderT = useTranslations("builder");
  const locale = useLocale();
  const model = useAIModelStore((s) => s.override);
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setResult("");
    setError("");

    try {
      const res = await fetch("/api/ai/auto-fill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, prompt, locale, model }),
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
    }
  };

  const sectionTitle = builderT(`${section}.title` as never);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || trigger || (
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
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
                <p className="text-sm whitespace-pre-wrap">{result}</p>
              </div>
              <Button onClick={handleApply} variant="default" className="w-full">
                {t("apply")}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
