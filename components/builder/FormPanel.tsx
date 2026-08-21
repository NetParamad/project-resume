"use client";

import { useTranslations } from "next-intl";
import { useResumeStore } from "@/lib/store/resume-store";
import { PersonalInfoForm } from "./sections/PersonalInfoForm";
import { SummaryForm } from "./sections/SummaryForm";
import { WorkExperienceForm } from "./sections/WorkExperienceForm";
import { EducationForm } from "./sections/EducationForm";
import { SkillsForm } from "./sections/SkillsForm";
import { CertificationsForm } from "./sections/CertificationsForm";
import { ProjectsForm } from "./sections/ProjectsForm";
import { LanguagesForm } from "./sections/LanguagesForm";
import { ReferencesForm } from "./sections/ReferencesForm";
import { PublicationsForm } from "./sections/PublicationsForm";
import { ResearchExperienceForm } from "./sections/ResearchExperienceForm";
import { TeachingExperienceForm } from "./sections/TeachingExperienceForm";
import { AwardsForm } from "./sections/AwardsForm";

const BASE_SECTIONS = [
  "personalInfo",
  "summary",
  "experience",
  "education",
  "skills",
  "certifications",
  "projects",
  "languages",
  "references",
] as const;

const CV_SECTIONS = ["researchExperience", "teachingExperience", "publications", "awards"] as const;

function Section({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div id={`section-${id}`} className="scroll-mt-16">
      {children}
    </div>
  );
}

export function FormPanel() {
  const t = useTranslations("builder");
  const documentType = useResumeStore((s) => s.documentType);
  const isCV = documentType === "cv";

  const sections = [...BASE_SECTIONS, ...(isCV ? CV_SECTIONS : [])];

  const scrollToSection = (key: string) => {
    document.getElementById(`section-${key}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div id="form-panel" className="pb-8">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-2 flex gap-1.5 overflow-x-auto">
        {sections.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => scrollToSection(key)}
            className="shrink-0 text-xs px-2.5 py-1 rounded-full border border-border text-foreground hover:text-foreground hover:border-primary/50 transition-colors"
          >
            {t(`${key}.title`)}
          </button>
        ))}
      </div>
      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        <h2 className="text-lg font-semibold mb-4">{t("form")}</h2>
        <Section id="personalInfo">
          <PersonalInfoForm />
        </Section>
        <Section id="summary">
          <SummaryForm />
        </Section>
        <Section id="experience">
          <WorkExperienceForm />
        </Section>
        <Section id="education">
          <EducationForm />
        </Section>
        <Section id="skills">
          <SkillsForm />
        </Section>
        {isCV && (
          <Section id="researchExperience">
            <ResearchExperienceForm />
          </Section>
        )}
        {isCV && (
          <Section id="teachingExperience">
            <TeachingExperienceForm />
          </Section>
        )}
        {isCV && (
          <Section id="publications">
            <PublicationsForm />
          </Section>
        )}
        {isCV && (
          <Section id="awards">
            <AwardsForm />
          </Section>
        )}
        <Section id="certifications">
          <CertificationsForm />
        </Section>
        <Section id="projects">
          <ProjectsForm />
        </Section>
        <Section id="languages">
          <LanguagesForm />
        </Section>
        <Section id="references">
          <ReferencesForm />
        </Section>
      </div>
    </div>
  );
}
