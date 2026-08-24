-- ============================================================
-- Project setup: tables, indexes, RLS policies, triggers
-- Idempotent: safe to run on a fresh project or an existing one
-- ============================================================

-- Resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Untitled Resume',
  template TEXT DEFAULT 'modern' CHECK (template IN ('modern', 'classic', 'minimal', 'creative', 'academic', 'comprehensive', 'compact')),
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  document_type TEXT DEFAULT 'resume' CHECK (document_type IN ('resume', 'cv')),
  is_public BOOLEAN DEFAULT false,
  share_slug TEXT UNIQUE,
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Version history table
CREATE TABLE IF NOT EXISTS resume_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  version INT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Legacy databases may still have the 4-template constraint or missing column
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS document_type TEXT DEFAULT 'resume' CHECK (document_type IN ('resume', 'cv'));
ALTER TABLE resumes DROP CONSTRAINT IF EXISTS resumes_template_check;
ALTER TABLE resumes ADD CONSTRAINT resumes_template_check
  CHECK (template IN ('modern', 'classic', 'minimal', 'creative', 'academic', 'comprehensive', 'compact'));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_share_slug ON resumes(share_slug) WHERE share_slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_resumes_document_type ON resumes(document_type);
CREATE INDEX IF NOT EXISTS idx_resume_versions_resume_id ON resume_versions(resume_id);

-- Row Level Security
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_versions ENABLE ROW LEVEL SECURITY;

-- RLS policies: resumes
DROP POLICY IF EXISTS "Users can view own resumes" ON resumes;
CREATE POLICY "Users can view own resumes"
  ON resumes FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view public resumes" ON resumes;
CREATE POLICY "Users can view public resumes"
  ON resumes FOR SELECT
  USING (is_public = true);

DROP POLICY IF EXISTS "Users can create own resumes" ON resumes;
CREATE POLICY "Users can create own resumes"
  ON resumes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own resumes" ON resumes;
CREATE POLICY "Users can update own resumes"
  ON resumes FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own resumes" ON resumes;
CREATE POLICY "Users can delete own resumes"
  ON resumes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies: resume_versions
DROP POLICY IF EXISTS "Users can view own resume versions" ON resume_versions;
CREATE POLICY "Users can view own resume versions"
  ON resume_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM resumes
      WHERE resumes.id = resume_versions.resume_id
      AND resumes.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create resume versions" ON resume_versions;
CREATE POLICY "Users can create resume versions"
  ON resume_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM resumes
      WHERE resumes.id = resume_versions.resume_id
      AND resumes.user_id = auth.uid()
    )
  );

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_resume_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_resume_updated_at ON resumes;
CREATE TRIGGER trigger_update_resume_updated_at
  BEFORE UPDATE ON resumes
  FOR EACH ROW
  EXECUTE FUNCTION update_resume_updated_at();
