
-- Add "Send Email" to the lead_status enum
ALTER TYPE lead_status ADD VALUE 'Send Email';

-- Add columns to track remarks history and activity log
ALTER TABLE leads 
ADD COLUMN remarks_history JSONB DEFAULT '[]'::jsonb,
ADD COLUMN activity_log JSONB DEFAULT '[]'::jsonb;
