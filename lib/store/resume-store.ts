import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import { normalizeResumeData } from "@/lib/normalize-resume";
import type {
  ResumeData,
  PersonalInfo,
  ThemeConfig,
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
  TemplateType,
  DocumentType,
} from "@/lib/types/resume";

const defaultPersonalInfo: PersonalInfo = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  portfolio: "",
  occupation: "",
  avatar: "",
};

const defaultTheme: ThemeConfig = {
  accentColor: "#ff751f",
};

export const defaultResumeData: ResumeData = {
  personalInfo: { ...defaultPersonalInfo },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  certifications: [],
  projects: [],
  languages: [],
  references: [],
  theme: { ...defaultTheme },
};

interface ResumeState {
  currentResumeId: string | null
  title: string
  documentType: DocumentType
  template: TemplateType
  data: ResumeData
  isDirty: boolean
  lastSaved: string | null
  shareSlug: string | null
  isPublic: boolean
}

interface ResumeActions {
  setCurrentResume: (id: string | null, title: string, documentType: DocumentType, template: TemplateType, data: ResumeData, shareSlug?: string | null, isPublic?: boolean) => void
  setData: (data: ResumeData) => void
  setShareInfo: (shareSlug: string | null, isPublic: boolean) => void
  setTitle: (title: string) => void
  setDocumentType: (documentType: DocumentType) => void
  setTemplate: (template: TemplateType) => void
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void
  updateSummary: (summary: string) => void
  updateTheme: (theme: Partial<ThemeConfig>) => void
  addExperience: () => void
  updateExperience: (id: string, exp: Partial<WorkExperience>) => void
  removeExperience: (id: string) => void
  reorderExperience: (from: number, to: number) => void
  addEducation: () => void
  updateEducation: (id: string, edu: Partial<Education>) => void
  removeEducation: (id: string) => void
  reorderEducation: (from: number, to: number) => void
  addSkill: () => void
  updateSkill: (id: string, skill: Partial<Skill>) => void
  removeSkill: (id: string) => void
  reorderSkills: (from: number, to: number) => void
  addCertification: () => void
  updateCertification: (id: string, cert: Partial<Certification>) => void
  removeCertification: (id: string) => void
  addProject: () => void
  updateProject: (id: string, project: Partial<Project>) => void
  removeProject: (id: string) => void
  reorderProjects: (from: number, to: number) => void
  addLanguage: () => void
  updateLanguage: (id: string, lang: Partial<Language>) => void
  removeLanguage: (id: string) => void
  reorderLanguages: (from: number, to: number) => void
  addReference: () => void
  updateReference: (id: string, ref: Partial<Reference>) => void
  removeReference: (id: string) => void
  reorderReferences: (from: number, to: number) => void
  addPublication: () => void
  updatePublication: (id: string, pub: Partial<Publication>) => void
  removePublication: (id: string) => void
  reorderPublications: (from: number, to: number) => void
  addResearchExperience: () => void
  updateResearchExperience: (id: string, exp: Partial<ResearchExperience>) => void
  removeResearchExperience: (id: string) => void
  reorderResearchExperience: (from: number, to: number) => void
  addTeachingExperience: () => void
  updateTeachingExperience: (id: string, exp: Partial<TeachingExperience>) => void
  removeTeachingExperience: (id: string) => void
  addAward: () => void
  updateAward: (id: string, award: Partial<Award>) => void
  removeAward: (id: string) => void
  resetData: () => void
  markSaved: () => void
}

