"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useResumeStore } from "@/lib/store/resume-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIAssistButton } from "@/components/ai/AIAssistButton";
import { splitFields } from "@/lib/ai/split-fields";
import { Plus, Trash2 } from "lucide-react";
import type { Publication } from "@/lib/types/resume";

export function PublicationsForm() {
  const t = useTranslations("builder.publications");
  const pubs = useResumeStore((s) => s.data.publications);
  const add = useResumeStore((s) => s.addPublication);
  const update = useResumeStore((s) => s.updatePublication);
  const remove = useResumeStore((s) => s.removePublication);

  useEffect(() => {
    const handler = (e: Event) => {
      const { section, content, itemId } = (e as CustomEvent).detail as {
        section: string;
        content: string;
        itemId?: string;
      };
      if (section !== "publications" || !content) return;
      const patch: Partial<Publication> = splitFields(content, [
        "title",
        "authors",
        "journal",
        "year",
      ]);
      if (itemId) {
        update(itemId, patch);
        return;
      }
      const list = useResumeStore.getState().data.publications ?? [];
      if (list.length > 0) {
        update(list[list.length - 1].id, patch);
      } else {
        add();
        const after = useResumeStore.getState().data.publications ?? [];
        if (after.length > 0) update(after[after.length - 1].id, patch);
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
        {(pubs || []).map((pub) => (
          <div key={pub.id} className="border border-border rounded-md p-3 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="sm:col-span-2 space-y-1">
                <Label className="text-xs">{t("titleLabel")}</Label>
                <Input
                  value={pub.title}
                  onChange={(e) => update(pub.id, { title: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t("authors")}</Label>
                <Input
                  value={pub.authors}
                  onChange={(e) => update(pub.id, { authors: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t("journal")}</Label>
                <Input
                  value={pub.journal}
                  onChange={(e) => update(pub.id, { journal: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t("year")}</Label>
                <Input
                  value={pub.year}
                  onChange={(e) => update(pub.id, { year: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t("volume")}</Label>
                <Input
                  value={pub.volume}
                  onChange={(e) => update(pub.id, { volume: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t("pages")}</Label>
                <Input
                  value={pub.pages}
                  onChange={(e) => update(pub.id, { pages: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t("doi")}</Label>
                <Input
                  value={pub.doi}
                  onChange={(e) => update(pub.id, { doi: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t("url")}</Label>
                <Input
                  value={pub.url}
                  onChange={(e) => update(pub.id, { url: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <div className="flex items-center gap-1 justify-end">
              <AIAssistButton section="publications" itemId={pub.id} />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => remove(pub.id)}
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
