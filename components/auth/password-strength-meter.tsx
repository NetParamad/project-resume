"use client";

import { useTranslations } from "next-intl";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  evaluatePassword,
  passwordChecks,
  type CheckId,
} from "@/lib/validation/password-strength";

const BAR_COLOR = ["bg-muted", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"];
const SCORE_LABEL = ["weak", "weak", "fair", "good", "strong"] as const;
const REQ_LABEL: Record<CheckId, string> = {
  length: "reqLength",
  lower: "reqLower",
  upper: "reqUpper",
  digit: "reqDigit",
  symbol: "reqSymbol",
};

export function PasswordStrengthMeter({
  password,
  email,
}: {
  password: string;
  email?: string;
}) {
  const t = useTranslations("auth.password");
  if (!password) return null;

  const strength = evaluatePassword(password, email);
  const checks = passwordChecks(password);

  return (
    <div className="space-y-2" aria-live="polite">
      <div className="flex gap-1" aria-hidden="true">
        {[1, 2, 3, 4].map((seg) => (
          <span
            key={seg}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              seg <= strength.score ? BAR_COLOR[strength.score] : "bg-muted",
            )}
          />
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        {t("strengthLabel")}:{" "}
        <span
          className={cn(
            "font-medium",
            strength.acceptable ? "text-green-600" : "text-orange-600",
          )}
        >
          {t(SCORE_LABEL[strength.score])}
        </span>
        {!strength.acceptable && strength.reason ? <> — {t(strength.reason)}</> : null}
      </p>

      <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        {checks.map((c) => (
          <li
            key={c.id}
            className={cn(
              "flex items-center gap-1.5",
              c.met ? "text-green-600" : "text-muted-foreground",
            )}
          >
            {c.met ? <Check size={12} className="shrink-0" /> : <X size={12} className="shrink-0" />}
            {t(REQ_LABEL[c.id])}
          </li>
        ))}
      </ul>
    </div>
  );
}
