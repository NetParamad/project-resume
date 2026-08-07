"use client";

import type { ResumeData } from "@/lib/types/resume";

interface CompactTemplateProps {
  data: ResumeData;
}

export function CompactTemplate({ data }: CompactTemplateProps) {
  const { personalInfo, summary, experience, education, skills, languages, publications, researchExperience, awards, theme } = data;
  const accentColor = theme?.accentColor ?? "#ff751f";

  return (
    <div className="p-5 text-sm text-gray-900 max-w-[600px] mx-auto">
      {/* Header */}
      <div className="text-center mb-4">
        {personalInfo.avatar && (
          <img src={personalInfo.avatar} alt="" className="w-14 h-14 rounded-full object-cover mx-auto mb-1" />
        )}
        <h1 className="text-lg font-bold tracking-tight">{personalInfo.fullName || "Your Name"}</h1>
        {personalInfo.occupation && <p className="text-[11px] text-gray-500">{personalInfo.occupation}</p>}
        <div className="flex flex-wrap justify-center gap-x-2 text-[11px] text-gray-500 mt-0.5">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
      </div>

      {summary && (
        <div className="mb-3">
          <p className="text-[11px] leading-relaxed text-gray-700">{summary}</p>
        </div>
      )}

      {education.length > 0 && (
        <div className="mb-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: accentColor }}>Education</h2>
          {education.map((edu) => (
            <div key={edu.id} className="mb-1">
              <p className="text-[12px] font-medium">{edu.degree}</p>
              <p className="text-[11px] text-gray-500">{edu.institution} • {edu.startDate} - {edu.endDate}</p>
            </div>
          ))}
        </div>
      )}

      {researchExperience && researchExperience.length > 0 && (
        <div className="mb-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: accentColor }}>Research</h2>
          {researchExperience.map((exp) => (
            <div key={exp.id} className="mb-1">
              <p className="text-[12px] font-medium">{exp.role} — {exp.institution}</p>
              <p className="text-[11px] text-gray-500">{exp.startDate} - {exp.current ? "Present" : exp.endDate}</p>
            </div>
          ))}
        </div>
      )}

      {publications && publications.length > 0 && (
        <div className="mb-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: accentColor }}>Publications</h2>
          {publications.slice(0, 3).map((pub) => (
            <p key={pub.id} className="text-[11px] mb-0.5">
              &ldquo;{pub.title}&rdquo; ({pub.year})
            </p>
          ))}
          {publications.length > 3 && (
            <p className="text-[11px] text-gray-400">+{publications.length - 3} more publications</p>
          )}
        </div>
      )}

      {experience.length > 0 && (
        <div className="mb-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: accentColor }}>Experience</h2>
          {experience.map((exp) => (
            <div key={exp.id} className="mb-1">
              <p className="text-[12px] font-medium">{exp.jobTitle} — {exp.company}</p>
              <p className="text-[11px] text-gray-500">{exp.startDate} - {exp.current ? "Present" : exp.endDate}</p>
            </div>
          ))}
        </div>
      )}

      {awards && awards.length > 0 && (
        <div className="mb-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: accentColor }}>Honors</h2>
          {awards.map((award) => (
            <p key={award.id} className="text-[11px]">{award.name} — {award.issuer}</p>
          ))}
        </div>
      )}

      {skills.length > 0 && (
        <div className="mb-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: accentColor }}>Skills</h2>
          <p className="text-[11px] text-gray-700">{skills.map((s) => s.name).join(" • ")}</p>
        </div>
      )}

      {languages.length > 0 && (
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: accentColor }}>Languages</h2>
          <p className="text-[11px] text-gray-700">{languages.map((l) => `${l.name} (${l.proficiency})`).join(", ")}</p>
        </div>
      )}
    </div>
  );
}
