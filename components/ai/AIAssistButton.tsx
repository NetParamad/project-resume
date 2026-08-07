"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { AutoFillDialog } from "./AutoFillDialog";

interface AIAssistButtonProps {
  section: string;
  itemId?: string;
}

export function AIAssistButton({ section, itemId }: AIAssistButtonProps) {
  const t = useTranslations("ai");

  return (
    <AutoFillDialog section={section} itemId={itemId}>
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-foreground"
      >
        <Sparkles size={14} className="mr-1 text-amber-500" />
        <span className="text-xs">{t("improve")}</span>
      </Button>
    </AutoFillDialog>
  );
}
