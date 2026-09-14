import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { routing } from "@/i18n/routing";

/** Public brand name. Used in <title> template, Open Graph, JSON-LD, footer. */
export const SITE_NAME = "Resume Builder";

/** Short-form abbreviation, surfaced in structured data and card alt text. */
export const SITE_ABBR = "AIRB";

/**
 * Alternate names people actually type for this site. Fed to WebSite JSON-LD
 * `alternateName` so Google can resolve these queries to the same entity.
 */
export const SITE_ALTERNATE_NAMES = [
  "AI Resume Builder",
  "AIRB",
  "Resume Builder AI",
  "เรซูเม่บิลเดอร์",
];

/** Broad, brand-relevant keywords reused across pages (EN + TH). */
export const SEO_KEYWORDS = [
  "resume builder",
  "AI resume builder",
  "free resume builder",
  "ATS resume",
  "ATS resume builder",
  "resume templates",
  "online resume builder",
  "cv builder",
  "สร้างเรซูเม่",
  "เรซูเม่ออนไลน์",
  "สร้าง resume ออนไลน์",
  "เรซูเม่ ATS",
  "ทำเรซูเม่ฟรี",
  "ทำ resume ด้วย AI",
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
    alt: `${SITE_NAME} (${SITE_ABBR}) — free AI-powered ATS resume builder`,
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

const inLang = (locale: string) => (locale === "th" ? "th-TH" : "en-US");

/** BreadcrumbList from an ordered list of {name, path} (path is locale-relative, "" = home). */
export function breadcrumbJsonLd(
  locale: string,
  crumbs: Array<{ name: string; path: string }>,
): JsonLdObject {
  const base = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${base}/${locale}${c.path}`,
    })),
  };
}

/** FAQPage — only emit when the same Q&A is visible on the page. */
export function faqJsonLd(faq: Array<{ q: string; a: string }>): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

/** Article structured data for knowledge / guide pages. */
export function articleJsonLd(opts: {
  locale: string;
  path: string;
  headline: string;
  description: string;
  datePublished?: string;
  dateModified?: string;
}): JsonLdObject {
  const base = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.headline,
    description: opts.description,
    inLanguage: inLang(opts.locale),
    url: `${base}/${opts.locale}${opts.path}`,
    mainEntityOfPage: `${base}/${opts.locale}${opts.path}`,
    image: `${base}/opengraph-image`,
    ...(opts.datePublished ? { datePublished: opts.datePublished } : {}),
    dateModified: opts.dateModified ?? opts.datePublished,
    author: { "@id": `${base}/#organization` },
    publisher: { "@id": `${base}/#organization` },
  };
}

/** SoftwareApplication block reused on commercial landing pages. */
export function softwareAppJsonLd(locale: string, description: string): JsonLdObject {
  const base = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${base}/#webapp`,
    name: SITE_NAME,
    alternateName: SITE_ALTERNATE_NAMES,
    url: `${base}/${locale}`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    inLanguage: ["th-TH", "en-US"],
    description,
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "THB" },
    publisher: { "@id": `${base}/#organization` },
  };
}

/**
 * Structured data for the home page: identifies the site as "Resume
 * Builder" (AIRB) and lists the aliases users search for.
 */
export function homeJsonLd(locale: string, description: string): JsonLdObject[] {
  const base = getSiteUrl();
  const url = `${base}/${locale}`;

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
          ? `เครื่องมือสร้างเรซูเม่ออนไลน์ด้วย AI ที่ผ่านมาตรฐาน ATS ใช้งานได้ฟรี`
          : `Free, AI-powered, ATS-friendly online resume builder.`,
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
