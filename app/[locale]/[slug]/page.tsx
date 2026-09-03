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
  softwareAppJsonLd,
} from "@/lib/seo";
import { LANDING_PAGES, getLandingPage } from "@/lib/content/landing-pages";
import { getKnowledgeArticle } from "@/lib/content/knowledge";

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    LANDING_PAGES.map((p) => ({ locale, slug: p.slug })),
  );
}

type Params = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = getLandingPage(slug);
  if (!page || !hasLocale(routing.locales, locale)) return {};

  const c = page[locale === "th" ? "th" : "en"];
  return buildMetadata({
    locale,
    path: `/${slug}`,
    title: c.title,
    description: c.description,
    absoluteTitle: true,
  });
}

export default async function LandingPage({ params }: Params) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const page = getLandingPage(slug);
  if (!page) notFound();

  const loc = locale === "th" ? "th" : "en";
  const c = page[loc];
  const g = await getTranslations({ locale, namespace: "guides" });
  const k = await getTranslations({ locale, namespace: "knowledge" });

  const relatedLinks = page.related
    .map((s) => getLandingPage(s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .map((p) => ({ label: p[loc].h1, href: `/${locale}/${p.slug}` }));

  const readMoreLinks = page.readMore
    .map((s) => getKnowledgeArticle(s))
    .filter((a): a is NonNullable<typeof a> => Boolean(a))
    .map((a) => ({ label: a[loc].h1, href: `/${locale}/knowledge/${a.slug}` }));

  const crumbs = [
    { name: g("homeCrumb"), path: "" },
    { name: k("guidesLabel"), path: "/knowledge" },
    { name: page.breadcrumb[loc], path: `/${slug}` },
  ];

  const jsonLd = [
    breadcrumbJsonLd(
      locale,
      crumbs.map((cr) => ({ name: cr.name, path: cr.path })),
    ),
    faqJsonLd(c.faq),
    softwareAppJsonLd(locale, c.description),
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
        readMore={{ heading: g("readMoreHeading"), links: readMoreLinks }}
      />
    </>
  );
}
