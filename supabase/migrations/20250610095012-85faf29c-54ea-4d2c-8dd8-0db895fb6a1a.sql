
-- Add missing columns to the leads table for organization details
ALTER TABLE public.leads 
ADD COLUMN organization_website TEXT,
ADD COLUMN organization_founded INTEGER,
ADD COLUMN department TEXT,
ADD COLUMN personal_email TEXT,
ADD COLUMN photo_url TEXT,
ADD COLUMN twitter_url TEXT,
ADD COLUMN facebook_url TEXT;
