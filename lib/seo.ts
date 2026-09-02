import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { routing } from "@/i18n/routing";

export const SITE_NAME = "Resume Builder";

/** Broad, brand-relevant keywords reused across pages (EN + TH). */
export const SEO_KEYWORDS = [
  "resume builder",
  "resume maker",
  "online resume builder",
  "free resume builder",
  "CV builder",
  "CV maker",
  "ATS resume",
  "ATS friendly resume",
  "AI resume builder",
  "resume templates",
  "curriculum vitae",
  "cover letter",
  "resume checker",
  "สร้างเรซูเม่",
  "เรซูเม่ออนไลน์",
  "ทำเรซูเม่ฟรี",
  "เขียน resume",
  "เทมเพลตเรซูเม่",
  "resume ATS",
];

const OG_LOCALE: Record<string, string> = {
  en: "en_US",
  th: "th_TH",
};

const HREFLANG: Record<string, string> = {
  en: "en",
  th: "th",
};

/**
 * Canonical URL + hreflang alternates for a locale-prefixed path.
 * `path` is the part after the locale, e.g. "" or "/knowledge/how-to-use".
 */
export function alternates(locale: string, path = ""): NonNullable<Metadata["alternates"]> {
  const base = getSiteUrl();
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[HREFLANG[l] ?? l] = `${base}/${l}${path}`;
  }
  languages["x-default"] = `${base}/${routing.defaultLocale}${path}`;

  return {
    canonical: `${base}/${locale}${path}`,
    languages,
  };
}

type BuildMetadataOptions = {
  locale: string;
  path?: string;
  title: string;
  description: string;
  keywords?: string[];
  type?: "website" | "article";
  /** Absolute or metadataBase-relative image URLs. Falls back to the file-based OG image. */
  images?: string[];
  /** When true, `title` is used verbatim without the "… — Resume Builder" template. */
  absoluteTitle?: boolean;
};

/** Assemble a consistent Metadata object (canonical, hreflang, Open Graph, Twitter). */
export function buildMetadata({
  locale,
  path = "",
  title,
  description,
  keywords,
  type = "website",
  images,
  absoluteTitle = false,
}: BuildMetadataOptions): Metadata {
  const alt = alternates(locale, path);

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords: keywords ?? SEO_KEYWORDS,
    alternates: alt,
    openGraph: {
      type,
      url: alt.canonical as string,
      siteName: SITE_NAME,
      title,
      description,
      locale: OG_LOCALE[locale] ?? "en_US",
      alternateLocale: routing.locales
        .filter((l) => l !== locale)
        .map((l) => OG_LOCALE[l] ?? "en_US"),
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(images ? { images } : {}),
    },
  };
}