type ResumeStore = ResumeState & ResumeActions

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set) => ({
      currentResumeId: null,
      title: "Untitled Resume",
      documentType: "resume",
      template: "modern",
      data: { ...defaultResumeData },
      isDirty: false,
      lastSaved: null,
      shareSlug: null,
      isPublic: false,

      setCurrentResume: (id, title, documentType, template, data, shareSlug = null, isPublic = false) =>
        set({
          currentResumeId: id, title, documentType, template, isPublic,
          data: normalizeResumeData(data),
          shareSlug: shareSlug ?? null,
          isDirty: false,
          lastSaved: new Date().toISOString(),
        }),

      setData: (data) =>
        set({
          data: normalizeResumeData(data),
          isDirty: true,
        }),

      setShareInfo: (shareSlug, isPublic) =>
        set({ shareSlug, isPublic }),

      setTitle: (title) => set({ title, isDirty: true }),

      setDocumentType: (documentType) => {
        const defaultTemplate = documentType === "cv" ? "academic" : "modern";
        set({ documentType, template: defaultTemplate as TemplateType, isDirty: true });
      },

      setTemplate: (template) => set({ template, isDirty: true }),

      updatePersonalInfo: (info) =>
        set((state) => ({
          data: { ...state.data, personalInfo: { ...state.data.personalInfo, ...info } },
          isDirty: true,
        })),

      updateSummary: (summary) =>
        set((state) => ({ data: { ...state.data, summary }, isDirty: true })),

      updateTheme: (theme) =>
        set((state) => ({
          data: { ...state.data, theme: { ...defaultTheme, ...state.data.theme, ...theme } },
          isDirty: true,
        })),

      addExperience: () =>
        set((state) => ({
          data: {
            ...state.data,
            experience: [
              ...state.data.experience,
              {
                id: nanoid(),
                jobTitle: "",
                company: "",
                location: "",
                startDate: "",
                endDate: "",
                current: false,
                description: "",
              },
            ],
          },
          isDirty: true,
        })),

      updateExperience: (id, exp) =>
        set((state) => ({
          data: {
            ...state.data,
            experience: state.data.experience.map((e) =>
              e.id === id ? { ...e, ...exp } : e
            ),
          },
          isDirty: true,
        })),

      removeExperience: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            experience: state.data.experience.filter((e) => e.id !== id),
          },
          isDirty: true,
        })),

      reorderExperience: (from, to) =>
        set((state) => {
          const items = [...state.data.experience];
          const [moved] = items.splice(from, 1);
          items.splice(to, 0, moved);
          return { data: { ...state.data, experience: items }, isDirty: true };
        }),

      addEducation: () =>
        set((state) => ({
          data: {
            ...state.data,
            education: [
              ...state.data.education,
              {
                id: nanoid(),
                degree: "",
                institution: "",
                field: "",
                startDate: "",
                endDate: "",
                gpa: "",
              },
            ],
          },
          isDirty: true,
        })),

      updateEducation: (id, edu) =>
        set((state) => ({
          data: {
            ...state.data,
            education: state.data.education.map((e) =>
              e.id === id ? { ...e, ...edu } : e
            ),
          },
          isDirty: true,
        })),

      removeEducation: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            education: state.data.education.filter((e) => e.id !== id),
          },
          isDirty: true,
        })),

      reorderEducation: (from, to) =>
        set((state) => {
          const items = [...state.data.education];
          const [moved] = items.splice(from, 1);
          items.splice(to, 0, moved);
          return { data: { ...state.data, education: items }, isDirty: true };
        }),

      addSkill: () =>
        set((state) => ({
          data: {
            ...state.data,
            skills: [
              ...state.data.skills,
              { id: nanoid(), name: "", level: "intermediate" },
            ],
          },
          isDirty: true,
        })),

      updateSkill: (id, skill) =>
        set((state) => ({
          data: {
            ...state.data,
            skills: state.data.skills.map((s) =>
              s.id === id ? { ...s, ...skill } : s
            ),
          },
          isDirty: true,
        })),

      removeSkill: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            skills: state.data.skills.filter((s) => s.id !== id),
          },
          isDirty: true,
        })),

      reorderSkills: (from, to) =>
        set((state) => {
          const items = [...state.data.skills];
          const [moved] = items.splice(from, 1);
          items.splice(to, 0, moved);
          return { data: { ...state.data, skills: items }, isDirty: true };
        }),

      addCertification: () =>
        set((state) => ({
          data: {
            ...state.data,
            certifications: [
              ...state.data.certifications,
              { id: nanoid(), name: "", issuer: "", date: "" },
            ],
          },
          isDirty: true,
        })),

      updateCertification: (id, cert) =>
        set((state) => ({
          data: {
            ...state.data,
            certifications: state.data.certifications.map((c) =>
              c.id === id ? { ...c, ...cert } : c
            ),
          },
          isDirty: true,
        })),

      removeCertification: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            certifications: state.data.certifications.filter((c) => c.id !== id),
          },
          isDirty: true,
        })),

      addProject: () =>
        set((state) => ({
          data: {
            ...state.data,
            projects: [
              ...state.data.projects,
              { id: nanoid(), name: "", url: "", description: "" },
            ],
          },
          isDirty: true,
        })),

      updateProject: (id, project) =>
        set((state) => ({
          data: {
            ...state.data,
            projects: state.data.projects.map((p) =>
              p.id === id ? { ...p, ...project } : p
            ),
          },
          isDirty: true,
        })),

      removeProject: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            projects: state.data.projects.filter((p) => p.id !== id),
          },
          isDirty: true,
        })),

      reorderProjects: (from, to) =>
        set((state) => {
          const items = [...state.data.projects];
          const [moved] = items.splice(from, 1);
          items.splice(to, 0, moved);
          return { data: { ...state.data, projects: items }, isDirty: true };
        }),

      addLanguage: () =>
        set((state) => ({
          data: {
            ...state.data,
            languages: [
              ...state.data.languages,
              { id: nanoid(), name: "", proficiency: "intermediate" },
            ],
          },
          isDirty: true,
        })),

      updateLanguage: (id, lang) =>
        set((state) => ({
          data: {
            ...state.data,
            languages: state.data.languages.map((l) =>
              l.id === id ? { ...l, ...lang } : l
            ),
          },
          isDirty: true,
        })),

      removeLanguage: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            languages: state.data.languages.filter((l) => l.id !== id),
          },
          isDirty: true,
        })),

      reorderLanguages: (from, to) =>
        set((state) => {
          const items = [...state.data.languages];
          const [moved] = items.splice(from, 1);
          items.splice(to, 0, moved);
          return { data: { ...state.data, languages: items }, isDirty: true };
        }),

      addReference: () =>
        set((state) => ({
          data: {
            ...state.data,
            references: [
              ...state.data.references,
              {
                id: nanoid(),
                name: "",
                title: "",
                company: "",
                email: "",
                phone: "",
              },
            ],
          },
          isDirty: true,
        })),

      updateReference: (id, ref) =>
        set((state) => ({
          data: {
            ...state.data,
            references: state.data.references.map((r) =>
              r.id === id ? { ...r, ...ref } : r
            ),
          },
          isDirty: true,
        })),

      removeReference: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            references: state.data.references.filter((r) => r.id !== id),
          },
          isDirty: true,
        })),

      reorderReferences: (from, to) =>
        set((state) => {
          const items = [...state.data.references];
          const [moved] = items.splice(from, 1);
          items.splice(to, 0, moved);
          return { data: { ...state.data, references: items }, isDirty: true };
        }),

      addPublication: () =>
        set((state) => ({
          data: {
            ...state.data,
            publications: [
              ...(state.data.publications || []),
              { id: nanoid(), title: "", authors: "", journal: "", year: "", volume: "", pages: "", doi: "", url: "" },
            ],
          },
          isDirty: true,
        })),

      updatePublication: (id, pub) =>
        set((state) => ({
          data: {
            ...state.data,
            publications: (state.data.publications || []).map((p) =>
              p.id === id ? { ...p, ...pub } : p
            ),
          },
          isDirty: true,
        })),

      removePublication: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            publications: (state.data.publications || []).filter((p) => p.id !== id),
          },
          isDirty: true,
        })),

      reorderPublications: (from, to) =>
        set((state) => {
          const items = [...(state.data.publications || [])];
          const [moved] = items.splice(from, 1);
          items.splice(to, 0, moved);
          return { data: { ...state.data, publications: items }, isDirty: true };
        }),

      addResearchExperience: () =>
        set((state) => ({
          data: {
            ...state.data,
            researchExperience: [
              ...(state.data.researchExperience || []),
              {
                id: nanoid(),
                role: "",
                institution: "",
                location: "",
                startDate: "",
                endDate: "",
                current: false,
                description: "",
                supervisor: "",
              },
            ],
          },
          isDirty: true,
        })),

      updateResearchExperience: (id, exp) =>
        set((state) => ({
          data: {
            ...state.data,
            researchExperience: (state.data.researchExperience || []).map((e) =>
              e.id === id ? { ...e, ...exp } : e
            ),
          },
          isDirty: true,
        })),

      removeResearchExperience: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            researchExperience: (state.data.researchExperience || []).filter((e) => e.id !== id),
          },
          isDirty: true,
        })),

      reorderResearchExperience: (from, to) =>
        set((state) => {
          const items = [...(state.data.researchExperience || [])];
          const [moved] = items.splice(from, 1);
          items.splice(to, 0, moved);
          return { data: { ...state.data, researchExperience: items }, isDirty: true };
        }),

      addTeachingExperience: () =>
        set((state) => ({
          data: {
            ...state.data,
            teachingExperience: [
              ...(state.data.teachingExperience || []),
              { id: nanoid(), courseName: "", institution: "", role: "", startDate: "", endDate: "", description: "" },
            ],
          },
          isDirty: true,
        })),

      updateTeachingExperience: (id, exp) =>
        set((state) => ({
          data: {
            ...state.data,
            teachingExperience: (state.data.teachingExperience || []).map((e) =>
              e.id === id ? { ...e, ...exp } : e
            ),
          },
          isDirty: true,
        })),

      removeTeachingExperience: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            teachingExperience: (state.data.teachingExperience || []).filter((e) => e.id !== id),
          },
          isDirty: true,
        })),

      addAward: () =>
        set((state) => ({
          data: {
            ...state.data,
            awards: [
              ...(state.data.awards || []),
              { id: nanoid(), name: "", issuer: "", date: "", description: "" },
            ],
          },
          isDirty: true,
        })),

      updateAward: (id, award) =>
        set((state) => ({
          data: {
            ...state.data,
            awards: (state.data.awards || []).map((a) =>
              a.id === id ? { ...a, ...award } : a
            ),
          },
          isDirty: true,
        })),

      removeAward: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            awards: (state.data.awards || []).filter((a) => a.id !== id),
          },
          isDirty: true,
        })),

      resetData: () =>
        set({
          currentResumeId: null,
          data: { ...defaultResumeData },
          title: "Untitled Resume",
          documentType: "resume",
          template: "modern",
          isDirty: false,
          shareSlug: null,
          isPublic: false,
        }),

      markSaved: () =>
        set({ isDirty: false, lastSaved: new Date().toISOString() }),
    }),
    {
      name: "resume-draft",
      partialize: (state) => ({
        data: state.data,
        title: state.title,
        documentType: state.documentType,
        template: state.template,
        currentResumeId: state.currentResumeId,
        shareSlug: state.shareSlug,
        isPublic: state.isPublic,
      }),
    }
  )
);
