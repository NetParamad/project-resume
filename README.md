[English](README.md) | [ไทย](README.th.md)

<h1 align="center">Resume Builder</h1>

<p align="center">
  A free, AI-powered online résumé &amp; CV builder (AIRB).
</p>

<p align="center">
  <a href="https://rmutl-resume.vercel.app"><strong>rmutl-resume.vercel.app</strong></a>
</p>

<p align="center">
  <a href="#overview">Overview</a> ·
  <a href="#features">Features</a> ·
  <a href="#tech-stack">Tech stack</a> ·
  <a href="#project-structure">Structure</a> ·
  <a href="#supabase-setup">Supabase</a> ·
  <a href="#getting-started">Getting started</a> ·
  <a href="#environment-variables">Environment</a> ·
  <a href="#usage">Usage</a> ·
  <a href="#notes">Notes</a>
</p>

---

## Overview

Resume Builder is a web app for writing, styling, and exporting a résumé or academic CV. It pairs a real-time form editor with a live A4 preview, so edits render immediately next to the document. Résumés are stored in Supabase and tied to a signed-in account, can be published at a public slug-scoped URL, and can be exported to a single-page PDF straight from the browser.

An optional AI layer helps improve wording, tailor content to a job posting, score the résumé against an Applicant Tracking System (ATS), and auto-fill the form from an uploaded PDF. The interface is fully localized in **English and Thai**, and the résumé *content* carries its own independent language setting.

> This is an independent project, not an official service of any university.

## Features

