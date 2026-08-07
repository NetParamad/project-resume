"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useResumeStore } from "@/lib/store/resume-store";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, ChevronDown, Menu, Share2, Layout, Loader2, Save, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { TemplateType } from "@/lib/types/resume";
import { resumeTemplates, cvTemplates } from "@/lib/types/resume";
import { AIAssistDialog } from "@/components/ai/AIAssistDialog";
import { ShareDialog } from "@/components/share/ShareDialog";
import { usePreviewZoomStore } from "@/lib/store/preview-zoom-store";
import { generatePdf } from "@/lib/pdf/generator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const COLOR_PRESETS = [
  { name: "Blue", color: "#3b82f6" },
  { name: "Indigo", color: "#6366f1" },
  { name: "Purple", color: "#a855f7" },
  { name: "Pink", color: "#ec4899" },
  { name: "Red", color: "#ef4444" },
  { name: "Orange", color: "#f97316" },
  { name: "Amber", color: "#f59e0b" },
  { name: "Green", color: "#22c55e" },
  { name: "Teal", color: "#14b8a6" },
  { name: "Cyan", color: "#06b6d4" },
  { name: "Gray", color: "#6b7280" },
  { name: "Black", color: "#111111" },
];

export function BuilderHeader({ resumeId }: { resumeId: string }) {
  const t = useTranslations("builder");
  const ct = useTranslations("common");
  const dt = useTranslations("dashboard");
  const tt = useTranslations("templates");
  const locale = useLocale();
  const title = useResumeStore((s) => s.title);
  const setTitle = useResumeStore((s) => s.setTitle);
  const documentType = useResumeStore((s) => s.documentType);
  const template = useResumeStore((s) => s.template);
  const setTemplate = useResumeStore((s) => s.setTemplate);
  const data = useResumeStore((s) => s.data);
  const updateTheme = useResumeStore((s) => s.updateTheme);
  const isDirty = useResumeStore((s) => s.isDirty);
  const currentResumeId = useResumeStore((s) => s.currentResumeId);
  const markSaved = useResumeStore((s) => s.markSaved);
  const setCurrentResume = useResumeStore((s) => s.setCurrentResume);
  const [isSaving, setIsSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const savingRef = useRef(false);
  const router = useRouter();
  const accentColor = data.theme?.accentColor ?? "#ff751f";

  const [aiOpen, setAiOpen] = useState(false);
  const [mobileShareOpen, setMobileShareOpen] = useState(false);

  const availableTemplates = documentType === "cv" ? cvTemplates : resumeTemplates;

  const hasContent = useMemo(
    () =>
      Boolean(
        data.personalInfo.fullName ||
          data.personalInfo.email ||
          data.personalInfo.phone ||
          data.summary ||
          data.experience.length > 0 ||
          data.education.length > 0 ||
          data.skills.length > 0 ||
          data.certifications.length > 0 ||
          data.projects.length > 0 ||
          data.languages.length > 0 ||
          (data.publications?.length ?? 0) > 0 ||
          (data.researchExperience?.length ?? 0) > 0 ||
          (data.teachingExperience?.length ?? 0) > 0 ||
          (data.awards?.length ?? 0) > 0,
      ),
    [data],
  );

  const saveResume = useCallback(async () => {
    if (savingRef.current) return false;
    savingRef.current = true;
    setIsSaving(true);
    try {
      const existingId = currentResumeId || (resumeId !== "new" ? resumeId : null);
      const method = existingId ? "PUT" : "POST";
      const url = existingId ? `/api/resumes/${existingId}` : "/api/resumes";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, document_type: documentType, template, data }),
      });

      if (!res.ok) throw new Error("Save failed");

      const saved = await res.json();

      if (!currentResumeId) {
        setCurrentResume(saved.id, saved.title, saved.document_type || "resume", saved.template, saved.data);
        router.replace(`/${locale}/builder/${saved.id}`);
      }

      markSaved();
      return true;
    } catch (err) {
      console.error("Save error:", err);
      return false;
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  }, [title, documentType, template, data, currentResumeId, resumeId, markSaved, setCurrentResume, locale, router]);

  const handleSave = useCallback(async () => {
    const ok = await saveResume();
    if (ok) {
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 2000);
    }
  }, [saveResume]);

  useEffect(() => {
    if (!isDirty || !hasContent) return;
    const timer = window.setTimeout(() => {
      void saveResume();
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [isDirty, hasContent, saveResume]);

  const handleDownloadPdf = useCallback(async () => {
    const prev = usePreviewZoomStore.getState().zoom;
    usePreviewZoomStore.getState().setZoom(100);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    try {
      await generatePdf("resume-preview");
    } catch (err) {
      console.error("PDF download error:", err);
    } finally {
      usePreviewZoomStore.getState().setZoom(prev);
    }
  }, []);

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background px-4 py-2 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <Link
          href={`/${locale}/dashboard`}
          aria-label={ct("back")}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-sm font-medium bg-transparent border-none outline-none focus:ring-0"
          />
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground border border-border rounded px-1.5 py-0.5">
          {dt(documentType)}
        </span>
      </div>
      <div className="flex items-center gap-1 sm:gap-1 overflow-x-auto">
        {isDirty && (
          <div className="shrink-0">
            <Button variant="ghost" size="sm" onClick={handleSave} disabled={isSaving} className="text-xs">
              {isSaving ? <Loader2 size={12} className="animate-spin mr-1" /> : <Save size={12} className="mr-1" />}
              {isSaving ? t("saving") ?? "Saving…" : t("save") ?? "Save"}
            </Button>
          </div>
        )}
        {savedFlash && (
          <span className="shrink-0 flex items-center gap-1 text-xs text-green-600">
            <CheckCircle2 size={12} />
            {t("saved")}
          </span>
        )}
        <div className="hidden sm:flex items-center gap-1 sm:gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="shrink-0">
                {tt(template)}
                <ChevronDown size={14} className="ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup
                value={template}
                onValueChange={(v) => setTemplate(v as TemplateType)}
              >
                {availableTemplates.map((tpl) => (
                  <DropdownMenuRadioItem key={tpl} value={tpl} className="text-sm">
                    <Layout size={14} className="mr-2" />
                    {tt(tpl)}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="shrink-0" title={t("accentColor")} aria-label={t("accentColor")}>
                <span className="w-4 h-4 rounded-full block" style={{ backgroundColor: accentColor }} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="p-2">
              <div className="grid grid-cols-6 gap-1.5 mb-2">
                {COLOR_PRESETS.map(({ color, name }) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={name}
                    onClick={() => updateTheme({ accentColor: color })}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      accentColor === color ? "border-foreground scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 border-t pt-2">
                <input
                  type="color"
                  value={accentColor}
                  aria-label={t("accentColor")}
                  onChange={(e) => updateTheme({ accentColor: e.target.value })}
                  className="w-7 h-7 rounded cursor-pointer border border-input"
                />
                <span className="text-[10px] text-muted-foreground font-mono">{accentColor}</span>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" onClick={() => setAiOpen(true)} className="shrink-0">
            <Sparkles size={14} className="mr-1" />
            {t("aiAssist")}
          </Button>
          <ShareDialog onSave={saveResume} />
          <Button variant="outline" size="sm" onClick={handleDownloadPdf} className="shrink-0">
            <Download size={14} className="mr-1" />
            {t("downloadPdf")}
          </Button>
        </div>
        <div className="sm:hidden shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" aria-label={ct("menu")}>
                <Menu size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 max-h-[80vh] overflow-y-auto">
              {isDirty && (
                <DropdownMenuItem onSelect={handleSave} disabled={isSaving}>
                  {isSaving ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Save size={14} className="mr-2" />}
                  {isSaving ? t("saving") : t("save")}
                </DropdownMenuItem>
              )}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Layout size={14} className="mr-2" />
                  {t("template") ?? "Template"}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="max-h-[60vh] overflow-y-auto">
                  <DropdownMenuRadioGroup
                    value={template}
                    onValueChange={(v) => setTemplate(v as TemplateType)}
                  >
                    {availableTemplates.map((tpl) => (
                      <DropdownMenuRadioItem key={tpl} value={tpl} className="text-sm">
                        <Layout size={14} className="mr-2" />
                        {tt(tpl)}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <span className="w-3 h-3 rounded-full mr-2 inline-block" style={{ backgroundColor: accentColor }} />
                  Theme
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="p-2">
                  <div className="grid grid-cols-6 gap-1.5 mb-2">
                    {COLOR_PRESETS.map(({ color }) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => updateTheme({ accentColor: color })}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${
                          accentColor === color ? "border-foreground scale-110" : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 border-t pt-2">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => updateTheme({ accentColor: e.target.value })}
                      className="w-7 h-7 rounded cursor-pointer border border-input"
                    />
                    <span className="text-[10px] text-muted-foreground font-mono">{accentColor}</span>
                  </div>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setAiOpen(true)}>
                <Sparkles size={14} className="mr-2" />
                {t("aiAssist")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setMobileShareOpen(true)}>
                <Share2 size={14} className="mr-2" />
                {t("share")}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleDownloadPdf}>
                <Download size={14} className="mr-2" />
                {t("downloadPdf")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <AIAssistDialog open={aiOpen} onOpenChange={setAiOpen} />
      <ShareDialog open={mobileShareOpen} onOpenChange={setMobileShareOpen} onSave={saveResume} />
    </header>
  );
}
