
import React, { useState } from 'react';
import Header from '@/components/Header';
import { AddLeadDialog } from '@/components/AddLeadDialog';
import { MobileBottomNav } from '@/components/ui/mobile-bottom-nav';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Category } from '@/types/category';

interface AppleLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  categories?: Category[];
  onLeadAdded?: () => void;
}

const AppleLayout: React.FC<AppleLayoutProps> = ({ 
  children, 
  activeTab = 'dashboard', 
  onTabChange = () => {},
  categories = [],
  onLeadAdded = () => {}
}) => {
  const [isAddLeadDialogOpen, setIsAddLeadDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleAddLead = () => {
    setIsAddLeadDialogOpen(true);
  };

  const handleLeadAdded = () => {
    onLeadAdded();
  };

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <Header 
        activeTab={activeTab} 
        onTabChange={onTabChange}
        onAddLead={handleAddLead}
      />
      
      <main className="flex-1 overflow-hidden">
        {isMobile ? (
          // Mobile Layout - Full height container with no padding
          <div className="h-full pb-16">
            {children}
          </div>
        ) : (
          // Desktop Layout - No padding, full width
          <div className="w-full h-full">
            {children}
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <MobileBottomNav
          activeTab={activeTab}
          onTabChange={onTabChange}
          onAddLead={handleAddLead}
        />
      )}

      <AddLeadDialog
        isOpen={isAddLeadDialogOpen}
        onClose={() => setIsAddLeadDialogOpen(false)}
        categories={categories}
        onLeadAdded={handleLeadAdded}
      />
    </div>
  );
};

export default AppleLayout;
