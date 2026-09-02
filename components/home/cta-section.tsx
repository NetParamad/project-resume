import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CTASectionProps {
  t: (key: string) => string;
  locale: string;
}

export function CTASection({ t, locale }: CTASectionProps) {
  return (
    <section className="py-16 px-5">
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <h2 className="text-2xl font-bold">{t("home.cta.title")}</h2>
        <p className="text-muted-foreground">{t("home.cta.subtitle")}</p>
        <div className="pt-2">
          <Link href={`/${locale}/auth/sign-up`}>
            <Button size="lg" className="transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0">{t("home.hero.getStarted")}</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
