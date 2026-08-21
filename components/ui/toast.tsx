"use client";

import { useToastStore } from "@/lib/store/toast-store";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = {
  success: <CheckCircle2 size={16} className="text-green-600 shrink-0" />,
  error: <AlertCircle size={16} className="text-red-600 shrink-0" />,
  info: <Info size={16} className="text-primary shrink-0" />,
} as const;

export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts);
  const dismissToast = useToastStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-sm"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={cn(
            "flex items-center gap-2.5 rounded-lg border bg-background shadow-lg px-3.5 py-2.5 text-sm animate-[fade-in-up_0.25s_ease-out]",
            toast.type === "error" ? "border-red-200" : "border-border",
          )}
        >
          {ICONS[toast.type]}
          <span className="flex-1 leading-snug">{toast.message}</span>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            aria-label="Dismiss"
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
