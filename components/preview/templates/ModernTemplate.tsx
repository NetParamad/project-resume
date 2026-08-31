"use client";

import type { ResumeData } from "@/lib/types/resume";
import { useResumeTranslator } from "@/lib/resume-lang-context";

interface ModernTemplateProps {
  data: ResumeData;
}

export function ModernTemplate({ data }: ModernTemplateProps) {
  const { personalInfo, summary, experience, education, skills, certifications, projects, languages, theme } = data;
  const accentColor = theme?.accentColor ?? "#f97316";
  const t = useResumeTranslator(data);

  return (
    <div className="p-6 text-sm text-gray-900">
      {/* Header */}
      <div className="text-center mb-4">
        {personalInfo.avatar && (
          <img src={personalInfo.avatar} alt="" className="w-16 h-16 rounded-full object-cover mx-auto mb-2" />
        )}
        <h1 className="text-xl font-bold">{personalInfo.fullName || t("yourName")}</h1>
        {personalInfo.occupation && <p className="text-xs text-gray-500">{personalInfo.occupation}</p>}
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-gray-600 mt-1">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
          {personalInfo.portfolio && <span>{personalInfo.portfolio}</span>}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="mb-4">
          <h2 className="text-sm font-semibold border-b border-gray-300 pb-1 mb-2">
            {t("summary")}
          </h2>
          <p className="text-xs leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-semibold border-b border-gray-300 pb-1 mb-2">
            {t("experience")}
          </h2>
          {experience.map((exp) => (
            <div key={exp.id} className="mb-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium">{exp.jobTitle}</p>
                  <p className="text-xs text-gray-600">{exp.company}</p>
                </div>
                <p className="text-xs text-gray-500 shrink-0">
                  {exp.startDate} - {exp.current ? t("present") : exp.endDate}
                </p>
              </div>
              {exp.description && (
                <p className="text-xs mt-1 leading-relaxed">{exp.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-semibold border-b border-gray-300 pb-1 mb-2">
            {t("education")}
          </h2>
          {education.map((edu) => (
            <div key={edu.id} className="mb-1">
              <div className="flex justify-between">
                <p className="text-sm font-medium">{edu.degree}</p>
                <p className="text-xs text-gray-500">
                  {edu.startDate} - {edu.endDate}
                </p>
              </div>
              <p className="text-xs text-gray-600">
                {edu.institution} | {edu.field}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-semibold border-b border-gray-300 pb-1 mb-2">
            {t("skills")}
          </h2>
          <div className="flex flex-wrap gap-1">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="text-xs bg-gray-100 px-2 py-0.5 rounded"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-semibold border-b border-gray-300 pb-1 mb-2">
            {t("certifications")}
          </h2>
          {certifications.map((cert) => (
            <div key={cert.id} className="flex justify-between mb-1">
              <p className="text-xs">{cert.name} - {cert.issuer}</p>
              <p className="text-xs text-gray-500">{cert.date}</p>
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-semibold border-b border-gray-300 pb-1 mb-2">
            {t("projects")}
          </h2>
          {projects.map((project) => (
            <div key={project.id} className="mb-2">
              <div className="flex justify-between">
                <p className="text-sm font-medium">{project.name}</p>
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs hover:underline break-all"
                    style={{ color: accentColor }}
                  >
                    {project.url.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>
              {project.description && (
                <p className="text-xs mt-1 leading-relaxed">{project.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold border-b border-gray-300 pb-1 mb-2">
            {t("languages")}
          </h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {languages.map((lang) => (
              <p key={lang.id} className="text-xs">
                {lang.name} - {t(lang.proficiency)}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
