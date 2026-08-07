import { setRequestLocale } from "next-intl/server";
import { SignUpForm } from "@/components/sign-up-form";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="w-full max-w-sm">
      <SignUpForm />
    </div>
  );
}
