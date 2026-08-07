"use client";

import { useTranslations } from "next-intl";
import { useResumeStore } from "@/lib/store/resume-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

export function ReferencesForm() {
  const t = useTranslations("builder.references");
  const references = useResumeStore((s) => s.data.references);
  const add = useResumeStore((s) => s.addReference);
  const update = useResumeStore((s) => s.updateReference);
  const remove = useResumeStore((s) => s.removeReference);

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
        {references.map((ref) => (
          <div key={ref.id} className="border border-border rounded-md p-3 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">{t("name")}</Label>
                <Input
                  value={ref.name}
                  onChange={(e) => update(ref.id, { name: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t("title")}</Label>
                <Input
                  value={ref.title}
                  onChange={(e) => update(ref.id, { title: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">{t("company")}</Label>
                <Input
                  value={ref.company}
                  onChange={(e) => update(ref.id, { company: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t("email")}</Label>
                <Input
                  type="email"
                  value={ref.email}
                  onChange={(e) => update(ref.id, { email: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div className="w-full max-w-48 space-y-1">
                <Label className="text-xs">{t("phone")}</Label>
                <Input
                  value={ref.phone}
                  onChange={(e) => update(ref.id, { phone: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => remove(ref.id)}
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
