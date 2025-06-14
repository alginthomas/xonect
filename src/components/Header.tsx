
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserDropdown } from '@/components/UserDropdown';
import { OrganizationSwitcher } from '@/components/OrganizationSwitcher';
import { RoleGuard } from '@/components/RoleGuard';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { Settings, Users, BarChart3 } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentOrganization, userRole } = useOrganizationContext();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold">LeadManager</h1>
            {currentOrganization && (
              <span className="text-sm text-muted-foreground">
                | {currentOrganization.name}
              </span>
            )}
          </div>
          <OrganizationSwitcher />
        </div>

        <div className="flex items-center space-x-4">
          {userRole && (
            <div className="text-sm text-muted-foreground capitalize">
              {userRole.replace('_', ' ')}
            </div>
          )}

          <RoleGuard requiredRole="team_manager">
            <Button variant="ghost" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </RoleGuard>

          <RoleGuard requiredRole="admin">
            <Button variant="ghost" size="sm">
              <Users className="h-4 w-4 mr-2" />
              Team
            </Button>
          </RoleGuard>

          <RoleGuard requiredRole="admin">
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </RoleGuard>

          <UserDropdown />
        </div>
      </div>
    </header>
  );
};
