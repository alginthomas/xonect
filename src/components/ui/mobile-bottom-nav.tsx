
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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border/40 px-2 py-2 safe-area-pb md:hidden">
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
                // Base responsive styles
                "flex flex-col items-center gap-1 px-2 py-3 min-w-0 relative transition-all duration-200",
                // Enhanced touch targets and spacing
                "h-16 min-w-[60px] touch-manipulation select-none",
                // Active/inactive states
                isActive 
                  ? 'bg-primary/10 text-primary border-2 border-primary/20 rounded-lg' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
                // Responsive adjustments
                "text-xs sm:text-sm"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0 sm:h-6 sm:w-6" />
              <span className="font-medium truncate leading-none max-w-[50px] text-center">
                {item.label}
              </span>
              {item.id === 'categories' && unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center rounded-full min-w-[20px]"
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
