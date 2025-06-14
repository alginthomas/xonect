
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserDropdown } from '@/components/UserDropdown';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange
}) => {
  const isMobile = useIsMobile();
  
  const tabs = [{
    id: 'dashboard',
    label: 'Dashboard'
  }, {
    id: 'leads',
    label: 'Leads'
  }, {
    id: 'import',
    label: 'Import'
  }, {
    id: 'categories',
    label: 'Categories'
  }];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Left Section - Logo/Title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-lg font-semibold text-primary-foreground">X</span>
            </div>
            <h1 className="text-xl lg:text-2xl font-semibold text-foreground">Xonect</h1>
          </div>
        </div>

        {/* Center Section - Desktop Navigation */}
        {!isMobile && (
          <nav className="hidden md:flex items-center space-x-1">
            {tabs.map(tab => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                onClick={() => onTabChange(tab.id)}
                className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                {tab.label}
              </Button>
            ))}
          </nav>
        )}

        {/* Right Section - User */}
        <div className="flex items-center gap-3">
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default Header;
