import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { buildMetadata, articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";

const PATH = "/knowledge/how-to-use";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return buildMetadata({
    locale,
    path: PATH,
    title: t("knowledge.howToUse.title"),
    description: t("knowledge.howToUse.description"),
    type: "article",
  });
}

export default async function HowToUse({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("knowledge.howToUse");
  const kt = await getTranslations("knowledge");
  const g = await getTranslations({ locale, namespace: "guides" });
  const seo = await getTranslations({ locale, namespace: "seo" });

  const crumbs = [
    { name: g("homeCrumb"), path: "" },
    { name: kt("guidesLabel"), path: "/knowledge" },
    { name: t("title"), path: PATH },
  ];

  const jsonLd = [
    articleJsonLd({
      locale,
      path: PATH,
      headline: seo("knowledge.howToUse.title"),
      description: seo("knowledge.howToUse.description"),
      datePublished: "2026-08-22",
    }),
    breadcrumbJsonLd(locale, crumbs),
  ];

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <JsonLd data={jsonLd} />
      <Breadcrumbs items={crumbs.map((c) => ({ name: c.name, href: `/${locale}${c.path}` }))} />
      <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
      <p className="text-sm text-muted-foreground mb-8">{t("subtitle")}</p>

      {[1, 2, 3, 4, 5, 6].map((step) => (
        <section key={step} className="mb-8">
          <h2 className="text-lg font-semibold mb-2">
            {t(`step${step}.title`)}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t(`step${step}.desc`)}
          </p>
        </section>
      ))}
      <div className="mt-12 pt-6 border-t border-border flex flex-col gap-2">
        <Link
          href={`/${locale}/knowledge/cv-vs-resume`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          {kt("cvVsResumeCta")}
          <ArrowRight size={14} />
        </Link>
        <Link
          href={`/${locale}/knowledge`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          {kt("viewAll")}
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
