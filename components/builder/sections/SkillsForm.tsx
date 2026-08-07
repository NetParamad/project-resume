"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useResumeStore } from "@/lib/store/resume-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIAssistButton } from "@/components/ai/AIAssistButton";
import { Plus, Trash2 } from "lucide-react";
import type { Skill } from "@/lib/types/resume";

const levels: Skill["level"][] = ["beginner", "intermediate", "advanced", "expert"];

export function SkillsForm() {
  const t = useTranslations("builder.skills");
  const skills = useResumeStore((s) => s.data.skills);
  const add = useResumeStore((s) => s.addSkill);
  const update = useResumeStore((s) => s.updateSkill);
  const remove = useResumeStore((s) => s.removeSkill);

  useEffect(() => {
    const handler = (e: Event) => {
      const { section, content, itemId } = (e as CustomEvent).detail;
      if (section !== "skills" || !content) return;
      if (itemId) {
        update(itemId, { name: content });
      } else {
        content.split(",").map((s: string) => s.trim()).filter(Boolean).forEach((name: string) => {
          add();
          const items = useResumeStore.getState().data.skills;
          if (items.length > 0) update(items[items.length - 1].id, { name });
        });
      }
    };
    window.addEventListener("ai-autofill", handler);
    return () => window.removeEventListener("ai-autofill", handler);
  }, [add, update]);

  return (
    <Card>
      <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">{t("title")}</CardTitle>
        <div className="flex items-center gap-2">
          <AIAssistButton section="skills" />
          <Button variant="outline" size="sm" onClick={add}>
            <Plus size={14} className="mr-1" />
            {t("add")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {skills.map((skill) => (
          <div key={skill.id} className="flex items-center gap-2">
            <Input
              value={skill.name}
              onChange={(e) => update(skill.id, { name: e.target.value })}
              placeholder={t("placeholder")}
              className="h-8 text-sm flex-1"
            />
            <select
              value={skill.level}
              onChange={(e) =>
                update(skill.id, { level: e.target.value as Skill["level"] })
              }
              className="h-8 text-sm rounded-md border border-input bg-background px-2"
            >
              {levels.map((l) => (
                <option key={l} value={l}>
                  {t(l)}
                </option>
              ))}
            </select>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => remove(skill.id)}
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
