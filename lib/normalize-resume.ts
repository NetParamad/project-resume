import { nanoid } from "nanoid";
import type {
  ResumeData,
  PersonalInfo,
  WorkExperience,
  Education,
  Skill,
  Certification,
  Project,
  Language,
  Reference,
  Publication,
  ResearchExperience,
  TeachingExperience,
  Award,
} from "@/lib/types/resume";

const SKILL_LEVELS = ["beginner", "intermediate", "advanced", "expert"] as const;
const LANGUAGE_PROFICIENCIES = ["native", "fluent", "advanced", "intermediate", "basic"] as const;

const str = (v: unknown): string => (typeof v === "string" ? v : v == null ? "" : String(v));
const bool = (v: unknown): boolean => v === true || v === "true";

type CleanFieldType =
  | "name"
  | "email"
  | "phone"
  | "location"
  | "occupation"
  | "company"
  | "url"
  | "degree"
  | "field"
  | "date"
  | "summary"
  | "text";

const CLEAN_PREFIXES: Record<CleanFieldType, RegExp> = {
  name: /^\s*(?:(?:my\s+)?name\s+(?:is\s+)?|name\s*[:：-]|i\s+am\s+|i'm\s+|this\s+is\s+|ผมชื่อ\s+|ฉันชื่อ\s+|ดิฉันชื่อ\s+|ชื่อ-สกุล\s*[:：]?\s*|ชื่อจริง\s*[:：]?\s*|ชื่อเล่น\s*[:：]?\s*|ชื่อ\s*[:：])/i,
  email: /^\s*(?:(?:my\s+)?e-?mail(?:\s+address)?(?:\s+is\s+|\s*[:：])|อีเมล\s*[:：]?\s*|อีเมล์\s*[:：]?\s*|อีเมลล์\s*[:：]?\s*)/i,
  phone: /^\s*(?:ph(?:one)?\.?|tel(?:ephone)?\.?|mobile\.?|cell(?:ular)?\.?|โทรศัพท์\s*[:：]?|โทร\.?\s*[:：]?|เบอร์โทร\s*[:：]?|เบอร์\s*[:：]?|มือถือ\s*[:：]?)\s*/i,
  location: /^\s*(?:location|address|based\s+in|located\s+in|ที่อยู่|ภูมิลำเนา|อาศัยอยู่|อยู่ที่|จังหวัด|ปท\.?)\s*[:：-]?\s*/i,
  occupation: /^\s*(?:(?:job\s+)?title|position|role|profession|occupation|งาน|ตำแหน่ง|อาชีพ)\s*[:：-]?\s*|^\s*(?:a|an|the)\s+/i,
  company: /^\s*(?:company|org(?:anization)?|employer|บริษัท|องค์กร|หน่วยงาน)\s*[:：-]?\s*/i,
  url: /^\s*(?:linkedin|portfolio|website|web\s*site|url|github|gitlab|line|facebook|twitter|doi|เว็บไซต์|เว็บ|พอร์ตโฟลิโอ|ลิงก์)\s*[:：-]?\s*/i,
  degree: /^\s*(?:degree|diploma|วุฒิ|วุฒิการศึกษา|ปริญญา)\s*[:：-]?\s*/i,
  field: /^\s*(?:field|major|gpa|สาขา|สาขาวิชา|เกรด)\s*[:：-]?\s*/i,
  date: /^\s*(?:date|start|end|from|to|since|ตั้งแต่|ถึง|จนถึง|ช่วง)\s*[:：-]?\s*/i,
  summary: /^\s*(?:summary|profile|objective|about(?:\s+me)?|intro(?:duction)?|ประวัติโดยย่อ|สรุป|เกี่ยวกับฉัน|แนะนำตัว)\s*[:：-]?\s*/i,
  text: /^\s*(?:description|detail|รายละเอียด|หมายเหตุ)\s*[:：-]?\s*|^\s*[•●▪‣-]\s*/i,
};

const PUNCT_FIELDS: ReadonlySet<CleanFieldType> = new Set([
  "name",
  "email",
  "phone",
  "location",
  "occupation",
  "company",
  "url",
  "degree",
  "field",
  "date",
]);
const KEEP_NEWLINES_FIELDS: ReadonlySet<CleanFieldType> = new Set(["summary", "text"]);

export function cleanExtractedValue(value: unknown, type: CleanFieldType): string {
  let v = str(value);
  if (!v.trim()) return "";

  const prefix = CLEAN_PREFIXES[type];
  v = v.replace(prefix, "").trim();

  v = v.replace(/^["'“”‘’\s]+|["'“”‘’\s]+$/g, "").trim();

  if (KEEP_NEWLINES_FIELDS.has(type)) {
    v = v.replace(/[ \t]+/g, " ").trim();
  } else {
    v = v.replace(/\s+/g, " ").trim();
    if (PUNCT_FIELDS.has(type)) v = v.replace(/[.,;:。]+$/g, "").trim();
  }

  return v;
}

function ensureIds<T extends { id: string }>(items: T[] | undefined): T[] {
  if (!Array.isArray(items)) return [];
  return items
    .filter((item): item is T => !!item && typeof item === "object")
    .map((item) => (item.id ? item : { ...item, id: nanoid() }));
}

function normalizePersonalInfo(personalInfo: Partial<PersonalInfo> | undefined): PersonalInfo {
  return {
    fullName: str(personalInfo?.fullName),
    email: str(personalInfo?.email),
    phone: str(personalInfo?.phone),
    location: str(personalInfo?.location),
    linkedin: str(personalInfo?.linkedin),
    portfolio: str(personalInfo?.portfolio),
    occupation: str(personalInfo?.occupation),
    avatar: str(personalInfo?.avatar),
  };
}

function normalizeExperience(items: WorkExperience[] | undefined): WorkExperience[] {
  return ensureIds(items).map((e) => ({
    ...e,
    jobTitle: str(e.jobTitle),
    company: str(e.company),
    location: str(e.location),
    startDate: str(e.startDate),
    endDate: str(e.endDate),
    current: bool(e.current),
    description: str(e.description),
  }));
}

function normalizeEducation(items: Education[] | undefined): Education[] {
  return ensureIds(items).map((e) => ({
    ...e,
    degree: str(e.degree),
    institution: str(e.institution),
    field: str(e.field),
    startDate: str(e.startDate),
    endDate: str(e.endDate),
    gpa: str(e.gpa),
  }));
}

function normalizeSkills(items: Skill[] | undefined): Skill[] {
  return ensureIds(items).map((s) => ({
    ...s,
    name: str(s.name),
    level: (SKILL_LEVELS as readonly string[]).includes(str(s.level))
      ? (str(s.level) as Skill["level"])
      : "intermediate",
  }));
}

function normalizeCertifications(items: Certification[] | undefined): Certification[] {
  return ensureIds(items).map((c) => ({
    ...c,
    name: str(c.name),
    issuer: str(c.issuer),
    date: str(c.date),
  }));
}

function normalizeProjects(items: Project[] | undefined): Project[] {
  return ensureIds(items).map((p) => ({
    ...p,
    name: str(p.name),
    url: str(p.url),
    description: str(p.description),
  }));
}

function normalizeLanguages(items: Language[] | undefined): Language[] {
  return ensureIds(items).map((l) => ({
    ...l,
    name: str(l.name),
    proficiency: (LANGUAGE_PROFICIENCIES as readonly string[]).includes(str(l.proficiency))
      ? (str(l.proficiency) as Language["proficiency"])
      : "intermediate",
  }));
}

function normalizeReferences(items: Reference[] | undefined): Reference[] {
  return ensureIds(items).map((r) => ({
    ...r,
    name: str(r.name),
    title: str(r.title),
    company: str(r.company),
    email: str(r.email),
    phone: str(r.phone),
  }));
}

function normalizePublications(items: Publication[] | undefined): Publication[] {
  return ensureIds(items).map((p) => ({
    ...p,
    title: str(p.title),
    authors: str(p.authors),
    journal: str(p.journal),
    year: str(p.year),
    volume: str(p.volume),
    pages: str(p.pages),
    doi: str(p.doi),
    url: str(p.url),
  }));
}

function normalizeResearchExperience(items: ResearchExperience[] | undefined): ResearchExperience[] {
  return ensureIds(items).map((r) => ({
    ...r,
    role: str(r.role),
    institution: str(r.institution),
    location: str(r.location),
    startDate: str(r.startDate),
    endDate: str(r.endDate),
    current: bool(r.current),
    description: str(r.description),
    supervisor: str(r.supervisor),
  }));
}

function normalizeTeachingExperience(items: TeachingExperience[] | undefined): TeachingExperience[] {
  return ensureIds(items).map((t) => ({
    ...t,
    courseName: str(t.courseName),
    institution: str(t.institution),
    role: str(t.role),
    startDate: str(t.startDate),
    endDate: str(t.endDate),
    description: str(t.description),
  }));
}

function normalizeAwards(items: Award[] | undefined): Award[] {
  return ensureIds(items).map((a) => ({
    ...a,
    name: str(a.name),
    issuer: str(a.issuer),
    date: str(a.date),
    description: str(a.description),
  }));
}

export function normalizeResumeData(data: Partial<ResumeData> | undefined): ResumeData {
  const source = data ?? {};

  return {
    personalInfo: normalizePersonalInfo(source.personalInfo),
    summary: str(source.summary),
    experience: normalizeExperience(source.experience),
    education: normalizeEducation(source.education),
    skills: normalizeSkills(source.skills),
    certifications: normalizeCertifications(source.certifications),
    projects: normalizeProjects(source.projects),
    languages: normalizeLanguages(source.languages),
    references: normalizeReferences(source.references),
    publications: normalizePublications(source.publications),
    researchExperience: normalizeResearchExperience(source.researchExperience),
    teachingExperience: normalizeTeachingExperience(source.teachingExperience),
    awards: normalizeAwards(source.awards),
    theme: source.theme?.accentColor
      ? { accentColor: str(source.theme.accentColor) }
      : { accentColor: "#ff751f" },
  };
}

export function sanitizeExtractedResume(data: Partial<ResumeData> | undefined): ResumeData {
  const normalized = normalizeResumeData(data);

  const c = (v: string | undefined, t: CleanFieldType): string => cleanExtractedValue(v, t);

  const personalInfo: PersonalInfo = {
    fullName: c(normalized.personalInfo.fullName, "name"),
    email: c(normalized.personalInfo.email, "email"),
    phone: c(normalized.personalInfo.phone, "phone"),
    location: c(normalized.personalInfo.location, "location"),
    linkedin: c(normalized.personalInfo.linkedin, "url"),
    portfolio: c(normalized.personalInfo.portfolio, "url"),
    occupation: c(normalized.personalInfo.occupation, "occupation"),
    avatar: c(normalized.personalInfo.avatar, "url"),
  };

  const experience = normalized.experience.map((e) => ({
    ...e,
    jobTitle: c(e.jobTitle, "occupation"),
    company: c(e.company, "company"),
    location: c(e.location, "location"),
    startDate: c(e.startDate, "date"),
    endDate: c(e.endDate, "date"),
    description: c(e.description, "text"),
  }));

  const education = normalized.education.map((e) => ({
    ...e,
    degree: c(e.degree, "degree"),
    institution: c(e.institution, "company"),
    field: c(e.field, "field"),
    startDate: c(e.startDate, "date"),
    endDate: c(e.endDate, "date"),
    gpa: c(e.gpa, "field"),
  }));

  const skills = normalized.skills.map((s) => ({ ...s, name: c(s.name, "name") }));
  const certifications = normalized.certifications.map((crt) => ({
    ...crt,
    name: c(crt.name, "name"),
    issuer: c(crt.issuer, "company"),
    date: c(crt.date, "date"),
  }));
  const projects = normalized.projects.map((p) => ({
    ...p,
    name: c(p.name, "name"),
    url: c(p.url, "url"),
    description: c(p.description, "text"),
  }));
  const languages = normalized.languages.map((l) => ({ ...l, name: c(l.name, "name") }));
  const references = normalized.references.map((r) => ({
    ...r,
    name: c(r.name, "name"),
    title: c(r.title, "occupation"),
    company: c(r.company, "company"),
    email: c(r.email, "email"),
    phone: c(r.phone, "phone"),
  }));
  const publications = (normalized.publications ?? []).map((p) => ({
    ...p,
    title: c(p.title, "name"),
    authors: c(p.authors, "text"),
    journal: c(p.journal, "company"),
    year: c(p.year, "date"),
    volume: c(p.volume, "field"),
    pages: c(p.pages, "field"),
    doi: c(p.doi, "url"),
    url: c(p.url, "url"),
  }));
  const researchExperience = (normalized.researchExperience ?? []).map((r) => ({
    ...r,
    role: c(r.role, "name"),
    institution: c(r.institution, "company"),
    location: c(r.location, "location"),
    startDate: c(r.startDate, "date"),
    endDate: c(r.endDate, "date"),
    description: c(r.description, "text"),
    supervisor: c(r.supervisor, "name"),
  }));
  const teachingExperience = (normalized.teachingExperience ?? []).map((t) => ({
    ...t,
    courseName: c(t.courseName, "name"),
    institution: c(t.institution, "company"),
    role: c(t.role, "occupation"),
    startDate: c(t.startDate, "date"),
    endDate: c(t.endDate, "date"),
    description: c(t.description, "text"),
  }));
  const awards = (normalized.awards ?? []).map((a) => ({
    ...a,
    name: c(a.name, "name"),
    issuer: c(a.issuer, "company"),
    date: c(a.date, "date"),
    description: c(a.description, "text"),
  }));

  const has = (v: string | undefined) => !!v && v.trim().length > 0;

  return {
    ...normalized,
    personalInfo,
    summary: c(normalized.summary, "summary"),
    experience: experience.filter(
      (e) => has(e.jobTitle) || has(e.company) || has(e.description) || has(e.startDate) || has(e.endDate),
    ),
    education: education.filter((e) => has(e.degree) || has(e.institution)),
    skills: skills.filter((s) => has(s.name)),
    certifications: certifications.filter((crt) => has(crt.name) || has(crt.issuer)),
    projects: projects.filter((p) => has(p.name) || has(p.url) || has(p.description)),
    languages: languages.filter((l) => has(l.name)),
    references: references.filter((r) => has(r.name) || has(r.email) || has(r.phone)),
    publications: publications.filter((p) => has(p.title) || has(p.doi) || has(p.url)),
    researchExperience: researchExperience.filter(
      (r) => has(r.role) || has(r.institution) || has(r.description),
    ),
    teachingExperience: teachingExperience.filter(
      (t) => has(t.courseName) || has(t.institution) || has(t.description),
    ),
    awards: awards.filter((a) => has(a.name) || has(a.issuer)),
  };
}
