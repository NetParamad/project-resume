"use client";

import type { ResumeData } from "@/lib/types/resume";
import { useResumeTranslator } from "@/lib/resume-lang-context";

export function CreativeTemplate({ data }: { data: ResumeData }) {
  const { personalInfo, summary, experience, education, skills, certifications, projects, languages, theme } = data;
  const accentColor = theme?.accentColor ?? "#f97316";
  const t = useResumeTranslator(data);

  return (
    <div className="text-sm text-gray-900">
      <div
        className="p-6 text-white"
        style={{ backgroundColor: accentColor }}
      >
        {personalInfo.avatar && (
          <img src={personalInfo.avatar} alt="" className="w-16 h-16 rounded-full object-cover mb-2 border-2 border-white/30" />
        )}
        <h1 className="text-xl font-extrabold tracking-tight">{personalInfo.fullName || t("yourName")}</h1>
        {personalInfo.occupation && <p className="text-[11px] text-white/70 mt-0.5">{personalInfo.occupation}</p>}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-white/80 mt-2">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.linkedin && <span className="break-all">{personalInfo.linkedin}</span>}
          {personalInfo.portfolio && <span className="break-all">{personalInfo.portfolio}</span>}
        </div>
        {summary && (
          <p className="text-xs mt-3 leading-relaxed text-white/90 italic border-t border-white/20 pt-3">
            {summary}
          </p>
        )}
      </div>

      <div className="p-5 space-y-4">
        {experience.length > 0 && (
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: accentColor }}>{t("experience")}</h2>
            {experience.map((exp) => (
              <div key={exp.id} className="mb-3 pl-3 border-l-2" style={{ borderColor: accentColor }}>
                <div className="flex justify-between items-baseline">
                  <p className="text-sm font-bold">{exp.jobTitle}</p>
                  <p className="text-[10px] text-gray-500">{exp.startDate} – {exp.current ? t("present") : exp.endDate}</p>
                </div>
                <p className="text-xs" style={{ color: accentColor }}>{exp.company}</p>
                {exp.description && <p className="text-xs mt-1 leading-relaxed">{exp.description}</p>}
              </div>
            ))}
          </div>
        )}

        {education.length > 0 && (
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: accentColor }}>{t("education")}</h2>
            {education.map((edu) => (
              <div key={edu.id} className="mb-2">
                <p className="text-sm font-bold">{edu.degree}</p>
                <p className="text-xs text-gray-600">{edu.institution} — {edu.field}</p>
              </div>
            ))}
          </div>
        )}

        {skills.length > 0 && (
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: accentColor }}>{t("skills")}</h2>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span
                  key={s.id}
                  className="text-[10px] font-medium px-2.5 py-1 rounded-full text-white"
                  style={{ backgroundColor: accentColor }}
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {projects.length > 0 && (
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: accentColor }}>{t("projects")}</h2>
            {projects.map((p) => (
              <div key={p.id} className="mb-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold">{p.name}</p>
                  {p.url && (
                    <a href={p.url} target="_blank" rel="noreferrer" className="text-[10px] underline" style={{ color: accentColor }}>
                      {t("view")}
                    </a>
                  )}
                </div>
                {p.description && <p className="text-xs mt-0.5 leading-relaxed">{p.description}</p>}
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {certifications.length > 0 && (
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: accentColor }}>{t("certifications")}</h2>
              {certifications.map((cert) => (
                <p key={cert.id} className="text-xs mb-1">{cert.name} <span className="text-gray-500">({cert.date})</span></p>
              ))}
            </div>
          )}
          {languages.length > 0 && (
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: accentColor }}>{t("languages")}</h2>
              {languages.map((l) => (
                <p key={l.id} className="text-xs mb-1">{l.name} — {l.proficiency}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
