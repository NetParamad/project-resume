import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Validate that `next` is a safe relative path:
 *  - starts with /
 *  - does not contain // (protocol-relative or path escalation)
 *  - no spaces or newlines (null-byte injection)
 */
function isSafeRedirect(next: string): boolean {
  return (
    next.startsWith("/") &&
    !next.startsWith("//") &&
    !/[\s\n\r]/.test(next) &&
    !next.includes("\0")
  );
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const rl = rateLimit(`auth:confirm:${ip}`, 10, 60_000);
  if (!rl.ok) {
    redirect("/auth/error");
  }

  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const rawNext = searchParams.get("next") ?? "/";
  const next = isSafeRedirect(rawNext) ? rawNext : "/";

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      redirect(next);
    } else {
      redirect("/auth/error");
    }
  }

  redirect("/auth/error");
}
