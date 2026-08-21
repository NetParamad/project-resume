import type { Metadata } from "next";
import { Geist, Noto_Sans_Thai } from "next/font/google";
import { ImageKitProvider } from "@imagekit/next";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "Resume Builder",
  description: "Build ATS-friendly resumes with AI assistance",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  display: "swap",
  subsets: ["thai"],
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${notoSansThai.variable}`}
    >
      <body className="antialiased" suppressHydrationWarning>
        <ImageKitProvider urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}>
          {children}
        </ImageKitProvider>
      </body>
    </html>
  );
}
