
import React from 'react';
import Header from '@/components/Header';
import { MobileBottomNav } from '@/components/ui/mobile-bottom-nav';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <Header 
        activeTab={activeTab} 
        onTabChange={onTabChange}
      />
      
      <main className="flex-1 overflow-hidden">
        {isMobile ? (
          // Mobile Layout - Full height container with proper bottom spacing for nav
          <div className="h-full pb-20">
            {children}
          </div>
        ) : (
          // Desktop Layout - Full width and height
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
        />
      )}
    </div>
  );
};

export default AppleLayout;
