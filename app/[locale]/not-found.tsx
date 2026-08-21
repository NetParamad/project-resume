import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default async function NotFoundPage() {
  const t = await getTranslations("pageErrors");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-heading text-6xl font-bold text-primary">404</p>
      <h1 className="mt-4 text-xl font-semibold text-foreground">
        {t("notFoundTitle")}
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {t("notFoundDesc")}
      </p>
      <Button asChild className="mt-6">
        <Link href="/">{t("backHome")}</Link>
      </Button>
    </div>
  );
}
