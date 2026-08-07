"use client";

import type { ResumeData } from "@/lib/types/resume";

export function MinimalTemplate({ data }: { data: ResumeData }) {
  const { personalInfo, summary, experience, education, skills, projects, theme } = data;
  const accentColor = theme?.accentColor ?? "#ff751f";

  return (
    <div className="p-4 sm:p-6 text-sm text-gray-900 max-w-[600px] mx-auto">
      <div className="mb-6">
        {personalInfo.avatar && (
          <img src={personalInfo.avatar} alt="" className="w-14 h-14 rounded-full object-cover mx-auto mb-2" />
        )}
        <h1 className="text-lg font-light tracking-[0.2em] uppercase">{personalInfo.fullName || "Your Name"}</h1>
        {personalInfo.occupation && <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">{personalInfo.occupation}</p>}
        <div className="h-px bg-gray-300 my-3" style={{ backgroundColor: accentColor }} />
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-gray-500 uppercase tracking-wider">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
      </div>

      {summary && (
        <div className="mb-5">
          <p className="text-xs leading-relaxed text-gray-600">{summary}</p>
        </div>
      )}

      {experience.length > 0 && (
        <div className="mb-5">
          <h2 className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-3" style={{ color: accentColor }}>Experience</h2>
          {experience.map((exp) => (
            <div key={exp.id} className="mb-3">
              <div className="flex justify-between items-baseline">
                <p className="text-xs font-medium">{exp.jobTitle}</p>
                <p className="text-[10px] text-gray-400">{exp.startDate} – {exp.current ? "Present" : exp.endDate}</p>
              </div>
              <p className="text-[10px] text-gray-500">{exp.company}</p>
              {exp.description && <p className="text-xs mt-1 leading-relaxed text-gray-600">{exp.description}</p>}
            </div>
          ))}
        </div>
      )}

      {education.length > 0 && (
        <div className="mb-5">
          <h2 className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-3" style={{ color: accentColor }}>Education</h2>
          {education.map((edu) => (
            <div key={edu.id} className="mb-2">
              <p className="text-xs font-medium">{edu.degree}</p>
              <p className="text-[10px] text-gray-500">{edu.institution}, {edu.field}</p>
            </div>
          ))}
        </div>
      )}

      {skills.length > 0 && (
        <div className="mb-5">
          <h2 className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-2" style={{ color: accentColor }}>Skills</h2>
          <p className="text-xs text-gray-600">
            {skills.map((s) => s.name).join(" \u2022 ")}
          </p>
        </div>
      )}

      {projects.length > 0 && (
        <div className="mb-5">
          <h2 className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-3" style={{ color: accentColor }}>Projects</h2>
          {projects.map((p) => (
            <div key={p.id} className="mb-2">
              <p className="text-xs font-medium">{p.name}</p>
              {p.description && <p className="text-xs mt-0.5 text-gray-600">{p.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
