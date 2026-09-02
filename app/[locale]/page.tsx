import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { HeroSection } from "@/components/home/hero-section";
import { EditorPreview } from "@/components/home/editor-preview";
import { FeaturesSection } from "@/components/home/features-section";
import { CTASection } from "@/components/home/cta-section";
import { JsonLd } from "@/components/seo/json-ld";
import { buildMetadata, SITE_NAME } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return buildMetadata({
    locale,
    path: "",
    title: t("home.title"),
    description: t("home.description"),
    absoluteTitle: true,
  });
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const seo = await getTranslations({ locale, namespace: "seo" });

  const base = getSiteUrl();
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: `${base}/${locale}`,
      inLanguage: locale,
      description: seo("home.description"),
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      url: base,
      logo: `${base}/icon.svg`,
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: SITE_NAME,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: `${base}/${locale}`,
      description: seo("home.description"),
      inLanguage: ["en", "th"],
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  ];

  return (
    <div className="flex flex-col">
      <JsonLd data={jsonLd} />
      <HeroSection t={t} locale={locale} />
      <EditorPreview />
      <FeaturesSection t={t} locale={locale} />
      <CTASection t={t} locale={locale} />
    </div>
  );
}
