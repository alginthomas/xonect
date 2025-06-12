
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { UserDropdown } from '@/components/UserDropdown';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddLead?: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, onAddLead }) => {
  const isMobile = useIsMobile();

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'leads', label: 'Leads' },
    { id: 'import', label: 'Import' },
    { id: 'categories', label: 'Categories' },
    { id: 'templates', label: 'Templates' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left Section - Logo/Title */}
        <div className="flex items-center gap-4">
          <h1 className="text-xl lg:text-2xl font-bold text-primary">Xonect</h1>
        </div>

        {/* Center Section - Desktop Navigation */}
        {!isMobile && (
          <nav className="hidden md:flex items-center space-x-1">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                onClick={() => onTabChange(tab.id)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                {tab.label}
              </Button>
            ))}
          </nav>
        )}

        {/* Right Section - Actions and User */}
        <div className="flex items-center gap-2">
          {/* Add Lead Button - Show on mobile and when appropriate */}
          {isMobile && onAddLead && (
            <Button
              onClick={onAddLead}
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden xs:inline">Add Lead</span>
            </Button>
          )}
          
          {/* Desktop Add Lead Button - Show on leads tab */}
          {!isMobile && activeTab === 'leads' && onAddLead && (
            <Button
              onClick={onAddLead}
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Lead
            </Button>
          )}
          
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default Header;
