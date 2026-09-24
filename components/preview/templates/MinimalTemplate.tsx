"use client";

import type { ResumeData } from "@/lib/types/resume";
import { useResumeTranslator } from "@/lib/resume-lang-context";

export function MinimalTemplate({ data }: { data: ResumeData }) {
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
    <div className="p-4 sm:p-6 text-sm text-gray-900 max-w-[600px] mx-auto">
      <div className="mb-6">
        {personalInfo.avatar && (
          <img
            src={personalInfo.avatar}
            alt=""
            className="w-14 h-14 rounded-full object-cover mx-auto mb-2"
          />
        )}
        <h1 className="text-lg font-light tracking-[0.2em] uppercase">
          {personalInfo.fullName || t("yourName")}
        </h1>
        {personalInfo.occupation && (
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">
            {personalInfo.occupation}
          </p>
        )}
        <div
          className="h-px bg-gray-300 my-3"
          style={{ backgroundColor: accentColor }}
        />
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-gray-500 uppercase tracking-wider">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
      </div>

      {summary && (
        <div className="mb-5">
          <h2
            className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-2"
            style={{ color: accentColor }}
          >
            {t("summary")}
          </h2>
          <p className="text-xs leading-relaxed text-gray-600">{summary}</p>
        </div>
      )}

      {experience.length > 0 && (
        <div className="mb-5">
          <h2
            className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-3"
            style={{ color: accentColor }}
          >
            {t("experience")}
          </h2>
          {experience.map((exp) => (
            <div key={exp.id} className="mb-3">
              <div className="flex justify-between items-baseline">
                <p className="text-xs font-medium">{exp.jobTitle}</p>
                <p className="text-[10px] text-gray-400">
                  {exp.startDate} – {exp.current ? t("present") : exp.endDate}
                </p>
              </div>
              <p className="text-[10px] text-gray-500">{exp.company}</p>
              {exp.description && (
                <p className="text-xs mt-1 leading-relaxed text-gray-600">
                  {exp.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {education.length > 0 && (
        <div className="mb-5">
          <h2
            className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-3"
            style={{ color: accentColor }}
          >
            {t("education")}
          </h2>
          {education.map((edu) => (
            <div key={edu.id} className="mb-2">
              <div className="flex justify-between items-baseline">
                <p className="text-xs font-medium">{edu.degree}</p>
                <p className="text-[10px] text-gray-400">
                  {edu.startDate} – {edu.endDate}
                </p>
              </div>
              <p className="text-[10px] text-gray-500">
                {edu.institution}, {edu.field}
                {edu.gpa ? ` — ${t("gpa")}: ${edu.gpa}` : ""}
              </p>
            </div>
          ))}
        </div>
      )}

      {certifications.length > 0 && (
        <div className="mb-5">
          <h2
            className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-2"
            style={{ color: accentColor }}
          >
            {t("certifications")}
          </h2>
          {certifications.map((cert) => (
            <p key={cert.id} className="text-xs text-gray-600">
              {cert.name} — {cert.issuer} ({cert.date})
            </p>
          ))}
        </div>
      )}

      {skills.length > 0 && (
        <div className="mb-5">
          <h2
            className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-2"
            style={{ color: accentColor }}
          >
            {t("skills")}
          </h2>
          <p className="text-xs text-gray-600">
            {skills.map((s) => s.name).join(" \u2022 ")}
          </p>
        </div>
      )}

      {languages.length > 0 && (
        <div className="mb-5">
          <h2
            className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-2"
            style={{ color: accentColor }}
          >
            {t("languages")}
          </h2>
          {languages.map((l) => (
            <p key={l.id} className="text-xs text-gray-600">
              {l.name} — {t(l.proficiency)}
            </p>
          ))}
        </div>
      )}

      {projects.length > 0 && (
        <div className="mb-5">
          <h2
            className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-3"
            style={{ color: accentColor }}
          >
            {t("projects")}
          </h2>
          {projects.map((p) => (
            <div key={p.id} className="mb-2">
              <p className="text-xs font-medium">{p.name}</p>
              {p.description && (
                <p className="text-xs mt-0.5 text-gray-600">{p.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {researchExperience && researchExperience.length > 0 && (
        <div className="mb-5">
          <h2
            className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-2"
            style={{ color: accentColor }}
          >
            {t("researchExperience")}
          </h2>
          {researchExperience.map((exp) => (
            <div key={exp.id} className="mb-2">
              <div className="flex justify-between items-baseline">
                <p className="text-xs font-medium">{exp.role}</p>
                <p className="text-[10px] text-gray-400">
                  {exp.startDate} – {exp.current ? t("present") : exp.endDate}
                </p>
              </div>
              <p className="text-[10px] text-gray-500">
                {exp.institution}
                {exp.location ? `, ${exp.location}` : ""}
              </p>
              {exp.supervisor && (
                <p className="text-[10px] text-gray-500">
                  {t("supervisor")}: {exp.supervisor}
                </p>
              )}
              {exp.description && (
                <p className="text-xs mt-0.5 leading-relaxed text-gray-600">
                  {exp.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {teachingExperience && teachingExperience.length > 0 && (
        <div className="mb-5">
          <h2
            className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-2"
            style={{ color: accentColor }}
          >
            {t("teachingExperience")}
          </h2>
          {teachingExperience.map((exp) => (
            <p key={exp.id} className="text-xs text-gray-600 mb-1">
              {exp.courseName} — {exp.role} at {exp.institution} (
              {exp.startDate} – {exp.endDate})
              {exp.description ? ` — ${exp.description}` : ""}
            </p>
          ))}
        </div>
      )}

      {publications && publications.length > 0 && (
        <div className="mb-5">
          <h2
            className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-2"
            style={{ color: accentColor }}
          >
            {t("publications")}
          </h2>
          {publications.map((pub) => (
            <div key={pub.id} className="mb-2">
              <p className="text-xs text-gray-600 italic">
                &ldquo;{pub.title}&rdquo;
              </p>
              <p className="text-[10px] text-gray-500">{pub.authors}</p>
              <p className="text-[10px] text-gray-500">
                {pub.journal}
                {pub.volume ? `, ${pub.volume}` : ""}
                {pub.pages ? `, ${t("pages")} ${pub.pages}` : ""} ({pub.year})
              </p>
              {pub.doi && (
                <p className="text-[10px] text-gray-400">
                  {t("doi")}: {pub.doi}
                </p>
              )}
              {pub.url && (
                <a
                  href={pub.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] hover:underline break-all"
                  style={{ color: accentColor }}
                >
                  {pub.url.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {awards && awards.length > 0 && (
        <div className="mb-5">
          <h2
            className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-2"
            style={{ color: accentColor }}
          >
            {t("awards")}
          </h2>
          {awards.map((award) => (
            <p key={award.id} className="text-xs text-gray-600 mb-1">
              {award.name} — {award.issuer}
              {award.date ? ` (${award.date})` : ""}
              {award.description ? ` — ${award.description}` : ""}
            </p>
          ))}
        </div>
      )}

      {references && references.length > 0 && (
        <div>
          <h2
            className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-2"
            style={{ color: accentColor }}
          >
            {t("references")}
          </h2>
          {references.map((ref) => (
            <div key={ref.id} className="mb-1">
              <p className="text-xs font-medium text-gray-900">{ref.name}</p>
              <p className="text-[10px] text-gray-500">
                {ref.title}
                {ref.company ? `, ${ref.company}` : ""}
              </p>
              {[ref.email, ref.phone].filter(Boolean).length > 0 && (
                <p className="text-[10px] text-gray-400">
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
