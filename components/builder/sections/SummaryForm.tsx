"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useResumeStore } from "@/lib/store/resume-store";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIAssistButton } from "@/components/ai/AIAssistButton";

export function SummaryForm() {
  const t = useTranslations("builder.summary");
  const summary = useResumeStore((s) => s.data.summary);
  const updateSummary = useResumeStore((s) => s.updateSummary);

  useEffect(() => {
    const handler = (e: Event) => {
      const { section, content } = (e as CustomEvent).detail;
      if (section === "summary" && content) updateSummary(content);
    };
    window.addEventListener("ai-autofill", handler);
    return () => window.removeEventListener("ai-autofill", handler);
  }, [updateSummary]);

  return (
    <Card>
      <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">{t("title")}</CardTitle>
        <AIAssistButton section="summary" />
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <Label htmlFor="summary" className="text-xs">
            {t("title")}
          </Label>
          <textarea
            id="summary"
            value={summary}
            onChange={(e) => updateSummary(e.target.value)}
            placeholder={t("placeholder")}
            className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}
