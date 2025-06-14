
import React from 'react';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import type { OrganizationRole } from '@/types/organization';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: OrganizationRole;
  requiredPermission?: {
    action: string;
    resource: string;
    conditions?: Record<string, any>;
  };
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  requiredRole,
  requiredPermission,
  fallback = null
}) => {
  const { hasMinimumRole, hasPermission } = useOrganizationContext();

  const hasAccess = () => {
    if (requiredRole && !hasMinimumRole(requiredRole)) {
      return false;
    }

    if (requiredPermission) {
      const { action, resource, conditions } = requiredPermission;
      if (!hasPermission(action, resource, conditions)) {
        return false;
      }
    }

    return true;
  };

  if (!hasAccess()) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
