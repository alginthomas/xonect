
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Users, 
  Upload, 
  FolderOpen,
  Copy
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  unreadCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  unreadCount = 0
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'duplicates', label: 'Duplicates', icon: Copy },
    { id: 'import', label: 'Import', icon: Upload },
    { id: 'categories', label: 'Categories', icon: FolderOpen },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border/40 px-1 sm:px-2 py-1.5 sm:py-2 safe-area-pb md:hidden">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => onTabChange(item.id)}
              className={cn(
                // Base responsive styles - more compact for small screens
                "flex flex-col items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-2 sm:py-3 min-w-0 relative transition-all duration-200",
                // Enhanced touch targets and spacing - smaller for mobile
                "h-12 sm:h-16 min-w-[52px] sm:min-w-[60px] touch-manipulation select-none",
                // Active/inactive states
                isActive 
                  ? 'bg-primary/10 text-primary border-2 border-primary/20 rounded-lg' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
                // Responsive adjustments
                "text-xs"
              )}
            >
              <Icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="font-medium truncate leading-none max-w-[44px] sm:max-w-[50px] text-center text-[10px] sm:text-xs">
                {item.label}
              </span>
              {item.id === 'categories' && unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 h-4 w-4 sm:h-5 sm:w-5 text-xs p-0 flex items-center justify-center rounded-full min-w-[16px] sm:min-w-[20px]"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
