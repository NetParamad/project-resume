-- Add document_type column to distinguish CV vs Resume
ALTER TABLE resumes ADD COLUMN document_type TEXT DEFAULT 'resume' CHECK (document_type IN ('resume', 'cv'));

-- Update template CHECK constraint to include CV templates
ALTER TABLE resumes DROP CONSTRAINT IF EXISTS resumes_template_check;
ALTER TABLE resumes ADD CONSTRAINT resumes_template_check
  CHECK (template IN ('modern', 'classic', 'minimal', 'professional', 'creative', 'academic', 'comprehensive', 'compact'));

-- Update RLS policies to include document_type in SELECT
-- (existing policies already cover all columns via auth.uid() = user_id)

-- Index for filtering by document type
CREATE INDEX idx_resumes_document_type ON resumes(document_type);
