import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { routing } from "./i18n/routing";
import { hasEnvVars } from "./lib/utils";

const handleI18n = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const i18nResponse = handleI18n(request);

  if (i18nResponse.status >= 300 && i18nResponse.status < 400) {
    return i18nResponse;
  }

  if (!hasEnvVars) {
    return i18nResponse;
  }

  const rewriteUrl = i18nResponse.headers.get("x-middleware-rewrite");

  let supabaseResponse: NextResponse = i18nResponse;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          if (rewriteUrl) {
            supabaseResponse.headers.set("x-middleware-rewrite", rewriteUrl);
          }
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const pathname = request.nextUrl.pathname;
  const isPublic =
    pathname === "/" ||
    /^\/(en|th)\/?$/.test(pathname) ||
    pathname.includes("/auth") ||
    pathname.includes("/login") ||
    pathname.includes("/share") ||
    pathname.includes("/knowledge");

  if (!isPublic && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  const locale = routing.locales.find((l) => pathname.startsWith(`/${l}`)) || routing.defaultLocale;

  const isAuthPage =
    pathname.endsWith("/auth/login") ||
    pathname.endsWith("/auth/sign-up") ||
    pathname.endsWith("/login");

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/dashboard`;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Skip API/internal routes, files with an extension, and the extension-less
    // metadata routes (opengraph-image, sitemap, robots) so i18n doesn't
    // redirect them to a locale-prefixed path.
    '/((?!api|trpc|_next|_vercel|auth/confirm|auth/oauth|opengraph-image|twitter-image|sitemap|robots|manifest|icon|apple-icon|.*\\..*).*)',
  ],
};
