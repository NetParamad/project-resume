import { nanoid } from "nanoid";

export type DocumentType = "resume" | "cv"

export interface PersonalInfo {
  fullName: string
  email: string
  phone: string
  location: string
  linkedin: string
  portfolio: string
  occupation: string
  avatar: string
}

export interface WorkExperience {
  id: string
  jobTitle: string
  company: string
  location: string
  startDate: string
  endDate: string
  current: boolean
  description: string
}

export interface Education {
  id: string
  degree: string
  institution: string
  field: string
  startDate: string
  endDate: string
  gpa: string
}

export interface Skill {
  id: string
  name: string
  level: "beginner" | "intermediate" | "advanced" | "expert"
}

export interface Certification {
  id: string
  name: string
  issuer: string
  date: string
}

export interface Project {
  id: string
  name: string
  url: string
  description: string
}

export interface Language {
  id: string
  name: string
  proficiency: "native" | "fluent" | "advanced" | "intermediate" | "basic"
}

export interface Reference {
  id: string
  name: string
  title: string
  company: string
  email: string
  phone: string
}

export interface Publication {
  id: string
  title: string
  authors: string
  journal: string
  year: string
  volume: string
  pages: string
  doi: string
  url: string
}

export interface ResearchExperience {
  id: string
  role: string
  institution: string
  location: string
  startDate: string
  endDate: string
  current: boolean
  description: string
  supervisor: string
}

export interface TeachingExperience {
  id: string
  courseName: string
  institution: string
  role: string
  startDate: string
  endDate: string
  description: string
}

export interface Award {
  id: string
  name: string
  issuer: string
  date: string
  description: string
}

export type ResumeTemplateType = "modern" | "classic" | "minimal" | "creative"
export type CVTemplateType = "academic" | "comprehensive" | "compact"
export type TemplateType = ResumeTemplateType | CVTemplateType

export const resumeTemplates: ResumeTemplateType[] = ["modern", "classic", "minimal", "creative"]
export const cvTemplates: CVTemplateType[] = ["academic", "comprehensive", "compact"]

export interface ThemeConfig {
  accentColor: string
}

export interface ResumeData {
  personalInfo: PersonalInfo
  summary: string
  experience: WorkExperience[]
  education: Education[]
  skills: Skill[]
  certifications: Certification[]
  projects: Project[]
  languages: Language[]
  references: Reference[]
  publications?: Publication[]
  researchExperience?: ResearchExperience[]
  teachingExperience?: TeachingExperience[]
  awards?: Award[]
  theme?: ThemeConfig
}

export type SectionType =
  | "personalInfo"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "certifications"
  | "projects"
  | "languages"
  | "references"
  | "publications"
  | "researchExperience"
  | "teachingExperience"
  | "awards"

export interface Resume {
  id: string
  userId: string
  title: string
  documentType: DocumentType
  template: TemplateType
  data: ResumeData
  isPublic: boolean
  shareSlug: string
  createdAt: string
  updatedAt: string
  version: number
}

const arraySections = [
  "experience",
  "education",
  "skills",
  "certifications",
  "projects",
  "languages",
  "references",
  "publications",
  "researchExperience",
  "teachingExperience",
  "awards",
] as const satisfies readonly (keyof ResumeData)[];

export function normalizeResumeData(data: ResumeData): ResumeData {
  if (!data || typeof data !== "object") return data;
  const result: Record<string, unknown> = { ...data };

  for (const section of arraySections) {
    const items = result[section];
    if (Array.isArray(items)) {
      result[section] = items.map((item) => {
        if (item && typeof item === "object" && typeof (item as { id?: unknown }).id !== "string") {
          return { ...(item as object), id: nanoid(12) };
        }
        return item;
      });
    }
  }

  return result as unknown as ResumeData;
}
