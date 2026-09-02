<h1 align="center">RMUTL Resume</h1>

<p align="center">
  A free online résumé &amp; CV builder for students and graduates of
  Rajamangala University of Technology Lanna (มทร.ล้านนา).
</p>

<p align="center">
  <a href="https://rmutl-resume.vercel.app"><strong>rmutl-resume.vercel.app</strong></a>
</p>

<p align="center">
  <a href="#features">Features</a> ·
  <a href="#tech-stack">Tech stack</a> ·
  <a href="#getting-started">Getting started</a> ·
  <a href="#environment-variables">Environment</a> ·
  <a href="#project-structure">Structure</a> ·
  <a href="#development">Development</a> ·
  <a href="#deployment">Deployment</a>
</p>

---

## Features

- **Real‑time editor with live preview** — edits render instantly next to an A4 preview.
- **7 templates** — 4 résumé layouts (Modern, Classic, Minimal, Creative) and 3 academic CV layouts (Academic, Comprehensive, Compact), each with an adjustable accent color.
- **ATS score checker** — scores the résumé against Applicant Tracking Systems and suggests missing keywords.
- **AI writing assistant** — improve, rewrite, polish, fix grammar and tailor content to a specific job (`app/api/ai/*`).
- **Import & auto‑fill** — upload an existing résumé (PDF); the text is extracted and mapped into the form.
- **Thai & English** — the UI is fully localized, and résumé *content* has its own language setting with automatic section‑heading detection.
- **PDF export** — print‑based export that guarantees a single A4 page (see [ADR‑0001](docs/adr/0001-pdf-fit-one-page.md)).
- **Shareable link** — publish a résumé at a public, slug‑scoped URL (see [ADR‑0002](docs/adr/0002-public-share-rpc.md)).
- **Cloud storage** — résumés are saved to Supabase and available from any device.

> This is an independent project built for the RMUTL student community. It is not an official service of the university.

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack) · React 19 · TypeScript |
| Styling | Tailwind CSS v3 · [shadcn/ui](https://ui.shadcn.com) (`components/ui/`) |
| State | Zustand stores (`lib/store/`) |
| i18n | [next-intl](https://next-intl.dev) — locales `en` / `th` (default `en`), see `i18n/routing.ts` |
| Auth & DB | [Supabase](https://supabase.com) (Postgres + Auth via `@supabase/ssr` cookies) |
| AI | [NVIDIA API](https://build.nvidia.com) (OpenAI‑compatible) via the `openai` SDK — models in `lib/ai/models.ts` |
| Images | [ImageKit](https://imagekit.io) — avatar upload &amp; transforms |
| Hosting | [Vercel](https://vercel.com) (serverless, see [ADR‑0004](docs/adr/0004-vercel-deployment.md)) |

## Getting started

Requirements: **Node.js 22+**, a [Supabase project](https://database.new), and (for the AI features) an NVIDIA API key and an ImageKit account.

```bash
git clone https://github.com/NetParamad/project-resume.git
cd project-resume
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev                  # http://localhost:3000
```

Apply the database schema by running the SQL files in [`supabase/migrations/`](supabase/migrations/) **in order** against your Supabase project (SQL editor or `psql`). They are idempotent — there is no migration tool wired up.

## Environment variables

Copy `.env.example` to `.env.local` and set:

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | From your Supabase project's API settings |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ✅ | Supabase *publishable* (or legacy *anon*) key |
| `NVIDIA_API_KEY` | for AI | Used by every `app/api/ai/*` route |
| `IMAGEKIT_PRIVATE_KEY` | for uploads | Server‑side signing for avatar upload |
| `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY` | for uploads | |
| `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` | for uploads | e.g. `https://ik.imagekit.io/your_id` |
| `NEXT_PUBLIC_SITE_URL` | production | Canonical origin for metadata / sitemap / hreflang. On Vercel it falls back to the deployment URL — set it to the real domain. |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | optional | `content` value of the Search Console meta tag |

Supabase and AI credentials are only read at **request time**, so the app builds without them (CI uses placeholders).

## Project structure

```
app/
  [locale]/            localized routes (home, auth, dashboard, builder, knowledge, share)
  api/
    resumes/           CRUD for the signed-in user's résumés
    ai/                improve · polish · tailor · ats-score · auto-fill · extract-resume
    upload/auth/       ImageKit upload signing
  layout.tsx           default metadata (no <html> — that lives in [locale]/layout.tsx)
  sitemap.ts robots.ts manifest.ts opengraph-image.tsx
components/
  ui/                  shadcn/ui primitives
  builder/             editor form + preview panels
  preview/templates/   résumé & CV template components
  home/ dashboard/ share/ seo/
lib/
  ai/                  NVIDIA client, model chain, prompts
  supabase/            client & server helpers
  types/resume.ts      résumé data shape (source of truth)
  store/               Zustand stores (incl. résumé content language)
  seo.ts site-url.ts   metadata / JSON-LD helpers
  print-utils.ts       one-page PDF fit
  validation/          zod request schemas
i18n/                  next-intl routing & request config
messages/              en.json · th.json  (every user-facing string, both files)
supabase/migrations/   raw SQL, applied manually
proxy.ts               middleware: i18n routing + Supabase session refresh
docs/adr/              architecture decision records
```

## Development

```bash
npm run dev          # dev server
npm run build        # production build
npm run lint         # eslint (baseline: 8 known <img> warnings, 0 errors)
npx tsc --noEmit     # typecheck
npm test             # vitest — unit tests for pure logic in lib/
```

Verification before any change = **`tsc --noEmit` + `lint` + `test` + `build`**. GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs all four on every push and PR.

Conventions (see [`AGENTS.md`](AGENTS.md) for the full list):

- Every user‑facing string goes through `next-intl` and must exist in **both** `messages/en.json` and `messages/th.json`.
- Prefer `components/ui/*` (shadcn/ui) over hand‑rolled markup.
- Résumé data shape is defined once in `lib/types/resume.ts`.

## Deployment

Deployed on Vercel. Set the environment variables above in the project settings, point `NEXT_PUBLIC_SITE_URL` at the production domain, and apply the `supabase/migrations/` SQL to the production database.

## License

No license file is currently included — all rights reserved by the authors.
