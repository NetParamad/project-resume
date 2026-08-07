"use client";

import { ReactNode, useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, FileText, GraduationCap, ArrowLeft, Loader2 } from "lucide-react";

interface CreateNewDialogProps {
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type DocType = "resume" | "cv";

export function CreateNewDialog({ children, open, onOpenChange }: CreateNewDialogProps) {
  const dt = useTranslations("documentType");
  const d = useTranslations("dashboard");
  const locale = useLocale();
  const router = useRouter();

  const [selectedType, setSelectedType] = useState<DocType | null>(null);
  const [name, setName] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setSelectedType(null);
      setName("");
      setIsNavigating(false);
    }
    onOpenChange?.(value);
  };

  const handleSelectType = (type: DocType) => {
    setName(type === "cv" ? dt("newCvTitle") : dt("newResumeTitle"));
    setSelectedType(type);
  };

  const handleCreate = () => {
    if (!selectedType || isNavigating) return;
    setIsNavigating(true);
    const finalTitle =
      name.trim() || (selectedType === "cv" ? dt("newCvTitle") : dt("newResumeTitle"));
    const params = new URLSearchParams({ type: selectedType, title: finalTitle });
    router.push(`/${locale}/builder/new?${params.toString()}`);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus size={16} className="mr-2" />
            {d("createNew")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        {selectedType ? (
          <>
            <DialogHeader className="text-left">
              <DialogTitle>{dt("nameTitle")}</DialogTitle>
              <DialogDescription>{dt("nameSubtitle")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <Input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                }}
                placeholder={dt("namePlaceholder")}
              />
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => setSelectedType(null)}>
                  <ArrowLeft size={14} className="mr-1" />
                  {dt("back")}
                </Button>
                <Button onClick={handleCreate} disabled={isNavigating}>
                  {isNavigating ? (
                    <Loader2 size={14} className="mr-1 animate-spin" />
                  ) : (
                    <Plus size={14} className="mr-1" />
                  )}
                  {dt("create")}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{dt("chooseTitle")}</DialogTitle>
              <DialogDescription>{dt("chooseSubtitle")}</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
              <button
                type="button"
                onClick={() => handleSelectType("resume")}
                className="flex flex-col items-center gap-3 rounded-xl border border-border p-6 hover:border-primary/50 hover:bg-accent/50 transition-all text-center"
              >
                <FileText size={40} className="text-primary" />
                <div>
                  <p className="font-semibold text-base">{dt("resume")}</p>
                  <p className="text-xs text-muted-foreground mt-1">{dt("resumeDesc")}</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleSelectType("cv")}
                className="flex flex-col items-center gap-3 rounded-xl border border-border p-6 hover:border-primary/50 hover:bg-accent/50 transition-all text-center"
              >
                <GraduationCap size={40} className="text-primary" />
                <div>
                  <p className="font-semibold text-base">{dt("cv")}</p>
                  <p className="text-xs text-muted-foreground mt-1">{dt("cvDesc")}</p>
                </div>
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
