import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, FileText, Sparkles, FileDown } from "lucide-react";
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
          <div className="text-center py-14 border-2 border-dashed border-border rounded-lg px-6">
            <FileText size={48} className="mx-auto text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t("emptyTitle")}</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">{t("emptyDesc")}</p>
            <CreateNewDialog>
              <Button size="lg">
                <Plus size={16} className="mr-2" />
                {t("createNew")}
              </Button>
            </CreateNewDialog>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left">
              <Card>
                <CardContent className="flex items-start gap-2.5 p-3">
                  <FileText size={18} className="text-primary shrink-0 mt-0.5" />
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    <p className="font-semibold text-foreground mb-0.5">{t("stepFill")}</p>
                    {t("stepFillDesc")}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-start gap-2.5 p-3">
                  <Sparkles size={18} className="text-primary shrink-0 mt-0.5" />
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    <p className="font-semibold text-foreground mb-0.5">{t("stepAi")}</p>
                    {t("stepAiDesc")}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-start gap-2.5 p-3">
                  <FileDown size={18} className="text-primary shrink-0 mt-0.5" />
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    <p className="font-semibold text-foreground mb-0.5">{t("stepExport")}</p>
                    {t("stepExportDesc")}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <ResumeCardGrid resumes={resumes.map((r) => ({ ...r, document_type: r.document_type || "resume" }))} locale={locale} />
        )}
      </div>
    </div>
  );
}
