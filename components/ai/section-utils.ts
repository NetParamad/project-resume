export const SECTION_KEYS: Record<string, string> = {
  summary: "summary",
  experience: "experience",
  skills: "skills",
  education: "education",
  projects: "projects",
  certifications: "certifications",
  languages: "languages",
  references: "references",
};

export function truncate(s: string, max = 120): string {
  return s.length > max ? s.slice(0, max) + "…" : s;
}

export function renderValue(section: string, value: unknown): string {
  if (section === "summary") {
    return truncate(String(value ?? ""));
  }
  if (Array.isArray(value)) {
    const names = value
      .map((item) => {
        if (!item || typeof item !== "object") return "";
        const t = item as Record<string, unknown>;
        if (section === "experience") return String(t.jobTitle ?? t.company ?? "");
        if (section === "skills") return String(t.name ?? "");
        if (section === "education") return String(t.degree ?? t.institution ?? "");
        if (section === "projects") return String(t.name ?? "");
        return String(t.name ?? t.title ?? "");
      })
      .filter(Boolean)
      .join(", ");
    return names || `${value.length} items`;
  }
  return truncate(String(value ?? ""));
}

export function sectionTitle(t: (key: never) => string, section: string): string {
  const key = SECTION_KEYS[section];
  if (key) {
    try {
      const label = t(`${key}.title` as never);
      if (label && label !== `${key}.title`) return label;
    } catch {
      // fall through
    }
  }
  return section.charAt(0).toUpperCase() + section.slice(1);
}
