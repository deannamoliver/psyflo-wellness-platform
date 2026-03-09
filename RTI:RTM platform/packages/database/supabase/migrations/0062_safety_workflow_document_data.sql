-- Add document_data column to safety_workflows table
-- This stores the step 6 documentation data (situation summary, student statement,
-- actions taken: emergency services, school notification, parent contact, CPS)
ALTER TABLE safety_workflows
ADD COLUMN document_data jsonb;
