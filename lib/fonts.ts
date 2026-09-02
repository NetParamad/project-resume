import { Geist, Noto_Sans_Thai } from "next/font/google";

/**
 * Shared font instances. Defined once here so both the root layout and the
 * locale layout apply the same CSS variables to <html> without instantiating
 * the loader twice.
 */
export const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  display: "swap",
  subsets: ["thai"],
  weight: ["400", "500", "600", "700"],
});

export const fontVariables = `${geistSans.variable} ${notoSansThai.variable}`;
