
-- Add new lead statuses to the existing enum
ALTER TYPE lead_status ADD VALUE 'Call Back';
ALTER TYPE lead_status ADD VALUE 'Unresponsive';
ALTER TYPE lead_status ADD VALUE 'Not Interested';

-- Add remarks column to leads table
ALTER TABLE public.leads ADD COLUMN remarks text;
