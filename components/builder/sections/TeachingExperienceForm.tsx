"use client";

import { useTranslations } from "next-intl";
import { useResumeStore } from "@/lib/store/resume-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIAssistButton } from "@/components/ai/AIAssistButton";
import { MonthYearField } from "@/components/ui/MonthYearField";
import { useAiAutofillListener } from "@/lib/hooks/use-ai-autofill-listener";
import { Plus, Trash2 } from "lucide-react";
import type { TeachingExperience } from "@/lib/types/resume";

export function TeachingExperienceForm() {
  const t = useTranslations("builder.teachingExperience");
  const items = useResumeStore((s) => s.data.teachingExperience);
  const add = useResumeStore((s) => s.addTeachingExperience);
  const update = useResumeStore((s) => s.updateTeachingExperience);
  const remove = useResumeStore((s) => s.removeTeachingExperience);

  useAiAutofillListener<TeachingExperience>("teachingExperience", update, add);

  return (
    <Card>
      <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">{t("title")}</CardTitle>
        <div className="flex items-center gap-2">
          <AIAssistButton section="teachingExperience" />
          <Button variant="outline" size="sm" onClick={add}>
            <Plus size={14} className="mr-1" />
            {t("add")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {(items || []).map((exp) => (
          <Card key={exp.id} className="rounded-md shadow-none">
            <CardContent className="p-3 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">{t("courseName")}</Label>
                  <Input
                    value={exp.courseName}
                    onChange={(e) =>
                      update(exp.id, { courseName: e.target.value })
                    }
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t("institution")}</Label>
                  <Input
                    value={exp.institution}
                    onChange={(e) =>
                      update(exp.id, { institution: e.target.value })
                    }
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t("role")}</Label>
                  <Input
                    value={exp.role}
                    onChange={(e) => update(exp.id, { role: e.target.value })}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t("startDate")}</Label>
                  <MonthYearField
                    value={exp.startDate}
                    onChange={(v) => update(exp.id, { startDate: v })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t("endDate")}</Label>
                  <MonthYearField
                    value={exp.endDate}
                    onChange={(v) => update(exp.id, { endDate: v })}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t("description")}</Label>
                <textarea
                  value={exp.description}
                  onChange={(e) =>
                    update(exp.id, { description: e.target.value })
                  }
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
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
