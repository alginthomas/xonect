
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const Header = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <header className="border-b border-border bg-card/50 apple-blur sticky top-0 z-40">
      <div className="px-4 lg:px-8 py-3 lg:py-4">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="w-7 h-7 lg:w-8 lg:h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-xs lg:text-sm font-bold text-primary-foreground">L</span>
            </div>
            <span className="font-semibold text-foreground text-sm lg:text-base">LeadManager</span>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-8 w-8 lg:h-10 lg:w-10 rounded-full hover:bg-accent transition-colors duration-200"
              >
                <Avatar className="h-8 w-8 lg:h-10 lg:w-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs lg:text-sm">
                    {user?.email ? getInitials(user.email) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-56 lg:w-64 apple-shadow-lg border-border" 
              align="end" 
              forceMount
            >
              <DropdownMenuLabel className="font-normal p-3 lg:p-4">
                <div className="flex flex-col space-y-1 lg:space-y-2">
                  <p className="text-sm font-semibold leading-none">
                    {user?.user_metadata?.full_name || 'User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleSignOut} 
                className="cursor-pointer p-3 lg:p-4 hover:bg-destructive/10 text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
                <LogOut className="mr-2 lg:mr-3 h-4 w-4" />
                <span className="font-medium">Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
