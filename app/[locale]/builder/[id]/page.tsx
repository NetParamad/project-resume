import { setRequestLocale } from "next-intl/server";
import { BuilderLayout } from "@/components/builder/BuilderLayout";

export default async function BuilderPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ type?: string; title?: string }>;
}) {
  const { locale, id } = await params;
  const { type, title } = await searchParams;
  setRequestLocale(locale);

  return (
    <div className="flex flex-col min-h-0 lg:h-[calc(100dvh-4rem)] lg:overflow-hidden">
      <BuilderLayout
        resumeId={id}
        documentType={type as "resume" | "cv" | undefined}
        initialTitle={title}
      />
    </div>
  );
}
