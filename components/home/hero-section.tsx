import Link from "next/link";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  t: (key: string) => string;
  locale: string;
}

export function HeroSection({ t, locale }: HeroSectionProps) {
  return (
    <section className="py-20 md:py-32 px-5">
      <div className="max-w-3xl mx-auto text-center space-y-6 my-5">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          {t("home.hero.title")}
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          {t("home.hero.subtitle")}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href={`/${locale}/auth/sign-up`}>
            <Button size="lg" className="text-base transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0">
              {t("home.hero.getStarted")}
            </Button>
          </Link>
          <Link href={`/${locale}/auth/login`}>
            <Button variant="outline" size="lg" className="text-base transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0">
              {t("nav.signIn")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
