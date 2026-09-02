import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface AboutSectionProps {
  t: (key: string) => string;
  locale: string;
}

export function AboutSection({ t, locale }: AboutSectionProps) {
  return (
    <section className="bg-card border-y border-border py-12 lg:py-16">
      <div className="mx-auto max-w-3xl px-5">
        <p className="font-heading text-sm font-semibold uppercase tracking-wider text-primary">
          {t("home.about.badge")}
        </p>
        <h2 className="mt-3 font-heading text-2xl font-bold text-foreground md:text-3xl">
          {t("home.about.title")}
        </h2>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          {t("home.about.body")}
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:gap-6">
          <Link
            href={`/${locale}/knowledge/how-to-use`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            {t("home.about.howToUseCta")}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={`/${locale}/knowledge/cv-vs-resume`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            {t("home.about.cvVsResumeCta")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
