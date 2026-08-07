"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useResumeStore } from "@/lib/store/resume-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIAssistButton } from "@/components/ai/AIAssistButton";
import { Plus, Trash2 } from "lucide-react";

export function AwardsForm() {
  const t = useTranslations("builder.awards");
  const items = useResumeStore((s) => s.data.awards);
  const add = useResumeStore((s) => s.addAward);
  const update = useResumeStore((s) => s.updateAward);
  const remove = useResumeStore((s) => s.removeAward);

  useEffect(() => {
    const handler = (e: Event) => {
      const { section, content, itemId } = (e as CustomEvent).detail;
      if (section !== "awards" || !content) return;
      if (itemId) {
        update(itemId, { description: content });
        return;
      }
      const list = useResumeStore.getState().data.awards ?? [];
      if (list.length > 0) {
        update(list[list.length - 1].id, { description: content });
      } else {
        add();
        const after = useResumeStore.getState().data.awards ?? [];
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
        <Button variant="outline" size="sm" onClick={add}>
          <Plus size={14} className="mr-1" />
          {t("add")}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {(items || []).map((award) => (
          <div key={award.id} className="border border-border rounded-md p-3 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">{t("name")}</Label>
                <Input
                  value={award.name}
                  onChange={(e) => update(award.id, { name: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t("issuer")}</Label>
                <Input
                  value={award.issuer}
                  onChange={(e) => update(award.id, { issuer: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t("date")}</Label>
                <Input
                  type="month"
                  value={award.date}
                  onChange={(e) => update(award.id, { date: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t("description")}</Label>
              <textarea
                value={award.description}
                onChange={(e) => update(award.id, { description: e.target.value })}
                className="w-full min-h-[60px] rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-center gap-1 justify-end">
              <AIAssistButton section="awards" itemId={award.id} />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => remove(award.id)}
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
