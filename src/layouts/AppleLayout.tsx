
import React from 'react';
import { useMobile } from '@/hooks/use-mobile';
import { Header } from '@/components/Header';

interface AppleLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
}

export const AppleLayout: React.FC<AppleLayoutProps> = ({ 
  children, 
  showHeader = true 
}) => {
  const isMobile = useMobile();

  return (
    <div className="min-h-screen bg-background w-full">
      {showHeader && <Header />}
      <div className={`${showHeader ? '' : 'pt-0'} w-full`}>
        {children}
      </div>
    </div>
  );
};

export default AppleLayout;
