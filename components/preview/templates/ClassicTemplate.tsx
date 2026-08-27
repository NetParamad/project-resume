"use client";

import type { ResumeData } from "@/lib/types/resume";
import { useResumeTranslator } from "@/lib/resume-lang-context";

export function ClassicTemplate({ data }: { data: ResumeData }) {
  const { personalInfo, summary, experience, education, skills, certifications, languages, theme } = data;
  const accentColor = theme?.accentColor ?? "#f97316";
  const t = useResumeTranslator(data);

  return (
    <div className="p-6 text-sm text-gray-900">
      <div className="text-center mb-5 border-b-2 border-gray-900 pb-3" style={{ borderColor: accentColor }}>
        {personalInfo.avatar && (
          <img src={personalInfo.avatar} alt="" className="w-20 h-20 rounded-full object-cover mx-auto mb-2" />
        )}
        <h1 className="text-2xl font-serif font-bold tracking-tight">{personalInfo.fullName || t("yourName")}</h1>
        {personalInfo.occupation && <p className="text-sm text-gray-500 mt-1 font-serif">{personalInfo.occupation}</p>}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-gray-600 mt-2 font-serif">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
      </div>

      {summary && (
        <div className="mb-4">
          <h2 className="text-base font-serif font-bold tracking-wide border-b border-gray-300 pb-1 mb-2 uppercase" style={{ color: accentColor, borderColor: accentColor }}>{t("summary")}</h2>
          <p className="text-sm leading-relaxed italic">{summary}</p>
        </div>
      )}

      {experience.length > 0 && (
        <div className="mb-4">
          <h2 className="text-base font-serif font-bold tracking-wide border-b border-gray-300 pb-1 mb-3 uppercase" style={{ color: accentColor, borderColor: accentColor }}>{t("experience")}</h2>
          {experience.map((exp) => (
            <div key={exp.id} className="mb-3">
              <div className="flex justify-between items-baseline">
                <div>
                  <p className="text-sm font-bold">{exp.jobTitle}</p>
                  <p className="text-sm font-serif italic">{exp.company}{exp.location ? `, ${exp.location}` : ""}</p>
                </div>
                <p className="text-sm text-gray-500 shrink-0 font-serif">
                  {exp.startDate} – {exp.current ? t("present") : exp.endDate}
                </p>
              </div>
              {exp.description && (
                <p className="text-sm mt-1 leading-relaxed">{exp.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {education.length > 0 && (
        <div className="mb-4">
          <h2 className="text-base font-serif font-bold tracking-wide border-b border-gray-300 pb-1 mb-2 uppercase" style={{ color: accentColor, borderColor: accentColor }}>{t("education")}</h2>
          {education.map((edu) => (
            <div key={edu.id} className="mb-2">
              <div className="flex justify-between">
                <p className="text-sm font-bold">{edu.institution}</p>
                <p className="text-sm text-gray-500 font-serif">{edu.startDate} – {edu.endDate}</p>
              </div>
              <p className="text-sm font-serif italic">{edu.degree} in {edu.field}{edu.gpa ? ` — ${t("gpa")}: ${edu.gpa}` : ""}</p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {skills.length > 0 && (
          <div>
            <h2 className="text-base font-serif font-bold tracking-wide border-b border-gray-300 pb-1 mb-2 uppercase" style={{ color: accentColor, borderColor: accentColor }}>{t("skills")}</h2>
            <div className="flex flex-wrap gap-1">
              {skills.map((s) => (
                <span key={s.id} className="text-sm px-2 py-0.5 bg-gray-100 rounded">{s.name}</span>
              ))}
            </div>
          </div>
        )}
        {languages.length > 0 && (
          <div>
            <h2 className="text-base font-serif font-bold tracking-wide border-b border-gray-300 pb-1 mb-2 uppercase" style={{ color: accentColor, borderColor: accentColor }}>{t("languages")}</h2>
            {languages.map((l) => (
              <p key={l.id} className="text-sm">{l.name} — {l.proficiency}</p>
            ))}
          </div>
        )}
      </div>

      {certifications.length > 0 && (
        <div className="mb-4 mt-4">
          <h2 className="text-base font-serif font-bold tracking-wide border-b border-gray-300 pb-1 mb-2 uppercase" style={{ color: accentColor, borderColor: accentColor }}>{t("certifications")}</h2>
          {certifications.map((cert) => (
            <p key={cert.id} className="text-sm">{cert.name} — {cert.issuer} ({cert.date})</p>
          ))}
        </div>
      )}
    </div>
  );
}
