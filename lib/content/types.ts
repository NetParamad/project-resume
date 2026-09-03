export type ContentSection = {
  heading: string;
  /** Each string is a paragraph. */
  body: string[];
  /** Optional bullet list rendered after the paragraphs. */
  bullets?: string[];
};

export type FaqItem = { q: string; a: string };

export type LocalizedPage = {
  /** Full <title> — written verbatim, already includes the brand. */
  title: string;
  description: string;
  h1: string;
  intro: string;
  sections: ContentSection[];
  faq: FaqItem[];
  ctaTitle: string;
  ctaBody: string;
};

export type LandingPage = {
  slug: string;
  breadcrumb: { th: string; en: string };
  /** Slugs of other landing pages to cross-link. */
  related: string[];
  /** Knowledge article slugs to link out to. */
  readMore: string[];
  th: LocalizedPage;
  en: LocalizedPage;
};

export type KnowledgeArticle = {
  slug: string;
  breadcrumb: { th: string; en: string };
  datePublished: string;
  related: string[];
  /** Landing page slugs to link to. */
  seeAlso: string[];
  th: LocalizedPage;
  en: LocalizedPage;
};
