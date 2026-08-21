import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ToastViewport } from "@/components/ui/toast";
import { PageTransition } from "@/components/page-transition";
import { SetHtmlLang } from "@/components/SetHtmlLang";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <SetHtmlLang locale={locale} />
      <Navbar />
      <main className="min-h-screen pb-16 md:pb-0 flex flex-col">
          <PageTransition>
            {children}
            <Footer />
          </PageTransition>
        </main>
      <ToastViewport />
    </NextIntlClientProvider>
  );
}
