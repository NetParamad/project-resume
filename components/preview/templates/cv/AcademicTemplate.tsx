"use client";

import type { ResumeData, Publication, ResearchExperience, TeachingExperience, Award } from "@/lib/types/resume";

interface AcademicTemplateProps {
  data: ResumeData;
}

function PublicationsSection({ publications, accentColor }: { publications?: Publication[]; accentColor: string }) {
  if (!publications || publications.length === 0) return null;
  return (
    <div className="mb-4">
      <h2 className="text-sm font-semibold border-b border-gray-300 pb-1 mb-2">Publications</h2>
      {publications.map((pub) => (
        <div key={pub.id} className="mb-2 text-xs">
          <p className="italic">&ldquo;{pub.title}&rdquo;</p>
          <p className="text-gray-600">{pub.authors}</p>
          <p className="text-gray-500">
            {pub.journal}{pub.volume ? `, ${pub.volume}` : ""}{pub.pages ? `, pp. ${pub.pages}` : ""} ({pub.year})
          </p>
          {pub.doi && <p className="text-gray-400">DOI: {pub.doi}</p>}
          {pub.url && (
            <a href={pub.url} target="_blank" rel="noreferrer" className="hover:underline" style={{ color: accentColor }}>Link</a>
          )}
        </div>
      ))}
    </div>
  );
}

function ResearchSection({ items }: { items?: ResearchExperience[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mb-4">
      <h2 className="text-sm font-semibold border-b border-gray-300 pb-1 mb-2">Research Experience</h2>
      {items.map((exp) => (
        <div key={exp.id} className="mb-2">
          <div className="flex justify-between">
            <p className="text-sm font-medium">{exp.role}</p>
            <p className="text-xs text-gray-500">
              {exp.startDate} - {exp.current ? "Present" : exp.endDate}
            </p>
          </div>
          <p className="text-xs text-gray-600">{exp.institution}{exp.location ? `, ${exp.location}` : ""}</p>
          {exp.supervisor && <p className="text-xs text-gray-500">Supervisor: {exp.supervisor}</p>}
          {exp.description && <p className="text-xs mt-1 leading-relaxed">{exp.description}</p>}
        </div>
      ))}
    </div>
  );
}

function TeachingSection({ items }: { items?: TeachingExperience[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mb-4">
      <h2 className="text-sm font-semibold border-b border-gray-300 pb-1 mb-2">Teaching Experience</h2>
      {items.map((exp) => (
        <div key={exp.id} className="mb-1 text-xs">
          <p className="font-medium">{exp.courseName} — {exp.role}</p>
          <p className="text-gray-600">{exp.institution}</p>
          <p className="text-gray-500">{exp.startDate} - {exp.endDate}</p>
          {exp.description && <p className="mt-1">{exp.description}</p>}
        </div>
      ))}
    </div>
  );
}

function AwardsSection({ items }: { items?: Award[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mb-4">
      <h2 className="text-sm font-semibold border-b border-gray-300 pb-1 mb-2">Awards & Honors</h2>
      {items.map((award) => (
        <div key={award.id} className="mb-1 text-xs">
          <p className="font-medium">{award.name}</p>
          <p className="text-gray-600">{award.issuer}{award.date ? ` — ${award.date}` : ""}</p>
          {award.description && <p className="text-gray-500 mt-0.5">{award.description}</p>}
        </div>
      ))}
    </div>
  );
}

export function AcademicTemplate({ data }: AcademicTemplateProps) {
  const { personalInfo, summary, experience, education, skills, certifications, projects, languages, publications, researchExperience, teachingExperience, awards, theme } = data;
  const accentColor = theme?.accentColor ?? "#ff751f";

  return (
    <div className="p-6 text-sm text-gray-900">
      {/* Header */}
      <div className="text-center mb-5">
        {personalInfo.avatar && (
          <img src={personalInfo.avatar} alt="" className="w-16 h-16 rounded-full object-cover mx-auto mb-2" />
        )}
        <h1 className="text-xl font-bold">{personalInfo.fullName || "Your Name"}</h1>
        {personalInfo.occupation && <p className="text-xs text-gray-500">{personalInfo.occupation}</p>}
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-gray-600 mt-1">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
          {personalInfo.portfolio && <span>{personalInfo.portfolio}</span>}
        </div>
      </div>

      {summary && (
        <div className="mb-4">
          <p className="text-xs leading-relaxed">{summary}</p>
        </div>
      )}

      {education.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-semibold border-b border-gray-300 pb-1 mb-2">Education</h2>
          {education.map((edu) => (
            <div key={edu.id} className="mb-1">
              <div className="flex justify-between">
                <p className="text-sm font-medium">{edu.degree}</p>
                <p className="text-xs text-gray-500">{edu.startDate} - {edu.endDate}</p>
              </div>
              <p className="text-xs text-gray-600">{edu.institution} | {edu.field}{edu.gpa ? ` | GPA: ${edu.gpa}` : ""}</p>
            </div>
          ))}
        </div>
      )}

      <ResearchSection items={researchExperience} />

      <TeachingSection items={teachingExperience} />

      <PublicationsSection publications={publications} accentColor={accentColor} />

      {experience.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-semibold border-b border-gray-300 pb-1 mb-2">Professional Experience</h2>
          {experience.map((exp) => (
            <div key={exp.id} className="mb-2">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium">{exp.jobTitle}</p>
                  <p className="text-xs text-gray-600">{exp.company}</p>
                </div>
                <p className="text-xs text-gray-500">{exp.startDate} - {exp.current ? "Present" : exp.endDate}</p>
              </div>
              {exp.description && <p className="text-xs mt-1 leading-relaxed">{exp.description}</p>}
            </div>
          ))}
        </div>
      )}

      <AwardsSection items={awards} />

      {skills.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-semibold border-b border-gray-300 pb-1 mb-2">Skills</h2>
          <div className="flex flex-wrap gap-1">
            {skills.map((skill) => (
              <span key={skill.id} className="text-xs bg-gray-100 px-2 py-0.5 rounded">{skill.name}</span>
            ))}
          </div>
        </div>
      )}

      {certifications.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-semibold border-b border-gray-300 pb-1 mb-2">Certifications</h2>
          {certifications.map((cert) => (
            <div key={cert.id} className="flex justify-between mb-1 text-xs">
              <p>{cert.name} - {cert.issuer}</p>
              <p className="text-gray-500">{cert.date}</p>
            </div>
          ))}
        </div>
      )}

      {projects.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-semibold border-b border-gray-300 pb-1 mb-2">Projects</h2>
          {projects.map((project) => (
            <div key={project.id} className="mb-2 text-xs">
              <p className="font-medium">{project.name}</p>
              {project.description && <p className="mt-0.5">{project.description}</p>}
            </div>
          ))}
        </div>
      )}

      {languages.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold border-b border-gray-300 pb-1 mb-2">Languages</h2>
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
