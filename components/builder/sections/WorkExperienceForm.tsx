"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useResumeStore } from "@/lib/store/resume-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIAssistButton } from "@/components/ai/AIAssistButton";
import { Plus, Trash2, GripVertical } from "lucide-react";

export function WorkExperienceForm() {
  const t = useTranslations("builder.experience");
  const experience = useResumeStore((s) => s.data.experience);
  const add = useResumeStore((s) => s.addExperience);
  const update = useResumeStore((s) => s.updateExperience);
  const remove = useResumeStore((s) => s.removeExperience);

  useEffect(() => {
    const handler = (e: Event) => {
      const { section, content, itemId } = (e as CustomEvent).detail;
      if (section !== "experience" || !content) return;
      if (itemId) {
        update(itemId, { description: content });
      } else if (experience.length > 0) {
        update(experience[experience.length - 1].id, { description: content });
      } else {
        add();
        const items = useResumeStore.getState().data.experience;
        if (items.length > 0) update(items[items.length - 1].id, { description: content });
      }
    };
    window.addEventListener("ai-autofill", handler);
    return () => window.removeEventListener("ai-autofill", handler);
  }, [update, experience, add]);

  return (
    <Card>
      <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">{t("title")}</CardTitle>
        <Button variant="outline" size="sm" onClick={add}>
          <Plus size={14} className="mr-1" />
          {t("add")}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {experience.map((exp) => (
          <div key={exp.id} className="border border-border rounded-md p-3 space-y-2 relative">
            <div className="flex items-center gap-1 absolute left-1 top-1">
              <GripVertical size={14} className="text-muted-foreground cursor-grab" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-5">
              <div className="space-y-1">
                <Label className="text-xs">{t("jobTitle")}</Label>
                <Input
                  value={exp.jobTitle}
                  onChange={(e) => update(exp.id, { jobTitle: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t("company")}</Label>
                <Input
                  value={exp.company}
                  onChange={(e) => update(exp.id, { company: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exp.current}
                    onChange={(e) => update(exp.id, { current: e.target.checked })}
                    className="rounded"
                  />
                  {t("current")}
                </label>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t("description")}</Label>
              <textarea
                value={exp.description}
                onChange={(e) => update(exp.id, { description: e.target.value })}
                placeholder={t("descriptionPlaceholder")}
                className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                rows={2}
              />
            </div>
            <div className="flex items-center gap-1 absolute top-1 right-1">
              <AIAssistButton section="experience" itemId={exp.id} />
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
