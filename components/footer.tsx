"use client";

import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function Footer() {
  const t = useTranslations();
  const f = useTranslations("footer");
  const locale = useLocale();
  const pathname = usePathname();

  if (pathname.includes("/builder/")) {
    return null;
  }

  return (
    <footer className="w-full border-t border-border bg-background mt-auto">
      <div className="max-w-5xl mx-auto px-5 py-10">
        <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-16">
          <div className="flex-1">
            <Link href={`/${locale}`} className="font-semibold text-base">
              {t("app.title")}
            </Link>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              {t("app.description")}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {f("links")}
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href={`/${locale}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("nav.home")}
              </Link>
              <Link
                href={`/${locale}/dashboard`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("nav.dashboard")}
              </Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {f("legal")}
            </p>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground cursor-not-allowed">
                {f("privacy")}
              </span>
              <span className="text-sm text-muted-foreground cursor-not-allowed">
                {f("terms")}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            {f("copyright", { year: String(new Date().getFullYear()) })}
          </p>
        </div>
      </div>
    </footer>
  );
}
