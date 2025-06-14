
-- Create enum for organization roles
CREATE TYPE public.organization_role AS ENUM (
  'owner',
  'admin', 
  'team_manager',
  'sales_rep',
  'viewer'
);

-- Create organizations table
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  domain TEXT,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  subscription_plan TEXT DEFAULT 'starter',
  subscription_status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create teams table
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  territory JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, name)
);

-- Create user_organizations table (many-to-many relationship)
CREATE TABLE public.user_organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  role organization_role NOT NULL DEFAULT 'sales_rep',
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, organization_id)
);

-- Add organization_id to existing tables
ALTER TABLE public.leads 
ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
ADD COLUMN assigned_to UUID REFERENCES auth.users(id),
ADD COLUMN team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;

ALTER TABLE public.categories 
ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.import_batches 
ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.email_templates 
ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.campaigns 
ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Update profiles table to include current organization
ALTER TABLE public.profiles 
ADD COLUMN current_organization_id UUID REFERENCES public.organizations(id);

-- Create indexes for performance
CREATE INDEX idx_user_organizations_user_id ON public.user_organizations(user_id);
CREATE INDEX idx_user_organizations_org_id ON public.user_organizations(organization_id);
CREATE INDEX idx_leads_organization_id ON public.leads(organization_id);
CREATE INDEX idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX idx_teams_organization_id ON public.teams(organization_id);

-- Create RLS policies for organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organizations" 
ON public.organizations FOR SELECT 
USING (
  id IN (
    SELECT organization_id 
    FROM public.user_organizations 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Organization owners can update their organizations" 
ON public.organizations FOR UPDATE 
USING (
  id IN (
    SELECT organization_id 
    FROM public.user_organizations 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND is_active = true
  )
);

-- Create RLS policies for teams
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view teams in their organizations" 
ON public.teams FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id 
    FROM public.user_organizations 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Team managers and above can manage teams" 
ON public.teams FOR ALL 
USING (
  organization_id IN (
    SELECT organization_id 
    FROM public.user_organizations 
    WHERE user_id = auth.uid() 
    AND role IN ('owner', 'admin', 'team_manager') 
    AND is_active = true
  )
);

-- Create RLS policies for user_organizations
ALTER TABLE public.user_organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own organization memberships" 
ON public.user_organizations FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all organization memberships" 
ON public.user_organizations FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id 
    FROM public.user_organizations 
    WHERE user_id = auth.uid() 
    AND role IN ('owner', 'admin') 
    AND is_active = true
  )
);

CREATE POLICY "Admins can manage organization memberships" 
ON public.user_organizations FOR ALL 
USING (
  organization_id IN (
    SELECT organization_id 
    FROM public.user_organizations 
    WHERE user_id = auth.uid() 
    AND role IN ('owner', 'admin') 
    AND is_active = true
  )
);

-- Update existing table RLS policies to include organization context
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can create their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON public.leads;

CREATE POLICY "Users can view leads in their organizations" 
ON public.leads FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id 
    FROM public.user_organizations 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Users can create leads in their organizations" 
ON public.leads FOR INSERT 
WITH CHECK (
  organization_id IN (
    SELECT organization_id 
    FROM public.user_organizations 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Users can update leads in their organizations" 
ON public.leads FOR UPDATE 
USING (
  organization_id IN (
    SELECT organization_id 
    FROM public.user_organizations 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Admins can delete leads in their organizations" 
ON public.leads FOR DELETE 
USING (
  organization_id IN (
    SELECT organization_id 
    FROM public.user_organizations 
    WHERE user_id = auth.uid() 
    AND role IN ('owner', 'admin') 
    AND is_active = true
  )
);

-- Create function to get user's current organization
CREATE OR REPLACE FUNCTION public.get_current_organization_id()
RETURNS UUID AS $$
  SELECT current_organization_id 
  FROM public.profiles 
  WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create function to check user role in organization
CREATE OR REPLACE FUNCTION public.has_organization_role(
  _organization_id UUID, 
  _role organization_role
)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_organizations
    WHERE user_id = auth.uid()
    AND organization_id = _organization_id
    AND role = _role
    AND is_active = true
  )
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create function to check if user has minimum role (fixed version)
CREATE OR REPLACE FUNCTION public.has_minimum_role(
  _organization_id UUID, 
  _min_role organization_role
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_organizations
    WHERE user_id = auth.uid()
    AND organization_id = _organization_id
    AND (
      (_min_role = 'viewer' AND role IN ('viewer', 'sales_rep', 'team_manager', 'admin', 'owner')) OR
      (_min_role = 'sales_rep' AND role IN ('sales_rep', 'team_manager', 'admin', 'owner')) OR
      (_min_role = 'team_manager' AND role IN ('team_manager', 'admin', 'owner')) OR
      (_min_role = 'admin' AND role IN ('admin', 'owner')) OR
      (_min_role = 'owner' AND role = 'owner')
    )
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Update the existing update_updated_at_column trigger for new tables
CREATE TRIGGER update_organizations_updated_at 
  BEFORE UPDATE ON public.organizations 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teams_updated_at 
  BEFORE UPDATE ON public.teams 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_organizations_updated_at 
  BEFORE UPDATE ON public.user_organizations 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
