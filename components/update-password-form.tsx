"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { mapAuthError } from "@/lib/auth-errors";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/password-input";
import { PasswordStrengthMeter } from "@/components/auth/password-strength-meter";
import {
  isAcceptablePassword,
  MIN_PASSWORD_LENGTH,
} from "@/lib/validation/password-strength";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const t = useTranslations("auth.updatePassword");
  const et = useTranslations("auth.errors");
  const locale = useLocale();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(t("mismatch"));
      return;
    }
    if (!isAcceptablePassword(password)) {
      setError(t("requirementsNotMet"));
      return;
    }
    const supabase = createClient();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMessage(t("success"));
      timerRef.current = window.setTimeout(
        () => router.push(`/${locale}/dashboard`),
        1500,
      );
    } catch (error: unknown) {
      setError(mapAuthError(error instanceof Error ? error.message : "", et));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password">{t("passwordLabel")}</Label>
                <PasswordInput
                  id="password"
                  autoComplete="new-password"
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <PasswordStrengthMeter password={password} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">{t("confirmLabel")}</Label>
                <PasswordInput
                  id="confirm-password"
                  autoComplete="new-password"
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {confirmPassword.length > 0 && confirmPassword !== password && (
                  <p className="text-xs text-orange-600">{t("mismatch")}</p>
                )}
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              {message && <p className="text-sm text-green-500">{message}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t("submitting") : t("submit")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
