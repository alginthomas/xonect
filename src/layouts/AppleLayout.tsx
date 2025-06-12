
import React, { useState } from 'react';
import Header from '@/components/Header';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { AddLeadDialog } from '@/components/AddLeadDialog';
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

  const handleAddLead = () => {
    setIsAddLeadDialogOpen(true);
  };

  const handleLeadAdded = () => {
    onLeadAdded();
  };

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <Header activeTab={activeTab} onTabChange={onTabChange} />
      <main className="flex-1 p-4 lg:p-6 xl:p-8">
        <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
          {children}
        </div>
      </main>
      
      {/* Floating Action Button - Only show on leads tab for mobile */}
      {activeTab === 'leads' && (
        <FloatingActionButton
          onClick={handleAddLead}
          label="Add Lead"
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
