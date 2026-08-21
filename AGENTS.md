# AGENTS.md

## Commands

```bash
npm run dev                # dev server (localhost:3000)
npm run build              # production build — run before finishing any change
npm run lint               # eslint .  (baseline: 8 known warnings, 0 errors)
npx tsc --noEmit           # typecheck (no `typecheck` script exists)
```

There is no test suite. Verification = `tsc --noEmit` + `lint` + `build`.

## Stack & Structure

- Next.js App Router + TypeScript + Tailwind CSS v3 + shadcn/ui (`components/ui/`) + Zustand stores in `lib/store/`.
- Path alias: `@/*` → repo root.
- i18n via next-intl: locales `en`/`th` (default `en`, see `i18n/routing.ts`). **All user-facing text must exist in both `messages/en.json` and `messages/th.json`** — missing keys break one language silently.
- `proxy.ts` is the middleware (Next.js proxy convention): handles i18n routing + Supabase auth session refresh.
- Supabase: client/server helpers in `lib/supabase/`. Schema changes are raw SQL files in `supabase/migrations/` applied manually (numbered, no migration tool wired).
- AI endpoints under `app/api/ai/*` call providers via `lib/ai/`; keys come from env (`NVIDIA_API_KEY`, ImageKit keys for image upload/background removal). `.env.example` lists them; `.env.local` is required for dev.
- All API routes require Supabase auth (`getUser()` → 401). AI endpoints are rate-limited per user via `lib/rate-limit.ts` (in-memory, per instance).
- Site URL for metadata/sitemap/robots comes from `lib/site-url.ts` (`NEXT_PUBLIC_SITE_URL` → `VERCEL_URL` → localhost).
- Resume data shape/types/templates live in `lib/types/resume.ts`; templates are React components in `components/preview/templates/`.

## Key Conventions

- **Prefer shadcn/ui components over hand-rolled markup** (Card, Button, Dialog, Input, DropdownMenu...). Don't build bordered div "cards" by hand — use `components/ui/card.tsx`.
- All UI copy goes through translations (`useTranslations` / `getTranslations`), never hardcoded strings.

## Gotchas

- **PDF export is print-based**: the Download PDF button calls `window.print()`. The printable copy lives in a `.print-resume` element (hidden with `display:none`, revealed by `@media print` rules in `app/globals.css`). Browser uses `document.title` as the PDF filename, so it is set from the resume title. Any change to preview rendering may need the same change mirrored in the print copy (`BuilderLayout.tsx`, `ShareResumeView.tsx`).
- Builder page (`app/[locale]/builder/[id]`) uses a fixed-height wrapper (`h-[calc(100dvh-3rem-4rem)] md:h-[calc(100dvh-4rem)]`) so form/preview panels scroll internally. Header/tab bars sit outside those scroll containers; section chips inside panels use `sticky top-0`. Don't add page-level sticky offsets there.
- A4 preview width constant is `794`px; zoom "fit" scale is computed from container width via ResizeObserver (`components/builder/PreviewPanel.tsx`).
- Resume content has its own language setting (Thai/English) separate from UI locale: `resume-lang-store` + `hasThaiInResume()` auto-detect; Thai resumes get the `font-thai` class (Noto Sans Thai).
- Dialogs are centered fixed elements sized `w-[calc(100%-2rem)] max-h-[calc(100dvh-2rem)] overflow-y-auto` in `components/ui/dialog.tsx` — keep mobile margins if editing that base class.
