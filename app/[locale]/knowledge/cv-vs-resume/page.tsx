import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { buildMetadata, SITE_NAME } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";

const PATH = "/knowledge/cv-vs-resume";

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
    title: t("knowledge.cvVsResume.title"),
    description: t("knowledge.cvVsResume.description"),
    type: "article",
  });
}

export default async function CvVsResume({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("knowledge.cvVsResume");
  const kt = await getTranslations("knowledge");
  const seo = await getTranslations({ locale, namespace: "seo" });

  const base = getSiteUrl();
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: seo("knowledge.cvVsResume.title"),
      description: seo("knowledge.cvVsResume.description"),
      inLanguage: locale,
      url: `${base}/${locale}${PATH}`,
      author: { "@type": "Organization", name: SITE_NAME },
      publisher: { "@type": "Organization", name: SITE_NAME },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: SITE_NAME, item: `${base}/${locale}` },
        { "@type": "ListItem", position: 2, name: t("title"), item: `${base}/${locale}${PATH}` },
      ],
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <JsonLd data={jsonLd} />
      <Link
        href={`/${locale}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        {kt("back")}
      </Link>
      <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
      <p className="text-sm text-muted-foreground mb-8">{t("subtitle")}</p>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">{t("whatIsResume")}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t("resumeDesc")}
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">{t("whatIsCv")}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t("cvDesc")}
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">{t("comparisonTitle")}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold">{t("table.aspect")}</th>
                <th className="text-left py-3 px-4 font-semibold">{t("table.resume")}</th>
                <th className="text-left py-3 px-4 font-semibold">{t("table.cv")}</th>
              </tr>
            </thead>
            <tbody>
              {["length", "purpose", "content", "customization", "update"].map((key) => (
                <tr key={key} className="border-b border-border">
                  <td className="py-3 px-4 font-medium">{t(`table.${key}Label`)}</td>
                  <td className="py-3 px-4 text-muted-foreground">{t(`table.${key}Resume`)}</td>
                  <td className="py-3 px-4 text-muted-foreground">{t(`table.${key}Cv`)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">{t("whenTitle")}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t("whenDesc")}
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">{t("tipTitle")}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t("tipDesc")}
        </p>
      </section>

      <div className="mt-12 pt-6 border-t border-border space-y-4">
        <p className="text-xs text-muted-foreground">
          {t("reference")}
        </p>
        <Link
          href={`/${locale}/knowledge/how-to-use`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          {kt("howToUseCta")}
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
