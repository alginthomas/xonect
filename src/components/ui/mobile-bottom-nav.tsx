
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Users, 
  Upload, 
  FolderOpen, 
  Mail, 
  Settings,
  Plus
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddLead: () => void;
  unreadCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  onAddLead,
  unreadCount = 0
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'add', label: 'Add', icon: Plus, isAction: true },
    { id: 'import', label: 'Import', icon: Upload },
    { id: 'templates', label: 'Templates', icon: Mail },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border/50 px-2 py-2 safe-area-pb md:hidden">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          if (item.isAction) {
            return (
              <Button
                key={item.id}
                onClick={onAddLead}
                size="sm"
                className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
              >
                <Icon className="h-5 w-5" />
              </Button>
            );
          }
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center gap-1 h-12 px-3 min-w-0 relative ${
                isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs font-medium truncate leading-none">
                {item.label}
              </span>
              {item.id === 'templates' && unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
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
