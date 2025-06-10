
-- Phase 1: Add user_id columns to all data tables
ALTER TABLE public.leads ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.email_templates ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.categories ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.import_batches ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.campaigns ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.lead_lists ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Phase 2: Enable Row Level Security on all tables
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
DROP POLICY IF EXISTS "Anyone can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Anyone can view import batches" ON public.import_batches;
DROP POLICY IF EXISTS "Anyone can manage import batches" ON public.import_batches;
DROP POLICY IF EXISTS "Anyone can view lead lists" ON public.lead_lists;
DROP POLICY IF EXISTS "Anyone can manage lead lists" ON public.lead_lists;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;

-- Phase 3: Create secure RLS policies for leads
CREATE POLICY "Users can view their own leads" ON public.leads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own leads" ON public.leads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leads" ON public.leads
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own leads" ON public.leads
  FOR DELETE USING (auth.uid() = user_id);

-- Phase 4: Create secure RLS policies for email_templates
CREATE POLICY "Users can view their own templates" ON public.email_templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own templates" ON public.email_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" ON public.email_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" ON public.email_templates
  FOR DELETE USING (auth.uid() = user_id);

-- Phase 5: Create secure RLS policies for categories
CREATE POLICY "Users can view their own categories" ON public.categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories" ON public.categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories" ON public.categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories" ON public.categories
  FOR DELETE USING (auth.uid() = user_id);

-- Phase 6: Create secure RLS policies for import_batches
CREATE POLICY "Users can view their own import batches" ON public.import_batches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own import batches" ON public.import_batches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own import batches" ON public.import_batches
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own import batches" ON public.import_batches
  FOR DELETE USING (auth.uid() = user_id);

-- Phase 7: Create secure RLS policies for campaigns
CREATE POLICY "Users can view their own campaigns" ON public.campaigns
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own campaigns" ON public.campaigns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns" ON public.campaigns
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns" ON public.campaigns
  FOR DELETE USING (auth.uid() = user_id);

-- Phase 8: Create secure RLS policies for lead_lists
CREATE POLICY "Users can view their own lead lists" ON public.lead_lists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lead lists" ON public.lead_lists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lead lists" ON public.lead_lists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lead lists" ON public.lead_lists
  FOR DELETE USING (auth.uid() = user_id);

-- Phase 9: Fix profiles table security
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Phase 10: Create a function to delete duplicate leads safely
CREATE OR REPLACE FUNCTION public.delete_duplicate_leads(lead_ids UUID[])
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Only allow deletion of leads that belong to the current user
  DELETE FROM public.leads 
  WHERE id = ANY(lead_ids) 
  AND user_id = auth.uid();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
