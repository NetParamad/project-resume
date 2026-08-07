"use client";

import { useTranslations } from "next-intl";
import { useResumeStore } from "@/lib/store/resume-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import type { Language } from "@/lib/types/resume";

const proficiencies: Language["proficiency"][] = [
  "native",
  "fluent",
  "advanced",
  "intermediate",
  "basic",
];

export function LanguagesForm() {
  const t = useTranslations("builder.languages");
  const languages = useResumeStore((s) => s.data.languages);
  const add = useResumeStore((s) => s.addLanguage);
  const update = useResumeStore((s) => s.updateLanguage);
  const remove = useResumeStore((s) => s.removeLanguage);

  return (
    <Card>
      <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">{t("title")}</CardTitle>
        <Button variant="outline" size="sm" onClick={add}>
          <Plus size={14} className="mr-1" />
          {t("add")}
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {languages.map((lang) => (
          <div key={lang.id} className="flex items-center gap-2">
            <Input
              value={lang.name}
              onChange={(e) => update(lang.id, { name: e.target.value })}
              placeholder={t("language")}
              className="h-8 text-sm flex-1"
            />
            <select
              value={lang.proficiency}
              onChange={(e) =>
                update(lang.id, {
                  proficiency: e.target.value as Language["proficiency"],
                })
              }
              className="h-8 text-sm rounded-md border border-input bg-background px-2"
            >
              {proficiencies.map((p) => (
                <option key={p} value={p}>
                  {t(p)}
                </option>
              ))}
            </select>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => remove(lang.id)}
              className="text-destructive hover:text-destructive shrink-0"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
