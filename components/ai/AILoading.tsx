"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";

export function AILoading({
  steps,
  notice,
  onCancel,
}: {
  steps: string[];
  notice?: string;
  onCancel?: () => void;
}) {
  const t = useTranslations("ai");
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const tick = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(tick);
  }, []);

  const [currentStep, ...pendingSteps] = steps;

  return (
    <div className="space-y-3">
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full animate-indeterminate" style={{ width: "40%" }} />
      </div>
      <div className="border-2 border-border rounded-lg p-6 space-y-3">
        <div className="h-4 bg-muted rounded animate-pulse" />
        <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
        <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
      </div>
      <ul className="space-y-1.5">
        {currentStep && (
          <li className="flex items-center gap-2 text-sm text-foreground">
            <Loader2 size={14} className="animate-spin shrink-0" />
            {currentStep}
          </li>
        )}
        {pendingSteps.map((step, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground/60">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 shrink-0" />
            {step}
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground/60">{notice}</p>
        <p className="text-xs text-muted-foreground/60 font-mono tabular-nums shrink-0">
          {t("elapsedTime", { seconds })}
        </p>
      </div>
      {onCancel && (
        <Button variant="outline" size="sm" className="w-full" onClick={onCancel}>
          <X size={14} className="mr-2" />
          {t("cancel")}
        </Button>
      )}
    </div>
  );
}
