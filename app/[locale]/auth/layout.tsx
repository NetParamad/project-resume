import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth");
  const appT = await getTranslations("app");

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          {t("backHome")}
        </Link>
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 font-semibold text-lg"
        >
          <FileText size={20} className="text-primary" />
          {appT("title")}
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}
