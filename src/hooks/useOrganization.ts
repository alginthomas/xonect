
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Organization, UserOrganization, OrganizationRole } from '@/types/organization';

export const useOrganization = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [userOrganizations, setUserOrganizations] = useState<UserOrganization[]>([]);
  const [userRole, setUserRole] = useState<OrganizationRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserOrganizations = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_organizations')
        .select(`
          *,
          organization:organizations(*),
          team:teams(*)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;

      setUserOrganizations(data || []);

      // Get current organization from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('current_organization_id')
        .eq('id', user.id)
        .single();

      if (profile?.current_organization_id) {
        const currentOrgData = data?.find(
          org => org.organization_id === profile.current_organization_id
        );
        if (currentOrgData?.organization) {
          setCurrentOrganization(currentOrgData.organization);
          setUserRole(currentOrgData.role);
        }
      } else if (data && data.length > 0) {
        // Set first organization as current if none is set
        const firstOrg = data[0];
        if (firstOrg.organization) {
          await switchOrganization(firstOrg.organization.id);
        }
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load organizations',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const switchOrganization = async (organizationId: string) => {
    if (!user) return;

    try {
      // Update current organization in profile
      const { error } = await supabase
        .from('profiles')
        .update({ current_organization_id: organizationId })
        .eq('id', user.id);

      if (error) throw error;

      // Find and set the new current organization
      const orgData = userOrganizations.find(
        org => org.organization_id === organizationId
      );

      if (orgData?.organization) {
        setCurrentOrganization(orgData.organization);
        setUserRole(orgData.role);
        
        toast({
          title: 'Organization switched',
          description: `Now working in ${orgData.organization.name}`
        });
      }
    } catch (error) {
      console.error('Error switching organization:', error);
      toast({
        title: 'Error',
        description: 'Failed to switch organization',
        variant: 'destructive'
      });
    }
  };

  const hasPermission = (action: string, resource: string, conditions?: Record<string, any>) => {
    if (!userRole || !currentOrganization) return false;

    // Owner has all permissions
    if (userRole === 'owner') return true;

    // Check role-based permissions
    const rolePermissions = {
      admin: ['*'],
      team_manager: resource === 'leads' || resource === 'categories' || resource === 'teams' ? ['read', 'update', 'create'] : ['read'],
      sales_rep: resource === 'leads' ? ['read', 'update', 'create'] : resource === 'categories' ? ['read'] : [],
      viewer: ['read']
    };

    const allowedActions = rolePermissions[userRole] || [];
    return allowedActions.includes('*') || allowedActions.includes(action);
  };

  const hasMinimumRole = (minRole: OrganizationRole) => {
    if (!userRole) return false;

    const roleHierarchy: Record<OrganizationRole, number> = {
      viewer: 1,
      sales_rep: 2,
      team_manager: 3,
      admin: 4,
      owner: 5
    };

    return roleHierarchy[userRole] >= roleHierarchy[minRole];
  };

  useEffect(() => {
    if (user) {
      fetchUserOrganizations();
    } else {
      setCurrentOrganization(null);
      setUserOrganizations([]);
      setUserRole(null);
      setLoading(false);
    }
  }, [user, fetchUserOrganizations]);

  return {
    currentOrganization,
    userOrganizations,
    userRole,
    loading,
    switchOrganization,
    hasPermission,
    hasMinimumRole,
    refetch: fetchUserOrganizations
  };
};
