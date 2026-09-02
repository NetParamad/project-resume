import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { HeroSection } from "@/components/home/hero-section";
import { EditorPreview } from "@/components/home/editor-preview";
import { FeaturesSection } from "@/components/home/features-section";
import { AboutSection } from "@/components/home/about-section";
import { CTASection } from "@/components/home/cta-section";
import { JsonLd } from "@/components/seo/json-ld";
import { buildMetadata, homeJsonLd } from "@/lib/seo";

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

  return (
    <div className="flex flex-col">
      <JsonLd data={homeJsonLd(locale, seo("home.description"))} />
      <HeroSection t={t} locale={locale} />
      <EditorPreview />
      <FeaturesSection t={t} locale={locale} />
      <AboutSection t={t} locale={locale} />
      <CTASection t={t} locale={locale} />
    </div>
  );
}
