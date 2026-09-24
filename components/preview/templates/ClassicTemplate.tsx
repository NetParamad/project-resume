"use client";

import type { ResumeData } from "@/lib/types/resume";
import { useResumeTranslator } from "@/lib/resume-lang-context";

export function ClassicTemplate({ data }: { data: ResumeData }) {
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
    <div className="p-6 text-sm text-gray-900">
      <div
        className="text-center mb-5 border-b-2 border-gray-900 pb-3"
        style={{ borderColor: accentColor }}
      >
        {personalInfo.avatar && (
          <img
            src={personalInfo.avatar}
            alt=""
            className="w-20 h-20 rounded-full object-cover mx-auto mb-2"
          />
        )}
        <h1 className="text-2xl font-serif font-bold tracking-tight">
          {personalInfo.fullName || t("yourName")}
        </h1>
        {personalInfo.occupation && (
          <p className="text-sm text-gray-500 mt-1 font-serif">
            {personalInfo.occupation}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-gray-600 mt-2 font-serif">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
      </div>

      {summary && (
        <div className="mb-4">
          <h2
            className="text-base font-serif font-bold tracking-wide border-b border-gray-300 pb-1 mb-2 uppercase"
            style={{ color: accentColor, borderColor: accentColor }}
          >
            {t("summary")}
          </h2>
          <p className="text-sm leading-relaxed italic">{summary}</p>
        </div>
      )}

      {experience.length > 0 && (
        <div className="mb-4">
          <h2
            className="text-base font-serif font-bold tracking-wide border-b border-gray-300 pb-1 mb-3 uppercase"
            style={{ color: accentColor, borderColor: accentColor }}
          >
            {t("experience")}
          </h2>
          {experience.map((exp) => (
            <div key={exp.id} className="mb-3">
              <div className="flex justify-between items-baseline">
                <div>
                  <p className="text-sm font-bold">{exp.jobTitle}</p>
                  <p className="text-sm font-serif italic">
                    {exp.company}
                    {exp.location ? `, ${exp.location}` : ""}
                  </p>
                </div>
                <p className="text-sm text-gray-500 shrink-0 font-serif">
                  {exp.startDate} – {exp.current ? t("present") : exp.endDate}
                </p>
              </div>
              {exp.description && (
                <p className="text-sm mt-1 leading-relaxed">
                  {exp.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {education.length > 0 && (
        <div className="mb-4">
          <h2
            className="text-base font-serif font-bold tracking-wide border-b border-gray-300 pb-1 mb-2 uppercase"
            style={{ color: accentColor, borderColor: accentColor }}
          >
            {t("education")}
          </h2>
          {education.map((edu) => (
            <div key={edu.id} className="mb-2">
              <div className="flex justify-between">
                <p className="text-sm font-bold">{edu.institution}</p>
                <p className="text-sm text-gray-500 font-serif">
                  {edu.startDate} – {edu.endDate}
                </p>
              </div>
              <p className="text-sm font-serif italic">
                {edu.degree} in {edu.field}
                {edu.gpa ? ` — ${t("gpa")}: ${edu.gpa}` : ""}
              </p>
            </div>
          ))}
        </div>
      )}

      {projects.length > 0 && (
        <div className="mb-4">
          <h2
            className="text-base font-serif font-bold tracking-wide border-b border-gray-300 pb-1 mb-2 uppercase"
            style={{ color: accentColor, borderColor: accentColor }}
          >
            {t("projects")}
          </h2>
          {projects.map((project) => (
            <div key={project.id} className="mb-2">
              <div className="flex justify-between items-baseline">
                <p className="text-sm font-bold">{project.name}</p>
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-serif hover:underline break-all"
                    style={{ color: accentColor }}
                  >
                    {project.url.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>
              {project.description && (
                <p className="text-sm mt-0.5 leading-relaxed">
                  {project.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {skills.length > 0 && (
          <div>
            <h2
              className="text-base font-serif font-bold tracking-wide border-b border-gray-300 pb-1 mb-2 uppercase"
              style={{ color: accentColor, borderColor: accentColor }}
            >
              {t("skills")}
            </h2>
            <div className="flex flex-wrap gap-1">
              {skills.map((s) => (
                <span
                  key={s.id}
                  className="text-sm px-2 py-0.5 bg-gray-100 rounded"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}
        {languages.length > 0 && (
          <div>
            <h2
              className="text-base font-serif font-bold tracking-wide border-b border-gray-300 pb-1 mb-2 uppercase"
              style={{ color: accentColor, borderColor: accentColor }}
            >
              {t("languages")}
            </h2>
            {languages.map((l) => (
              <p key={l.id} className="text-sm">
                {l.name} — {t(l.proficiency)}
              </p>
            ))}
          </div>
        )}
      </div>

      {certifications.length > 0 && (
        <div className="mb-4 mt-4">
          <h2
            className="text-base font-serif font-bold tracking-wide border-b border-gray-300 pb-1 mb-2 uppercase"
            style={{ color: accentColor, borderColor: accentColor }}
          >
            {t("certifications")}
          </h2>
          {certifications.map((cert) => (
            <p key={cert.id} className="text-sm">
              {cert.name} — {cert.issuer} ({cert.date})
            </p>
          ))}
        </div>
      )}

      {researchExperience && researchExperience.length > 0 && (
        <div className="mb-4 mt-4">
          <h2
            className="text-base font-serif font-bold tracking-wide border-b border-gray-300 pb-1 mb-2 uppercase"
            style={{ color: accentColor, borderColor: accentColor }}
          >
            {t("researchExperience")}
          </h2>
          {researchExperience.map((exp) => (
            <div key={exp.id} className="mb-2">
              <div className="flex justify-between items-baseline">
                <p className="text-sm font-bold">{exp.role}</p>
                <p className="text-sm text-gray-500 shrink-0 font-serif">
                  {exp.startDate} – {exp.current ? t("present") : exp.endDate}
                </p>
              </div>
              <p className="text-sm font-serif italic">
                {exp.institution}
                {exp.location ? `, ${exp.location}` : ""}
              </p>
              {exp.supervisor && (
                <p className="text-sm text-gray-500">
                  {t("supervisor")}: {exp.supervisor}
                </p>
              )}
              {exp.description && (
                <p className="text-sm mt-1 leading-relaxed">
                  {exp.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {teachingExperience && teachingExperience.length > 0 && (
        <div className="mb-4">
          <h2
            className="text-base font-serif font-bold tracking-wide border-b border-gray-300 pb-1 mb-2 uppercase"
            style={{ color: accentColor, borderColor: accentColor }}
          >
            {t("teachingExperience")}
          </h2>
          {teachingExperience.map((exp) => (
            <p key={exp.id} className="text-sm mb-1">
              {exp.courseName} — {exp.role} at {exp.institution} (
              {exp.startDate} – {exp.endDate})
              {exp.description ? ` — ${exp.description}` : ""}
            </p>
          ))}
        </div>
      )}

      {publications && publications.length > 0 && (
        <div className="mb-4">
          <h2
            className="text-base font-serif font-bold tracking-wide border-b border-gray-300 pb-1 mb-2 uppercase"
            style={{ color: accentColor, borderColor: accentColor }}
          >
            {t("publications")}
          </h2>
          {publications.map((pub) => (
            <div key={pub.id} className="mb-2 text-sm">
              <p className="italic">&ldquo;{pub.title}&rdquo;</p>
              <p className="text-gray-700">{pub.authors}</p>
              <p className="text-sm text-gray-500 font-serif">
                {pub.journal}
                {pub.volume ? `, ${pub.volume}` : ""}
                {pub.pages ? `, ${t("pages")} ${pub.pages}` : ""} ({pub.year})
              </p>
              {pub.doi && (
                <p className="text-sm text-gray-500">
                  {t("doi")}: {pub.doi}
                </p>
              )}
              {pub.url && (
                <a
                  href={pub.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm hover:underline break-all"
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
        <div className="mb-4">
          <h2
            className="text-base font-serif font-bold tracking-wide border-b border-gray-300 pb-1 mb-2 uppercase"
            style={{ color: accentColor, borderColor: accentColor }}
          >
            {t("awards")}
          </h2>
          {awards.map((award) => (
            <p key={award.id} className="text-sm mb-1">
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
            className="text-base font-serif font-bold tracking-wide border-b border-gray-300 pb-1 mb-2 uppercase"
            style={{ color: accentColor, borderColor: accentColor }}
          >
            {t("references")}
          </h2>
          {references.map((ref) => (
            <div key={ref.id} className="mb-1 text-sm">
              <p className="font-bold">{ref.name}</p>
              <p className="font-serif italic text-gray-700">
                {ref.title}
                {ref.company ? `, ${ref.company}` : ""}
              </p>
              {[ref.email, ref.phone].filter(Boolean).length > 0 && (
                <p className="text-sm text-gray-500">
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
