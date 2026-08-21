import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ResumeLang } from "@/lib/resume-lang";

export type ResumeLangPreference = "auto" | ResumeLang;

interface ResumeLangStore {
  lang: ResumeLangPreference;
  setLang: (lang: ResumeLangPreference) => void;
}

export const useResumeLangStore = create<ResumeLangStore>()(
  persist(
    (set) => ({
      lang: "auto",
      setLang: (lang) => set({ lang }),
    }),
    { name: "resume-lang-preference" },
  ),
);
