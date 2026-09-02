import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {};

// Note: experimental.inlineCss was tried and reverted — with a ~40 KB Tailwind
// sheet it roughly doubled the streamed HTML (the CSS is also serialized into
// the RSC payload), which cost more for real users than the render-blocking
// <link> it removed.

export default withNextIntl(nextConfig);
