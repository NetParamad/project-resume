"use client";

import { createContext, useContext } from "react";
import { createResumeLang, type ResumeLang, type ResumeLangKey } from "./resume-lang";

const ResumeLangContext = createContext<ResumeLang | null>(null);

export function ResumeLangProvider({
  value,
  children,
}: {
  value: ResumeLang | null;
  children: React.ReactNode;
}) {
  return <ResumeLangContext.Provider value={value}>{children}</ResumeLangContext.Provider>;
}

export function useResumeLang(): ResumeLang | null {
  return useContext(ResumeLangContext);
}

export function useResumeTranslator(data: unknown) {
  const lang = useResumeLang();
  return createResumeLang(data, lang);
}

export type { ResumeLang, ResumeLangKey };
