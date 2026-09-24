"use client";

import type { ResumeData } from "@/lib/types/resume";
import { useResumeTranslator } from "@/lib/resume-lang-context";

interface CompactTemplateProps {
  data: ResumeData;
}

export function CompactTemplate({ data }: CompactTemplateProps) {
  const {
    personalInfo,
    summary,
    experience,
    education,
    skills,
    certifications,
    projects,
    languages,
    publications,
    researchExperience,
    teachingExperience,
    awards,
    references,
    theme,
  } = data;
  const accentColor = theme?.accentColor ?? "#f97316";
  const t = useResumeTranslator(data);

  return (
    <div className="p-5 text-sm text-gray-900 max-w-[600px] mx-auto">
      {/* Header */}
      <div className="text-center mb-4">
        {personalInfo.avatar && (
          <img
            src={personalInfo.avatar}
            alt=""
            className="w-14 h-14 rounded-full object-cover mx-auto mb-1"
          />
        )}
        <h1 className="text-lg font-bold tracking-tight">
          {personalInfo.fullName || t("yourName")}
        </h1>
        {personalInfo.occupation && (
          <p className="text-[11px] text-gray-500">{personalInfo.occupation}</p>
        )}
        <div className="flex flex-wrap justify-center gap-x-2 text-[11px] text-gray-500 mt-0.5">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
      </div>

      {summary && (
        <div className="mb-3">
          <h2
            className="text-[11px] font-semibold uppercase tracking-widest mb-1"
            style={{ color: accentColor }}
          >
            {t("summary")}
          </h2>
          <p className="text-[11px] leading-relaxed text-gray-700">{summary}</p>
        </div>
      )}

      {education.length > 0 && (
        <div className="mb-3">
          <h2
            className="text-[11px] font-semibold uppercase tracking-widest mb-1"
            style={{ color: accentColor }}
          >
            {t("education")}
          </h2>
          {education.map((edu) => (
            <div key={edu.id} className="mb-1">
              <p className="text-[12px] font-medium">{edu.degree}</p>
              <p className="text-[11px] text-gray-500">
                {edu.institution} • {edu.startDate} - {edu.endDate}
                {edu.gpa ? ` • ${t("gpa")}: ${edu.gpa}` : ""}
              </p>
            </div>
          ))}
        </div>
      )}

      {certifications.length > 0 && (
        <div className="mb-3">
          <h2
            className="text-[11px] font-semibold uppercase tracking-widest mb-1"
            style={{ color: accentColor }}
          >
            {t("certifications")}
          </h2>
          {certifications.map((cert) => (
            <p key={cert.id} className="text-[11px] mb-0.5">
              {cert.name} — {cert.issuer} ({cert.date})
            </p>
          ))}
        </div>
      )}

      {teachingExperience && teachingExperience.length > 0 && (
        <div className="mb-3">
          <h2
            className="text-[11px] font-semibold uppercase tracking-widest mb-1"
            style={{ color: accentColor }}
          >
            {t("teachingExperience")}
          </h2>
          {teachingExperience.map((exp) => (
            <div key={exp.id} className="mb-1">
              <p className="text-[12px] font-medium">
                {exp.courseName} — {exp.role}
              </p>
              <p className="text-[11px] text-gray-500">
                {exp.institution} • {exp.startDate} - {exp.endDate}
              </p>
            </div>
          ))}
        </div>
      )}

      {researchExperience && researchExperience.length > 0 && (
        <div className="mb-3">
          <h2
            className="text-[11px] font-semibold uppercase tracking-widest mb-1"
            style={{ color: accentColor }}
          >
            {t("research")}
          </h2>
          {researchExperience.map((exp) => (
            <div key={exp.id} className="mb-1">
              <p className="text-[12px] font-medium">
                {exp.role} — {exp.institution}
              </p>
              <p className="text-[11px] text-gray-500">
                {exp.startDate} - {exp.current ? t("present") : exp.endDate}
              </p>
            </div>
          ))}
        </div>
      )}

      {publications && publications.length > 0 && (
        <div className="mb-3">
          <h2
            className="text-[11px] font-semibold uppercase tracking-widest mb-1"
            style={{ color: accentColor }}
          >
            {t("publications")}
          </h2>
          {publications.slice(0, 3).map((pub) => (
            <p key={pub.id} className="text-[11px] mb-0.5">
              &ldquo;{pub.title}&rdquo; ({pub.year})
            </p>
          ))}
          {publications.length > 3 && (
            <p className="text-[11px] text-gray-400">
              +{publications.length - 3} {t("morePublications")}
            </p>
          )}
        </div>
      )}

      {experience.length > 0 && (
        <div className="mb-3">
          <h2
            className="text-[11px] font-semibold uppercase tracking-widest mb-1"
            style={{ color: accentColor }}
          >
            {t("experience")}
          </h2>
          {experience.map((exp) => (
            <div key={exp.id} className="mb-1">
              <p className="text-[12px] font-medium">
                {exp.jobTitle} — {exp.company}
              </p>
              <p className="text-[11px] text-gray-500">
                {exp.startDate} - {exp.current ? t("present") : exp.endDate}
              </p>
            </div>
          ))}
        </div>
      )}

      {projects.length > 0 && (
        <div className="mb-3">
          <h2
            className="text-[11px] font-semibold uppercase tracking-widest mb-1"
            style={{ color: accentColor }}
          >
            {t("projects")}
          </h2>
          {projects.map((p) => (
            <p key={p.id} className="text-[11px] mb-0.5">
              {p.name}
              {p.url ? ` — ${p.url.replace(/^https?:\/\//, "")}` : ""}
            </p>
          ))}
        </div>
      )}

      {awards && awards.length > 0 && (
        <div className="mb-3">
          <h2
            className="text-[11px] font-semibold uppercase tracking-widest mb-1"
            style={{ color: accentColor }}
          >
            {t("awards")}
          </h2>
          {awards.map((award) => (
            <p key={award.id} className="text-[11px]">
              {award.name} — {award.issuer}
            </p>
          ))}
        </div>
      )}

      {skills.length > 0 && (
        <div className="mb-3">
          <h2
            className="text-[11px] font-semibold uppercase tracking-widest mb-1"
            style={{ color: accentColor }}
          >
            {t("skills")}
          </h2>
          <p className="text-[11px] text-gray-700">
            {skills.map((s) => s.name).join(" • ")}
          </p>
        </div>
      )}

      {languages.length > 0 && (
        <div>
          <h2
            className="text-[11px] font-semibold uppercase tracking-widest mb-1"
            style={{ color: accentColor }}
          >
            {t("languages")}
          </h2>
          <p className="text-[11px] text-gray-700">
            {languages.map((l) => `${l.name} (${t(l.proficiency)})`).join(", ")}
          </p>
        </div>
      )}

      {references && references.length > 0 && (
        <div className="mt-3">
          <h2
            className="text-[11px] font-semibold uppercase tracking-widest mb-1"
            style={{ color: accentColor }}
          >
            {t("references")}
          </h2>
          {references.map((ref) => (
            <div key={ref.id} className="mb-1">
              <p className="text-[12px] font-medium">{ref.name}</p>
              <p className="text-[11px] text-gray-500">
                {ref.title}
                {ref.company ? `, ${ref.company}` : ""}
              </p>
              {[ref.email, ref.phone].filter(Boolean).length > 0 && (
                <p className="text-[11px] text-gray-500">
                  {ref.email}
                  {ref.email && ref.phone ? " • " : ""}
                  {ref.phone}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
