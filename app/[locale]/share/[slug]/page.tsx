import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { normalizeResumeData, type TemplateType, type ResumeData } from "@/lib/types/resume";
import { shareSlugSchema } from "@/lib/validation/resumes";
import { ShareResumeView } from "@/components/share/ShareResumeView";

export const dynamic = "force-dynamic";

type PublicResume = {
  title: string | null;
  template: string | null;
  document_type: string | null;
  data: unknown;
};

/**
 * Public reads go through the slug-scoped SECURITY DEFINER RPC (ADR-0002);
 * the blanket `is_public = true` table policy was removed in migration 002.
 */
async function fetchPublicResume(
  supabase: SupabaseClient,
  slug: string,
): Promise<PublicResume | null> {
  // Slugs are capability tokens — skip pointless RPC hits for junk input.
  if (!shareSlugSchema.safeParse(slug).success) return null;
  const { data } = await supabase
    .rpc("get_public_resume", { p_slug: slug })
    .single();
  return (data as PublicResume | null) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const supabase = await createClient();
  const resume = await fetchPublicResume(supabase, slug);

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
  const resume = await fetchPublicResume(supabase, slug);

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
