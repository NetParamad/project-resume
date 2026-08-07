"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, File as FileIcon, MoreVertical, Trash2, Pencil, Copy, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ResumeCardGridProps {
  resumes: Array<{
    id: string;
    title: string;
    template: string;
    document_type?: string;
    updated_at: string;
  }>;
  locale: string;
}

export function ResumeCardGrid({ resumes, locale }: ResumeCardGridProps) {
  const t = useTranslations("dashboard");
  const common = useTranslations("common");
  const router = useRouter();

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState("");
  const [renaming, setRenaming] = useState(false);

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await fetch(`/api/resumes/${deleteId}`, { method: "DELETE" });
      router.refresh();
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }, [deleteId, router]);

  const handleRename = useCallback(async () => {
    if (!renameId || !renameTitle.trim()) return;
    setRenaming(true);
    try {
      await fetch(`/api/resumes/${renameId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: renameTitle.trim() }),
      });
      router.refresh();
    } catch (err) {
      console.error("Rename error:", err);
    } finally {
      setRenaming(false);
      setRenameId(null);
    }
  }, [renameId, renameTitle, router]);

  const handleDuplicate = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/resumes/${id}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const original = await res.json();

      await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${original.title} (Copy)`,
          document_type: original.document_type || "resume",
          template: original.template,
          data: original.data,
        }),
      });
      router.refresh();
    } catch (err) {
      console.error("Duplicate error:", err);
    }
  }, [router]);

  const resumeDocs = resumes.filter((r) => r.document_type !== "cv");
  const cvDocs = resumes.filter((r) => r.document_type === "cv");
  const hasResumes = resumeDocs.length > 0;
  const hasCVs = cvDocs.length > 0;

  function renderCard(resume: ResumeCardGridProps["resumes"][number], icon: React.ReactNode) {
    return (
      <div key={resume.id} className="group relative">
        <Link href={`/${locale}/builder/${resume.id}`} className="block">
          <Card className="h-full transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg">
            <CardContent className="flex flex-col items-center pt-8 pb-6">
              {icon}
              <CardTitle className="text-center text-sm">{resume.title}</CardTitle>
              <CardDescription className="text-center mt-1 text-xs">
                {t("lastEdited", {
                  date: new Date(resume.updated_at).toLocaleDateString(),
                })}
              </CardDescription>
            </CardContent>
          </Card>
        </Link>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onSelect={() => { setRenameId(resume.id); setRenameTitle(resume.title); }}>
                <Pencil size={14} className="mr-2" />
                {t("rename")}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleDuplicate(resume.id)}>
                <Copy size={14} className="mr-2" />
                {t("duplicate")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setDeleteId(resume.id)}
                className="text-destructive"
              >
                <Trash2 size={14} className="mr-2" />
                {common("delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <>
      {hasResumes && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">{t("resume")}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {resumeDocs.map((r) => renderCard(r, <FileText size={40} className="text-primary mb-4" />))}
          </div>
        </div>
      )}
      {hasCVs && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">{t("cv")}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cvDocs.map((r) => renderCard(r, <FileIcon size={40} className="text-primary mb-4" />))}
          </div>
        </div>
      )}

      <Dialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("deleteConfirm")}</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              {common("cancel") ?? "Cancel"}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 size={14} className="mr-1 animate-spin" />}
              {common("delete") ?? "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!renameId} onOpenChange={(o) => { if (!o) setRenameId(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("rename")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rename-title" className="text-xs">Title</Label>
            <Input
              id="rename-title"
              value={renameTitle}
              onChange={(e) => setRenameTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleRename(); }}
              className="text-sm"
              autoFocus
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRenameId(null)}>
              {common("cancel") ?? "Cancel"}
            </Button>
            <Button onClick={handleRename} disabled={renaming || !renameTitle.trim()}>
              {renaming && <Loader2 size={14} className="mr-1 animate-spin" />}
              {t("rename")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
