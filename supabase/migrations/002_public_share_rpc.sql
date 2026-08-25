-- ============================================================
-- Restrict public resume reads to slug-scoped RPC (ADR-0002)
--
-- 001 granted a blanket SELECT on is_public = true, which let anyone
-- holding the anon key enumerate every public resume (full data JSONB,
-- user_id) via direct REST. From now on the only public read path is
-- this SECURITY DEFINER function keyed by share_slug.
-- Idempotent: safe to re-run.
-- ============================================================

-- 1. Drop the world-listable blanket policy added by 001.
DROP POLICY IF EXISTS "Users can view public resumes" ON resumes;

-- 2. Public access = knowing the slug of a published resume.
--    Returns only the columns the share page renders.
CREATE OR REPLACE FUNCTION get_public_resume(p_slug text)
RETURNS TABLE (
  title text,
  template text,
  document_type text,
  data jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.title, r.template, r.document_type, r.data
  FROM resumes r
  WHERE r.share_slug = p_slug
    AND r.is_public = true
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION get_public_resume(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_public_resume(text) TO anon, authenticated;
