"use client";

import { fontVariables } from "@/lib/fonts";

/**
 * Last-resort error boundary — replaces the whole document when the locale
 * layout itself throws, so it must render its own <html>/<body>.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className={fontVariables}>
      <body className="antialiased">
        <div className="flex min-h-[100dvh] flex-col items-center justify-center px-4 py-16 text-center">
          <p className="font-heading text-6xl font-bold text-primary">500</p>
          <h1 className="mt-4 text-xl font-semibold text-foreground">
            Something went wrong &middot; เกิดข้อผิดพลาด
          </h1>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            An unexpected error occurred. Please try again.
            <br />
            มีข้อผิดพลาดที่ไม่คาดคิดเกิดขึ้น กรุณาลองอีกครั้ง
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-semibold text-primary-foreground"
          >
            Try again &middot; ลองอีกครั้ง
          </button>
        </div>
      </body>
    </html>
  );
}
