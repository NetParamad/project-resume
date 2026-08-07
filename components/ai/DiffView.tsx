"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2, GitCompareArrows } from "lucide-react";
import type { ResumeData } from "@/lib/types/resume";
import { sectionTitle, renderValue } from "./section-utils";

export interface SectionChange {
  section: string;
  previous: unknown;
  current: unknown;
}

const DIFF_SECTIONS: Array<keyof ResumeData> = [
  "summary",
  "experience",
  "education",
  "skills",
  "certifications",
  "projects",
  "languages",
  "references",
  "publications",
  "researchExperience",
  "teachingExperience",
  "awards",
];

export function computeChanges(
  original: ResumeData,
  updated: ResumeData,
): SectionChange[] {
  const changes: SectionChange[] = [];
  for (const section of DIFF_SECTIONS) {
    const prev = original[section];
    const next = updated[section];
    if (JSON.stringify(prev ?? null) !== JSON.stringify(next ?? null)) {
      changes.push({ section, previous: prev, current: next });
    }
  }
  return changes;
}

export function DiffView({
  original,
  updated,
}: {
  original: ResumeData;
  updated: ResumeData;
}) {
  const t = useTranslations("ai");
  const builderT = useTranslations("builder");
  const changes = computeChanges(original, updated);

  if (changes.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <CheckCircle2 size={16} />
        {t("noChanges")}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium flex items-center gap-2">
        <GitCompareArrows size={14} className="text-muted-foreground" />
        {t("sectionsChanged", { count: changes.length })}
      </h4>
      <div className="space-y-2 max-h-[260px] overflow-y-auto">
        {changes.map((change, i) => (
          <div key={i} className="rounded-md border border-border p-2 text-xs">
            <div className="font-medium text-foreground mb-1">
              {sectionTitle(builderT, change.section)}
            </div>
            <div className="text-muted-foreground line-through decoration-red-400/60">
              {renderValue(change.section, change.previous) || "—"}
            </div>
            <div className="text-foreground">
              {renderValue(change.section, change.current) || "—"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
