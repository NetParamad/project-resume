# ADR-0002: Public resume access only through slug-scoped RPC

**Status:** Implemented (`supabase/migrations/002_public_share_rpc.sql` + RPC-backed share page) — 2026-08-25

## Context

The RLS policy on `resumes` includes a blanket `USING (is_public = true)` SELECT for anon/authenticated roles. Anyone holding the public anon key can therefore list **every** public resume via direct REST (`GET /rest/v1/resumes?is_public=eq.true`), including the full `data` JSONB (personal info) and `user_id`. The share page filters by slug correctly, but the policy makes "public" mean "world-listable".

## Decision

- Drop the blanket public SELECT policy from `supabase/migrations` (new migration, migrations are applied manually and numbered).
- Expose public reads solely through a `SECURITY DEFINER` RPC, e.g. `get_public_resume(p_slug text)`, returning a single row where `share_slug = p_slug AND is_public = true`, projecting only the columns the share page needs.
- The share page (`app/[locale]/share/[slug]`) switches from table select to this RPC.
- Owner-scoped policies remain unchanged; authenticated users keep full CRUD on their own rows.

## Consequences

- Direct REST listing of public resumes returns nothing for anon clients; knowing a slug becomes the capability that grants read access.
- Slugs are capability tokens → keep them unguessable (existing nanoid-style generation); validate client-supplied slug shape separately (see input-limits ADR).
