"use client";

import type { ResumeData } from "@/lib/types/resume";
import { useResumeTranslator } from "@/lib/resume-lang-context";
import { Mail, Phone } from "lucide-react";

interface ComprehensiveTemplateProps {
  data: ResumeData;
}

export function ComprehensiveTemplate({ data }: ComprehensiveTemplateProps) {
  const { personalInfo, summary, experience, education, skills, certifications, projects, languages, publications, researchExperience, teachingExperience, awards, theme } = data;
  const accentColor = theme?.accentColor ?? "#f97316";
  const t = useResumeTranslator(data);

  return (
    <div className="p-6 text-sm text-gray-900">
      {/* Header */}
      <div className="border-b-2 border-gray-800 pb-3 mb-5" style={{ borderColor: accentColor }}>
        {personalInfo.avatar && (
          <img src={personalInfo.avatar} alt="" className="w-16 h-16 rounded-full object-cover mb-2" />
        )}
        <h1 className="text-2xl font-bold">{personalInfo.fullName || t("yourName")}</h1>
        {personalInfo.occupation && <p className="text-xs text-gray-500 mt-0.5">{personalInfo.occupation}</p>}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 mt-1">
          {personalInfo.email && (
            <span className="inline-flex items-center gap-1">
              <Mail size={12} className="shrink-0" />
              {personalInfo.email}
            </span>
          )}
          {personalInfo.phone && (
            <span className="inline-flex items-center gap-1">
              <Phone size={12} className="shrink-0" />
              {personalInfo.phone}
            </span>
          )}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
          {personalInfo.portfolio && <span>{personalInfo.portfolio}</span>}
        </div>
      </div>

      {summary && (
        <div className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: accentColor }}>{t("summary")}</h2>
          <p className="text-xs leading-relaxed">{summary}</p>
        </div>
      )}

      {education.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: accentColor }}>{t("education")}</h2>
          {education.map((edu) => (
            <div key={edu.id} className="mb-2">
              <div className="flex justify-between">
                <p className="text-sm font-semibold">{edu.degree}</p>
                <p className="text-xs text-gray-500">{edu.startDate} - {edu.endDate}</p>
              </div>
              <p className="text-xs text-gray-600">{edu.institution} | {edu.field}{edu.gpa ? ` | ${t("gpa")}: ${edu.gpa}` : ""}</p>
            </div>
          ))}
        </div>
      )}

      {researchExperience && researchExperience.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: accentColor }}>{t("researchExperience")}</h2>
          {researchExperience.map((exp) => (
            <div key={exp.id} className="mb-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold">{exp.role}</p>
                  <p className="text-xs text-gray-600">{exp.institution}{exp.location ? `, ${exp.location}` : ""}</p>
                </div>
                <p className="text-xs text-gray-500 shrink-0">{exp.startDate} - {exp.current ? t("present") : exp.endDate}</p>
              </div>
              {exp.supervisor && <p className="text-xs text-gray-500 mt-0.5">{t("supervisor")}: {exp.supervisor}</p>}
              {exp.description && <p className="text-xs mt-1 leading-relaxed">{exp.description}</p>}
            </div>
          ))}
        </div>
      )}

      {teachingExperience && teachingExperience.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: accentColor }}>{t("teachingExperience")}</h2>
          {teachingExperience.map((exp) => (
            <div key={exp.id} className="mb-2">
              <div className="flex justify-between">
                <p className="text-sm font-semibold">{exp.courseName}</p>
                <p className="text-xs text-gray-500">{exp.startDate} - {exp.endDate}</p>
              </div>
              <p className="text-xs text-gray-600">{exp.role} — {exp.institution}</p>
              {exp.description && <p className="text-xs mt-1">{exp.description}</p>}
            </div>
          ))}
        </div>
      )}

      {experience.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: accentColor }}>{t("professionalExperience")}</h2>
          {experience.map((exp) => (
            <div key={exp.id} className="mb-3">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-semibold">{exp.jobTitle}</p>
                  <p className="text-xs text-gray-600">{exp.company}{exp.location ? `, ${exp.location}` : ""}</p>
                </div>
                <p className="text-xs text-gray-500">{exp.startDate} - {exp.current ? t("present") : exp.endDate}</p>
              </div>
              {exp.description && <p className="text-xs mt-1 leading-relaxed">{exp.description}</p>}
            </div>
          ))}
        </div>
      )}

      {publications && publications.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: accentColor }}>{t("publications")}</h2>
          {publications.map((pub) => (
            <div key={pub.id} className="mb-2 text-xs">
              <p className="font-semibold">{pub.title}</p>
              <p className="text-gray-600">{pub.authors}</p>
              <p className="text-gray-500">
                {pub.journal}{pub.volume ? `, ${pub.volume}` : ""}{pub.pages ? `, ${t("pages")} ${pub.pages}` : ""} ({pub.year})
              </p>
              {pub.doi && <p className="text-gray-400">{t("doi")}: {pub.doi}</p>}
            </div>
          ))}
        </div>
      )}

      {awards && awards.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: accentColor }}>{t("awards")}</h2>
          {awards.map((award) => (
            <div key={award.id} className="mb-1 text-xs">
              <p className="font-semibold">{award.name}</p>
              <p className="text-gray-600">{award.issuer}{award.date ? ` — ${award.date}` : ""}</p>
            </div>
          ))}
        </div>
      )}

      {skills.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: accentColor }}>{t("skills")}</h2>
          <div className="flex flex-wrap gap-1">
            {skills.map((skill) => (
              <span key={skill.id} className="text-xs bg-gray-100 px-2 py-0.5 rounded">{skill.name}</span>
            ))}
          </div>
        </div>
      )}

      {certifications.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: accentColor }}>{t("certifications")}</h2>
          {certifications.map((cert) => (
            <div key={cert.id} className="flex justify-between mb-1 text-xs">
              <p>{cert.name} - {cert.issuer}</p>
              <p className="text-gray-500">{cert.date}</p>
            </div>
          ))}
        </div>
      )}

      {projects.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: accentColor }}>{t("projects")}</h2>
          {projects.map((project) => (
            <div key={project.id} className="mb-1 text-xs">
              <p className="font-semibold">{project.name}</p>
              {project.description && <p>{project.description}</p>}
            </div>
          ))}
        </div>
      )}

      {languages.length > 0 && (
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: accentColor }}>{t("languages")}</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {languages.map((lang) => (
              <p key={lang.id}>{lang.name} - {lang.proficiency}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
