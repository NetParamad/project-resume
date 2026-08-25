# Glossary

Terms used across the codebase, ADRs, and tickets.

| Term | Meaning |
|---|---|
| **Resume vs CV** | Two document types (`documentType`: `resume` \| `cv`) sharing one builder. CV unlocks academic templates (`academic`, `comprehensive`, `compact`). |
| **Template** | Render component for a resume; 7 total in `components/preview/templates/` (4 resume + 3 cv). Selected per-document via `template` column. |
| **Print copy / `.print-resume`** | Hidden duplicate of the rendered resume revealed only by `@media print`; the thing that actually gets "Downloaded as PDF". Lives via portal on `document.body` (see ADR-0001). |
| **`.print-root`** | Class of the portaled print-copy wrapper; the sole body child kept visible during printing. |
| **Fit threshold (1080px)** | Max natural content height at 794px width before zoom scaling kicks in; intentionally below the 1122px printable box for safety. |
| **Heavy shrink** | Fitted scale below 0.5 — content technically fits but text is very small; treated as a "too long" warning case. |
| **Truncated** | Even at `MIN_SCALE = 0.15` content exceeds one page; bottom is clipped by the fixed-height print box and user is warned. |
| **share_slug** | Unguessable public identifier for a shared resume; acts as a capability token once ADR-0002 lands. |
| **is_public** | Row flag making a resume shareable; must never imply world-listable read access (ADR-0002). |
| **Resume language vs UI locale** | Content language (`en`/`th`/`auto`, `resume-lang-store`, drives `font-thai`) is independent from UI locale (next-intl, `[locale]` segment). |
| **Autosave / isDirty** | Builder auto-PUTs to `/api/resumes/[id]` 1.5s after any change when dirty and content exists. |
| **FormPanel / PreviewPanel** | The two builder panes; desktop uses fixed-height independent scroll layers, mobile toggles via tab bar. |
| **Anon key** | Public Supabase key shipped in the client bundle; everything reachable with it alone must be considered world-readable. |
| **RLS** | Supabase Postgres Row Level Security; policies in `supabase/migrations/*.sql` applied manually (numbered, no migration tool). |
