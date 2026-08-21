"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Bot,
  Lightbulb,
  Target,
  Sparkles,
  FileText,
  CheckCircle2,
  ChevronDown,
  Settings2,
  type LucideIcon,
} from "lucide-react";
import { useAIModelStore } from "@/lib/store/ai-model-store";
import { ALLOWED_MODELS } from "@/lib/ai/models";
import { cn } from "@/lib/utils";
import { AtsPanel } from "./AtsPanel";
import { TailorPanel } from "./TailorPanel";
import { PolishPanel } from "./PolishPanel";
import { ExtractPanel } from "./ExtractPanel";

type Tab = "ats" | "tailor" | "polish" | "import";

const TABS: Array<{ id: Tab; icon: LucideIcon; labelKey: string }> = [
  { id: "ats", icon: Lightbulb, labelKey: "aiTabAts" },
  { id: "tailor", icon: Target, labelKey: "aiTabTailor" },
  { id: "polish", icon: Sparkles, labelKey: "aiTabPolish" },
  { id: "import", icon: FileText, labelKey: "aiTabImport" },
];

export function AIAssistDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("ai");
  const [tab, setTab] = useState<Tab>("ats");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const override = useAIModelStore((s) => s.override);
  const setOverride = useAIModelStore((s) => s.setOverride);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] max-h-[85vh] flex flex-col overflow-hidden p-5">
        <DialogHeader className="text-left">
          <DialogTitle className="flex items-center gap-2">
            <Bot size={18} className="text-primary" />
            {t("aiAssistTitle")}
          </DialogTitle>
          <DialogDescription>{t("aiAssistDescription")}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1 min-h-0">
          <nav
            className="grid grid-cols-2 gap-1 sm:flex sm:flex-col sm:gap-1 sm:shrink-0 sm:w-44 pb-1 sm:pb-0"
            aria-label={t("aiAssistTitle")}
          >
            {TABS.map((tabs) => {
              const Icon = tabs.icon;
              const active = tab === tabs.id;
              return (
                <button
                  key={tabs.id}
                  type="button"
                  role="tab"
                  id={`ai-tab-${tabs.id}`}
                  aria-selected={active}
                  aria-controls={`ai-panel-${tabs.id}`}
                  onClick={() => setTab(tabs.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm whitespace-nowrap transition-all active:scale-[0.98]",
                    active
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <Icon size={15} className="shrink-0" />
                  {t(tabs.labelKey)}
                </button>
              );
            })}
          </nav>

          <div
            key={tab}
            role="tabpanel"
            id={`ai-panel-${tab}`}
            aria-labelledby={`ai-tab-${tab}`}
            className="flex-1 min-h-0 overflow-y-auto pr-1 animate-fade-in-up [animation-duration:0.25s]"
          >
            {tab === "ats" && <AtsPanel />}
            {tab === "tailor" && <TailorPanel />}
            {tab === "polish" && <PolishPanel />}
            {tab === "import" && <ExtractPanel onClose={() => onOpenChange(false)} />}
          </div>
        </div>

        <div className="border-t pt-3 mt-3">
          <button
            type="button"
            onClick={() => setAdvancedOpen((prev) => !prev)}
            aria-expanded={advancedOpen}
            className="flex items-center justify-between w-full text-sm text-muted-foreground transition-all active:scale-[0.99] hover:text-foreground"
          >
            <span className="flex items-center gap-2">
              <Settings2 size={14} />
              {t("advanced")}
              <span className="text-xs text-muted-foreground/60">· {t("advancedHint")}</span>
            </span>
            <ChevronDown size={14} className={cn("transition-transform duration-300 shrink-0", advancedOpen && "rotate-180")} />
          </button>

          <div
            className={cn(
              "grid transition-[grid-template-rows] duration-300 ease-out",
              advancedOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
            )}
            aria-hidden={!advancedOpen}
            inert={!advancedOpen}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="mt-3 space-y-1.5 max-h-[40vh] overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => setOverride(null)}
                className={cn(
                  "w-full flex items-start gap-2 rounded-md border px-3 py-2 text-left text-sm transition-all active:scale-[0.99]",
                  override === null
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-accent",
                )}
              >
                <CheckCircle2
                  size={16}
                  className={cn("mt-0.5 shrink-0", override === null ? "text-primary" : "text-muted-foreground/40")}
                />
                <span className="flex flex-col">
                  <span>{t("modelAuto")}</span>
                  <span className="text-xs text-muted-foreground">{t("modelAutoHint")}</span>
                </span>
              </button>
              {Object.entries(ALLOWED_MODELS).map(([id, meta]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setOverride(id)}
                  className={cn(
                    "w-full flex items-start gap-2 rounded-md border px-3 py-2 text-left text-sm transition-all active:scale-[0.99]",
                    override === id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-accent",
                  )}
                >
                  <CheckCircle2
                    size={16}
                    className={cn("mt-0.5 shrink-0", override === id ? "text-primary" : "text-muted-foreground/40")}
                  />
                  <span className="flex flex-col">
                    <span>{meta.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {meta.supportsTools ? t("modelTools") : t("modelNoTools")}
                    </span>
                  </span>
                </button>
              ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