- **Real-time editor with live preview** — edits render instantly in an A4 preview pane beside the form.
- **7 templates** — 4 résumé layouts (Modern, Classic, Minimal, Creative) and 3 academic CV layouts (Academic, Comprehensive, Compact), each with an adjustable accent color.
- **Two document types** — résumé or CV (`documentType`), sharing one builder; CV unlocks the academic templates.
- **ATS score checker** — scores the résumé against Applicant Tracking Systems and suggests missing keywords, taking a job description as input.
- **AI writing assistant** — improve, rewrite, polish, fix grammar, and tailor content to a specific job (`app/api/ai/*`).
- **AI improvement agent** — an iterative optimizer that edits sections, re-scores, and reports changes over multiple rounds, with a live log and apply/discard diff.
- **Import & auto-fill** — upload an existing résumé (PDF); the text is extracted in the browser and mapped into the form.
- **Thai & English** — the UI is fully localized with `next-intl`, and résumé content has its own language setting (`en` / `th` / auto-detect) that drives Thai font handling.
- **PDF export** — print-based export that guarantees a single A4 page (see [ADR‑0001](docs/adr/0001-pdf-fit-one-page.md)).
- **Shareable link** — publish a résumé at a public, slug-scoped URL served through a security-definer RPC (see [ADR‑0002](docs/adr/0002-public-share-rpc.md)).
- **Cloud storage & version history** — résumés are saved to Supabase and available from any device; a `resume_versions` table records versions.
- **Dashboard** — list, rename, duplicate, and delete résumés and CVs.
- **Auth** — email/password sign-up, login, forgot/update password, and OAuth callbacks backed by Supabase Auth.
- **Knowledge base & guides** — localized articles and how-to pages under `/knowledge`.
- **SEO plumbing** — sitemap, robots, web manifest, Open Graph image, canonical URLs, and hreflang alternates.

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack) · React 19 · TypeScript |
| Styling | Tailwind CSS v3 · [shadcn/ui](https://ui.shadcn.com) (`components/ui/`) |
| State | Zustand stores (`lib/store/`) |
| i18n | [next-intl](https://next-intl.dev) — locales `en` / `th` (default `en`), see `i18n/routing.ts` |
| Auth & DB | [Supabase](https://supabase.com) (Postgres + Auth via `@supabase/ssr` cookies) |
| AI | [NVIDIA API](https://build.nvidia.com) (OpenAI‑compatible) via the `openai` SDK — models in `lib/ai/models.ts`; optional Gemini fallback |
| PDF import | [`pdfjs-dist`](https://mozilla.github.io/pdf.js/) — text extraction runs in the browser |
| Images | [ImageKit](https://imagekit.io) — avatar upload &amp; transforms |
| Validation | [zod](https://zod.dev) — request schemas in `lib/validation/` |
| Testing | [Vitest](https://vitest.dev) + Testing Library |
| Hosting | [Vercel](https://vercel.com) (serverless, see [ADR‑0004](docs/adr/0004-vercel-deployment.md)) |

## Project structure

```
app/
  [locale]/            localized routes
    page.tsx           landing page
    [slug]/            SEO landing pages
    auth/              login · sign-up · forgot/update password flows
    dashboard/         résumé list, create/rename/duplicate/delete
    builder/[id]/      the editor + live preview
    knowledge/         guides and localized articles
    share/[slug]/      public shared-résumé view
  api/
    resumes/           CRUD for the signed-in user's résumés
    ai/                improve · polish · ats-score · auto-fill · extract-resume
    upload/auth/       ImageKit upload signing
  auth/                confirm · oauth callbacks
  layout.tsx global-error.tsx not-found.tsx
  globals.css sitemap.ts robots.ts manifest.ts opengraph-image.tsx
components/
  ui/                  shadcn/ui primitives
  builder/             editor form + preview panels (sections/ holds per-section forms)
  preview/             A4 preview · PrintResumePortal · templates/ (4 résumé + cv/ 3)
  ai/                  AI assist dialogs (ATS, polish, import, improve agent)
  dashboard/ home/ marketing/ share/ auth/ seo/
lib/
  ai/                  NVIDIA client, model chain & roles, prompts, ATS optimizer
  supabase/            client & server helpers
  types/resume.ts      résumé data shape (source of truth)
  store/               Zustand stores (résumé content, preview zoom, AI model/language, toast)
  content/             knowledge articles & landing-page content
  pdf/                 browser PDF text extraction
  validation/          zod request schemas + co-located tests
  seo.ts site-url.ts   metadata / JSON-LD helpers
  print-utils.ts       one-page PDF fit
i18n/                  next-intl routing, request config, navigation
messages/              en.json · th.json  (every user-facing string, both files)
supabase/migrations/   raw SQL, applied manually
proxy.ts               middleware: i18n routing + Supabase session refresh
docs/adr/              architecture decision records
docs/agents/           issue-tracker, triage-label, and domain conventions
```

The `@/*` path alias resolves to the repository root (see `tsconfig.json`).

## Supabase setup

1. Create a project at [database.new](https://database.new).
2. Apply the SQL files in [`supabase/migrations/`](supabase/migrations/) **in order** against the project (SQL editor or `psql`). Migrations are raw, numbered SQL applied **manually** — there is no migration tool wired up. They are written to be idempotent.
3. Copy the project URL and publishable (or legacy anon) key from **Project settings → API** into your `.env.local`.

The migrations create:

| Object | Purpose |
| --- | --- |
| `resumes` | One row per résumé/CV: `title`, `template`, `data` (JSONB), `document_type`, `is_public`, `share_slug`, `version`, timestamps. |
| `resume_versions` | Version history rows keyed to a résumé. |
| `rate_limits` | Counters backing the optional distributed rate limiter. |
| `get_public_resume(p_slug)` | Security-definer RPC — the only public read path for shared résumés (ADR‑0002). |
| `rate_limit_bump(...)` | Security-definer RPC used by the shared limiter when present. |

Row Level Security is enabled on `resumes` and `resume_versions`; owners get full CRUD on their own rows, and public reads go exclusively through `get_public_resume`.

## Getting started

Requirements: **Node.js 22+**, a [Supabase project](https://database.new), and (for the AI features) an NVIDIA API key and an ImageKit account.

```bash
git clone https://github.com/NetParamad/project-resume.git
cd project-resume
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev                  # http://localhost:3000
```

Apply the database schema first (see [Supabase setup](#supabase-setup)). Supabase and AI credentials are only read at **request time**, so the app builds without them (CI uses placeholders).

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server at `http://localhost:3000` |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (baseline: 8 known `<img>` warnings, 0 errors) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest unit tests (co-located `*.test.ts`) |
| `npm run prepare` | Installs Husky git hooks (runs on `npm install`) |

Verification before any change = **`tsc --noEmit` + `lint` + `test` + `build`**. GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs all four on every push and PR using placeholder env vars.

## Environment variables

Copy `.env.example` to `.env.local` and set (names only — never commit real values):

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | From your Supabase project's API settings |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ✅ | Supabase *publishable* (or legacy *anon*) key |
| `NVIDIA_API_KEY` | for AI | Used by every `app/api/ai/*` route |
| `GEMINI_API_KEY` | optional | Paid last-resort AI fallback; app works without it |
| `IMAGEKIT_PRIVATE_KEY` | for uploads | Server-side signing for avatar upload |
| `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY` | for uploads | |
| `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` | for uploads | e.g. `https://ik.imagekit.io/your_id` |
| `NEXT_PUBLIC_SITE_URL` | production | Canonical origin for metadata / sitemap / hreflang. On Vercel it falls back to the deployment URL — set it to the real domain. |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | optional | `content` value of the Search Console meta tag |

## Usage

1. **Sign up / log in** — create an account or authenticate via the Supabase-backed auth flows.
2. **Create a document** — from the dashboard, start a new résumé or CV.
3. **Edit** — fill in sections (personal info, summary, experience, education, skills, projects, certifications, languages, and academic sections such as publications, research, teaching, awards, references) in the form pane while the A4 preview updates live.
4. **Style** — pick a template and accent color; switch the résumé content language between Thai and English (or auto-detect).
5. **Use AI** — run the AI assistant to improve or polish wording, tailor content to a job description, get an ATS score with missing keywords, run the iterative improvement agent, or import an existing PDF to auto-fill the form.
6. **Export** — download a single-page, print-based PDF.
7. **Share** — publish the résumé and copy its public, slug-scoped link.

## Notes

- **Verification & conventions** — see [`AGENTS.md`](AGENTS.md) for the full list. Every user-facing string goes through `next-intl` and must exist in **both** `messages/en.json` and `messages/th.json`; prefer `components/ui/*` (shadcn/ui) over hand-rolled markup; the résumé data shape is defined once in `lib/types/resume.ts`.
- **Auth** — all API routes require Supabase auth (`getUser()` → 401).
- **Rate limiting** — AI and CRUD endpoints are rate-limited per user. The in-memory limiter (`lib/rate-limit.ts`) counts per serverless instance; the `rate_limit_bump` RPC provides an optional distributed store.
- **PDF export** — print-based; scaling uses `zoom` and an iterative fit so long content is auto-scaled to one A4 page (see ADR‑0001).
- **Deployment** — deployed on Vercel. Set the environment variables above, point `NEXT_PUBLIC_SITE_URL` at the production domain, and apply the `supabase/migrations/` SQL to the production database.
- **Architecture decisions** — recorded in [`docs/adr/`](docs/adr/): one-page PDF fit (0001), public share RPC (0002), input limits (0003), Vercel deployment (0004).
- **License** — no license file is currently included; all rights reserved by the authors.
