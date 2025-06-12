
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MobileNavigation } from '@/components/MobileNavigation';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard';
      case 'leads':
        return 'Leads';
      case 'import':
        return 'Import Data';
      case 'categories':
        return 'Categories';
      case 'templates':
        return 'Email Templates';
      case 'settings':
        return 'Settings';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="border-b border-border bg-card/50 apple-blur sticky top-0 z-40">
      <div className="px-4 lg:px-8 py-3 lg:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left Zone: Brand + Mobile Menu + Desktop Navigation */}
          <div className="flex items-center gap-3 lg:gap-6 flex-1 min-w-0">
            {/* Brand */}
            <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
              {/* Mobile Navigation */}
              <MobileNavigation 
                activeTab={activeTab} 
                onTabChange={onTabChange} 
              />
              
              <div className="w-7 h-7 lg:w-8 lg:h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-xs lg:text-sm font-bold text-primary-foreground">L</span>
              </div>
              <span className="font-semibold text-foreground text-sm lg:text-base">LeadManager</span>
            </div>

            {/* Desktop Navigation - Hidden on Mobile */}
            <div className="hidden lg:block">
              <Tabs value={activeTab} onValueChange={onTabChange}>
                <TabsList className="bg-muted/50 rounded-lg p-1 gap-1">
                  <TabsTrigger value="dashboard" className="rounded-md font-medium text-xs px-3 py-1.5">Dashboard</TabsTrigger>
                  <TabsTrigger value="leads" className="rounded-md font-medium text-xs px-3 py-1.5">Leads</TabsTrigger>
                  <TabsTrigger value="import" className="rounded-md font-medium text-xs px-3 py-1.5">Import</TabsTrigger>
                  <TabsTrigger value="categories" className="rounded-md font-medium text-xs px-3 py-1.5">Categories</TabsTrigger>
                  <TabsTrigger value="templates" className="rounded-md font-medium text-xs px-3 py-1.5">Templates</TabsTrigger>
                  <TabsTrigger value="settings" className="rounded-md font-medium text-xs px-3 py-1.5">Settings</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Center Zone: Page Title on Mobile */}
          <div className="lg:hidden flex-1 text-center">
            <h1 className="font-semibold text-foreground text-sm truncate">
              {getPageTitle()}
            </h1>
          </div>

          {/* Right Zone: Empty for now - cleaner look */}
          <div className="flex-shrink-0 w-8">
            {/* This space is intentionally left empty for a cleaner design */}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
