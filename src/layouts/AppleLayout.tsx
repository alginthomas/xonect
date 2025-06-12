
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
          // Mobile Layout - Full height container
          <div className="h-full pb-16">
            {children}
          </div>
        ) : (
          // Desktop Layout - Padded container
          <div className="p-4 lg:p-6 xl:p-8">
            <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
              {children}
            </div>
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
