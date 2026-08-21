import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const THAI_REGEX = /[\u0E00-\u0E7F]/;

export function containsThai(text: string): boolean {
  return THAI_REGEX.test(text);
}

export function hasThaiInResume(data: unknown): boolean {
  if (!data) return false;
  try {
    return THAI_REGEX.test(JSON.stringify(data));
  } catch {
    return false;
  }
}
