import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { normalizeResumeData, type TemplateType, type ResumeData } from "@/lib/types/resume";
import { ShareResumeView } from "@/components/share/ShareResumeView";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const supabase = await createClient();
  const { data: resume } = await supabase
    .from("resumes")
    .select("title, template")
    .eq("share_slug", slug)
    .eq("is_public", true)
    .single();

  if (!resume) return { robots: { index: false, follow: false } };

  const title = resume.title ?? "Shared Resume";
  return {
    title,
    description: `Resume shared via ${title}`,
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description: `View ${title} — shared resume`,
      type: "profile",
    },
  };
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data: resume } = await supabase
    .from("resumes")
    .select("data, title, template")
    .eq("share_slug", slug)
    .eq("is_public", true)
    .single();

  if (!resume) {
    notFound();
  }

  const templateData = normalizeResumeData(resume.data as ResumeData);

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <ShareResumeView
        templateType={(resume.template as TemplateType) ?? "modern"}
        data={templateData}
        title={resume.title ?? undefined}
      />
    </div>
  );
}
