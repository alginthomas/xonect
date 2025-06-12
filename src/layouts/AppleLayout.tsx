
import React from 'react';
import Header from '@/components/Header';

interface AppleLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const AppleLayout: React.FC<AppleLayoutProps> = ({ 
  children, 
  activeTab = 'dashboard', 
  onTabChange = () => {} 
}) => {
  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <Header activeTab={activeTab} onTabChange={onTabChange} />
      <main className="flex-1 p-3 lg:p-6 xl:p-8">
        <div className="max-w-7xl mx-auto space-y-4 lg:space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppleLayout;
