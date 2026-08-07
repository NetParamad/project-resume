import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { CreateNewDialog } from "@/components/dashboard/CreateNewDialog";
import { ResumeCardGrid } from "@/components/dashboard/ResumeCardGrid";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login`);
  }

  const { data: resumes } = await supabase
    .from("resumes")
    .select("id, title, template, document_type, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return (
    <div className="bg-background">
      <div className="max-w-4xl mx-auto p-6 pt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">{t("title")}</h1>
          </div>
          <CreateNewDialog />
        </div>

        {!resumes || resumes.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-border rounded-lg">
            <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">{t("noResumes")}</p>
            <CreateNewDialog>
              <Button>
                <Plus size={16} className="mr-2" />
                {t("createNew")}
              </Button>
            </CreateNewDialog>
          </div>
        ) : (
          <ResumeCardGrid resumes={resumes.map((r) => ({ ...r, document_type: r.document_type || "resume" }))} locale={locale} />
        )}
      </div>
    </div>
  );
}
