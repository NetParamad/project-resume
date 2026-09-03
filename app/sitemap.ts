import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { routing } from "@/i18n/routing";
import { LANDING_SLUGS } from "@/lib/content/landing-pages";
import { KNOWLEDGE_SLUGS } from "@/lib/content/knowledge";

/** Public, indexable paths (locale-relative). Private routes are excluded. */
const paths: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }> = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  ...LANDING_SLUGS.map((s) => ({ path: `/${s}`, priority: 0.9, changeFrequency: "monthly" as const })),
  { path: "/knowledge", priority: 0.7, changeFrequency: "monthly" },
  { path: "/knowledge/how-to-use", priority: 0.6, changeFrequency: "monthly" },
  { path: "/knowledge/cv-vs-resume", priority: 0.6, changeFrequency: "monthly" },
  ...KNOWLEDGE_SLUGS.map((s) => ({ path: `/knowledge/${s}`, priority: 0.6, changeFrequency: "monthly" as const })),
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const lastModified = new Date();

  return routing.locales.flatMap((locale) =>
    paths.map(({ path, priority, changeFrequency }) => ({
      url: `${base}/${locale}${path}`,
      lastModified,
      changeFrequency,
      priority,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, `${base}/${l}${path}`]),
        ),
      },
    })),
  );
}
