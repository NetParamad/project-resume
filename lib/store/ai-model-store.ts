"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AIModelState {
  override: string | null;
  setOverride: (model: string | null) => void;
}

export const useAIModelStore = create<AIModelState>()(
  persist(
    (set) => ({
      override: null,
      setOverride: (model) => set({ override: model }),
    }),
    { name: "ai-model-choice" },
  ),
);
