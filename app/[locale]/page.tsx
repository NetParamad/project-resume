import { getTranslations, setRequestLocale } from "next-intl/server";
import { HeroSection } from "@/components/home/hero-section";
import { EditorPreview } from "@/components/home/editor-preview";
import { FeaturesSection } from "@/components/home/features-section";
import { CTASection } from "@/components/home/cta-section";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <div className="flex flex-col">
      <HeroSection t={t} locale={locale} />
      <EditorPreview />
      <FeaturesSection t={t} locale={locale} />
      <CTASection t={t} />
    </div>
  );
}
