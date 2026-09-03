import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { JsonLd } from "@/components/seo/json-ld";
import { ContentPageView } from "@/components/marketing/content-page-view";
import {
  buildMetadata,
  breadcrumbJsonLd,
  faqJsonLd,
  articleJsonLd,
} from "@/lib/seo";
import { KNOWLEDGE_ARTICLES, getKnowledgeArticle } from "@/lib/content/knowledge";
import { getLandingPage } from "@/lib/content/landing-pages";

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    KNOWLEDGE_ARTICLES.map((a) => ({ locale, slug: a.slug })),
  );
}

type Params = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = getKnowledgeArticle(slug);
  if (!article || !hasLocale(routing.locales, locale)) return {};

  const c = article[locale === "th" ? "th" : "en"];
  return buildMetadata({
    locale,
    path: `/knowledge/${slug}`,
    title: c.title,
    description: c.description,
    type: "article",
    absoluteTitle: true,
  });
}

export default async function KnowledgeArticlePage({ params }: Params) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const article = getKnowledgeArticle(slug);
  if (!article) notFound();

  const loc = locale === "th" ? "th" : "en";
  const c = article[loc];
  const path = `/knowledge/${slug}`;
  const g = await getTranslations({ locale, namespace: "guides" });
  const k = await getTranslations({ locale, namespace: "knowledge" });

  const relatedLinks = article.related
    .map((s) => getKnowledgeArticle(s))
    .filter((a): a is NonNullable<typeof a> => Boolean(a))
    .map((a) => ({ label: a[loc].h1, href: `/${locale}/knowledge/${a.slug}` }));

  const seeAlsoLinks = article.seeAlso
    .map((s) => getLandingPage(s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .map((p) => ({ label: p[loc].h1, href: `/${locale}/${p.slug}` }));

  const crumbs = [
    { name: g("homeCrumb"), path: "" },
    { name: k("guidesLabel"), path: "/knowledge" },
    { name: article.breadcrumb[loc], path },
  ];

  const jsonLd = [
    articleJsonLd({
      locale,
      path,
      headline: c.title,
      description: c.description,
      datePublished: article.datePublished,
    }),
    breadcrumbJsonLd(locale, crumbs.map((cr) => ({ name: cr.name, path: cr.path }))),
    faqJsonLd(c.faq),
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <ContentPageView
        breadcrumbs={crumbs.map((cr) => ({ name: cr.name, href: `/${locale}${cr.path}` }))}
        h1={c.h1}
        intro={c.intro}
        sections={c.sections}
        faq={c.faq}
        faqHeading={g("faqHeading")}
        cta={{
          title: c.ctaTitle,
          body: c.ctaBody,
          href: `/${locale}/auth/sign-up`,
          label: g("ctaLabel"),
        }}
        related={{ heading: g("relatedHeading"), links: relatedLinks }}
        readMore={{ heading: g("readMoreHeading"), links: seeAlsoLinks }}
      />
    </>
  );
}
