
-- Fix RLS policies for existing tables to ensure proper data isolation

-- First, ensure RLS is enabled on all user data tables
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Clean up organization-related policies that may conflict
DROP POLICY IF EXISTS "Users can view leads in their organizations" ON public.leads;
DROP POLICY IF EXISTS "Users can create leads in their organizations" ON public.leads;
DROP POLICY IF EXISTS "Users can update leads in their organizations" ON public.leads;
DROP POLICY IF EXISTS "Admins can delete leads in their organizations" ON public.leads;

-- Create or replace RLS policies for leads table (using CREATE OR REPLACE pattern)
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
CREATE POLICY "Users can view their own leads" ON public.leads
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own leads" ON public.leads;
CREATE POLICY "Users can insert their own leads" ON public.leads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own leads" ON public.leads;
CREATE POLICY "Users can update their own leads" ON public.leads
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own leads" ON public.leads;
CREATE POLICY "Users can delete their own leads" ON public.leads
  FOR DELETE USING (auth.uid() = user_id);

-- Create or replace RLS policies for email_templates table
DROP POLICY IF EXISTS "Users can view their own templates" ON public.email_templates;
CREATE POLICY "Users can view their own templates" ON public.email_templates
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own templates" ON public.email_templates;
CREATE POLICY "Users can insert their own templates" ON public.email_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own templates" ON public.email_templates;
CREATE POLICY "Users can update their own templates" ON public.email_templates
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own templates" ON public.email_templates;
CREATE POLICY "Users can delete their own templates" ON public.email_templates
  FOR DELETE USING (auth.uid() = user_id);

-- Create or replace RLS policies for categories table
DROP POLICY IF EXISTS "Users can view their own categories" ON public.categories;
CREATE POLICY "Users can view their own categories" ON public.categories
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own categories" ON public.categories;
CREATE POLICY "Users can insert their own categories" ON public.categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own categories" ON public.categories;
CREATE POLICY "Users can update their own categories" ON public.categories
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own categories" ON public.categories;
CREATE POLICY "Users can delete their own categories" ON public.categories
  FOR DELETE USING (auth.uid() = user_id);

-- Create or replace RLS policies for import_batches table
DROP POLICY IF EXISTS "Users can view their own import batches" ON public.import_batches;
CREATE POLICY "Users can view their own import batches" ON public.import_batches
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own import batches" ON public.import_batches;
CREATE POLICY "Users can insert their own import batches" ON public.import_batches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own import batches" ON public.import_batches;
CREATE POLICY "Users can update their own import batches" ON public.import_batches
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own import batches" ON public.import_batches;
CREATE POLICY "Users can delete their own import batches" ON public.import_batches
  FOR DELETE USING (auth.uid() = user_id);

-- Create or replace RLS policies for campaigns table
DROP POLICY IF EXISTS "Users can view their own campaigns" ON public.campaigns;
CREATE POLICY "Users can view their own campaigns" ON public.campaigns
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own campaigns" ON public.campaigns;
CREATE POLICY "Users can insert their own campaigns" ON public.campaigns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own campaigns" ON public.campaigns;
CREATE POLICY "Users can update their own campaigns" ON public.campaigns
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own campaigns" ON public.campaigns;
CREATE POLICY "Users can delete their own campaigns" ON public.campaigns
  FOR DELETE USING (auth.uid() = user_id);

-- Create or replace RLS policies for lead_lists table
DROP POLICY IF EXISTS "Users can view their own lead lists" ON public.lead_lists;
CREATE POLICY "Users can view their own lead lists" ON public.lead_lists
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own lead lists" ON public.lead_lists;
CREATE POLICY "Users can insert their own lead lists" ON public.lead_lists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own lead lists" ON public.lead_lists;
CREATE POLICY "Users can update their own lead lists" ON public.lead_lists
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own lead lists" ON public.lead_lists;
CREATE POLICY "Users can delete their own lead lists" ON public.lead_lists
  FOR DELETE USING (auth.uid() = user_id);

-- Ensure profiles table has proper RLS policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Clean up any organization-related data that may be causing issues
UPDATE public.leads SET organization_id = NULL WHERE organization_id IS NOT NULL;
UPDATE public.categories SET organization_id = NULL WHERE organization_id IS NOT NULL;
UPDATE public.import_batches SET organization_id = NULL WHERE organization_id IS NOT NULL;
UPDATE public.email_templates SET organization_id = NULL WHERE organization_id IS NOT NULL;
UPDATE public.campaigns SET organization_id = NULL WHERE organization_id IS NOT NULL;
