import type { Metadata, Viewport } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { SITE_NAME, SEO_KEYWORDS, ogImage, UNIVERSITY } from "@/lib/seo";
import "./globals.css";

/**
 * The <html>/<body> shell lives in `app/[locale]/layout.tsx` so `lang` can be
 * set from the active locale (see next-intl docs). This root layout only carries
 * the default metadata and global stylesheet; non-localized routes
 * (`not-found`, `global-error`) render their own shell.
 */

const description =
  `Free online resume builder for students and graduates of ${UNIVERSITY.nameEn} (${UNIVERSITY.abbr}). ` +
  "Create an ATS-friendly resume with professional templates, an AI writing assistant, an ATS score checker and PDF export — in Thai or English.";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${SITE_NAME} — Free ATS Resume Builder for ${UNIVERSITY.abbr} Students`,
    template: `%s | ${SITE_NAME}`,
  },
  description,
  applicationName: SITE_NAME,
  keywords: SEO_KEYWORDS,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: { email: false, address: false, telephone: false },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Free ATS Resume Builder for ${UNIVERSITY.abbr} Students`,
    description,
    images: [ogImage()],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Free ATS Resume Builder for ${UNIVERSITY.abbr} Students`,
    description,
    images: [ogImage()],
  },
  verification: {
    google:
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ??
      "Ru2xNFiDnq0ZqSqjzqynQCbd9BWzAC7Rodz0rjShAt0",
  },
};

export const viewport: Viewport = {
  themeColor: "#c2410c",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
