import { setRequestLocale } from "next-intl/server";
import { UpdatePasswordForm } from "@/components/update-password-form";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="w-full max-w-sm">
      <UpdatePasswordForm />
    </div>
  );
}
