import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  experimental: {
    // Inline the (small) global stylesheet into <head> instead of shipping a
    // render-blocking <link>. Removes ~120ms of render-blocking time / LCP delay.
    inlineCss: true,
  },
};

export default withNextIntl(nextConfig);
