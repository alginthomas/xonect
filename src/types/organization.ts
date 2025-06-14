
export interface Organization {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  logo_url?: string;
  settings: any; // Changed from Record<string, any> to any to match Supabase Json type
  subscription_plan: string;
  subscription_status: string;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  territory: any; // Changed from Record<string, any> to any to match Supabase Json type
  created_at: string;
  updated_at: string;
}

export interface UserOrganization {
  id: string;
  user_id: string;
  organization_id: string;
  role: OrganizationRole;
  team_id?: string;
  is_active: boolean;
  invited_by?: string;
  invited_at?: string;
  joined_at?: string;
  created_at: string;
  updated_at: string;
  organization?: Organization;
  team?: Team;
}

export type OrganizationRole = 'owner' | 'admin' | 'team_manager' | 'sales_rep' | 'viewer';

export interface Permission {
  action: string;
  resource: string;
  conditions?: Record<string, any>;
}

export const ROLE_PERMISSIONS: Record<OrganizationRole, Permission[]> = {
  owner: [
    { action: '*', resource: '*' }
  ],
  admin: [
    { action: '*', resource: 'leads' },
    { action: '*', resource: 'categories' },
    { action: '*', resource: 'teams' },
    { action: '*', resource: 'users' },
    { action: 'read', resource: 'organization' },
    { action: 'update', resource: 'organization' }
  ],
  team_manager: [
    { action: '*', resource: 'leads', conditions: { team_access: true } },
    { action: 'read', resource: 'categories' },
    { action: 'read', resource: 'teams' },
    { action: 'read', resource: 'users', conditions: { team_members_only: true } }
  ],
  sales_rep: [
    { action: 'read', resource: 'leads', conditions: { assigned_or_team: true } },
    { action: 'update', resource: 'leads', conditions: { assigned_only: true } },
    { action: 'create', resource: 'leads' },
    { action: 'read', resource: 'categories' }
  ],
  viewer: [
    { action: 'read', resource: 'leads', conditions: { team_access: true } },
    { action: 'read', resource: 'categories' }
  ]
};
