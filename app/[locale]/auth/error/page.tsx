"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ErrorMessage() {
  const t = useTranslations("auth.error");
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <p className="text-sm text-muted-foreground">
      {error
        ? t("codeError", { error })
        : t("unspecifiedError")}
    </p>
  );
}

export default function Page() {
  const t = useTranslations("auth.error");

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t("title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<p className="text-sm text-muted-foreground">{t("unspecifiedError")}</p>}>
                <ErrorMessage />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
