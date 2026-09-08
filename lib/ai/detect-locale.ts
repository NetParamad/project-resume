const THAI_PATTERN = /[\u0E00-\u0E7F]/;

/**
 * Resolves which language the AI should respond in. Free-typed input (a
 * pasted job description, a custom auto-fill prompt) wins over the UI's
 * locale toggle, so typing Thai gets a Thai reply even if the app is set
 * to English, and vice versa. Falls back to the UI locale when there's no
 * text to read a signal from.
 */
export function resolveLocale(text: string | undefined | null, uiLocale?: string): "th" | "en" {
  const trimmed = text?.trim();
  if (trimmed) {
    return THAI_PATTERN.test(trimmed) ? "th" : "en";
  }
  return uiLocale === "th" ? "th" : "en";
}

function hasThaiText(data: unknown): boolean {
  if (!data) return false;
  try {
    return THAI_PATTERN.test(JSON.stringify(data));
  } catch {
    return false;
  }
}

/**
 * Resolves the language for resume-processing features (ATS scoring,
 * improve agent, polish, tailor). The resume's own content is the primary
 * signal — a Thai resume gets a Thai system prompt even when the job
 * description or UI toggle is English — then the job description, then the
 * UI locale as the final fallback.
 */
export function resolveResumeLocale(
  resumeData: unknown,
  inputText?: string | null,
  uiLocale?: string,
): "th" | "en" {
  if (hasThaiText(resumeData)) return "th";
  return resolveLocale(inputText, uiLocale);
}
