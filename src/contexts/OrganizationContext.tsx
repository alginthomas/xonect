
import React, { createContext, useContext } from 'react';
import { useOrganization } from '@/hooks/useOrganization';
import type { Organization, UserOrganization, OrganizationRole } from '@/types/organization';

interface OrganizationContextType {
  currentOrganization: Organization | null;
  userOrganizations: UserOrganization[];
  userRole: OrganizationRole | null;
  loading: boolean;
  switchOrganization: (organizationId: string) => Promise<void>;
  hasPermission: (action: string, resource: string, conditions?: Record<string, any>) => boolean;
  hasMinimumRole: (minRole: OrganizationRole) => boolean;
  refetch: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const useOrganizationContext = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganizationContext must be used within an OrganizationProvider');
  }
  return context;
};

interface OrganizationProviderProps {
  children: React.ReactNode;
}

export const OrganizationProvider: React.FC<OrganizationProviderProps> = ({ children }) => {
  const organization = useOrganization();

  return (
    <OrganizationContext.Provider value={organization}>
      {children}
    </OrganizationContext.Provider>
  );
};
