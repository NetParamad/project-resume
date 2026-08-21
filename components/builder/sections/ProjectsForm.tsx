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

export function ProjectsForm() {
  const t = useTranslations("builder.projects");
  const projects = useResumeStore((s) => s.data.projects);
  const add = useResumeStore((s) => s.addProject);
  const update = useResumeStore((s) => s.updateProject);
  const remove = useResumeStore((s) => s.removeProject);

  useEffect(() => {
    const handler = (e: Event) => {
      const { section, content, itemId } = (e as CustomEvent).detail;
      if (section !== "projects" || !content) return;
      if (itemId) {
        update(itemId, { description: content });
      } else if (projects.length > 0) {
        update(projects[projects.length - 1].id, { description: content });
      } else {
        add();
        const items = useResumeStore.getState().data.projects;
        if (items.length > 0) update(items[items.length - 1].id, { description: content });
      }
    };
    window.addEventListener("ai-autofill", handler);
    return () => window.removeEventListener("ai-autofill", handler);
  }, [update, projects, add]);

  return (
    <Card>
      <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">{t("title")}</CardTitle>
        <div className="flex items-center gap-2">
          <AIAssistButton section="projects" />
          <Button variant="outline" size="sm" onClick={add}>
            <Plus size={14} className="mr-1" />
            {t("add")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {projects.map((project) => (
          <Card key={project.id} className="rounded-md shadow-none">
            <CardContent className="p-3 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">{t("name")}</Label>
                <Input
                  value={project.name}
                  onChange={(e) => update(project.id, { name: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">URL</Label>
                <Input
                  value={project.url}
                  onChange={(e) => update(project.id, { url: e.target.value })}
                  placeholder="https://"
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t("description")}</Label>
              <textarea
                value={project.description}
                onChange={(e) => update(project.id, { description: e.target.value })}
                className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                rows={2}
              />
            </div>
            <div className="flex items-center gap-1">
              <AIAssistButton section="projects" itemId={project.id} />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => remove(project.id)}
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
