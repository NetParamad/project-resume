import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { routing } from "@/i18n/routing";

const paths = ["", "/knowledge/how-to-use", "/knowledge/cv-vs-resume"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  return routing.locales.flatMap((locale) =>
    paths.map((path) => ({
      url: `${base}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : 0.7,
    })),
  );
}
