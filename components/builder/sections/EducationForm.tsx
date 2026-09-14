"use client";

import { useTranslations } from "next-intl";
import { useResumeStore } from "@/lib/store/resume-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

export function EducationForm() {
  const t = useTranslations("builder.education");
  const education = useResumeStore((s) => s.data.education);
  const add = useResumeStore((s) => s.addEducation);
  const update = useResumeStore((s) => s.updateEducation);
  const remove = useResumeStore((s) => s.removeEducation);

  return (
    <Card>
      <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">{t("title")}</CardTitle>
        <Button variant="outline" size="sm" onClick={add}>
          <Plus size={14} className="mr-1" />
          {t("add")}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {education.map((edu) => (
          <Card key={edu.id} className="rounded-md shadow-none">
            <CardContent className="p-3 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">{t("degree")}</Label>
                <Input
                  value={edu.degree}
                  onChange={(e) => update(edu.id, { degree: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t("institution")}</Label>
                <Input
                  value={edu.institution}
                  onChange={(e) => update(edu.id, { institution: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">{t("field")}</Label>
                <Input
                  value={edu.field}
                  onChange={(e) => update(edu.id, { field: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t("startDate")}</Label>
                <Input
                  type="month"
                  value={edu.startDate}
                  onChange={(e) => update(edu.id, { startDate: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t("endDate")}</Label>
                <Input
                  type="month"
                  value={edu.endDate}
                  min={edu.startDate || undefined}
                  onChange={(e) => update(edu.id, { endDate: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div className="w-full max-w-32 space-y-1">
                <Label className="text-xs">{t("gpa")}</Label>
                <Input
                  value={edu.gpa}
                  onChange={(e) => update(edu.id, { gpa: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(edu.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
