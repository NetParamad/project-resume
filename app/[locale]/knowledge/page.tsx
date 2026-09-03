import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { ArrowRight } from "lucide-react";
import { routing } from "@/i18n/routing";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";
import { KNOWLEDGE_ARTICLES } from "@/lib/content/knowledge";
import { LANDING_PAGES } from "@/lib/content/landing-pages";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "seo" });
  return buildMetadata({
    locale,
    path: "/knowledge",
    title: t("knowledge.hub.title"),
    description: t("knowledge.hub.description"),
  });
}

function Row({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <li>
      <Link
        href={href}
        className="group block rounded-lg border border-border p-4 transition-colors hover:border-primary/50 hover:bg-card"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground group-hover:text-primary">
              {title}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{desc}</p>
          </div>
          <ArrowRight
            size={16}
            className="mt-0.5 shrink-0 text-muted-foreground group-hover:text-primary"
          />
        </div>
      </Link>
    </li>
  );
}

export default async function KnowledgeHub({ params }: Params) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const loc = locale === "th" ? "th" : "en";
  const k = await getTranslations({ locale, namespace: "knowledge" });
  const g = await getTranslations({ locale, namespace: "guides" });
  const seo = await getTranslations({ locale, namespace: "seo" });
  const base = getSiteUrl();

  const articles = [
    {
      href: `/${locale}/knowledge/how-to-use`,
      title: k("howToUse.title"),
      desc: k("howToUse.subtitle"),
    },
    {
      href: `/${locale}/knowledge/cv-vs-resume`,
      title: k("cvVsResume.title"),
      desc: k("cvVsResume.subtitle"),
    },
    ...KNOWLEDGE_ARTICLES.map((a) => ({
      href: `/${locale}/knowledge/${a.slug}`,
      title: a[loc].h1,
      desc: a[loc].description,
    })),
  ];

  const guides = LANDING_PAGES.map((p) => ({
    href: `/${locale}/${p.slug}`,
    title: p[loc].h1,
    desc: p[loc].description,
  }));

  const crumbs = [
    { name: g("homeCrumb"), path: "" },
    { name: k("guidesLabel"), path: "/knowledge" },
  ];

  const jsonLd = [
    breadcrumbJsonLd(locale, crumbs),
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: seo("knowledge.hub.title"),
      description: seo("knowledge.hub.description"),
      url: `${base}/${locale}/knowledge`,
      inLanguage: loc === "th" ? "th-TH" : "en-US",
      isPartOf: { "@id": `${base}/#website` },
      hasPart: [...articles, ...guides].map((item) => ({
        "@type": "WebPage",
        name: item.title,
        url: `${base}${item.href}`,
      })),
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <JsonLd data={jsonLd} />
      <Breadcrumbs items={crumbs.map((c) => ({ name: c.name, href: `/${locale}${c.path}` }))} />

      <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{k("hubHeading")}</h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">{k("hubIntro")}</p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-4">{k("guidesLabel")}</h2>
        <ul className="space-y-3">
          {guides.map((item) => (
            <Row key={item.href} {...item} />
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-4">{k("articlesLabel")}</h2>
        <ul className="space-y-3">
          {articles.map((item) => (
            <Row key={item.href} {...item} />
          ))}
        </ul>
      </section>
    </div>
  );
}
