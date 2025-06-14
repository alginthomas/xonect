
-- First, disable RLS on all tables to avoid policy conflicts during cleanup
ALTER TABLE IF EXISTS public.user_organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.organizations DISABLE ROW LEVEL SECURITY;

-- Drop all policies that might reference these tables
DROP POLICY IF EXISTS "Users can view their organizations" ON public.organizations;
DROP POLICY IF EXISTS "Organization owners can update their organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can view teams in their organizations" ON public.teams;
DROP POLICY IF EXISTS "Team managers and above can manage teams" ON public.teams;
DROP POLICY IF EXISTS "Users can view user organizations" ON public.user_organizations;
DROP POLICY IF EXISTS "Users can manage user organizations" ON public.user_organizations;

-- Drop all functions that might reference these tables
DROP FUNCTION IF EXISTS public.get_current_organization_id() CASCADE;
DROP FUNCTION IF EXISTS public.has_organization_role(uuid, organization_role) CASCADE;
DROP FUNCTION IF EXISTS public.has_minimum_role(uuid, organization_role) CASCADE;

-- Drop tables in correct dependency order (child tables first)
DROP TABLE IF EXISTS public.user_organizations CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;
DROP TABLE IF EXISTS public.organizations CASCADE;

-- Drop the organization_role enum since it's no longer needed
DROP TYPE IF EXISTS public.organization_role CASCADE;

-- Remove organization-related columns from remaining tables
ALTER TABLE public.leads DROP COLUMN IF EXISTS organization_id CASCADE;
ALTER TABLE public.leads DROP COLUMN IF EXISTS team_id CASCADE;
ALTER TABLE public.leads DROP COLUMN IF EXISTS assigned_to CASCADE;
ALTER TABLE public.categories DROP COLUMN IF EXISTS organization_id CASCADE;
ALTER TABLE public.import_batches DROP COLUMN IF EXISTS organization_id CASCADE;
ALTER TABLE public.email_templates DROP COLUMN IF EXISTS organization_id CASCADE;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS current_organization_id CASCADE;

-- Verify cleanup by checking if any tables still exist
-- (This is just for verification, won't cause errors if tables don't exist)
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('organizations', 'teams', 'user_organizations');
