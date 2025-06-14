
import React from 'react';
import { Check, ChevronsUpDown, Building, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { cn } from '@/lib/utils';

export const OrganizationSwitcher: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const { 
    currentOrganization, 
    userOrganizations, 
    switchOrganization,
    loading 
  } = useOrganizationContext();

  if (loading || !currentOrganization) {
    return (
      <div className="flex h-10 w-64 items-center rounded-md border border-input bg-background px-3 py-2">
        <div className="animate-pulse flex space-x-2 items-center">
          <div className="rounded-full bg-muted h-6 w-6"></div>
          <div className="h-4 bg-muted rounded flex-1"></div>
        </div>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select organization"
          className="w-64 justify-between"
        >
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarImage 
                src={currentOrganization.logo_url} 
                alt={currentOrganization.name} 
              />
              <AvatarFallback>
                {currentOrganization.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">{currentOrganization.name}</span>
          </div>
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0">
        <Command>
          <CommandInput placeholder="Search organizations..." />
          <CommandList>
            <CommandEmpty>No organization found.</CommandEmpty>
            <CommandGroup heading="Organizations">
              {userOrganizations.map((userOrg) => (
                <CommandItem
                  key={userOrg.organization_id}
                  onSelect={() => {
                    if (userOrg.organization_id !== currentOrganization.id) {
                      switchOrganization(userOrg.organization_id);
                    }
                    setOpen(false);
                  }}
                  className="text-sm"
                >
                  <div className="flex items-center space-x-2 flex-1">
                    <Avatar className="h-5 w-5">
                      <AvatarImage 
                        src={userOrg.organization?.logo_url} 
                        alt={userOrg.organization?.name} 
                      />
                      <AvatarFallback>
                        {userOrg.organization?.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="truncate">{userOrg.organization?.name}</span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {userOrg.role.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <Check
                    className={cn(
                      "h-4 w-4",
                      currentOrganization.id === userOrg.organization_id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  // TODO: Implement create organization flow
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Organization
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
