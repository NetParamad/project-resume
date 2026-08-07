import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default async function HowToUse({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("knowledge.howToUse");
  const kt = await getTranslations("knowledge");

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <Link
        href={`/${locale}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        {kt("back")}
      </Link>
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
      <div className="mt-12 pt-6 border-t border-border">
        <Link
          href={`/${locale}/knowledge/cv-vs-resume`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          {kt("cvVsResumeCta")}
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
