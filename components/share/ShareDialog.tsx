"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useResumeStore } from "@/lib/store/resume-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Share2, Copy, Check, Globe, GlobeLock, Loader2, Save } from "lucide-react";

export function ShareDialog({
  open: controlledOpen,
  onOpenChange,
  onSave,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSave?: () => Promise<boolean>;
}) {
  const t = useTranslations("share");
  const builderT = useTranslations("builder");
  const locale = useLocale();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [copied, setCopied] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [savingFirst, setSavingFirst] = useState(false);

  const currentResumeId = useResumeStore((s) => s.currentResumeId);
  const shareSlug = useResumeStore((s) => s.shareSlug);
  const isPublic = useResumeStore((s) => s.isPublic);
  const setShareInfo = useResumeStore((s) => s.setShareInfo);

  const isPublished = isPublic && shareSlug;
  const shareUrl = isPublished
    ? `${window.location.origin}/${locale}/share/${shareSlug}`
    : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleTogglePublic = async () => {
    if (!currentResumeId) return;
    setPublishing(true);
    try {
      const res = await fetch(`/api/resumes/${currentResumeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_public: !isPublic }),
      });
      if (!res.ok) throw new Error("Failed to update");
      const data = await res.json();
      setShareInfo(data.share_slug, data.is_public);
    } catch (err) {
      console.error("Failed to toggle share:", err);
    } finally {
      setPublishing(false);
    }
  };

  const handleSaveFirst = async () => {
    if (!onSave) return;
    setSavingFirst(true);
    try {
      await onSave();
    } finally {
      setSavingFirst(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Share2 size={14} className="mr-1" />
            {builderT("share")}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {!currentResumeId ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{t("saveFirst")}</p>
              <Button
                className="w-full"
                onClick={handleSaveFirst}
                disabled={savingFirst || !onSave}
              >
                {savingFirst ? (
                  <Loader2 size={14} className="mr-2 animate-spin" />
                ) : (
                  <Save size={14} className="mr-2" />
                )}
                {t("saveFirstAction")}
              </Button>
            </div>
          ) : isPublished ? (
            <>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={shareUrl}
                  className="flex-1 h-9 rounded-md border border-input bg-muted px-3 text-sm truncate"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check size={14} className="text-green-500" />
                  ) : (
                    <Copy size={14} />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {copied ? t("copied") : t("description")}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("notPublic")}
            </p>
          )}

          <Button
            variant={isPublished ? "outline" : "default"}
            className="w-full"
            onClick={handleTogglePublic}
            disabled={publishing}
          >
            {publishing ? (
              <Loader2 size={14} className="mr-2 animate-spin" />
            ) : isPublished ? (
              <GlobeLock size={14} className="mr-2" />
            ) : (
              <Globe size={14} className="mr-2" />
            )}
            {isPublished ? t("makePrivate") : t("makePublic")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
