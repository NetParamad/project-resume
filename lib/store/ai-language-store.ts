"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type OutputLocale = "th" | "en";

interface AILanguageState {
  /** null = auto-detect from resume content / job description. */
  override: OutputLocale | null;
  setOverride: (locale: OutputLocale | null) => void;
}

export const useAILanguageStore = create<AILanguageState>()(
  persist(
    (set) => ({
      override: null,
      setOverride: (locale) => set({ override: locale }),
    }),
    { name: "ai-language-choice" },
  ),
);
