import { Button } from "@/components/ui/button";
import {
  FileText,
  Palette,
  Shield,
  Zap,
  Globe,
  Download,
  Layout,
  Layers,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

const features = [
  { key: "fastEditor", icon: Zap },
  { key: "atsOptimized", icon: Shield },
  { key: "customization", icon: Palette },
  { key: "multiFormatExport", icon: Download },
  { key: "smartLayout", icon: Layout },
  { key: "multiLanguage", icon: Globe },
  { key: "sectionManager", icon: Layers },
  { key: "coverLetter", icon: FileText },
] as const;

const HIGHLIGHT_COUNT = 6;

interface FeaturesSectionProps {
  t: (key: string) => string;
  locale: string;
}

export function FeaturesSection({ t, locale }: FeaturesSectionProps) {
  return (
    <>
      <section className="bg-background py-12 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-heading text-sm font-semibold uppercase tracking-wider text-primary">
              {t("home.features.badge")}
            </p>
            <h1 className="mt-3 font-heading text-4xl font-bold text-foreground md:text-5xl">
              <span className="text-balance">
                {t("home.features.title")}
              </span>
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              {t("home.features.subtitle")}
            </p>
          </div>
        </div>
      </section>

      <section className="border-border bg-card pb-12 lg:pb-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.key}
                className="group rounded-xl border border-border bg-background p-6 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 transition-all group-hover:scale-110 group-hover:bg-primary/15">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-heading text-base font-semibold text-foreground">
                  {t(`home.features.${feature.key}Title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t(`home.features.${feature.key}Desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background py-12 lg:py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="font-heading text-sm font-semibold uppercase tracking-wider text-primary">
                {t("home.features.whyUsBadge")}
              </p>
              <h2 className="mt-3 font-heading text-3xl font-bold text-foreground md:text-4xl">
                <span className="text-balance">
                  {t("home.features.whyUsTitle")}
                </span>
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                {t("home.features.whyUsSubtitle")}
              </p>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {Array.from({ length: HIGHLIGHT_COUNT }, (_, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm text-foreground">
                      {t(`home.features.highlights.${i}`)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button size="lg" className="gap-2 transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0" asChild>
                  <Link href={`/${locale}/auth/sign-up`}>
                    {t("home.features.cta")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="overflow-hidden rounded-xl border border-border bg-card p-8">
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10" />
                    <div className="flex flex-col gap-2">
                      <div className="h-4 w-36 rounded bg-foreground/15" />
                      <div className="h-3 w-24 rounded bg-muted-foreground/10" />
                    </div>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex flex-col gap-3">
                    <div className="h-3 w-24 rounded bg-primary/20" />
                    <div className="h-2.5 w-full rounded bg-muted-foreground/10" />
                    <div className="h-2.5 w-11/12 rounded bg-muted-foreground/10" />
                    <div className="h-2.5 w-4/5 rounded bg-muted-foreground/10" />
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="h-3 w-20 rounded bg-primary/20" />
                    <div className="flex gap-2">
                      <div className="h-7 w-20 rounded-full bg-primary/10" />
                      <div className="h-7 w-16 rounded-full bg-primary/10" />
                      <div className="h-7 w-24 rounded-full bg-primary/10" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="h-3 w-28 rounded bg-primary/20" />
                    <div className="h-2.5 w-full rounded bg-muted-foreground/10" />
                    <div className="h-2.5 w-3/4 rounded bg-muted-foreground/10" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
