import { Geist, Noto_Sans_Thai } from "next/font/google";

/**
 * Shared font instances. Defined once so both the root layout and the locale
 * layout apply the same CSS variables to <html> without instantiating twice.
 *
 * `display: "optional"` — the browser uses a size-adjusted fallback if the web
 * font isn't ready within ~100ms and never swaps afterwards. That removes the
 * late font-swap repaint that was pushing LCP past 2.5s, at the cost of some
 * first-load pageviews showing the fallback (near-identical thanks to
 * `adjustFontFallback`; the real font is cached for every later view).
 */
export const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "optional",
  subsets: ["latin"],
  preload: true,
  fallback: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
});

export const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  display: "optional",
  subsets: ["thai"],
  weight: ["400", "600", "700"],
  // Not on the critical path for the (Latin) landing page; Thai pages still get
  // it, just without a render-blocking preload.
  preload: false,
  fallback: ["system-ui", "sans-serif"],
});

export const fontVariables = `${geistSans.variable} ${notoSansThai.variable}`;
