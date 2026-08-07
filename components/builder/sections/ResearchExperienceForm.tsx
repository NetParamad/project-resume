"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useResumeStore } from "@/lib/store/resume-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIAssistButton } from "@/components/ai/AIAssistButton";
import { Plus, Trash2 } from "lucide-react";

export function ResearchExperienceForm() {
  const t = useTranslations("builder.researchExperience");
  const items = useResumeStore((s) => s.data.researchExperience);
  const add = useResumeStore((s) => s.addResearchExperience);
  const update = useResumeStore((s) => s.updateResearchExperience);
  const remove = useResumeStore((s) => s.removeResearchExperience);

  useEffect(() => {
    const handler = (e: Event) => {
      const { section, content, itemId } = (e as CustomEvent).detail;
      if (section !== "researchExperience" || !content) return;
      if (itemId) {
        update(itemId, { description: content });
        return;
      }
      const list = useResumeStore.getState().data.researchExperience ?? [];
      if (list.length > 0) {
        update(list[list.length - 1].id, { description: content });
      } else {
        add();
        const after = useResumeStore.getState().data.researchExperience ?? [];
        if (after.length > 0) update(after[after.length - 1].id, { description: content });
      }
    };
    window.addEventListener("ai-autofill", handler);
    return () => window.removeEventListener("ai-autofill", handler);
  }, [update, add]);

  return (
    <Card>
      <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">{t("title")}</CardTitle>
        <div className="flex items-center gap-2">
          <AIAssistButton section="researchExperience" />
          <Button variant="outline" size="sm" onClick={add}>
            <Plus size={14} className="mr-1" />
            {t("add")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {(items || []).map((exp) => (
          <div key={exp.id} className="border border-border rounded-md p-3 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">{t("role")}</Label>
                <Input
                  value={exp.role}
                  onChange={(e) => update(exp.id, { role: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t("institution")}</Label>
                <Input
                  value={exp.institution}
                  onChange={(e) => update(exp.id, { institution: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t("location")}</Label>
                <Input
                  value={exp.location}
                  onChange={(e) => update(exp.id, { location: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t("supervisor")}</Label>
                <Input
                  value={exp.supervisor}
                  onChange={(e) => update(exp.id, { supervisor: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t("startDate")}</Label>
                <Input
                  type="month"
                  value={exp.startDate}
                  onChange={(e) => update(exp.id, { startDate: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t("endDate")}</Label>
                <Input
                  type="month"
                  value={exp.endDate}
                  onChange={(e) => update(exp.id, { endDate: e.target.value })}
                  disabled={exp.current}
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id={`current-${exp.id}`}
                checked={exp.current}
                onCheckedChange={(checked) => update(exp.id, { current: checked === true })}
              />
              <Label htmlFor={`current-${exp.id}`} className="text-xs cursor-pointer">
                {t("current")}
              </Label>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t("description")}</Label>
              <textarea
                value={exp.description}
                onChange={(e) => update(exp.id, { description: e.target.value })}
                className="w-full min-h-[60px] rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => remove(exp.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
