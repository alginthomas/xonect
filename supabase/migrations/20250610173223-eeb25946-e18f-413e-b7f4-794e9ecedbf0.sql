
-- Phase 1: Remove conflicting RLS policies that allow unrestricted access
-- These policies override the secure user-specific policies, creating security vulnerabilities

-- Drop overly permissive policies on leads table
DROP POLICY IF EXISTS "Allow all operations on leads" ON public.leads;
DROP POLICY IF EXISTS "Anyone can view leads" ON public.leads;
DROP POLICY IF EXISTS "Anyone can manage leads" ON public.leads;

-- Drop overly permissive policies on email_templates table  
DROP POLICY IF EXISTS "Allow all operations on email_templates" ON public.email_templates;
DROP POLICY IF EXISTS "Anyone can view email_templates" ON public.email_templates;
DROP POLICY IF EXISTS "Anyone can manage email_templates" ON public.email_templates;

-- Drop overly permissive policies on campaigns table
DROP POLICY IF EXISTS "Allow all operations on campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Anyone can view campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Anyone can manage campaigns" ON public.campaigns;

-- Drop overly permissive policies on categories table
DROP POLICY IF EXISTS "Allow all operations on categories" ON public.categories;

-- Drop overly permissive policies on import_batches table
DROP POLICY IF EXISTS "Allow all operations on import_batches" ON public.import_batches;

-- Drop overly permissive policies on lead_lists table
DROP POLICY IF EXISTS "Allow all operations on lead_lists" ON public.lead_lists;

-- Ensure RLS is enabled on all tables (some may have been disabled)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_lists ENABLE ROW LEVEL SECURITY;

-- Verify that only secure user-specific policies remain active
-- The migration file 20250610091141 already created the correct policies:
-- - "Users can view their own leads" etc. for all tables
-- These policies ensure users can only access their own data

-- Add rate limiting table for email sending to prevent abuse
CREATE TABLE IF NOT EXISTS public.email_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email_count INTEGER DEFAULT 0,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on rate limiting table
ALTER TABLE public.email_rate_limits ENABLE ROW LEVEL SECURITY;

-- Users can only see their own rate limit records
CREATE POLICY "Users can view their own rate limits" ON public.email_rate_limits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own rate limits" ON public.email_rate_limits
  FOR ALL USING (auth.uid() = user_id);
