import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { alternates, buildMetadata } from "@/lib/seo";
import { fontVariables } from "@/lib/fonts";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ToastViewport } from "@/components/ui/toast";
import { PageTransition } from "@/components/page-transition";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    return { alternates: { languages: alternates(routing.defaultLocale).languages } };
  }

  const t = await getTranslations({ locale, namespace: "seo" });

  return buildMetadata({
    locale,
    path: "",
    title: t("defaultTitle"),
    description: t("home.description"),
    absoluteTitle: true,
  });
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={fontVariables}>
      <body className="antialiased" suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Navbar />
          <main className="min-h-screen pb-16 md:pb-0 flex flex-col">
            <PageTransition>
              {children}
              <Footer />
            </PageTransition>
          </main>
          <ToastViewport />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
