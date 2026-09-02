import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { routing } from "@/i18n/routing";

/** Public brand name. Used in <title> template, Open Graph, JSON-LD, footer. */
export const SITE_NAME = "RMUTL Resume";

/**
 * Alternate names people actually type for this site. Fed to WebSite JSON-LD
 * `alternateName` so Google can resolve these queries to the same entity.
 */
export const SITE_ALTERNATE_NAMES = [
  "RMUTL Resume Builder",
  "Resume RMUTL",
  "Resume มทร.ล้านนา",
  "เรซูเม่ มทร.ล้านนา",
  "เรซูเม่ราชมงคลล้านนา",
];

/** The university this tool is built for. Referenced (not impersonated) in schema. */
export const UNIVERSITY = {
  name: "มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา",
  nameEn: "Rajamangala University of Technology Lanna",
  abbr: "RMUTL",
  url: "https://www.rmutl.ac.th",
};

/** Broad, brand-relevant keywords reused across pages (EN + TH). */
export const SEO_KEYWORDS = [
  "RMUTL Resume",
  "RMUTL Resume Builder",
  "Resume RMUTL",
  "resume builder",
  "free resume builder",
  "ATS resume",
  "AI resume builder",
  "resume templates",
  "resume for students",
  "student resume builder",
  "สร้างเรซูเม่",
  "เรซูเม่ออนไลน์",
  "เรซูเม่ นักศึกษา",
  "เรซูเม่ มทร.ล้านนา",
  "resume มทร.ล้านนา",
  "resume ราชมงคลล้านนา",
  "สร้าง resume ออนไลน์",
  "เรซูเม่ ATS",
  "ทำเรซูเม่ฟรี",
];

const OG_LOCALE: Record<string, string> = {
  en: "en_US",
  th: "th_TH",
};

const HREFLANG: Record<string, string> = {
  en: "en",
  th: "th",
};

/** Open Graph / Twitter card image (the dynamic brand image at /opengraph-image). */
export function ogImage() {
  return {
    url: `${getSiteUrl()}/opengraph-image`,
    width: 1200,
    height: 630,
    alt: `${SITE_NAME} — free ATS resume builder for ${UNIVERSITY.abbr} students`,
  };
}

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
  /** Override the card image. Defaults to the dynamic brand OG image. */
  images?: Array<{ url: string; width?: number; height?: number; alt?: string }>;
  /** When true, `title` is used verbatim without the "… — RMUTL Resume" template. */
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
  const cardImages = images ?? [ogImage()];

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
      images: cardImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: cardImages,
    },
  };
}

type JsonLdObject = Record<string, unknown>;

/**
 * Structured data for the home page: identifies the site as "RMUTL Resume",
 * lists the aliases users search for, and states (via `about`) that the tool
 * serves มทร.ล้านนา students — without claiming to be the university itself.
 */
export function homeJsonLd(locale: string, description: string): JsonLdObject[] {
  const base = getSiteUrl();
  const url = `${base}/${locale}`;

  const university: JsonLdObject = {
    "@type": "CollegeOrUniversity",
    name: UNIVERSITY.name,
    alternateName: UNIVERSITY.nameEn,
    url: UNIVERSITY.url,
  };

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${base}/#website`,
      name: SITE_NAME,
      alternateName: SITE_ALTERNATE_NAMES,
      url: base,
      inLanguage: locale === "th" ? "th-TH" : "en-US",
      description,
      publisher: { "@id": `${base}/#organization` },
      about: university,
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${base}/#organization`,
      name: SITE_NAME,
      alternateName: SITE_ALTERNATE_NAMES,
      url: base,
      logo: `${base}/icon.svg`,
      description:
        locale === "th"
          ? `เครื่องมือสร้างเรซูเม่ออนไลน์สำหรับนักศึกษาและบัณฑิต${UNIVERSITY.name} (${UNIVERSITY.abbr})`
          : `Online resume builder for students and graduates of ${UNIVERSITY.nameEn} (${UNIVERSITY.abbr}).`,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "@id": `${base}/#webapp`,
      name: SITE_NAME,
      alternateName: SITE_ALTERNATE_NAMES,
      url,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      browserRequirements: "Requires JavaScript. Modern browser.",
      inLanguage: ["th-TH", "en-US"],
      description,
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "THB" },
      audience: {
        "@type": "EducationalAudience",
        educationalRole: "student",
        audienceType: `${UNIVERSITY.abbr} students and graduates`,
      },
      about: university,
      publisher: { "@id": `${base}/#organization` },
      featureList: [
        "ATS-friendly resume templates",
        "AI writing assistant",
        "ATS score checker",
        "PDF export",
        "Shareable resume link",
        "Thai and English",
      ],
    },
  ];
}
