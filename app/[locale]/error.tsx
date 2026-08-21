"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("pageErrors");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-heading text-6xl font-bold text-destructive">!</p>
      <h1 className="mt-4 text-xl font-semibold text-foreground">
        {t("errorTitle")}
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {t("errorDesc")}
      </p>
      <Button onClick={reset} className="mt-6">
        {t("retry")}
      </Button>
    </div>
  );
}
