import { setRequestLocale } from "next-intl/server";
import { LoginForm } from "@/components/login-form";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="w-full max-w-sm">
      <LoginForm />
    </div>
  );
}
